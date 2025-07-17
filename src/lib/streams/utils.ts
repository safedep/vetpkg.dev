import { S2StreamConfig, S2StreamOptions } from "./types";

/**
 * Validate S2 stream configuration
 */
export function validateS2Config(
  config: Partial<S2StreamConfig>,
): config is S2StreamConfig {
  return !!(config.accessToken && config.basin && config.stream);
}

/**
 * Create S2 configuration from environment variables
 */
export function createS2ConfigFromEnv(
  accessTokenEnv: string = "S2_ACCESS_TOKEN",
  basinEnv: string = "S2_BASIN",
  streamEnv: string = "S2_STREAM",
): S2StreamConfig | null {
  const accessToken = process.env[accessTokenEnv];
  const basin = process.env[basinEnv];
  const stream = process.env[streamEnv];

  if (!accessToken || !basin || !stream) {
    return null;
  }

  const config: S2StreamConfig = {
    accessToken,
    basin,
    stream,
  };

  // Add optional positioning parameters from environment
  if (process.env.S2_START_SEQ_NUM) {
    config.startSeqNum = parseInt(process.env.S2_START_SEQ_NUM, 10);
  }
  if (process.env.S2_START_TIMESTAMP) {
    config.startTimestamp = parseInt(process.env.S2_START_TIMESTAMP, 10);
  }
  if (process.env.S2_TAIL_OFFSET) {
    config.tailOffset = parseInt(process.env.S2_TAIL_OFFSET, 10);
  }

  return config;
}

/**
 * Get missing environment variables for S2 configuration
 */
export function getMissingS2EnvVars(
  accessTokenEnv: string = "S2_ACCESS_TOKEN",
  basinEnv: string = "S2_BASIN",
  streamEnv: string = "S2_STREAM",
): string[] {
  const missing: string[] = [];

  if (!process.env[accessTokenEnv]) {
    missing.push(accessTokenEnv);
  }
  if (!process.env[basinEnv]) {
    missing.push(basinEnv);
  }
  if (!process.env[streamEnv]) {
    missing.push(streamEnv);
  }

  return missing;
}

/**
 * Create default S2 stream options
 */
export function createDefaultS2Options(): S2StreamOptions {
  return {
    maxRetries: 3,
    baseRetryDelay: 1000,
    timeout: 30000,
  };
}

/**
 * Create S2 stream options from environment variables
 */
export function createS2OptionsFromEnv(): S2StreamOptions {
  return {
    maxRetries: process.env.S2_MAX_RETRIES
      ? parseInt(process.env.S2_MAX_RETRIES, 10)
      : 3,
    baseRetryDelay: process.env.S2_BASE_RETRY_DELAY
      ? parseInt(process.env.S2_BASE_RETRY_DELAY, 10)
      : 1000,
    timeout: process.env.S2_TIMEOUT
      ? parseInt(process.env.S2_TIMEOUT, 10)
      : 30000,
  };
}

/**
 * Check if S2 configuration is available in environment
 */
export function isS2ConfigAvailable(
  accessTokenEnv: string = "S2_ACCESS_TOKEN",
  basinEnv: string = "S2_BASIN",
  streamEnv: string = "S2_STREAM",
): boolean {
  return !!(
    process.env[accessTokenEnv] &&
    process.env[basinEnv] &&
    process.env[streamEnv]
  );
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");

      if (attempt === maxRetries) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(
        `Attempt ${attempt + 1} failed, retrying in ${delay}ms:`,
        lastError.message,
      );
      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Sleep for the specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce function for stream events
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number,
): T {
  let timeout: NodeJS.Timeout | null = null;

  return ((...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

/**
 * Throttle function for stream events
 */
export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number,
): T {
  let inThrottle: boolean = false;

  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
}
