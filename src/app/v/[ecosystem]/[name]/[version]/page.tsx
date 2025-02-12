"use client";

import { Scale, Shield, ShieldAlert, ShieldCheck } from "lucide-react";

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

enum MalwareStatus {
  Safe = "Safe",
  PossiblyMalicious = "Possibly Malicious",
  Malicious = "Malicious",
}

export default function Page() {
  const params = useParams<{
    ecosystem: string;
    name: string;
    version: string;
  }>();

  // Mock data - replace with API calls
  const securityMetrics = {
    vulnerabilities: {
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
                <CardDescription>{params.ecosystem} Package</CardDescription>
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
                    {securityMetrics.vulnerabilities.critical}
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
                          {securityMetrics.vulnerabilities.critical}
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
                          {securityMetrics.vulnerabilities.high}
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
                          {securityMetrics.vulnerabilities.medium}
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
                          {securityMetrics.vulnerabilities.low}
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
            </div>
          </TabsContent>

          <TabsContent value="vulnerabilities">
            <Card>
              <CardHeader>
                <CardTitle>Vulnerability Details</CardTitle>
                <CardDescription>
                  Comprehensive list of detected vulnerabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="code">
            <Card>
              <CardHeader>
                <CardTitle>Static Code Analysis</CardTitle>
                <CardDescription>
                  Detailed code quality and security analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="versions">
            <Card>
              <CardHeader>
                <CardTitle>Version History</CardTitle>
                <CardDescription>
                  Available versions and their security status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
