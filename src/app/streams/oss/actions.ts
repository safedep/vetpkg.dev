"use server";

import { PackageStreamItem } from "./types";
import {
  createS2StreamReader,
  createS2ConfigFromEnv,
  isS2ConfigAvailable,
} from "@/lib/streams";

export async function getStreamHealthStatus(): Promise<{
  healthy: boolean;
  message?: string;
}> {
  try {
    // Check if S2 environment variables are configured
    if (!isS2ConfigAvailable()) {
      return {
        healthy: false,
        message:
          "S2 environment variables not configured (S2_ACCESS_TOKEN, S2_BASIN, S2_STREAM)",
      };
    }

    const config = createS2ConfigFromEnv();
    if (!config) {
      return {
        healthy: false,
        message: "Failed to create S2 configuration",
      };
    }

    // Test S2 connection
    const s2Reader = createS2StreamReader<PackageStreamItem>(config);
    const healthStatus = await s2Reader.getHealthStatus();

    return {
      healthy: healthStatus.healthy,
      message: healthStatus.message,
    };
  } catch (error) {
    return {
      healthy: false,
      message: `S2 stream health check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
