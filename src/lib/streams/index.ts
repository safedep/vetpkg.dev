// Main S2 Stream Reader
export { S2StreamReader, createS2StreamReader } from "./s2-stream-reader";

// Types and interfaces
export type {
  S2StreamConfig,
  S2StreamOptions,
  S2StreamHealth,
  S2StreamPosition,
  S2StreamRecord,
} from "./types";

// Error classes
export { S2StreamError, S2ParseError, S2ControlMessageError } from "./types";

// Utility functions
export {
  validateS2Config,
  createS2ConfigFromEnv,
  getMissingS2EnvVars,
  createDefaultS2Options,
  createS2OptionsFromEnv,
  isS2ConfigAvailable,
  retryWithBackoff,
  sleep,
  debounce,
  throttle,
} from "./utils";
