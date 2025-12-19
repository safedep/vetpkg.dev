"use client";

import {
  ExternalLink,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

import { useParams } from "next/navigation";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Report_Evidence_Confidence } from "@buf/safedep_api.bufbuild_es/safedep/messages/malysis/v1/report_pb";
import { LicenseMeta } from "@buf/safedep_api.bufbuild_es/safedep/messages/package/v1/license_meta_pb";
import {
  PackageVersionInsight,
  PackageVersionInsightSchema,
} from "@buf/safedep_api.bufbuild_es/safedep/messages/package/v1/package_version_insight_pb";
import { Severity_Risk } from "@buf/safedep_api.bufbuild_es/safedep/messages/vulnerability/v1/severity_pb";
import { VulnerabilityIdentifierType } from "@buf/safedep_api.bufbuild_es/safedep/messages/vulnerability/v1/vulnerability_pb";
import {
  AnalysisStatus,
  QueryPackageAnalysisResponse,
  QueryPackageAnalysisResponseSchema,
} from "@buf/safedep_api.bufbuild_es/safedep/services/malysis/v1/malysis_pb";
import { toJson } from "@bufbuild/protobuf";
import {
  DialogDescription,
  DialogOverlay,
  DialogPortal,
} from "@radix-ui/react-dialog";
import { Spinner } from "@radix-ui/themes";
import { useEffect, useState, useMemo } from "react";
import { getPackageVersionInfo, queryMalwareAnalysis } from "./actions";
import { DiffViewer } from "./DiffViewer";
import { getRiskName, getRiskColor } from "./utils";
import DependencyGraph from "./DependencyGraph";
import MalwareAnalysis, { MalwareStatus } from "./MalwareAnalysis";
import {
  Vulnerability,
  Version,
  SecurityScorecardCheck,
  MalwareEvidence,
  MalwareAnalysisBehavior,
  PackageSafetyStatus,
} from "./types";
import ReactMarkdown from "react-markdown";
import Footer from "@/components/app/footer";

function getEcosystemIcon(ecosystem: string) {
  switch (ecosystem.toLowerCase()) {
    case "npm":
      return "📦";
    case "rubygems":
      return "💎";
    case "go":
      return "🐹";
    case "maven":
      return "☕";
    case "pypi":
      return "🐍";
    case "packagist":
      return "🐘";
    default:
      return "📦";
  }
}

function getCriticalVulnerabilitiesCount(
  insights: PackageVersionInsight | null,
): number {
  return (
    insights?.vulnerabilities.filter(
      (v) =>
        v.severities.filter((s) => s.risk === Severity_Risk.CRITICAL).length >
        0,
    ).length ?? 0
  );
}

function getVulnerabilitiesCountBySeverity(
  insights: PackageVersionInsight | null,
  severity: Severity_Risk,
): number {
  return (
    insights?.vulnerabilities.filter(
      (v) => v.severities.filter((s) => s.risk === severity).length > 0,
    ).length ?? 0
  );
}

function getVulnerabilities(
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

function getLicense(licenses: LicenseMeta[]): string {
  const name = licenses.length > 0 ? licenses[0].licenseId : "";
  return name.length > 0 ? name : "Unknown";
}

function getVersions(insights: PackageVersionInsight | null): Version[] {
  return (
    insights?.availableVersions.map((v) => ({
      version: v.version,
      published_at: "2024-03-15",
      is_default: v.defaultVersion,
    })) ?? []
  );
}

function getSecurityScorecardScore(
  insights: PackageVersionInsight | null,
): Record<SecurityScorecardCheck, number> {
  const scorecard = insights?.projectInsights[0]?.scorecard;
  if (!scorecard) {
    return {
      [SecurityScorecardCheck.Vulnerability]: 0,
      [SecurityScorecardCheck.Maintenance]: 0,
      [SecurityScorecardCheck.SAST]: 0,
      [SecurityScorecardCheck.CodeReview]: 0,
      [SecurityScorecardCheck.Contributors]: 0,
      [SecurityScorecardCheck.SignedReleases]: 0,
    };
  }

  return {
    [SecurityScorecardCheck.Vulnerability]:
      scorecard.checks.find((c) => c.name === "Vulnerabilities")?.score ?? 0,
    [SecurityScorecardCheck.Maintenance]:
      scorecard.checks.find((c) => c.name === "Maintained")?.score ?? 0,
    [SecurityScorecardCheck.SAST]:
      scorecard.checks.find((c) => c.name === "SAST")?.score ?? 0,
    [SecurityScorecardCheck.CodeReview]:
      scorecard.checks.find((c) => c.name === "Code-Review")?.score ?? 0,
    [SecurityScorecardCheck.Contributors]:
      scorecard.checks.find((c) => c.name === "Contributors")?.score ?? 0,
    [SecurityScorecardCheck.SignedReleases]:
      scorecard.checks.find((c) => c.name === "Signed-Releases")?.score ?? 0,
  };
}

function getMalwareAnalysisStatus(
  malwareAnalysis: QueryPackageAnalysisResponse | null,
): MalwareStatus {
  if (malwareAnalysis?.status != AnalysisStatus.COMPLETED) {
    return MalwareStatus.Unknown;
  }

  if (malwareAnalysis.verificationRecord?.isMalware) {
    return MalwareStatus.Malicious;
  }

  if (malwareAnalysis.verificationRecord?.isSafe) {
    return MalwareStatus.Safe;
  }

  if (!malwareAnalysis?.report) {
    return MalwareStatus.Unknown;
  }

  if (!malwareAnalysis?.report?.inference?.isMalware) {
    return MalwareStatus.Safe;
  }

  return MalwareStatus.PossiblyMalicious;
}

function getMalwareEvidences(
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

function getInferredBehavior(
  malwareAnalysis: QueryPackageAnalysisResponse | null,
  insights: PackageVersionInsight | null,
): MalwareAnalysisBehavior {
  const evidences = getMalwareEvidences(malwareAnalysis);
  const behavior: MalwareAnalysisBehavior = {};

  evidences.forEach((evidence) => {
    // We are using a lame rule matching to infer the behavior.
    // This is temporary till our code analysis based behavior detection is ready.

    const source = evidence.source.toLowerCase();
    const title = evidence.title.toLowerCase();

    if (source.includes("yara")) {
      if (title.includes("exotic") || title.includes("url")) {
        behavior.network_calls = true;
      }

      if (title.includes("exec")) {
        behavior.process_creation = true;
      }

      if (title.includes("pe_packed")) {
        behavior.process_creation = true;
      }
    }

    if (source.includes("package project")) {
      if (title.includes("untrustworthy source project")) {
        behavior.suspicious_project = true;
      }
    }
  });

  const provenances = insights?.slsaProvenances ?? [];
  behavior.package_signature_missing = provenances.length === 0;

  return behavior;
}

/**
 * Get the safety status of the package based on the malware analysis and project insights
 *
 * @param insights - The package version insights
 * @param malwareAnalysis - The malware analysis
 * @returns The safety status of the package
 */
function getPackageSafetyStatus(
  insights: PackageVersionInsight | null,
  malwareAnalysis: QueryPackageAnalysisResponse | null,
): PackageSafetyStatus {
  const malwareStatus = getMalwareAnalysisStatus(malwareAnalysis);

  if (malwareStatus === MalwareStatus.Malicious) {
    return PackageSafetyStatus.Malicious;
  }

  if (malwareStatus === MalwareStatus.PossiblyMalicious) {
    return PackageSafetyStatus.PossiblyMalicious;
  }

  if (getVulnerabilitiesCountBySeverity(insights, Severity_Risk.CRITICAL) > 0) {
    return PackageSafetyStatus.Vulnerable;
  }

  if (getVulnerabilitiesCountBySeverity(insights, Severity_Risk.HIGH) > 0) {
    return PackageSafetyStatus.Vulnerable;
  }

  const projectInsights = insights?.projectInsights[0];
  const scorecard = projectInsights?.scorecard;

  if (!scorecard) {
    return PackageSafetyStatus.Unknown;
  }

  const maintenanceCheck = scorecard.checks.find(
    (c) => c.name === "Maintained",
  );
  if (maintenanceCheck?.score && maintenanceCheck.score < 4.0) {
    return PackageSafetyStatus.Unmaintained;
  }

  const codeReviewCheck = scorecard.checks.find(
    (c) => c.name === "Code-Review",
  );
  if (codeReviewCheck?.score && codeReviewCheck.score < 4.0) {
    return PackageSafetyStatus.PoorSecurityHygiene;
  }

  if (scorecard?.score && scorecard.score < 4.0) {
    return PackageSafetyStatus.PoorSecurityHygiene;
  }

  if (projectInsights?.stars && projectInsights.stars < 10) {
    return PackageSafetyStatus.Unpopular;
  }

  return PackageSafetyStatus.Safe;
}

function sortVersions(versions: Version[]): Version[] {
  return [...versions].sort((a, b) => {
    const aParts = a.version.split(".").map(Number);
    const bParts = b.version.split(".").map(Number);

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aNum = aParts[i] || 0;
      const bNum = bParts[i] || 0;
      if (aNum !== bNum) {
        return bNum - aNum; // Descending order
      }
    }
    return 0;
  });
}

function getOpenSSFCombinedScore(
  insights: PackageVersionInsight | null,
): number {
  if (insights?.projectInsights.length === 0) {
    console.error("No project insights found");
    return 0;
  }

  const project = insights?.projectInsights[0];
  return project?.scorecard?.score ?? 0;
}

function getProjectRepositoryInformation(
  insights: PackageVersionInsight | null,
): {
  url?: string;
  stars?: number;
  forks?: number;
  openIssues?: number;
  pullRequests?: number;
} {
  if (insights?.projectInsights.length === 0) {
    return {};
  }

  const project = insights?.projectInsights[0];
  return {
    url: project?.project?.url,
    stars: Number(project?.stars ?? 0),
    forks: Number(project?.forks ?? 0),
    openIssues: Number(project?.issues?.open ?? 0),
    pullRequests: Number(project?.pullRequests?.open ?? 0),
  };
}

export default function Page() {
  const params = useParams<{
    ecosystem: string;
    name: string;
    version: string;
  }>();

  const [showRawJSON, setShowRawJSON] = useState(false);
  const [insights, setInsights] = useState<PackageVersionInsight | null>(null);
  const [malwareAnalysis, setMalwareAnalysis] =
    useState<QueryPackageAnalysisResponse | null>(null);

  // Track which params we've loaded data for to derive loading state
  const [loadedInsightsParams, setLoadedInsightsParams] = useState<string>("");
  const [loadedMalwareParams, setLoadedMalwareParams] = useState<string>("");

  // Derive current params key for comparison
  const currentParamsKey = `${params.ecosystem}:${params.name}:${params.version}`;

  // Derive loading state by comparing current params with loaded params
  const insightsLoading = loadedInsightsParams !== currentParamsKey;
  const malwareAnalysisLoading = loadedMalwareParams !== currentParamsKey;

  // Decoded package version for display
  const packageVersion = useMemo(
    () => ({
      ecosystem: decodeURIComponent(params.ecosystem),
      name: decodeURIComponent(params.name),
      version: decodeURIComponent(params.version),
    }),
    [params.ecosystem, params.name, params.version],
  );

  // Derived state computed with useMemo instead of useState + useEffect
  const malwareAnalysisStatus = useMemo(
    () =>
      malwareAnalysis
        ? getMalwareAnalysisStatus(malwareAnalysis)
        : MalwareStatus.Unknown,
    [malwareAnalysis],
  );

  const packageSafetyStatus = useMemo(
    () => getPackageSafetyStatus(insights, malwareAnalysis),
    [insights, malwareAnalysis],
  );

  const securityScorecardScores = useMemo(
    () => getSecurityScorecardScore(insights),
    [insights],
  );

  const projectRepositoryInformation = useMemo(
    () => getProjectRepositoryInformation(insights),
    [insights],
  );

  const malwareEvidences = useMemo(
    () => getMalwareEvidences(malwareAnalysis),
    [malwareAnalysis],
  );

  const malwareAnalysisBehavior = useMemo(
    () => getInferredBehavior(malwareAnalysis, insights),
    [malwareAnalysis, insights],
  );

  const [showDiffViewer, setShowDiffViewer] = useState(false);
  const [compareInsightsLoading, setCompareInsightsLoading] = useState(false);
  const [compareVersion, setCompareVersion] = useState<string>("");
  const [compareInsights, setCompareInsights] =
    useState<PackageVersionInsight | null>(null);
  const [compareMalwareAnalysis, setCompareMalwareAnalysis] =
    useState<QueryPackageAnalysisResponse | null>(null);

  useEffect(() => {
    const paramsKey = `${params.ecosystem}:${params.name}:${params.version}`;
    const ecosystem = decodeURIComponent(params.ecosystem);
    const name = decodeURIComponent(params.name);
    const version = decodeURIComponent(params.version);

    getPackageVersionInfo(ecosystem, name, version)
      .then((data) => {
        setInsights(data);
        setLoadedInsightsParams(paramsKey);
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((error: any) => {
        console.warn("Failed to fetch package insights: ", error);
        setLoadedInsightsParams(paramsKey); // Mark as loaded even on error
      });

    queryMalwareAnalysis(ecosystem, name, version)
      .then((data) => {
        setMalwareAnalysis(data);
        setLoadedMalwareParams(paramsKey);
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((error: any) => {
        console.warn("Failed to fetch malware analysis: ", error);
        setLoadedMalwareParams(paramsKey); // Mark as loaded even on error
      });
  }, [params.ecosystem, params.name, params.version]);

  const handleCompare = async (version: string) => {
    setCompareVersion(version);
    setCompareInsightsLoading(true);
    setShowDiffViewer(true);

    try {
      const [compareInsightsData, compareMalwareData] = await Promise.all([
        getPackageVersionInfo(
          packageVersion.ecosystem!,
          packageVersion.name!,
          version,
        ),
        queryMalwareAnalysis(
          packageVersion.ecosystem!,
          packageVersion.name!,
          version,
        ),
      ]).finally(() => {
        setCompareInsightsLoading(false);
      });

      setCompareInsights(compareInsightsData);
      setCompareMalwareAnalysis(compareMalwareData);
    } catch (error) {
      console.warn("Failed to fetch comparison data:", error);
    }
  };

  if (insightsLoading || malwareAnalysisLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {/* Package Header Skeleton */}
          <Card className="border-l-4 border-l-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-[250px]" />
                  <Skeleton className="h-6 w-[150px]" />
                </div>
                <Skeleton className="h-8 w-[120px]" />
              </div>
            </CardHeader>
          </Card>

          {/* Tabs Skeleton */}
          <div className="w-full">
            <div className="mb-4 grid w-full grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>

            {/* Content Skeleton */}
            <div className="grid gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-5 w-[140px]" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-[70px]" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="mb-2 h-6 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[...Array(4)].map((_, j) => (
                        <Skeleton key={j} className="h-4 w-full" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showRawJSON) {
    return (
      <Tabs defaultValue="insights" className="w-full p-4 md:p-8">
        <TabsList className="grid min-h-max w-full md:grid-cols-3">
          <TabsTrigger
            value="insights"
            className="flex items-center gap-2 px-4 py-2"
          >
            📊 Package Insights
          </TabsTrigger>
          <TabsTrigger
            value="malware"
            className="flex items-center gap-2 px-4 py-2"
          >
            🔍 Malware Analysis
          </TabsTrigger>
          <TabsTrigger
            value="back"
            onClick={() => setShowRawJSON(false)}
            className="flex items-center gap-2 px-4 py-2"
          >
            ↩️ Back to UI
          </TabsTrigger>
        </TabsList>
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>Package Insights</CardTitle>
              <CardDescription>
                JSON response from the SafeDep Insights API.{" "}
                <Link
                  href="https://platform.safedep.io"
                  target="_blank"
                  className="text-sm text-blue-500 hover:underline"
                >
                  ↗️ Get API Access
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[80vh] overflow-auto rounded-lg bg-slate-950 p-4 text-slate-50">
                {JSON.stringify(
                  toJson(PackageVersionInsightSchema, insights!),
                  null,
                  2,
                )}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="malware">
          <Card>
            <CardHeader>
              <CardTitle>Malware Analysis</CardTitle>
              <CardDescription>
                JSON response from the SafeDep Malware Analysis API.{" "}
                <Link
                  href="https://platform.safedep.io"
                  target="_blank"
                  className="text-sm text-blue-500 hover:underline"
                >
                  ↗️ Get API Access
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[80vh] overflow-auto rounded-lg bg-slate-950 p-4 text-slate-50">
                {JSON.stringify(
                  toJson(QueryPackageAnalysisResponseSchema, malwareAnalysis!),
                  null,
                  2,
                )}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* Package Header */}
        <Card
          className={`border-l-4 ${
            packageSafetyStatus === PackageSafetyStatus.Safe
              ? "border-l-green-500"
              : packageSafetyStatus === PackageSafetyStatus.Malicious ||
                  packageSafetyStatus === PackageSafetyStatus.Vulnerable
                ? "border-l-red-500"
                : packageSafetyStatus ===
                      PackageSafetyStatus.PossiblyMalicious ||
                    packageSafetyStatus === PackageSafetyStatus.Unmaintained ||
                    packageSafetyStatus === PackageSafetyStatus.Unpopular ||
                    packageSafetyStatus ===
                      PackageSafetyStatus.PoorSecurityHygiene
                  ? "border-l-orange-500"
                  : "border-l-gray-500"
          }`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  🧩 {packageVersion.name}@{packageVersion.version}
                </CardTitle>
                <CardDescription className="space-y-2">
                  <span className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">
                    {getEcosystemIcon(packageVersion.ecosystem!)}{" "}
                    {packageVersion.ecosystem!} Package
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      ← Scan another package
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowRawJSON(true)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      View JSON
                    </button>
                  </div>
                </CardDescription>
              </div>
              <div>
                {packageSafetyStatus === PackageSafetyStatus.Unknown && (
                  <div className="mb-2 rounded-md bg-yellow-50 p-2 text-sm text-yellow-600">
                    ⚠️ Package name or version may be invalid
                  </div>
                )}
                <Badge
                  variant="default"
                  className={`text-md flex items-center gap-2 px-4 py-1 ${
                    packageSafetyStatus === PackageSafetyStatus.Safe
                      ? "bg-green-100 text-green-800"
                      : packageSafetyStatus === PackageSafetyStatus.Malicious
                        ? "bg-red-100 text-red-800"
                        : packageSafetyStatus ===
                            PackageSafetyStatus.PossiblyMalicious
                          ? "bg-orange-100 text-orange-800"
                          : packageSafetyStatus ===
                              PackageSafetyStatus.Vulnerable
                            ? "bg-red-100 text-red-800"
                            : packageSafetyStatus ===
                                PackageSafetyStatus.Unmaintained
                              ? "bg-yellow-100 text-yellow-800"
                              : packageSafetyStatus ===
                                  PackageSafetyStatus.Unpopular
                                ? "bg-yellow-100 text-yellow-800"
                                : packageSafetyStatus ===
                                    PackageSafetyStatus.PoorSecurityHygiene
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {packageSafetyStatus === PackageSafetyStatus.Safe ? (
                    <ShieldCheck className="h-4 w-4" />
                  ) : (
                    <ShieldAlert className="h-4 w-4" />
                  )}
                  {packageSafetyStatus}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Replace the grid div with Tabs */}
        <Tabs defaultValue="security" className="w-full">
          <TabsList className="grid min-h-max w-full grid-cols-1 md:grid-cols-5">
            <TabsTrigger value="security" className="flex items-center gap-2">
              🛡️ Security Posture
            </TabsTrigger>
            <TabsTrigger
              value="vulnerabilities"
              className="flex items-center gap-2"
            >
              🔍 Vulnerabilities
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2">
              🐛 Malicious Package Analysis
            </TabsTrigger>
            <TabsTrigger value="versions" className="flex items-center gap-2">
              📦 Available Versions
            </TabsTrigger>
            <TabsTrigger
              value="dependency-graph"
              className="flex items-center gap-2"
            >
              📈 Dependency Graph
            </TabsTrigger>
          </TabsList>

          <TabsContent value="security" className="space-y-4">
            {/* Security Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Critical Vulnerabilities
                  </CardTitle>
                  <ShieldAlert className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">
                    {getCriticalVulnerabilitiesCount(insights)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Malware Analysis
                  </CardTitle>
                  {malwareAnalysisLoading ? (
                    <Skeleton className="h-4 w-4 rounded-full" />
                  ) : (
                    <div
                      className={`h-4 w-4 ${
                        malwareAnalysisStatus === MalwareStatus.Safe
                          ? "text-green-500"
                          : malwareAnalysisStatus ===
                              MalwareStatus.PossiblyMalicious
                            ? "text-orange-500"
                            : malwareAnalysisStatus === MalwareStatus.Unknown
                              ? "text-gray-500"
                              : "text-red-500"
                      }`}
                    >
                      {malwareAnalysisStatus === MalwareStatus.Safe
                        ? "✅"
                        : malwareAnalysisStatus ===
                            MalwareStatus.PossiblyMalicious
                          ? "⚠️"
                          : malwareAnalysisStatus === MalwareStatus.Unknown
                            ? "❓"
                            : "❌"}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {malwareAnalysisLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div
                      className={`text-2xl font-bold ${
                        malwareAnalysisStatus === MalwareStatus.Safe
                          ? "text-green-500"
                          : malwareAnalysisStatus ===
                              MalwareStatus.PossiblyMalicious
                            ? "text-orange-500"
                            : malwareAnalysisStatus === MalwareStatus.Unknown
                              ? "text-gray-500"
                              : "text-red-500"
                      }`}
                    >
                      {malwareAnalysisStatus}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    OpenSSF Score
                  </CardTitle>
                  <Shield className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div
                    className={`inline-flex items-center gap-2 rounded-md px-3 py-1 text-2xl font-bold ${
                      getOpenSSFCombinedScore(insights) > 7
                        ? "bg-green-100 text-green-800"
                        : getOpenSSFCombinedScore(insights) >= 5
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {getOpenSSFCombinedScore(insights) > 7
                      ? "🏆"
                      : getOpenSSFCombinedScore(insights) >= 5
                        ? "⚠️"
                        : "❌"}{" "}
                    {Math.round(getOpenSSFCombinedScore(insights))}/10
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">License</CardTitle>
                  <Scale className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {getLicense(insights?.licenses?.licenses ?? [])}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analysis Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Vulnerability Breakdown</CardTitle>
                  <CardDescription>
                    Security issues by severity level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Severity</TableHead>
                        <TableHead>Count</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-red-100 text-red-800 hover:bg-red-100"
                          >
                            Critical
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getVulnerabilitiesCountBySeverity(
                            insights,
                            Severity_Risk.CRITICAL,
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">Action Required</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-orange-100 text-orange-800 hover:bg-orange-100"
                          >
                            High
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getVulnerabilitiesCountBySeverity(
                            insights,
                            Severity_Risk.HIGH,
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">Action Required</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          >
                            Medium
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getVulnerabilitiesCountBySeverity(
                            insights,
                            Severity_Risk.MEDIUM,
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Review</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 hover:bg-green-100"
                          >
                            Low
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getVulnerabilitiesCountBySeverity(
                            insights,
                            Severity_Risk.LOW,
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Monitor</Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Malicious Package Analysis</CardTitle>
                  <CardDescription>
                    Code analysis to detect malicious behavior
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Summary section */}
                  <div className="bg-muted rounded-lg">
                    <h4 className="font-medium">Summary</h4>
                    <ReactMarkdown>
                      {(
                        malwareAnalysis?.verificationRecord?.reason ||
                        malwareAnalysis?.report?.inference?.summary ||
                        ""
                      ).toString()}
                    </ReactMarkdown>
                  </div>
                  {/* Evidence section */}
                  <div>
                    <h4 className="mb-2 font-medium">Evidence</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm">
                        <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />
                        {malwareAnalysisBehavior.network_calls
                          ? "❌ Suspicious network calls detected"
                          : "✅ No suspicious network calls detected"}
                      </li>
                      <li className="flex items-center text-sm">
                        <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />
                        {malwareAnalysisBehavior.suspicious_project
                          ? "❌ Suspicious project detected"
                          : "✅ Clean dependency tree"}
                      </li>
                      <li className="flex items-center text-sm">
                        <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />
                        {malwareAnalysisBehavior.process_creation
                          ? "❌ Suspicious process creation detected"
                          : "✅ No suspicious process creation detected"}
                      </li>
                      <li className="flex items-center text-sm">
                        <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />
                        {malwareAnalysisBehavior.package_signature_missing
                          ? "❌ Package signature missing"
                          : "✅ Package signature verified"}
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>OpenSSF Scorecard</CardTitle>
                  <CardDescription>
                    Security health metrics from{" "}
                    <a
                      href="https://scorecard.dev/"
                      className="text-blue-500 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      OpenSSF Scorecard
                    </a>{" "}
                    that checks various security aspects of the package
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        data={Object.entries(securityScorecardScores).map(
                          ([key, value]) => ({
                            category: key,
                            score: value,
                          }),
                        )}
                      >
                        <PolarGrid />
                        <PolarAngleAxis
                          dataKey="category"
                          tick={{ fontSize: 12 }}
                        />
                        <PolarRadiusAxis
                          angle={30}
                          domain={[0, 10]}
                          tick={{ fontSize: 10 }}
                        />
                        <Radar
                          name="Score"
                          dataKey="score"
                          stroke="#4f46e5"
                          fill="#4f46e5"
                          fillOpacity={0.2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Repository Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Repository Information</CardTitle>
                  <CardDescription>
                    Open source project metrics and activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-2 font-medium">Repository</h4>
                      <a
                        href={projectRepositoryInformation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {projectRepositoryInformation.url}
                      </a>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-muted-foreground text-sm font-medium">
                          Stars
                        </h4>
                        <p className="text-2xl font-bold">
                          {projectRepositoryInformation.stars?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-muted-foreground text-sm font-medium">
                          Forks
                        </h4>
                        <p className="text-2xl font-bold">
                          {projectRepositoryInformation.forks?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-muted-foreground text-sm font-medium">
                          Open Issues
                        </h4>
                        <p className="text-2xl font-bold">
                          {projectRepositoryInformation.openIssues?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-muted-foreground text-sm font-medium">
                          Pull Requests
                        </h4>
                        <p className="text-2xl font-bold">
                          {projectRepositoryInformation.pullRequests?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vulnerabilities">
            <Card>
              <CardHeader>
                <CardDescription>
                  <p className="text-muted-foreground justify-left flex items-center gap-1 rounded-md bg-slate-100 p-2 text-sm dark:bg-slate-800">
                    Vulnerabilities detected in the package using
                    <a
                      href="https://docs.safedep.io/guides/insights-api-using-typescript"
                      className="flex items-center gap-1 text-blue-500 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" /> SafeDep Insights API
                    </a>
                  </p>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>CVE</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getVulnerabilities(insights).map((vuln) => (
                      <TableRow key={vuln.id}>
                        <TableCell className="font-mono">{vuln.id}</TableCell>
                        <TableCell className="font-mono">{vuln.cve}</TableCell>
                        <TableCell className="font-medium">
                          {vuln.title}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${getRiskColor(getRiskName(vuln.severity)).bg} ${getRiskColor(getRiskName(vuln.severity)).text}`}
                          >
                            {getRiskName(vuln.severity)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <a
                            href={vuln.reference_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700"
                          >
                            <span>View Details</span>
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="code">
            <MalwareAnalysis
              malwareAnalysis={malwareAnalysis}
              malwareAnalysisStatus={malwareAnalysisStatus}
              malwareEvidences={malwareEvidences}
            />
          </TabsContent>

          <TabsContent value="versions">
            <Card>
              <CardHeader>
                <CardDescription>
                  <p className="text-muted-foreground justify-left flex items-center gap-1 rounded-md bg-slate-100 p-2 text-sm dark:bg-slate-800">
                    Vulnerabilities detected in the package using
                    <a
                      href="https://docs.safedep.io/guides/insights-api-using-typescript"
                      className="flex items-center gap-1 text-blue-500 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" /> SafeDep Insights API
                    </a>
                  </p>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Version</TableHead>
                      <TableHead>Published At</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortVersions(getVersions(insights)).map((version) => (
                      <TableRow
                        key={version.version}
                        className={version.is_default ? "bg-blue-50" : ""}
                      >
                        <TableCell className="font-medium">
                          {version.version}
                        </TableCell>
                        <TableCell>
                          {new Date(version.published_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {version.is_default && (
                            <Badge
                              variant="outline"
                              className="bg-blue-100 text-blue-800"
                            >
                              Default
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {version.version === packageVersion.version ? (
                            <div className="text-sm text-gray-400">
                              Current version
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/v/${packageVersion.ecosystem}/${packageVersion.name}/${version.version}`}
                                className="text-sm text-blue-500 hover:text-blue-700"
                              >
                                View
                              </Link>
                              <span className="text-gray-300">|</span>
                              <button
                                onClick={() => handleCompare(version.version)}
                                className="text-sm text-blue-500 hover:text-blue-700"
                              >
                                Compare
                              </button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dependency-graph">
            <Card>
              <CardHeader>
                <CardTitle>Dependency Graph</CardTitle>
                <CardDescription>
                  Network of direct and transitive dependencies.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DependencyGraph
                  insights={insights}
                  packageName={packageVersion.name ?? ""}
                  packageVersion={packageVersion.version ?? ""}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <Footer />
      </div>
      <Dialog open={showDiffViewer} onOpenChange={setShowDiffViewer}>
        <DialogTrigger></DialogTrigger>
        <DialogPortal>
          <DialogOverlay className="data-[state=open]:animate-fadeIn fixed inset-0 bg-black/50 dark:bg-black/50" />
          <DialogContent className="z-50 max-h-[90vh] max-w-5xl overflow-y-auto bg-white dark:bg-gray-900 dark:text-white">
            <DialogHeader>
              <DialogTitle className="text-gray-500 dark:text-gray-300">
                Diff Viewer
              </DialogTitle>
              <DialogDescription className="text-gray-500 dark:text-gray-300">
                Comparing {packageVersion.version} with {compareVersion}
              </DialogDescription>
            </DialogHeader>
            {!compareInsightsLoading ? (
              <DiffViewer
                currentInsights={insights!}
                currentMalwareAnalysis={malwareAnalysis!}
                compareInsights={compareInsights!}
                compareMalwareAnalysis={compareMalwareAnalysis!}
                currentVersion={packageVersion.version!}
                compareVersion={compareVersion}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
                <Spinner />
                <p className="mt-2 text-sm">Loading comparison data...</p>
              </div>
            )}
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
