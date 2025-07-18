"use client";

import { useState, useEffect, useRef } from "react";
import { StreamingPackageList } from "./StreamingPackageList";
import { PackageStreamItem } from "./types";

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

  // Use useRef to maintain cache across renders without causing re-renders
  const packageCacheRef = useRef<Map<string, number>>(new Map());
  const cacheCleanupTimerRef = useRef<NodeJS.Timeout | null>(null);

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
  const isDuplicate = (packageData: PackageStreamItem): boolean => {
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
  };

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

      // Build the URL with sequence number if available
      let url = "/streams/oss/api/stream";
      if (lastSequenceNumber !== null) {
        url += `?fromSequence=${lastSequenceNumber}`;
        console.log(`Reconnecting from sequence number: ${lastSequenceNumber}`);
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
  }, [forceReconnect, isManuallyDisconnected]);

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
    <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4 py-8 h-full flex flex-col">
        <div className="mb-1">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            Open Source Package Stream
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Real-time stream of newly published open source packages monitored
            by &nbsp;
            <a
              href="https://docs.safedep.io/cloud/overview"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              SafeDep Cloud
            </a>{" "}
            and delivered using{" "}
            <a
              href="https://s2.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              s2.dev
            </a>
          </p>

          {/* Call to Action */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 text-blue-500 dark:text-blue-400">💡</div>
              <p className="text-blue-700 dark:text-blue-300">
                <span className="font-medium">
                  Need API access to this stream?
                </span>{" "}
                Create an issue at{" "}
                <a
                  href="https://github.com/safedep/vet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  <span>@safedep/vet</span>
                </a>{" "}
                with your intended use-case
              </p>
            </div>
          </div>

          {/* Status Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4 mb-6">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Packages received:
                </span>
                <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 rounded">
                  {totalPackagesCount}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Duplicates filtered:
                </span>
                <span className="text-sm font-mono bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 px-2 py-1 rounded">
                  {duplicatesFilteredCount}
                </span>
              </div>

              {lastSequenceNumber !== null && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Last sequence:
                  </span>
                  <span className="text-sm font-mono bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-2 py-1 rounded">
                    {lastSequenceNumber}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : isManuallyDisconnected ? "bg-gray-500" : "bg-red-500"}`}
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
                  <span className="text-xs text-orange-600 dark:text-orange-400 ml-2">
                    — {connectionError}
                  </span>
                )}
              </div>

              {/* Connection Control Buttons */}
              <div className="flex items-center gap-2 ml-auto">
                {reconnectInProgress && (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
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
                      className="px-3 py-1 bg-orange-600 dark:bg-orange-700 text-white text-xs rounded-md hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors font-medium"
                    >
                      Reconnect
                    </button>
                  )}

                {isConnected &&
                  !isManuallyDisconnected &&
                  !reconnectInProgress && (
                    <button
                      onClick={manualDisconnect}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-red-400 text-xs rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                    >
                      Disconnect
                    </button>
                  )}

                {isManuallyDisconnected && !reconnectInProgress && (
                  <button
                    onClick={manualConnect}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-green-600 dark:text-green-400 text-xs rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <StreamingPackageList packages={packages} />
        </div>
      </div>
    </div>
  );
}
