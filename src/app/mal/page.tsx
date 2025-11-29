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

      <Footer />
    </div>
  );
}
