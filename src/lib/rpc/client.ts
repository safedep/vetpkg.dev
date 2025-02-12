import { createGrpcTransport } from "@connectrpc/connect-node";
import { createClient, type Interceptor } from "@connectrpc/connect";
import { InsightService } from "@buf/safedep_api.bufbuild_es/safedep/services/insights/v2/insights_pb";
import { MalwareAnalysisService } from "@buf/safedep_api.bufbuild_es/safedep/services/malysis/v1/malysis_pb";

const apiBaseUrl = (process.env.SAFEDEP_API_BASE_URL ||
  "https://api.safedep.io") as string;

// Cache to store memoized transports
const transportCache = new Map<
  string,
  ReturnType<typeof createGrpcTransport>
>();

// Function to add authentication headers in the request
function authenticationInterceptor(token: string, tenant: string): Interceptor {
  return (next) => async (req) => {
    req.header.set("authorization", token);
    req.header.set("x-tenant-id", tenant);
    return await next(req);
  };
}

/**
 * Create a gRPC transport with authentication headers, memoized by apiUrl+tenant+token
 */
export const createTransport = (
  apiUrl: string,
  tenant: string,
  token: string,
) => {
  const cacheKey = `${apiUrl}:${tenant}:${token}`;

  if (transportCache.has(cacheKey)) {
    return transportCache.get(cacheKey)!;
  }

  const transport = createGrpcTransport({
    baseUrl: apiUrl,
    interceptors: [authenticationInterceptor(token, tenant)],
  });

  transportCache.set(cacheKey, transport);
  return transport;
};

export const createInsightServiceClient = (tenant: string, token: string) => {
  const transport = createTransport(apiBaseUrl, tenant, token);
  return createClient(InsightService, transport);
};

export const createMalwareAnalysisServiceClient = (
  tenant: string,
  token: string,
) => {
  const transport = createTransport(apiBaseUrl, tenant, token);
  return createClient(MalwareAnalysisService, transport);
};
