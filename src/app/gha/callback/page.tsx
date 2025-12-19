"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { validateOAuthState, exchangeCodeForToken } from "../auth";
import {
  isUserContributor,
  isUserOwner,
  raiseVetIntegrationPullRequest,
} from "../integration";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<string>("Authenticating with GitHub...");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    prUrl?: string;
  } | null>(null);

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

        // Exchange code for token (in production, this would be a server-side call)
        const token = await exchangeCodeForToken(code);

        setStatus("Verifying repository access...");

        // First check if the user is the owner of the repository
        const isOwner = await isUserOwner(validatedState.repoUrl, token);

        if (!isOwner) {
          // If not owner, check if they are a contributor
          setStatus("Checking contributor access...");
          const isContributor = await isUserContributor(
            validatedState.repoUrl,
            token,
          );

          if (!isContributor) {
            throw new Error(
              "You don't have contributor access to this repository",
            );
          }
        }

        setStatus("Creating pull request...");

        // Create the pull request
        const prResult = await raiseVetIntegrationPullRequest(
          validatedState.repoUrl,
          token,
        );

        // Success!
        setResult(prResult);
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
      }
    }

    handleOAuthCallback();
  }, [searchParams, router]);

  // Display loading state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <div className="mb-4 text-2xl font-bold text-red-600">
            Authentication Error
          </div>
          <p className="mb-6 text-gray-700">{error}</p>
          <button
            onClick={() => router.push("/gha")}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
          >
            Return to Integration Page
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <div
            className={`mb-4 text-2xl font-bold ${result.success ? "text-green-600" : "text-red-600"}`}
          >
            {result.success ? "Success!" : "Error"}
          </div>
          <p className="mb-6 text-gray-700">{result.message}</p>

          {result.success && result.prUrl && (
            <a
              href={result.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 block w-full rounded-md bg-green-600 px-4 py-2 text-center text-white transition-colors hover:bg-green-700"
            >
              View Pull Request
            </a>
          )}

          <button
            onClick={() => router.push("/gha")}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
          >
            Return to Integration Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-4 flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
        </div>
        <p className="text-center text-lg text-gray-700">{status}</p>
      </div>
    </div>
  );
}

function CallbackLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-4 flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
        </div>
        <p className="text-center text-lg text-gray-700">Loading...</p>
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
