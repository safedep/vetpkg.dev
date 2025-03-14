import { PackageVersionInsight } from "@buf/safedep_api.bufbuild_es/safedep/messages/package/v1/package_version_insight_pb";
import { MalwareEvidence } from "./types";
import { Vulnerability } from "./types";
import { VulnerabilityIdentifierType } from "@buf/safedep_api.bufbuild_es/safedep/messages/vulnerability/v1/vulnerability_pb";
import { QueryPackageAnalysisResponse } from "@buf/safedep_api.bufbuild_es/safedep/services/malysis/v1/malysis_pb";
import {
  Report_Evidence_Confidence,
  Report_Evidence_ConfidenceSchema,
} from "@buf/safedep_api.bufbuild_es/safedep/messages/malysis/v1/report_pb";
import { Severity_RiskSchema } from "@buf/safedep_api.bufbuild_es/safedep/messages/vulnerability/v1/severity_pb";
import { Severity_Risk } from "@buf/safedep_api.bufbuild_es/safedep/messages/vulnerability/v1/severity_pb";

export function getVulnerabilities(
  insights: PackageVersionInsight | null,
): Vulnerability[] {
  return (
    insights?.vulnerabilities.map((v) => ({
      id: v.id?.value ?? "",
      title: v.summary,
      severity: v.severities[0]?.risk,
      cve: v.aliases.find((a) => a.type === VulnerabilityIdentifierType.CVE)
        ?.value,
      reference_url: `https://osv.dev/vulnerability/${v.id?.value}`,
    })) ?? []
  );
}

export function getRiskName(risk: Severity_Risk): string {
  return Severity_RiskSchema.values[risk ?? 0].name.replace("RISK_", "");
}

export function getConfidenceName(
  confidence: Report_Evidence_Confidence | undefined,
): string {
  return Report_Evidence_ConfidenceSchema.values[confidence ?? 0].name.replace(
    "CONFIDENCE_",
    "",
  );
}

export function getMalwareEvidences(
  malwareAnalysis: QueryPackageAnalysisResponse | null,
): MalwareEvidence[] {
  const evidences: MalwareEvidence[] =
    malwareAnalysis?.report?.fileEvidences.map((e) => ({
      source: e.evidence?.source || "",
      fileKey: e.fileKey,
      confidence: e.evidence?.confidence || Report_Evidence_Confidence.LOW,
      title: e.evidence?.title || "",
      details: e.evidence?.details || "",
    })) ?? [];

  malwareAnalysis?.report?.projectEvidences.forEach((e) => {
    evidences.push({
      source: e.evidence?.source || "",
      confidence: e.evidence?.confidence || Report_Evidence_Confidence.LOW,
      title: e.evidence?.title || "",
      details: e.evidence?.details || "",
      projectSource: e.project?.url,
    });
  });

  return evidences;
}

/**
 * Get Tailwind CSS color classes for risk levels
 * @param risk Risk level name (CRITICAL, HIGH, MEDIUM, LOW)
 * @returns Tailwind CSS color classes for background and text
 */
export function getRiskColor(risk: string): { bg: string; text: string } {
  switch (risk?.toUpperCase()) {
    case "CRITICAL":
      return { bg: "bg-red-100", text: "text-red-800" };
    case "HIGH":
      return { bg: "bg-orange-100", text: "text-orange-800" };
    case "MEDIUM":
      return { bg: "bg-yellow-100", text: "text-yellow-800" };
    case "LOW":
      return { bg: "bg-green-100", text: "text-green-800" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800" };
  }
}
