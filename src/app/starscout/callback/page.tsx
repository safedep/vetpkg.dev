"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { validateOAuthState, exchangeCodeForToken } from "../auth";
import { analyzeRepoForFakeStars } from "../actions";
import { StarScoutResults } from "../types";

// Results display component
function ResultsDisplay({ results }: { results: StarScoutResults }) {
  return (
    <div className="space-y-8">
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            Analysis Results for{" "}
            <a
              href={results.repository.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              {results.repository.owner}/{results.repository.name}
            </a>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Stars:
                </span>
                <span className="font-semibold">
                  {results.totalStars.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Suspected Fake Stars:
                </span>
                <span className="font-semibold">
                  {results.suspectedFakeStars.length.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Percentage Fake:
                </span>
                <span className="font-semibold">
                  {results.percentageFake.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Risk Assessment:
                </span>
                <span
                  className={`font-semibold ${
                    results.isRisky
                      ? "text-red-600 dark:text-red-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {results.isRisky ? "High Risk" : "Low Risk"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Risk Score</h3>
            <div className="mt-2">
              <div className="relative w-full h-6 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    results.riskScore > 75
                      ? "bg-red-500"
                      : results.riskScore > 50
                        ? "bg-orange-500"
                        : results.riskScore > 25
                          ? "bg-yellow-500"
                          : "bg-green-500"
                  }`}
                  style={{ width: `${results.riskScore}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Low Risk
                </span>
                <span className="text-xs font-medium">
                  {results.riskScore}/100
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  High Risk
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Detected Issues</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`p-4 rounded-lg border ${
                results.hasLowActivityStars
                  ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/30"
                  : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    results.hasLowActivityStars
                      ? "bg-amber-200 dark:bg-amber-800"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  {results.hasLowActivityStars ? (
                    <span className="text-amber-800 dark:text-amber-200">
                      ⚠️
                    </span>
                  ) : (
                    <span className="text-gray-500">✓</span>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">Low-Activity Accounts</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {results.hasLowActivityStars
                      ? "Detected one-shot or throw-away accounts"
                      : "No suspicious low-activity accounts detected"}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border ${
                results.hasLockStepStars
                  ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/30"
                  : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    results.hasLockStepStars
                      ? "bg-red-200 dark:bg-red-800"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  {results.hasLockStepStars ? (
                    <span className="text-red-800 dark:text-red-200">⚠️</span>
                  ) : (
                    <span className="text-gray-500">✓</span>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">Lock-Step Behavior</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {results.hasLockStepStars
                      ? "Detected coordinated starring activity"
                      : "No coordinated starring activity detected"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {results.suspectedFakeStars.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">
              Suspicious Accounts Sample
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Starred Date
                    </th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {results.suspectedFakeStars
                    .slice(0, 10)
                    .map((star, index) => (
                      <tr key={index}>
                        <td className="py-2 px-4 whitespace-nowrap">
                          <a
                            href={star.user.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            <img
                              src={star.user.avatar_url}
                              alt={star.user.login}
                              className="w-6 h-6 rounded-full mr-2"
                            />
                            {star.user.login}
                          </a>
                        </td>
                        <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {new Date(star.starred_at).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              star.reason === "both"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : star.reason === "lock_step"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            }`}
                          >
                            {star.reason === "both"
                              ? "Multiple Indicators"
                              : star.reason === "lock_step"
                                ? "Lock-Step Activity"
                                : "Low Activity"}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {results.suspectedFakeStars.length > 10 && (
                <p className="text-right text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Showing 10 of {results.suspectedFakeStars.length} suspicious
                  accounts
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="text-sm bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md border border-blue-200 dark:border-blue-800">
        <p className="text-blue-600 dark:text-blue-400 font-medium">
          Research Notes
        </p>
        <p className="mt-1 text-gray-700 dark:text-gray-300">
          According to research, fake stars provide only a small, short-lived
          boost to real popularity (approximately 0-2 months); afterwards they
          correlate with fewer real stars. More than 15% of trending
          repositories in mid-2024 were artificially boosted, with 90% of those
          repositories later deleted by GitHub.
        </p>
      </div>
    </div>
  );
}

// Callback content component
function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<string>("Authenticating with GitHub...");
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<StarScoutResults | null>(null);

  useEffect(() => {
    async function handleOAuthCallback() {
      try {
        // Get the code and state from the URL
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        // Handle errors from GitHub
        const errorParam = searchParams.get("error");
        if (errorParam) {
          const errorDescription =
            searchParams.get("error_description") || "Unknown error";
          throw new Error(
            `GitHub OAuth error: ${errorParam} - ${errorDescription}`,
          );
        }

        // Validate parameters
        if (!code || !state) {
          throw new Error("Missing code or state parameter");
        }

        // Validate state to prevent CSRF attacks
        const validatedState = validateOAuthState(state);
        if (!validatedState) {
          throw new Error("Invalid OAuth state");
        }

        setStatus("Obtaining access token...");

        // Exchange code for token (server-side call)
        const token = await exchangeCodeForToken(code);

        setStatus("Analyzing repository stars...");

        // Analyze the repository using the StarScout algorithm
        const analysisResults = await analyzeRepoForFakeStars(
          validatedState.repoUrl,
          token,
        );

        // Display the results
        setResults(analysisResults);
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
      }
    }

    handleOAuthCallback();
  }, [searchParams, router]);

  // Display error state
  if (error) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="text-red-600 dark:text-red-400 mb-4 text-2xl font-bold">
              Analysis Error
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => router.push("/starscout")}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Return to StarScout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Display results
  if (results) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold">StarScout Analysis</h1>
            <button
              onClick={() => router.push("/starscout")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Analyze Another Repository
            </button>
          </div>

          <ResultsDisplay results={results} />
        </div>
      </div>
    );
  }

  // Display loading state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md w-full">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <p className="text-center text-gray-700 dark:text-gray-300 text-lg">
          <div>
            <p className="mb-2">{status}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Note: Analysis may take longer for repositories with large number
              of stars and watchers
            </p>
          </div>
        </p>
      </div>
    </div>
  );
}

// Loading fallback
function CallbackLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md w-full">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <p className="text-center text-gray-700 dark:text-gray-300 text-lg">
          Loading...
        </p>
      </div>
    </div>
  );
}

export default function GitHubOAuthCallback() {
  return (
    <Suspense fallback={<CallbackLoading />}>
      <CallbackContent />
    </Suspense>
  );
}
