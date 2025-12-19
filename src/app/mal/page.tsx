"use client";

import Footer from "@/components/app/footer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ExternalLink,
  Github,
  Shield,
  Terminal,
  AlertTriangle,
} from "lucide-react";

export default function MalwarePage() {
  return (
    <div className="container mx-auto max-w-6xl p-4">
      <h1 className="mb-6 scroll-m-20 font-mono text-3xl font-extrabold tracking-tight lg:text-4xl">
        <span className="text-indigo-500 dark:text-indigo-400">Malware</span>{" "}
        Analysis Records
      </h1>

      <p className="text-md mb-6 text-gray-500 dark:text-gray-400">
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
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Feed Deprecated</AlertTitle>
          <AlertDescription>
            The malicious package analysis feed has been deprecated. Please see{" "}
            <a
              href="https://app.safedep.io"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline"
            >
              SafeDep App
            </a>{" "}
            for the latest feeds.
          </AlertDescription>
        </Alert>
      </div>

      <div className="mb-8">
        <div className="rounded-lg border border-indigo-200/50 bg-linear-to-r from-indigo-50 to-purple-50 p-6 dark:border-indigo-800/30 dark:from-indigo-950/50 dark:to-purple-950/50">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
                <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Protect Your CI/CD Pipeline
              </h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Use SafeDep vet to automatically detect and block malicious
                packages before they reach production. Add security scanning to
                your workflow in minutes.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="https://github.com/safedep/vet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="inline-flex items-center gap-3 rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-xs transition-all duration-200 hover:bg-gray-800 hover:shadow-md dark:bg-gray-700 dark:hover:bg-gray-600">
                    <Terminal className="h-4 w-4" />
                    <code className="font-mono">$ vet scan --malware</code>
                    <Github className="h-4 w-4 opacity-75 transition-opacity group-hover:opacity-100" />
                  </div>
                </a>
                <a
                  href="https://docs.safedep.io/cloud/malware-analysis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-xs transition-all duration-200 hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Documentation
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
