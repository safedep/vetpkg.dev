import { createConnectTransport } from "@connectrpc/connect-node";
import { createClient, type Interceptor } from "@connectrpc/connect";
import { OnboardingService } from "@buf/safedep_api.connectrpc_es/safedep/services/controltower/v1/onboarding_connect";
import { ApiKeyService } from "@buf/safedep_api.connectrpc_es/safedep/services/controltower/v1/api_key_connect";
import { UserService } from "@buf/safedep_api.connectrpc_es/safedep/services/controltower/v1/user_connect";
import { InsightService } from "@buf/safedep_api.connectrpc_es/safedep/services/insights/v2/insights_connect";
import { MalwareAnalysisService } from "@buf/safedep_api.connectrpc_es/safedep/services/malysis/v1/malysis_connect";
import { TenantService } from "@buf/safedep_api.connectrpc_es/safedep/services/controltower/v1/tenant_connect";
import { QueryService } from "@buf/safedep_api.connectrpc_es/safedep/services/controltower/v1/query_connect";
import { ProjectService } from "@buf/safedep_api.connectrpc_es/safedep/services/controltower/v1/project_connect";

const apiBaseUrl = (process.env.API_BASE_URL ||
  "https://api.safedep.io") as string;
const cloudApiBaseUrl = (process.env.CLOUD_API_BASE_URL ||
  "https://cloud.safedep.io") as string;

function authenticationInterceptor(token: string, tenant: string): Interceptor {
  return (next) => async (req) => {
    req.header.set("authorization", token);
    req.header.set("x-tenant-id", tenant);
    return await next(req);
  };
}

/**
 * Create a ConnectRPC transport with authentication headers
 */
export const createTransport = (
  apiUrl: string,
  tenant: string,
  token: string,
) => {
  const transport = createConnectTransport({
    baseUrl: apiUrl,
    httpVersion: "1.1",
    interceptors: [authenticationInterceptor(token, tenant)],
  });

  return transport;
};

export const createInsightServiceClient = (tenant: string, token: string) => {
  const transport = createTransport(apiBaseUrl, tenant, token);
  return createClient(InsightService, transport);
};

export const createOnboardingServiceClient = (token: string) => {
  const transport = createTransport(cloudApiBaseUrl, "", token);
  return createClient(OnboardingService, transport);
};

export const createApiKeyServiceClient = (tenant: string, token: string) => {
  const transport = createTransport(cloudApiBaseUrl, tenant, token);
  return createClient(ApiKeyService, transport);
};

export const createTenantServiceClient = (tenant: string, token: string) => {
  const transport = createTransport(cloudApiBaseUrl, tenant, token);
  return createClient(TenantService, transport);
};

export const createQueryServiceClient = (tenant: string, token: string) => {
  const transport = createTransport(apiBaseUrl, tenant, token);
  return createClient(QueryService, transport);
};

export const createUserServiceClient = (token: string) => {
  const transport = createTransport(cloudApiBaseUrl, "", token);
  return createClient(UserService, transport);
};

export function createProjectServiceClient(tenant: string, token: string) {
  const transport = createTransport(cloudApiBaseUrl, tenant, token);
  return createClient(ProjectService, transport);
}

export const createMalwareAnalysisServiceClient = (
  tenant: string,
  token: string,
) => {
  const transport = createTransport(apiBaseUrl, tenant, token);
  return createClient(MalwareAnalysisService, transport);
};

export const getUserAccess = async (token: string) => {
  const userServiceClient = createUserServiceClient(token);
  return await userServiceClient.getUserInfo({});
};

/**
 * Find the first tenant associated with the user
 */
export const findFirstUserAccess = async (token: string) => {
  const userServiceClient = createUserServiceClient(token);
  const userInfo = await userServiceClient.getUserInfo({});

  if (userInfo.access.length === 0) {
    throw new Error("User has no access to any tenant");
  }

  return userInfo.access[0];
};
