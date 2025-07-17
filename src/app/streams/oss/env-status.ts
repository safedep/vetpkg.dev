import { isS2ConfigAvailable, getMissingS2EnvVars } from "@/lib/streams";

export interface EnvStatus {
  isS2Configured: boolean;
  missingVars: string[];
  status: "configured" | "partial" | "missing";
}

export function checkS2EnvStatus(): EnvStatus {
  const isS2Configured = isS2ConfigAvailable();
  const missingVars = getMissingS2EnvVars();

  const requiredVars = ["S2_ACCESS_TOKEN", "S2_BASIN", "S2_STREAM"];
  const status = isS2Configured
    ? "configured"
    : missingVars.length === requiredVars.length
      ? "missing"
      : "partial";

  return {
    isS2Configured,
    missingVars,
    status,
  };
}

export function getDataSourceInfo(): { source: string; description: string } {
  const envStatus = checkS2EnvStatus();

  if (envStatus.isS2Configured) {
    return {
      source: "S2 Stream",
      description: "Reading from S2 StreamStore",
    };
  } else {
    return {
      source: "Mock Data",
      description: "Using mock data for demonstration",
    };
  }
}
