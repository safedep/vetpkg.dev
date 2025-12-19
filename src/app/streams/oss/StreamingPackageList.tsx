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
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      }, 0);
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
      <div className="flex h-[60vh] flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-900 sm:h-[60vh] dark:border-gray-600 dark:bg-gray-800">
        <div className="hidden border-b border-gray-700 bg-gray-800 px-4 py-2 sm:block dark:border-gray-600 dark:bg-gray-700">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="ml-2 text-sm text-gray-300 dark:text-gray-400">
              vetpkg.dev - OSS Package Stream
            </span>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="text-center">
            <div className="mb-2 hidden text-green-400 sm:block dark:text-green-300">
              $ tail -f /var/log/packages.log
            </div>
            <div className="animate-pulse text-gray-500 dark:text-gray-400">
              Waiting for package data...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[60vh] flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-900 sm:h-[60vh] dark:border-gray-600 dark:bg-gray-800">
      {/* Terminal Header - hidden on mobile for more space */}
      <div className="hidden border-b border-gray-700 bg-gray-800 px-4 py-2 sm:block dark:border-gray-600 dark:bg-gray-700">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <span className="ml-2 text-sm text-gray-300 dark:text-gray-400">
            vetpkg.dev - OSS Package Stream
          </span>
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto bg-gray-900 p-2 font-mono text-xs leading-relaxed sm:p-4 sm:text-sm dark:bg-gray-800"
      >
        <div className="mb-2 hidden text-green-400 sm:block dark:text-green-300">
          $ tail -f /var/log/packages.log
        </div>

        {packages.map((pkg, index) => (
          <div
            key={pkg.sequenceNumber || index}
            className="mb-1 rounded px-1 py-1 hover:bg-gray-800 sm:px-2 dark:hover:bg-gray-700"
          >
            {/* Desktop layout */}
            <div className="hidden sm:block">
              <span className="text-gray-500 dark:text-gray-400">
                [{formatTimestamp(pkg.timestamp)}]
              </span>
              <span className="ml-2 text-purple-400 dark:text-purple-300">
                #{(pkg.sequenceNumber || 0).toString().padStart(6, "0")}
              </span>
              <span className="ml-2 text-yellow-400 dark:text-yellow-300">
                {pkg.package?.ecosystem
                  ? formatEcosystem(pkg.package.ecosystem)
                  : "unknown"}
              </span>
              <Link
                href="#"
                className="ml-2 text-cyan-400 hover:text-cyan-300 hover:underline dark:text-cyan-300 dark:hover:text-cyan-200"
              >
                {pkg.package?.name || "unknown"}@{pkg.version || "unknown"}
              </Link>
            </div>

            {/* Mobile layout - more compact */}
            <div className="sm:hidden">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  [{formatTimestamp(pkg.timestamp)}]
                </span>
                <span className="text-xs text-purple-400 dark:text-purple-300">
                  #{(pkg.sequenceNumber || 0).toString().padStart(6, "0")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-yellow-400 dark:text-yellow-300">
                  {pkg.package?.ecosystem
                    ? formatEcosystem(pkg.package.ecosystem)
                    : "unknown"}
                </span>
                <Link
                  href="#"
                  className="flex-1 truncate text-cyan-400 hover:text-cyan-300 hover:underline dark:text-cyan-300 dark:hover:text-cyan-200"
                >
                  {pkg.package?.name || "unknown"}@{pkg.version || "unknown"}
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Cursor indicator */}
        <div className="animate-pulse text-green-400 dark:text-green-300">
          _
        </div>
      </div>
    </div>
  );
}
