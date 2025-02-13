"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">About vetpkg.dev</CardTitle>
            <CardDescription>
              Advanced package security analysis for modern development teams by{" "}
              <Link
                className="text-blue-500 hover:text-blue-700"
                href="https://safedep.io"
                target="_blank"
                rel="noopener noreferrer"
              >
                Engineering @ SafeDep 👨‍💻
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">What is vetpkg.dev?</h2>
              <ReactMarkdown>
                `vetpkg.dev` is a service built using [SafeDep Cloud
                API](https://docs.safedep.io) with the goal of providing a
                simple and easy to use interface for developers to scan their
                dependencies for security vulnerabilities, malware and other
                potential risks.
              </ReactMarkdown>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Key Features</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  Deep package analysis with vulnerability and CVE detection
                </li>
                <li>Advanced malware detection using behavioral analysis</li>
                <li>Comprehensive security metrics and risk assessment</li>
                <li>License compliance and compatibility verification</li>
                <li>Detailed dependency analytics and security insights</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Powered By</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">SafeDep Cloud API</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      SafeDep Cloud API provides aggregated open source package
                      security insights data. It also provides a{" "}
                      <Link
                        className="text-blue-500 hover:text-blue-700"
                        href="https://docs.safedep.io/cloud/malware-analysis"
                      >
                        {" "}
                        malicious code analysis service{" "}
                      </Link>
                      that is used to detect malicious code in open source
                      packages.
                    </p>
                    <Link
                      href="https://docs.safedep.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-blue-500 hover:text-blue-700"
                    >
                      Learn more <ExternalLink className="h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">OpenSSF Scorecard</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Security health metrics from the Open Source Security
                      Foundation&apos;s Scorecard project.
                    </p>
                    <Link
                      href="https://securityscorecards.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-blue-500 hover:text-blue-700"
                    >
                      Learn more <ExternalLink className="h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">deps.dev</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Google&apos;s OSS insights project providing insights into
                      package metadata, dependencies, and security information
                      across multiple ecosystems.
                    </p>
                    <Link
                      href="https://deps.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-blue-500 hover:text-blue-700"
                    >
                      Learn more <ExternalLink className="h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">OSV</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Vulnerability database for open source projects maintained
                      by the Google Open Source Security team.
                    </p>
                    <Link
                      href="https://osv.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-blue-500 hover:text-blue-700"
                    >
                      Learn more <ExternalLink className="h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Get Started</h2>
              <p className="text-muted-foreground">
                Ready to scan your packages? Head back to the scanner and enter
                your package details.
              </p>
              <Link
                href="/"
                className="inline-block rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Go to Scanner
              </Link>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
