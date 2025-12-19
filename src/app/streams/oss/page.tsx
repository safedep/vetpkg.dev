"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { StreamingPackageList } from "./StreamingPackageList";
import { PackageStreamItem } from "./types";
import { ChevronUp, ChevronDown } from "lucide-react";

// Cache configuration
const CACHE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

export default function OSSStreamsPage() {
  const [packages, setPackages] = useState<PackageStreamItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [reconnectInProgress, setReconnectInProgress] = useState(false);
  const [forceReconnect, setForceReconnect] = useState(0);
  const [totalPackagesCount, setTotalPackagesCount] = useState(0);
  const [isManuallyDisconnected, setIsManuallyDisconnected] = useState(false);
  const [duplicatesFilteredCount, setDuplicatesFilteredCount] = useState(0);
  const [lastSequenceNumber, setLastSequenceNumber] = useState<number | null>(
    null,
  );
  const [isStatusExpanded, setIsStatusExpanded] = useState(false);

  // Use useRef to maintain cache across renders without causing re-renders
  const packageCacheRef = useRef<Map<string, number>>(new Map());
  const cacheCleanupTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Ref to hold the latest sequence number for use in reconnection without triggering effect re-runs
  const lastSequenceNumberRef = useRef<number | null>(null);

  /**
   * Generate a minimal space hash for a package
   * Format: ecosystem:name:version
   */
  const generatePackageHash = (packageData: PackageStreamItem): string => {
    return `${packageData.package.ecosystem}:${packageData.package.name}:${packageData.version}`;
  };

  /**
   * Clean up cache entries older than the time window
   */
  const cleanupCache = () => {
    const now = Date.now();
    const cutoffTime = now - CACHE_WINDOW_MS;

    // Remove entries older than the time window
    for (const [hash, timestamp] of packageCacheRef.current.entries()) {
      if (timestamp < cutoffTime) {
        packageCacheRef.current.delete(hash);
      }
    }
  };

  /**
   * Check if a package is a duplicate within the time window
   */
  const isDuplicate = useCallback((packageData: PackageStreamItem): boolean => {
    const hash = generatePackageHash(packageData);
    const now = Date.now();

    // Clean up old entries before checking
    cleanupCache();

    if (packageCacheRef.current.has(hash)) {
      return true;
    }

    // Add to cache
    packageCacheRef.current.set(hash, now);
    return false;
  }, []);

  // Set up periodic cache cleanup
  useEffect(() => {
    // Clean up cache every minute
    cacheCleanupTimerRef.current = setInterval(() => {
      cleanupCache();
    }, 60000);

    return () => {
      if (cacheCleanupTimerRef.current) {
        clearInterval(cacheCleanupTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;
    let reconnectAttempts = 0;
    let isManualClose = false;

    const connect = () => {
      // Don't connect if manually disconnected
      if (isManuallyDisconnected) {
        return;
      }

      // Close existing connection if any
      if (eventSource) {
        eventSource.close();
      }

      // Build the URL with sequence number if available (use ref to get latest value)
      let url = "/streams/oss/api/stream";
      if (lastSequenceNumberRef.current !== null) {
        url += `?fromSequence=${lastSequenceNumberRef.current}`;
        console.log(
          `Reconnecting from sequence number: ${lastSequenceNumberRef.current}`,
        );
      }

      eventSource = new EventSource(url);

      eventSource.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        setReconnectInProgress(false);
        reconnectAttempts = 0; // Reset attempts on successful connection
        console.log("Connected to package stream");
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle different message types
          if (data.type === "connected") {
            console.log("Stream connection established");
            return;
          }

          if (data.type === "info") {
            console.log("Stream info:", data.message);
            return;
          }

          if (data.type === "keepalive") {
            console.log("Stream keep-alive:", data.timestamp);
            return;
          }

          if (data.type === "error") {
            setConnectionError(data.message || "Stream error");
            return;
          }

          // Handle package data
          const packageData: PackageStreamItem = data;

          // Update last sequence number if available
          if (packageData.sequenceNumber !== undefined) {
            lastSequenceNumberRef.current = packageData.sequenceNumber;
            setLastSequenceNumber(packageData.sequenceNumber);
          }

          // Check for duplicates using sliding window cache
          if (isDuplicate(packageData)) {
            setDuplicatesFilteredCount((prev) => prev + 1);
            console.log(
              "Filtered duplicate package:",
              generatePackageHash(packageData),
            );
            return;
          }

          setTotalPackagesCount((prev) => prev + 1);

          // To prevent overflowing the UI, we will keep last 1000 items
          // Add new packages at the end so most recent ones appear at the bottom
          setPackages((prev) => [...prev.slice(-999), packageData]);
        } catch (error) {
          console.error("Error parsing stream data:", error);
          setConnectionError("Error parsing stream data");
        }
      };

      eventSource.onerror = (error) => {
        console.log("EventSource error:", error);

        // Don't reconnect if this was a manual close or manual disconnect
        if (isManualClose || isManuallyDisconnected) {
          return;
        }

        setIsConnected(false);

        // Check if this is a network error vs server error
        const isNetworkError = eventSource?.readyState === EventSource.CLOSED;

        // Implement exponential backoff for reconnection
        reconnectAttempts++;
        const maxAttempts = isNetworkError ? 3 : 5; // Fewer retries for network errors
        const baseDelay = 3000;
        const maxDelay = 30000;

        if (reconnectAttempts <= maxAttempts) {
          const delay = Math.min(
            baseDelay * Math.pow(2, reconnectAttempts - 1),
            maxDelay,
          );

          setConnectionError(
            `Connection lost - reconnecting in ${delay / 1000}s (attempt ${reconnectAttempts}/${maxAttempts})...`,
          );
          setReconnectInProgress(true);

          if (reconnectTimer) {
            clearTimeout(reconnectTimer);
          }

          reconnectTimer = setTimeout(() => {
            console.log(
              `Attempting to reconnect to stream (attempt ${reconnectAttempts}/${maxAttempts})...`,
            );
            connect();
          }, delay);
        } else {
          const errorMessage = isNetworkError
            ? "Network connection lost. Please check your internet connection and refresh the page."
            : "Failed to reconnect after multiple attempts. Please refresh the page.";
          setConnectionError(errorMessage);
          setReconnectInProgress(false);
        }
      };
    };

    connect();

    return () => {
      isManualClose = true;
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, [forceReconnect, isManuallyDisconnected, isDuplicate]);

  const manualReconnect = () => {
    setReconnectInProgress(true);
    setConnectionError(null);
    setIsManuallyDisconnected(false);

    // Force a new connection by incrementing forceReconnect
    // This will trigger the useEffect to run again
    setForceReconnect((prev) => prev + 1);
  };

  const manualDisconnect = () => {
    setIsManuallyDisconnected(true);
    setIsConnected(false);
    setConnectionError(null);
    setReconnectInProgress(false);

    // Force cleanup by incrementing forceReconnect
    // This will trigger the useEffect cleanup and prevent reconnection
    setForceReconnect((prev) => prev + 1);
  };

  const manualConnect = () => {
    setIsManuallyDisconnected(false);
    setReconnectInProgress(true);
    setConnectionError(null);

    // Force a new connection
    setForceReconnect((prev) => prev + 1);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto flex flex-1 flex-col px-4 py-4 lg:py-8">
        {/* Header - compact on mobile */}
        <div className="mb-4">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 lg:text-3xl dark:text-gray-100">
            Open Source Package Stream
          </h1>
          <p className="mb-4 text-sm text-gray-600 lg:mb-6 lg:text-base dark:text-gray-300">
            Real-time stream of newly published open source packages monitored
            by &nbsp;
            <a
              href="https://docs.safedep.io/cloud/overview"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              SafeDep Cloud
            </a>{" "}
            and delivered using{" "}
            <a
              href="https://s2.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              s2.dev
            </a>
          </p>

          {/* Call to Action - hidden on mobile */}
          <div className="mb-6 hidden rounded-lg border border-blue-200 bg-blue-50 p-4 lg:block dark:border-blue-800 dark:bg-blue-900/20">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 text-blue-500 dark:text-blue-400">💡</div>
              <p className="text-blue-700 dark:text-blue-300">
                <span className="font-medium">
                  Need API access to this stream?
                </span>{" "}
                Create an issue at{" "}
                <a
                  href="https://github.com/safedep/vet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  <span>@safedep/vet</span>
                </a>{" "}
                with your intended use-case
              </p>
            </div>
          </div>

          {/* Mobile Status Bar - Collapsible */}
          <div className="mb-4 rounded-lg border border-gray-200 bg-white lg:hidden dark:border-gray-600 dark:bg-gray-800">
            <button
              onClick={() => setIsStatusExpanded(!isStatusExpanded)}
              className="flex w-full items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : isManuallyDisconnected ? "bg-gray-500" : "bg-red-500"}`}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {isConnected
                    ? "Connected"
                    : isManuallyDisconnected
                      ? "Disconnected"
                      : "Disconnected"}
                </span>
                <span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-900 dark:bg-gray-700 dark:text-gray-100">
                  {totalPackagesCount}
                </span>
              </div>
              {isStatusExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>

            {isStatusExpanded && (
              <div className="border-t border-gray-200 px-4 pb-4 dark:border-gray-600">
                <div className="mt-3 grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Packages received:
                    </span>
                    <span className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-900 dark:bg-gray-700 dark:text-gray-100">
                      {totalPackagesCount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Duplicates filtered:
                    </span>
                    <span className="rounded bg-yellow-100 px-2 py-1 font-mono text-sm text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100">
                      {duplicatesFilteredCount}
                    </span>
                  </div>

                  {lastSequenceNumber !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Last sequence:
                      </span>
                      <span className="rounded bg-blue-100 px-2 py-1 font-mono text-sm text-blue-900 dark:bg-blue-900 dark:text-blue-100">
                        {lastSequenceNumber}
                      </span>
                    </div>
                  )}

                  {/* Connection status and error */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Status:
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : isManuallyDisconnected ? "bg-gray-500" : "bg-red-500"}`}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {isConnected
                          ? "Connected"
                          : isManuallyDisconnected
                            ? "Manually Disconnected"
                            : "Disconnected"}
                      </span>
                    </div>
                  </div>

                  {/* Error message */}
                  {connectionError && !isManuallyDisconnected && (
                    <div className="rounded bg-orange-50 p-2 text-xs text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                      {connectionError}
                    </div>
                  )}

                  {/* Connection Control Buttons */}
                  <div className="mt-2 flex items-center justify-center gap-2">
                    {reconnectInProgress && (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
                        <span className="text-sm text-blue-600 dark:text-blue-400">
                          Reconnecting...
                        </span>
                      </div>
                    )}

                    {!isConnected &&
                      !reconnectInProgress &&
                      connectionError &&
                      !isManuallyDisconnected && (
                        <button
                          onClick={manualReconnect}
                          className="rounded-md bg-orange-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600"
                        >
                          Reconnect
                        </button>
                      )}

                    {isConnected &&
                      !isManuallyDisconnected &&
                      !reconnectInProgress && (
                        <button
                          onClick={manualDisconnect}
                          className="rounded-md bg-gray-200 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-gray-600"
                        >
                          Disconnect
                        </button>
                      )}

                    {isManuallyDisconnected && !reconnectInProgress && (
                      <button
                        onClick={manualConnect}
                        className="rounded-md bg-gray-200 px-3 py-1 text-xs font-medium text-green-600 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-green-400 dark:hover:bg-gray-600"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Status Bar */}
          <div className="mb-6 hidden rounded-lg border border-gray-200 bg-white p-4 lg:block dark:border-gray-600 dark:bg-gray-800">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Packages received:
                </span>
                <span className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-900 dark:bg-gray-700 dark:text-gray-100">
                  {totalPackagesCount}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Duplicates filtered:
                </span>
                <span className="rounded bg-yellow-100 px-2 py-1 font-mono text-sm text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100">
                  {duplicatesFilteredCount}
                </span>
              </div>

              {lastSequenceNumber !== null && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Last sequence:
                  </span>
                  <span className="rounded bg-blue-100 px-2 py-1 font-mono text-sm text-blue-900 dark:bg-blue-900 dark:text-blue-100">
                    {lastSequenceNumber}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : isManuallyDisconnected ? "bg-gray-500" : "bg-red-500"}`}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {isConnected
                    ? "Connected"
                    : isManuallyDisconnected
                      ? "Manually Disconnected"
                      : "Disconnected"}
                </span>
                {/* Error message integrated into connection status */}
                {connectionError && !isManuallyDisconnected && (
                  <span className="ml-2 text-xs text-orange-600 dark:text-orange-400">
                    — {connectionError}
                  </span>
                )}
              </div>

              {/* Connection Control Buttons */}
              <div className="ml-auto flex items-center gap-2">
                {reconnectInProgress && (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      Reconnecting...
                    </span>
                  </div>
                )}

                {!isConnected &&
                  !reconnectInProgress &&
                  connectionError &&
                  !isManuallyDisconnected && (
                    <button
                      onClick={manualReconnect}
                      className="rounded-md bg-orange-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600"
                    >
                      Reconnect
                    </button>
                  )}

                {isConnected &&
                  !isManuallyDisconnected &&
                  !reconnectInProgress && (
                    <button
                      onClick={manualDisconnect}
                      className="rounded-md bg-gray-200 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-gray-600"
                    >
                      Disconnect
                    </button>
                  )}

                {isManuallyDisconnected && !reconnectInProgress && (
                  <button
                    onClick={manualConnect}
                    className="rounded-md bg-gray-200 px-3 py-1 text-xs font-medium text-green-600 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-green-400 dark:hover:bg-gray-600"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <StreamingPackageList packages={packages} />
        </div>
      </div>
    </div>
  );
}
