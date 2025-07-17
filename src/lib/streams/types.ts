export interface S2StreamConfig {
  accessToken: string;
  basin: string;
  stream: string;
  startSeqNum?: number;
  startTimestamp?: number;
  tailOffset?: number;
  batchSize?: number;
}

export interface S2StreamOptions {
  maxRetries?: number;
  baseRetryDelay?: number;
  timeout?: number;
}

export interface S2StreamHealth {
  healthy: boolean;
  message?: string;
  lastChecked?: Date;
}

export interface S2StreamPosition {
  seqNum: number;
  timestamp: number;
}

export interface S2StreamRecord<T = unknown> {
  data: T;
  metadata?: {
    timestamp?: string;
    seqNum?: number;
    [key: string]: unknown;
  };
}

export class S2StreamError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly retryable: boolean = true,
  ) {
    super(message);
    this.name = "S2StreamError";
  }
}

export class S2ParseError extends Error {
  constructor(
    message: string,
    public readonly rawData: unknown,
  ) {
    super(message);
    this.name = "S2ParseError";
  }
}

export class S2ControlMessageError extends Error {
  constructor(
    message: string,
    public readonly messageType: string,
    public readonly rawData: unknown,
  ) {
    super(message);
    this.name = "S2ControlMessageError";
  }
}
