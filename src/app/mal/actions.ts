"use server";

import { createMalwareAnalysisServiceClient } from "@/lib/rpc/client";
import { getRpcCallCredentials } from "@/lib/rpc/utils";
import { PaginationRequest_SortOrder } from "@buf/safedep_api.bufbuild_es/safedep/messages/controltower/v1/pagination_pb";

type listMalwareAnalysisParams = {
  onlyMalware?: boolean;
  onlyVerified?: boolean;
  pageSize?: number;
  pageToken?: string;
};

export async function listMalwareAnalysis({
  onlyMalware,
  onlyVerified,
  pageSize,
  pageToken,
}: listMalwareAnalysisParams) {
  const credentials = getRpcCallCredentials();
  const client = createMalwareAnalysisServiceClient(
    credentials.tenant,
    credentials.token,
  );

  if (!pageSize) {
    pageSize = 10;
  }

  const response = await client.listPackageAnalysisRecords({
    filter: {
      onlyMalware,
      onlyVerified,
    },
    pagination: {
      pageSize,
      pageToken,
      sortOrder: PaginationRequest_SortOrder.DESCENDING,
    },
  });

  return response;
}
