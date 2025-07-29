"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToEcosystemName } from "@/lib/rpc/utils";
import { PackageAnalysisTarget } from "@buf/safedep_api.bufbuild_es/safedep/messages/malysis/v1/request_pb";
import { ListPackageAnalysisRecordsResponse_AnalysisRecord } from "@buf/safedep_api.bufbuild_es/safedep/services/malysis/v1/malysis_pb";
import { Timestamp } from "@bufbuild/protobuf/wkt";
import { useEffect, useState, useRef, useCallback } from "react";
import { listMalwareAnalysis } from "./actions";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  ExternalLink,
  Copy,
  MoreHorizontal,
  Filter,
  ChevronDown,
  Github,
  Shield,
  Terminal,
} from "lucide-react";
import Footer from "@/components/app/footer";

export default function MalwarePage() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<
    ListPackageAnalysisRecordsResponse_AnalysisRecord[]
  >([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(
    undefined,
  );
  const [prevPageTokens, setPrevPageTokens] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    onlyMalware: false,
    onlyVerified: false,
    pageSize: 10,
  });
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchRecords = useCallback(
    async ({
      pageToken,
      isAutoRefresh = false,
    }: {
      pageToken?: string;
      isAutoRefresh?: boolean;
    }) => {
      if (!isAutoRefresh) {
        setLoading(true);
      }
      try {
        const response = await listMalwareAnalysis({
          onlyMalware: filters.onlyMalware,
          onlyVerified: filters.onlyVerified,
          pageSize: filters.pageSize,
          pageToken: pageToken,
        });

        // Convert the response records to our expected format
        setRecords(response.records || []);
        setNextPageToken(response.pagination?.nextPageToken);
        if (!isAutoRefresh) {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching package analysis records:", error);
        setLoading(false);
      }
    },
    [filters.onlyMalware, filters.onlyVerified, filters.pageSize],
  );

  useEffect(() => {
    fetchRecords({ isAutoRefresh: false });
  }, [fetchRecords]);

  useEffect(() => {
    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    // Set up auto-refresh if enabled
    if (autoRefresh) {
      refreshTimerRef.current = setInterval(() => {
        fetchRecords({ isAutoRefresh: true });
      }, 5000);
    }

    // Cleanup function
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, fetchRecords]);

  const handleNextPage = () => {
    if (nextPageToken) {
      setPrevPageTokens([...prevPageTokens, ""]); // Save current page state
      fetchRecords({ pageToken: nextPageToken, isAutoRefresh: false });
    }
  };

  const handlePrevPage = () => {
    if (prevPageTokens.length > 0) {
      const newPrevTokens = [...prevPageTokens];
      const prevToken = newPrevTokens.pop();
      setPrevPageTokens(newPrevTokens);
      fetchRecords({ pageToken: prevToken, isAutoRefresh: false });
    }
  };

  const handleFilterChange = (key: string, value: boolean | number) => {
    setPrevPageTokens([]);
    setNextPageToken(undefined);
    setFilters({ ...filters, [key]: value });
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: Timestamp | undefined): string => {
    if (!timestamp) return "Unknown";
    return new Date(
      Number(timestamp.seconds) * 1000 + Number(timestamp.nanos) / 1000000,
    ).toISOString();
  };

  // Helper function to get package name
  const formatPackageName = (
    target: PackageAnalysisTarget | undefined,
  ): string => {
    if (!target) return "Unknown";

    const ecosystemName = ToEcosystemName(
      target.packageVersion?.package?.ecosystem,
    );
    const packageName = target.packageVersion?.package?.name;
    const packageVersion = target.packageVersion?.version;

    if (!ecosystemName || !packageName || !packageVersion) return "Unknown";

    return `${ecosystemName}/${packageName}@${packageVersion}`;
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl mb-6 font-mono">
        <span className="text-indigo-500 dark:text-indigo-400">Malware</span>{" "}
        Analysis Records
      </h1>

      <p className="text-md text-gray-500 dark:text-gray-400 mb-6">
        Malicious Package Analysis is a{" "}
        <a
          href="https://safedep.io"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1"
        >
          <ExternalLink className="h-4 w-4" /> SafeDep Cloud
        </a>{" "}
        service.
      </p>

      <div className="mb-8">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-lg border border-indigo-200/50 dark:border-indigo-800/30 p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Protect Your CI/CD Pipeline
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Use SafeDep vet to automatically detect and block malicious
                packages before they reach production. Add security scanning to
                your workflow in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://github.com/safedep/vet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="inline-flex items-center gap-3 px-4 py-3 bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-lg font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md">
                    <Terminal className="w-4 h-4" />
                    <code className="font-mono">$ vet scan --malware</code>
                    <Github className="w-4 h-4 opacity-75 group-hover:opacity-100 transition-opacity" />
                  </div>
                </a>
                <a
                  href="https://docs.safedep.io/cloud/malware-analysis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Documentation
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-6">
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
          <Button
            variant="ghost"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between p-3 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800/50"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {(filters.onlyMalware ||
                filters.onlyVerified ||
                autoRefresh ||
                filters.pageSize !== 10) && (
                <span className="ml-2 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">
                  Active
                </span>
              )}
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
            />
          </Button>

          {showFilters && (
            <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="onlyMalware"
                    checked={filters.onlyMalware}
                    onChange={(e) =>
                      handleFilterChange("onlyMalware", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <Label htmlFor="onlyMalware" className="text-sm">
                    Only Malware
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="onlyVerified"
                    checked={filters.onlyVerified}
                    onChange={(e) =>
                      handleFilterChange("onlyVerified", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <Label htmlFor="onlyVerified" className="text-sm">
                    Only Verified
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoRefresh"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <Label htmlFor="autoRefresh" className="text-sm">
                    Auto Refresh (5s)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Label htmlFor="pageSize" className="text-sm">
                    Page Size:
                  </Label>
                  <Select
                    value={filters.pageSize.toString()}
                    onValueChange={(value) =>
                      handleFilterChange("pageSize", parseInt(value))
                    }
                  >
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-100 dark:bg-gray-800 shadow-lg">
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                No records found. Try adjusting your filters.
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Package</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Submitted At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map(
                      (
                        record: ListPackageAnalysisRecordsResponse_AnalysisRecord,
                        index: number,
                      ) => (
                        <TableRow key={record.analysisId || index}>
                          <TableCell className="font-mono">
                            <span className="flex items-center gap-2">
                              <ExternalLink className="h-4 w-4" />
                              <a
                                href={`https://platform.safedep.io/community/malysis/${record.analysisId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {formatPackageName(record.target)}
                              </a>
                            </span>
                          </TableCell>
                          <TableCell>
                            {record.isMalware ? (
                              <span className="bg-yellow-500 text-white px-2 py-1 rounded-md">
                                Suspicious
                              </span>
                            ) : (
                              <span className="bg-green-500 text-white px-2 py-1 rounded-md">
                                Clean
                              </span>
                            )}
                            {record.isVerified && (
                              <span className="bg-red-500 text-white px-2 py-1 rounded-md">
                                Malicious
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {record.isVerified ? "Yes" : "No"}
                          </TableCell>
                          <TableCell>
                            <span
                              className="font-mono text-sm text-gray-600 dark:text-gray-400"
                              title={formatTimestamp(record.createdAt)}
                            >
                              {formatTimestamp(record.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <div className="flex items-center gap-2">
                                  <a href="#" className="cursor-pointer">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </a>
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="menu bg-gray-100 dark:bg-gray-800 shadow-lg"
                              >
                                <DropdownMenuItem>
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  <a
                                    href={`https://platform.safedep.io/community/malysis/${record.analysisId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Details
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    if (record.analysisId) {
                                      navigator.clipboard.writeText(
                                        record.analysisId,
                                      );
                                    }
                                  }}
                                >
                                  <Copy className="mr-2 h-4 w-4" />
                                  <span>Copy ID</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>

                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevPage}
                    disabled={prevPageTokens.length === 0}
                  >
                    Previous
                  </Button>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {records.length} records
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleNextPage}
                    disabled={!nextPageToken}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
