"use client";

import { PackageStreamItem } from "./types";
import { useEffect, useRef } from "react";
import Link from "next/link";

interface StreamingPackageListProps {
  packages: PackageStreamItem[];
}

export function StreamingPackageList({ packages }: StreamingPackageListProps) {
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new packages arrive
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [packages]);

  const formatTimestamp = (timestamp?: string | number) => {
    if (!timestamp) return "00:00:00";
    const date =
      typeof timestamp === "string" ? new Date(timestamp) : new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatEcosystem = (ecosystem: string) => {
    // Convert "ECOSYSTEM_NPM" to "npm"
    return ecosystem.replace("ECOSYSTEM_", "").toLowerCase();
  };

  if (packages.length === 0) {
    return (
      <div className="bg-gray-900 dark:bg-gray-800 rounded-lg border border-gray-700 dark:border-gray-600 overflow-hidden h-full flex flex-col">
        <div className="bg-gray-800 dark:bg-gray-700 px-4 py-2 border-b border-gray-700 dark:border-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="ml-2 text-sm text-gray-300 dark:text-gray-400">
              vetpkg.dev - OSS Package Stream
            </span>
          </div>
        </div>
        <div className="p-4 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-green-400 dark:text-green-300 mb-2">
              $ tail -f /var/log/packages.log
            </div>
            <div className="text-gray-500 dark:text-gray-400 animate-pulse">
              Waiting for package data...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 dark:bg-gray-800 rounded-lg border border-gray-700 dark:border-gray-600 overflow-hidden h-full flex flex-col">
      {/* Terminal Header */}
      <div className="bg-gray-800 dark:bg-gray-700 px-4 py-2 border-b border-gray-700 dark:border-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="ml-2 text-sm text-gray-300 dark:text-gray-400">
            vetpkg.dev - OSS Package Stream
          </span>
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-900 dark:bg-gray-800 font-mono text-sm leading-relaxed"
      >
        <div className="text-green-400 dark:text-green-300 mb-2">
          $ tail -f /var/log/packages.log
        </div>

        {packages.map((pkg, index) => (
          <div
            key={pkg.sequenceNumber || index}
            className="mb-1 hover:bg-gray-800 dark:hover:bg-gray-700 px-2 py-1 rounded"
          >
            <span className="text-gray-500 dark:text-gray-400">
              [{formatTimestamp(pkg.timestamp)}]
            </span>
            <span className="text-purple-400 dark:text-purple-300 ml-2">
              #{(pkg.sequenceNumber || 0).toString().padStart(6, "0")}
            </span>
            <span className="text-yellow-400 dark:text-yellow-300 ml-2">
              {pkg.package?.ecosystem
                ? formatEcosystem(pkg.package.ecosystem)
                : "unknown"}
            </span>
            <Link
              href={`/v/${pkg.package?.ecosystem ? formatEcosystem(pkg.package.ecosystem) : "unknown"}/${pkg.package?.name || "unknown"}/${pkg.version || "unknown"}`}
              className="text-cyan-400 dark:text-cyan-300 ml-2 hover:text-cyan-300 dark:hover:text-cyan-200 hover:underline"
            >
              {pkg.package?.name || "unknown"}
            </Link>
            <span className="text-gray-400 dark:text-gray-300 ml-1">
              @{pkg.version || "unknown"}
            </span>
          </div>
        ))}

        {/* Cursor indicator */}
        <div className="text-green-400 dark:text-green-300 animate-pulse">
          _
        </div>
      </div>
    </div>
  );
}
