import { S2 } from "@s2-dev/streamstore";
import {
  S2StreamConfig,
  S2StreamOptions,
  S2StreamHealth,
  S2StreamPosition,
  S2StreamRecord,
  S2StreamError,
  S2ParseError,
  S2ControlMessageError,
} from "./types";

export class S2StreamReader<T = unknown> {
  private client: S2;
  private config: S2StreamConfig;
  private options: Required<S2StreamOptions>;

  constructor(config: S2StreamConfig, options: S2StreamOptions = {}) {
    this.config = config;
    this.options = {
      maxRetries: options.maxRetries ?? 3,
      baseRetryDelay: options.baseRetryDelay ?? 1000,
      timeout: options.timeout ?? 30000,
    };

    this.client = new S2({
      accessToken: this.config.accessToken,
    });
  }

  /**
   * Get the tail position of the stream
   */
  async getStreamTail(): Promise<S2StreamPosition> {
    try {
      const result = await this.client.records.checkTail({
        stream: this.config.stream,
        s2Basin: this.config.basin,
      });

      // The result is directly a TailResponse, not a Result wrapper
      if (!result || !result.tail) {
        throw new S2StreamError(
          "Invalid tail response",
          "INVALID_TAIL_RESPONSE",
          false,
        );
      }

      return {
        seqNum: result.tail.seqNum,
        timestamp: result.tail.timestamp,
      };
    } catch (error) {
      if (error instanceof S2StreamError) {
        throw error;
      }
      throw new S2StreamError(
        `Failed to get stream tail: ${error instanceof Error ? error.message : "Unknown error"}`,
        "TAIL_CHECK_ERROR",
        true,
      );
    }
  }

  /**
   * Read records from the S2 stream starting from the tail position
   */
  async *readStreamFromTail(): AsyncGenerator<
    S2StreamRecord<T>,
    void,
    unknown
  > {
    try {
      const tailPosition = await this.getStreamTail();

      // Create a new config with the tail sequence number
      const configWithTail = {
        ...this.config,
        startSeqNum: tailPosition.seqNum,
      };

      // Create a temporary reader with the tail position
      const tempReader = new S2StreamReader<T>(configWithTail, this.options);

      // Yield records from the temporary reader
      for await (const record of tempReader.readStream()) {
        yield record;
      }
    } catch (error) {
      throw new S2StreamError(
        `Failed to read from tail: ${error instanceof Error ? error.message : "Unknown error"}`,
        "READ_FROM_TAIL_ERROR",
        true,
      );
    }
  }

  /**
   * Read records from the S2 stream starting from a specific sequence number
   */
  async *readStreamFromSeqNum(
    seqNum: number,
  ): AsyncGenerator<S2StreamRecord<T>, void, unknown> {
    const configWithSeqNum = {
      ...this.config,
      startSeqNum: seqNum,
    };

    const tempReader = new S2StreamReader<T>(configWithSeqNum, this.options);

    for await (const record of tempReader.readStream()) {
      yield record;
    }
  }

  /**
   * Read records from the S2 stream as an async generator
   */
  async *readStream(): AsyncGenerator<S2StreamRecord<T>, void, unknown> {
    let retryCount = 0;

    while (retryCount <= this.options.maxRetries) {
      try {
        // Prepare read parameters
        const readParams: {
          stream: string;
          s2Basin: string;
          seqNum?: number;
          timestamp?: number;
          tailOffset?: number;
          count?: number;
        } = {
          stream: this.config.stream,
          s2Basin: this.config.basin,
          // Don't set count by default for continuous streaming
        };

        // Add positioning parameters if provided
        if (this.config.startSeqNum !== undefined) {
          readParams.seqNum = this.config.startSeqNum;
        }
        if (this.config.startTimestamp !== undefined) {
          readParams.timestamp = this.config.startTimestamp;
        }
        if (this.config.tailOffset !== undefined) {
          readParams.tailOffset = this.config.tailOffset;
        }
        if (this.config.batchSize !== undefined) {
          readParams.count = this.config.batchSize;
        }
        // Note: If batchSize is not specified, we don't set count for continuous streaming

        const result = await this.client.records.read(readParams);

        // Check if result is an EventStream (async iterable) or ReadBatch
        if (
          result &&
          typeof (
            result as unknown as {
              [Symbol.asyncIterator]?: () => AsyncIterator<unknown>;
            }
          )[Symbol.asyncIterator] === "function"
        ) {
          // It's an EventStream - can iterate asynchronously
          for await (const record of result as AsyncIterable<unknown>) {
            try {
              const parsedRecord = this.parseRecord(record);
              yield parsedRecord;
            } catch (parseError) {
              // Handle different types of parse errors
              if (parseError instanceof S2ControlMessageError) {
                // Skip control messages silently (these are normal)
                continue;
              } else if (parseError instanceof S2ParseError) {
                // Log data parsing errors but continue processing
                console.warn("Failed to parse S2 record:", parseError.message);
                continue;
              } else {
                // Log unexpected errors but continue processing
                console.warn("Unexpected parse error:", parseError);
                continue;
              }
            }
          }
        } else {
          // It's a ReadBatch - access records array directly
          const batch = result as unknown as { records?: unknown[] };
          if (batch && batch.records && Array.isArray(batch.records)) {
            for (const record of batch.records) {
              try {
                const parsedRecord = this.parseRecord(record);
                yield parsedRecord;
              } catch (parseError) {
                // Handle different types of parse errors
                if (parseError instanceof S2ControlMessageError) {
                  // Skip control messages silently (these are normal)
                  continue;
                } else if (parseError instanceof S2ParseError) {
                  // Log data parsing errors but continue processing
                  console.warn(
                    "Failed to parse S2 record:",
                    parseError.message,
                  );
                  continue;
                } else {
                  // Log unexpected errors but continue processing
                  console.warn("Unexpected parse error:", parseError);
                  continue;
                }
              }
            }
          } else {
            console.warn(
              "S2 result is neither EventStream nor ReadBatch with records:",
              result,
            );
          }
        }

        // If we get here, the stream ended normally
        break;
      } catch (error) {
        retryCount++;

        const streamError = this.createStreamError(error);

        if (retryCount > this.options.maxRetries || !streamError.retryable) {
          throw streamError;
        }

        // Exponential backoff
        const delay = this.options.baseRetryDelay * Math.pow(2, retryCount - 1);
        console.warn(
          `S2 stream error (attempt ${retryCount}/${this.options.maxRetries + 1}), retrying in ${delay}ms:`,
          error,
        );
        await this.sleep(delay);
      }
    }
  }

  /**
   * Read a single record from the stream
   */
  async readSingleRecord(): Promise<S2StreamRecord<T> | null> {
    const generator = this.readStream();
    const result = await generator.next();

    if (result.done) {
      return null;
    }

    return result.value;
  }

  /**
   * Test the connection to the S2 stream
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.records.read({
        stream: this.config.stream,
        s2Basin: this.config.basin,
      });
      return true;
    } catch (error) {
      console.error("S2 connection test failed:", error);
      return false;
    }
  }

  /**
   * Get the health status of the stream
   */
  async getHealthStatus(): Promise<S2StreamHealth> {
    try {
      const isHealthy = await this.testConnection();
      return {
        healthy: isHealthy,
        message: isHealthy
          ? "S2 stream is healthy"
          : "S2 stream connection failed",
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        healthy: false,
        message: `S2 stream health check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        lastChecked: new Date(),
      };
    }
  }

  /**
   * Parse a raw S2 record into a structured format
   */
  private parseRecord(record: unknown): S2StreamRecord<T> {
    try {
      if (!record || typeof record !== "object") {
        throw new S2ParseError("Invalid record format", record);
      }

      const recordObj = record as Record<string, unknown>;

      // Handle S2 stream control messages
      if ("tail" in recordObj) {
        // This is a stream tail/position marker, not actual data
        throw new S2ControlMessageError(
          "Stream tail marker received",
          "tail",
          record,
        );
      }

      // Handle other S2 control messages if needed
      if ("head" in recordObj) {
        throw new S2ControlMessageError(
          "Stream head marker received",
          "head",
          record,
        );
      }

      if (
        "metadata" in recordObj &&
        !("data" in recordObj) &&
        !("payload" in recordObj) &&
        !("body" in recordObj)
      ) {
        throw new S2ControlMessageError(
          "Stream metadata message received",
          "metadata",
          record,
        );
      }

      // Extract the data from the record
      let rawData: unknown;

      if ("data" in recordObj) {
        rawData = recordObj.data;
      } else if ("payload" in recordObj) {
        rawData = recordObj.payload;
      } else if ("body" in recordObj) {
        rawData = recordObj.body;
      } else {
        rawData = record;
      }

      // Handle ProtoBuf serialized JSON
      let parsedData: T;
      if (typeof rawData === "string") {
        try {
          // Try to parse as JSON first
          parsedData = JSON.parse(rawData) as T;
        } catch {
          // If JSON parsing fails, treat as raw string
          parsedData = rawData as T;
        }
      } else if (rawData instanceof Uint8Array) {
        // Handle binary ProtoBuf data
        try {
          const jsonString = new TextDecoder().decode(rawData);
          parsedData = JSON.parse(jsonString) as T;
        } catch {
          throw new S2ParseError("Failed to decode ProtoBuf data", rawData);
        }
      } else {
        // Data is already an object
        parsedData = rawData as T;
      }

      // Extract metadata if available
      const metadata = {
        timestamp: recordObj.timestamp as string | undefined,
        ...Object.fromEntries(
          Object.entries(recordObj).filter(
            ([key]) => !["data", "payload", "body"].includes(key),
          ),
        ),
      };

      return {
        data: parsedData,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      };
    } catch (error) {
      if (error instanceof S2ParseError) {
        throw error;
      }
      throw new S2ParseError(
        `Failed to parse S2 record: ${error instanceof Error ? error.message : "Unknown error"}`,
        record,
      );
    }
  }

  /**
   * Create a standardized stream error
   */
  private createStreamError(error: unknown): S2StreamError {
    if (error instanceof S2StreamError) {
      return error;
    }

    if (error instanceof Error) {
      // Determine if error is retryable based on error type/message
      const retryable = this.isRetryableError(error);
      return new S2StreamError(error.message, error.name, retryable);
    }

    return new S2StreamError("Unknown stream error", "UNKNOWN_ERROR", true);
  }

  /**
   * Determine if an error is retryable
   */
  private isRetryableError(error: Error): boolean {
    // Check for HTTP status codes in the error message
    if (
      error.message.includes("statusCode: 416") ||
      error.message.includes("Range Not Satisfiable")
    ) {
      // 416 Range Not Satisfiable - sequence number is out of range, not retryable
      return false;
    }

    // Network errors are generally retryable
    if (
      error.message.includes("network") ||
      error.message.includes("connection")
    ) {
      return true;
    }

    // Timeout errors are retryable
    if (
      error.message.includes("timeout") ||
      error.message.includes("ETIMEDOUT")
    ) {
      return true;
    }

    // Authentication errors are not retryable
    if (
      error.message.includes("unauthorized") ||
      error.message.includes("forbidden")
    ) {
      return false;
    }

    // Rate limiting errors are retryable
    if (error.message.includes("rate limit") || error.message.includes("429")) {
      return true;
    }

    // Default to retryable
    return true;
  }

  /**
   * Sleep for the specified number of milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Factory function to create an S2StreamReader instance
 */
export function createS2StreamReader<T = unknown>(
  config: S2StreamConfig,
  options?: S2StreamOptions,
): S2StreamReader<T> {
  return new S2StreamReader<T>(config, options);
}
