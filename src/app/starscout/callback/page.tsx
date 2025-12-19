"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { validateOAuthState, exchangeCodeForToken } from "../auth";
import { analyzeRepoForFakeStars } from "../actions";
import { StarScoutResults } from "../types";

// Results display component
function ResultsDisplay({ results }: { results: StarScoutResults }) {
  const [currentPage, setCurrentPage] = useState(1);
  const accountsPerPage = 10;

  // Calculate pagination values
  const totalPages = Math.ceil(
    results.suspectedFakeStars.length / accountsPerPage,
  );
  const indexOfLastAccount = currentPage * accountsPerPage;
  const indexOfFirstAccount = indexOfLastAccount - accountsPerPage;
  const currentAccounts = results.suspectedFakeStars.slice(
    indexOfFirstAccount,
    indexOfLastAccount,
  );

  // Handle page navigation
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
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

        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <h3 className="mb-2 text-lg font-semibold">Summary</h3>
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

          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <h3 className="mb-2 text-lg font-semibold">Risk Score</h3>
            <div className="mt-2">
              <div className="relative h-6 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
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
              <div className="mt-1 flex justify-between">
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div
              className={`rounded-lg border p-4 ${
                results.hasLowActivityStars
                  ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/30"
                  : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`mr-3 flex h-8 w-8 items-center justify-center rounded-full ${
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
              className={`rounded-lg border p-4 ${
                results.hasLockStepStars
                  ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/30"
                  : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`mr-3 flex h-8 w-8 items-center justify-center rounded-full ${
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
            <h3 className="mb-4 text-lg font-semibold">Suspicious Accounts</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full overflow-hidden rounded-lg bg-white dark:bg-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      User
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      Starred Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentAccounts.map((star, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <a
                          href={star.user.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          <Image
                            src={star.user.avatar_url}
                            alt={star.user.login}
                            width={24}
                            height={24}
                            className="mr-2 rounded-full"
                            unoptimized
                          />
                          {star.user.login}
                        </a>
                      </td>
                      <td className="px-4 py-2 text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {new Date(star.starred_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
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

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {indexOfFirstAccount + 1}-
                    {Math.min(
                      indexOfLastAccount,
                      results.suspectedFakeStars.length,
                    )}{" "}
                    of {results.suspectedFakeStars.length} accounts
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => goToPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`rounded px-3 py-1 ${
                        currentPage === 1
                          ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show 5 page buttons centered around current page
                      let pageToShow;
                      if (totalPages <= 5) {
                        pageToShow = i + 1;
                      } else if (currentPage <= 3) {
                        pageToShow = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageToShow = totalPages - 4 + i;
                      } else {
                        pageToShow = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageToShow}
                          onClick={() => goToPage(pageToShow)}
                          className={`rounded px-3 py-1 ${
                            currentPage === pageToShow
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                          }`}
                        >
                          {pageToShow}
                        </button>
                      );
                    })}
                    <button
                      onClick={() =>
                        goToPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className={`rounded px-3 py-1 ${
                        currentPage === totalPages
                          ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-800 dark:bg-blue-900/30">
        <p className="font-medium text-blue-600 dark:text-blue-400">
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
  const [isRateLimitError, setIsRateLimitError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

        console.log(`Starting analysis of ${validatedState.repoUrl}`);

        // Analyze the repository using the StarScout algorithm
        const analysisResults = await analyzeRepoForFakeStars(
          validatedState.repoUrl,
          token,
        );

        console.log(`Analysis complete for ${validatedState.repoUrl}`);

        // Display the results
        setResults(analysisResults);
      } catch (err: unknown) {
        console.error("OAuth callback error: ", err);

        if (err instanceof Error) {
          const errorMessage = err.message || "";

          // Check for rate limit errors in the message
          if (
            errorMessage.includes("rate limit") ||
            errorMessage.includes("API rate limit") ||
            errorMessage.includes("resource exhausted") ||
            errorMessage.includes("403") ||
            errorMessage.includes("429")
          ) {
            setIsRateLimitError(true);
          }
        }

        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
      } finally {
        setIsLoading(false);
      }
    }

    handleOAuthCallback();
  }, [searchParams, router]);

  // Display error state
  if (error) {
    return (
      <div className="min-h-screen px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
            <div className="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">
              Analysis Error
            </div>
            <p className="mb-6 text-gray-700 dark:text-gray-300">{error}</p>

            {isRateLimitError && (
              <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/30">
                <h3 className="mb-2 font-semibold text-amber-800 dark:text-amber-400">
                  GitHub API Rate Limit Exceeded
                </h3>
                <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                  GitHub limits the number of API requests per hour. You can:
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>Try again later when your rate limit resets</li>
                  <li>
                    Use a GitHub personal access token with higher rate limits
                  </li>
                  <li>
                    Analyze smaller repositories that require fewer API calls
                  </li>
                </ul>
              </div>
            )}

            <button
              onClick={() => router.push("/starscout")}
              className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
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
      <div className="min-h-screen px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">StarScout Analysis</h1>
            <button
              onClick={() => router.push("/starscout")}
              className="rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
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
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
          <div className="mb-4 flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          </div>
          <div className="text-center text-lg text-gray-700 dark:text-gray-300">
            <p className="mb-2">{status}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Note: Analysis may take longer for repositories with large number
              of stars and watchers
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback state if not loading but no results or error
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold">Something went wrong</h2>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            We couldn&apos;t process your request. Please try again.
          </p>
          <button
            onClick={() => router.push("/starscout")}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
          >
            Return to StarScout
          </button>
        </div>
      </div>
    </div>
  );
}

// Loading fallback
function CallbackLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        <div className="mb-4 flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
        </div>
        <p className="text-center text-lg text-gray-700 dark:text-gray-300">
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
