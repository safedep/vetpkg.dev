"use server";

import {
  createInsightServiceClient,
  createMalwareAnalysisServiceClient,
} from "@/lib/rpc/client";
import { getRpcCallCredentials, parseEcosystem } from "@/lib/rpc/utils";
import { PackageVersionInsight } from "@buf/safedep_api.bufbuild_es/safedep/messages/package/v1/package_version_insight_pb";
import { QueryPackageAnalysisResponse } from "@buf/safedep_api.bufbuild_es/safedep/services/malysis/v1/malysis_pb";

export async function getPackageVersionInfo(
  ecosystem: string,
  name: string,
  version: string,
): Promise<PackageVersionInsight> {
  const credentials = getRpcCallCredentials();
  const client = createInsightServiceClient(
    credentials.tenant,
    credentials.token,
  );

  const response = await client.getPackageVersionInsight({
    packageVersion: {
      package: {
        ecosystem: parseEcosystem(ecosystem),
        name,
      },
      version,
    },
  });

  return response.insight!;
}

export async function queryMalwareAnalysis(
  ecosystem: string,
  name: string,
  version: string,
): Promise<QueryPackageAnalysisResponse> {
  const credentials = getRpcCallCredentials();
  const client = createMalwareAnalysisServiceClient(
    credentials.tenant,
    credentials.token,
  );

  const response = await client.queryPackageAnalysis({
    target: {
      packageVersion: {
        package: {
          ecosystem: parseEcosystem(ecosystem),
          name,
        },
        version,
      },
    },
  });

  return response;
}
