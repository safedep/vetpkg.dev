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

import { useParams } from "next/navigation";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import { useEffect, useState } from "react";
import { PackageVersionInsight } from "@buf/safedep_api.bufbuild_es/safedep/messages/package/v1/package_version_insight_pb";
import { getPackageVersionInfo, queryMalwareAnalysis } from "../../actions";
import { QueryPackageAnalysisResponse } from "@buf/safedep_api.bufbuild_es/safedep/services/malysis/v1/malysis_pb";

enum MalwareStatus {
  Safe = "Safe",
  PossiblyMalicious = "Possibly Malicious",
  Malicious = "Malicious",
}

enum Confidence {
  High = "High",
  Medium = "Medium",
  Low = "Low",
}

interface Version {
  version: string;
  published_at: string;
  is_default: boolean;
}

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
    default:
      return "📦";
  }
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

export default function Page() {
  const params = useParams<{
    ecosystem: string;
    name: string;
    version: string;
  }>();

  const [insights, setInsights] = useState<PackageVersionInsight | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);

  const [malwareAnalysis, setMalwareAnalysis] =
    useState<QueryPackageAnalysisResponse | null>(null);
  const [malwareAnalysisLoading, setMalwareAnalysisLoading] = useState(true);

  useEffect(() => {
    setInsightsLoading(true);
    setMalwareAnalysisLoading(true);

    getPackageVersionInfo(params.ecosystem, params.name, params.version)
      .then(setInsights)
      .then(() => setInsightsLoading(false))
      .catch(console.error);

    queryMalwareAnalysis(params.ecosystem, params.name, params.version)
      .then(setMalwareAnalysis)
      .then(() => setMalwareAnalysisLoading(false))
      .catch(console.error);
  }, [params.ecosystem, params.name, params.version]);

  // Mock data - replace with API calls
  const securityMetrics = {
    vulnerability_stats: {
      critical: 1,
      high: 3,
      medium: 7,
      low: 12,
    },
    malwareScore: {
      score: 98,
      status: MalwareStatus.Malicious,
    },
    openSSFScore: 8.2,
    license: "MIT",
    scanStatus: MalwareStatus.Malicious,
    openSSFMetrics: [
      { category: "Vulnerability", score: 8 },
      { category: "Maintenance", score: 7 },
      { category: "SAST", score: 9 },
      { category: "Code Review", score: 6 },
      { category: "Contributors", score: 8 },
      { category: "Packaging", score: 9 },
      { category: "Signed Releases", score: 7 },
    ],
    repository: {
      url: "https://github.com/organization/package-name",
      stars: 1234,
      forks: 245,
      openIssues: 34,
      pullRequests: 12,
      lastCommit: "2024-03-15",
      contributors: 67,
      weeklyDownloads: 45678,
    },
    vulnerabilities: [
      {
        id: "1",
        title: "Vulnerability 1",
        severity: "High",
        description: "Description of vulnerability 1",
        reference_url: "https://example.com/vuln1",
      },
      {
        id: "2",
        title: "Vulnerability 2",
        severity: "Medium",
        description: "Description of vulnerability 2",
        reference_url: "https://example.com/vuln2",
      },
    ],
    code_analysis: {
      is_malware: true,
      is_verified: true,
      reason: "The package is malware",
      details: "The package is malware because of various reasons",
      evidences: [
        {
          source: "Project Analyzer",
          confidence: Confidence.High,
          description: "The package is malware because of various reasons",
        },
        {
          source: "File Source Analyzer",
          confidence: Confidence.Medium,
          description: "The package is malware because of various reasons",
        },
        {
          source: "Network Source Analyzer",
          confidence: Confidence.Low,
          description: "The package is malware because of various reasons",
        },
      ],
    },
    versions: [
      {
        version: "1.0.0",
        published_at: "2024-03-15",
        is_default: false,
      },
      {
        version: "1.0.1-2024-03-16-1234567890",
        published_at: "2024-03-16",
        is_default: true,
      },
      {
        version: "1.0.2",
        published_at: "2024-03-17",
        is_default: false,
      },
    ],
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* Package Header */}
        <Card
          className={`border-l-4 ${
            securityMetrics.scanStatus === MalwareStatus.Safe
              ? "border-l-green-500"
              : "border-l-red-500"
          }`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {params.name} v{params.version}
                </CardTitle>
                <CardDescription>
                  <span className="bg-slate-100 px-2 py-1 rounded-md">
                    {getEcosystemIcon(params.ecosystem)} {params.ecosystem}{" "}
                    Package
                  </span>
                </CardDescription>
              </div>
              <Badge
                variant="default"
                className={`text-md px-4 py-1 flex items-center gap-2 ${
                  securityMetrics.scanStatus === MalwareStatus.Safe
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {securityMetrics.scanStatus === MalwareStatus.Safe ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <ShieldAlert className="h-4 w-4" />
                )}
                {securityMetrics.scanStatus}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Replace the grid div with Tabs */}
        <Tabs defaultValue="security" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger
              value="security"
              className="flex items-center gap-2 data-[state=active]:bg-blue-100"
            >
              🛡️ Security Posture
            </TabsTrigger>
            <TabsTrigger
              value="vulnerabilities"
              className="flex items-center gap-2 data-[state=active]:bg-red-100"
            >
              🔍 Vulnerabilities
            </TabsTrigger>
            <TabsTrigger
              value="code"
              className="flex items-center gap-2 data-[state=active]:bg-green-100"
            >
              💻 Code Analysis
            </TabsTrigger>
            <TabsTrigger
              value="versions"
              className="flex items-center gap-2 data-[state=active]:bg-purple-100"
            >
              📦 Available Versions
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
                    {securityMetrics.vulnerability_stats.critical}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Malware Analysis
                  </CardTitle>
                  <div
                    className={`h-4 w-4 ${
                      securityMetrics.malwareScore.status === MalwareStatus.Safe
                        ? "text-green-500"
                        : securityMetrics.malwareScore.status ===
                            MalwareStatus.PossiblyMalicious
                          ? "text-orange-500"
                          : "text-red-500"
                    }`}
                  >
                    {securityMetrics.malwareScore.status === MalwareStatus.Safe
                      ? "✅"
                      : securityMetrics.malwareScore.status ===
                          MalwareStatus.PossiblyMalicious
                        ? "⚠️"
                        : "❌"}
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      securityMetrics.malwareScore.status === MalwareStatus.Safe
                        ? "text-green-500"
                        : securityMetrics.malwareScore.status ===
                            MalwareStatus.PossiblyMalicious
                          ? "text-orange-500"
                          : "text-red-500"
                    }`}
                  >
                    {securityMetrics.malwareScore.status}
                  </div>
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
                  <div className="text-2xl font-bold text-blue-500">
                    {securityMetrics.openSSFScore}/10
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
                    {securityMetrics.license}
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
                          {securityMetrics.vulnerability_stats.critical}
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
                          {securityMetrics.vulnerability_stats.high}
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
                          {securityMetrics.vulnerability_stats.medium}
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
                          {securityMetrics.vulnerability_stats.low}
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
                  <CardTitle>Security Analysis</CardTitle>
                  <CardDescription>
                    Malware detection results and evidences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-muted p-4">
                    <h4 className="mb-2 font-medium">Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      Package shows no signs of malicious behavior. Static
                      analysis complete with 98% confidence score. All
                      dependencies verified.
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-2 font-medium">Evidence</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm">
                        <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />
                        No suspicious network calls detected
                      </li>
                      <li className="flex items-center text-sm">
                        <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />
                        Clean dependency tree
                      </li>
                      <li className="flex items-center text-sm">
                        <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />
                        No obfuscated code found
                      </li>
                      <li className="flex items-center text-sm">
                        <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />
                        Package signature verified
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
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        data={securityMetrics.openSSFMetrics}
                      >
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} />
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
                        href={securityMetrics.repository.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {securityMetrics.repository.url}
                      </a>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Stars
                        </h4>
                        <p className="text-2xl font-bold">
                          {securityMetrics.repository.stars.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Forks
                        </h4>
                        <p className="text-2xl font-bold">
                          {securityMetrics.repository.forks.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Open Issues
                        </h4>
                        <p className="text-2xl font-bold">
                          {securityMetrics.repository.openIssues.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Pull Requests
                        </h4>
                        <p className="text-2xl font-bold">
                          {securityMetrics.repository.pullRequests.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Contributors
                        </span>
                        <span className="font-medium">
                          {securityMetrics.repository.contributors.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Last Commit
                        </span>
                        <span className="font-medium">
                          {new Date(
                            securityMetrics.repository.lastCommit,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Weekly Downloads
                        </span>
                        <span className="font-medium">
                          {securityMetrics.repository.weeklyDownloads.toLocaleString()}
                        </span>
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
                  <p className="text-sm text-muted-foreground justify-left flex items-center gap-1 bg-slate-100 p-2 rounded-md">
                    Vulnerabilities detected in the package using
                    <a
                      href="https://docs.safedep.io/guides/insights-api-using-typescript"
                      className="text-blue-500 hover:underline flex items-center gap-1"
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
                      <TableHead>Title</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {securityMetrics.vulnerabilities.map((vuln) => (
                      <TableRow key={vuln.id}>
                        <TableCell className="font-mono">{vuln.id}</TableCell>
                        <TableCell className="font-medium">
                          {vuln.title}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`
                              ${
                                vuln.severity === "Critical"
                                  ? "bg-red-100 text-red-800"
                                  : vuln.severity === "High"
                                    ? "bg-orange-100 text-orange-800"
                                    : vuln.severity === "Medium"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                              }
                            `}
                          >
                            {vuln.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md">
                          {vuln.description}
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
            <Card>
              <CardHeader>
                <CardDescription>
                  <p className="text-sm text-muted-foreground justify-left flex items-center gap-1 bg-slate-100 p-2 rounded-md">
                    Malicious code scanning is performed using
                    <a
                      href="https://docs.safedep.io/cloud/malware-analysis"
                      className="text-blue-500 hover:underline flex items-center gap-1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" /> SafeDep Malicious
                      Package Scanning API
                    </a>
                  </p>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Summary */}
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className={`text-lg font-semibold ${
                        securityMetrics.code_analysis.is_malware
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {securityMetrics.code_analysis.is_malware
                        ? "⚠️ Malware Detected"
                        : "✅ Clean Package"}
                    </span>
                    {securityMetrics.code_analysis.is_verified && (
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-800"
                      >
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">Reason:</p>
                    <p className="text-sm text-muted-foreground">
                      <ReactMarkdown>
                        {securityMetrics.code_analysis.reason}
                      </ReactMarkdown>
                    </p>
                    <p className="font-medium mt-4">Details:</p>
                    <div className="text-sm text-muted-foreground prose prose-sm max-w-none">
                      <ReactMarkdown>
                        {securityMetrics.code_analysis.details}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>

                {/* Evidence Table */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Analysis Evidence
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {securityMetrics.code_analysis.evidences.map(
                        (evidence, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {evidence.source}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`
                              ${
                                evidence.confidence === Confidence.High
                                  ? "bg-red-100 text-red-800"
                                  : evidence.confidence === Confidence.Medium
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                              }
                            `}
                              >
                                {evidence.confidence}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xl">
                              {evidence.description}
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="versions">
            <Card>
              <CardHeader>
                <CardDescription>
                  <p className="text-sm text-muted-foreground justify-left flex items-center gap-1 bg-slate-100 p-2 rounded-md">
                    Vulnerabilities detected in the package using
                    <a
                      href="https://docs.safedep.io/guides/insights-api-using-typescript"
                      className="text-blue-500 hover:underline flex items-center gap-1"
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortVersions(securityMetrics.versions).map((version) => (
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
