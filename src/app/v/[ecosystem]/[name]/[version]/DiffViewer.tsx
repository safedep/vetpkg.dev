import { PackageVersionInsight } from "@buf/safedep_api.bufbuild_es/safedep/messages/package/v1/package_version_insight_pb";
import { QueryPackageAnalysisResponse } from "@buf/safedep_api.bufbuild_es/safedep/services/malysis/v1/malysis_pb";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getConfidenceName,
  getRiskColor,
  getRiskName,
  getVulnerabilities,
} from "./utils";
import { getMalwareEvidences } from "./utils";

interface DiffViewerProps {
  currentInsights: PackageVersionInsight;
  currentMalwareAnalysis: QueryPackageAnalysisResponse;
  compareInsights: PackageVersionInsight;
  compareMalwareAnalysis: QueryPackageAnalysisResponse;
  currentVersion: string;
  compareVersion: string;
}

export function DiffViewer({
  currentInsights,
  currentMalwareAnalysis,
  compareInsights,
  compareMalwareAnalysis,
  currentVersion,
  compareVersion,
}: DiffViewerProps) {
  const currentVulns = getVulnerabilities(currentInsights);
  const compareVulns = getVulnerabilities(compareInsights);
  const currentEvidences = getMalwareEvidences(currentMalwareAnalysis);
  const compareEvidences = getMalwareEvidences(compareMalwareAnalysis);

  // Find new and removed vulnerabilities
  const newVulns = currentVulns.filter(
    (v) => !compareVulns.find((cv) => cv.id === v.id),
  );
  const removedVulns = compareVulns.filter(
    (v) => !currentVulns.find((cv) => cv.id === v.id),
  );

  // Find new and removed malware evidences
  const newEvidences = currentEvidences.filter(
    (e) => !compareEvidences.find((ce) => ce.title === e.title),
  );
  const removedEvidences = compareEvidences.filter(
    (e) => !currentEvidences.find((ce) => ce.title === e.title),
  );

  return (
    <div className="flex flex-col w-full">
      <Tabs
        defaultValue="vulnerabilities"
        className="w-full dark:text-white text-gray-800"
      >
        <TabsList>
          <TabsTrigger
            value="vulnerabilities"
            className="dark:text-white text-gray-800"
          >
            Vulnerabilities
          </TabsTrigger>
          <TabsTrigger
            value="malware"
            className="dark:text-white text-gray-800"
          >
            Malware Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vulnerabilities">
          <Card>
            <CardHeader>
              <CardTitle>Vulnerability Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* New Vulnerabilities */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    New Vulnerabilities in {currentVersion}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    These vulnerabilities were discovered in {currentVersion}{" "}
                    but were not present in {compareVersion}.
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>CVE</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Severity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {newVulns.map((vuln) => (
                        <TableRow key={vuln.id}>
                          <TableCell>{vuln.id}</TableCell>
                          <TableCell>{vuln.cve}</TableCell>
                          <TableCell>{vuln.title}</TableCell>
                          <TableCell>
                            <Badge
                              variant="destructive"
                              className={`${getRiskColor(getRiskName(vuln.severity)).bg} ${getRiskColor(getRiskName(vuln.severity)).text}`}
                            >
                              {getRiskName(vuln.severity)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {newVulns.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            No new vulnerabilities
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Removed Vulnerabilities */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Vulnerabilities Fixed from {compareVersion}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    These vulnerabilities were present in {compareVersion} but
                    have been fixed in the current version.
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>CVE</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Severity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {removedVulns.map((vuln) => (
                        <TableRow key={vuln.id}>
                          <TableCell>{vuln.id}</TableCell>
                          <TableCell>{vuln.cve}</TableCell>
                          <TableCell>{vuln.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-100">
                              {getRiskName(vuln.severity)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {removedVulns.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            No fixed vulnerabilities
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="malware">
          <Card>
            <CardHeader>
              <CardTitle>Malware Analysis Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* New Malware Evidence */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    New Malware Evidence in {currentVersion}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Malicious code patterns and behaviors detected in this
                    version that were not present before
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead>File</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Confidence</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {newEvidences.map((evidence, index) => (
                        <TableRow key={index}>
                          <TableCell>{evidence.source}</TableCell>
                          <TableCell>
                            {evidence.fileKey || evidence.projectSource}
                          </TableCell>
                          <TableCell>{evidence.title}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">
                              {getConfidenceName(evidence.confidence)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {newEvidences.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            No new malware evidence
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Removed Malware Evidence */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Resolved Malware Evidence from {compareVersion}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Malicious code patterns and behaviors that were present in
                    the previous version but have been removed
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead>File</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Confidence</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {removedEvidences.map((evidence, index) => (
                        <TableRow key={index}>
                          <TableCell>{evidence.source}</TableCell>
                          <TableCell>
                            {evidence.fileKey || evidence.projectSource}
                          </TableCell>
                          <TableCell>{evidence.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-100">
                              {evidence.confidence}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {removedEvidences.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            No resolved malware evidence
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
