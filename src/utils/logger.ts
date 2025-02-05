import { z } from "zod";
import * as Sentry from "@sentry/browser";

type metaType =
  | Record<string, unknown>
  | string
  | number
  | z.ZodError
  | z.ZodIssue
  | z.ZodError[]
  | z.ZodIssue[]
  | unknown
  | null;

// logger is used by both the client and server
export const logger = {
  info: (message: string, meta?: metaType) => {
    const extra: Record<string, unknown> = meta ? { meta } : {};
    Sentry.captureMessage(message, {
      level: "info",
      extra: extra,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(`INFO: ${message}`, meta);
    }
  },
  error: (message: string, meta?: metaType) => {
    const extra: Record<string, unknown> = meta ? { meta } : {};
    Sentry.captureMessage(message, {
      level: "error",
      extra: extra,
    });

    if (process.env.NODE_ENV !== "production") {
      console.error(`ERROR: ${message}`, meta);
    }
  },
  debug: (message: string, meta?: metaType) => {
    if (process.env.NODE_ENV === "production") {
      return;
    }

    console.debug(`DEBUG: ${message}`, meta);
  },
  logException: (error: unknown) => {
    Sentry.captureException(error);
  },
};
