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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-600 mb-4 text-2xl font-bold">
            Authentication Error
          </div>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => router.push("/gha")}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Return to Integration Page
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
          <div
            className={`text-2xl font-bold mb-4 ${result.success ? "text-green-600" : "text-red-600"}`}
          >
            {result.success ? "Success!" : "Error"}
          </div>
          <p className="text-gray-700 mb-6">{result.message}</p>

          {result.success && result.prUrl && (
            <a
              href={result.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-center mb-4"
            >
              View Pull Request
            </a>
          )}

          <button
            onClick={() => router.push("/gha")}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Return to Integration Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <p className="text-center text-gray-700 text-lg">{status}</p>
      </div>
    </div>
  );
}

function CallbackLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <p className="text-center text-gray-700 text-lg">Loading...</p>
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
