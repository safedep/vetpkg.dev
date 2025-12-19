"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import Footer from "@/components/app/footer";
import { initiateGithubAuth } from "./auth";

// Validation schema for GitHub repository URL
const githubRepoFormSchema = z.object({
  repoUrl: z
    .string()
    .min(1, { message: "Repository URL is required" })
    .url({ message: "Please enter a valid URL" })
    .regex(/github\.com\/[\w-]+\/[\w-.]+/i, {
      message: "Please enter a valid GitHub repository URL",
    }),
});

export default function StarScoutPage() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Form setup with validation
  const githubRepoForm = useForm<z.infer<typeof githubRepoFormSchema>>({
    resolver: zodResolver(githubRepoFormSchema),
    defaultValues: {
      repoUrl: "",
    },
  });

  // Handle form submission
  const onSubmitGitHubRepoForm = (
    data: z.infer<typeof githubRepoFormSchema>,
  ) => {
    setIsAuthenticating(true);

    try {
      // Initiate GitHub OAuth flow
      initiateGithubAuth(data.repoUrl);

      // Note: The page will redirect to GitHub, so the code below may not execute
      console.log("Redirecting to GitHub for authentication...");
    } catch (error) {
      console.error("Error initiating GitHub authentication:", error);
      setIsAuthenticating(false);

      // Show an error alert
      alert(
        "Failed to initiate GitHub authentication. Please try again later.",
      );
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-8">
      <h1 className="mb-4 scroll-m-20 text-center font-mono text-4xl font-extrabold tracking-tight lg:text-5xl">
        <span role="img" aria-label="magnifying glass">
          🔍
        </span>{" "}
        <span className="text-indigo-500 dark:text-indigo-400">StarScout</span>
      </h1>

      <p className="mx-auto mb-8 max-w-3xl text-center text-lg text-gray-600 dark:text-gray-300">
        Detect fake GitHub stars and evaluate repository risk using the
        <a
          href="https://arxiv.org/abs/2412.13459"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          {" "}
          StarScout
        </a>{" "}
        approach.
      </p>
      <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left column - Form */}
        <div className="space-y-6">
          <div className="rounded-lg border border-indigo-200 bg-white p-6 shadow-lg dark:border-indigo-800 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold">Analyze Repository</h2>
            <Form {...githubRepoForm}>
              <form
                className="w-full space-y-4"
                onSubmit={githubRepoForm.handleSubmit(onSubmitGitHubRepoForm)}
              >
                <FormField
                  control={githubRepoForm.control}
                  name="repoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-2 font-mono text-sm text-gray-500 dark:text-gray-400">
                        GitHub Repository URL
                      </div>
                      <input
                        {...field}
                        type="text"
                        placeholder="https://github.com/username/repository"
                        className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm shadow-xs transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-hidden dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                        disabled={isAuthenticating}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-600 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                  <p className="mb-1 font-medium">
                    GitHub Authentication Required
                  </p>
                  <p>
                    You&apos;ll need to authenticate with GitHub to analyze
                    repository stars. We use your GitHub token to access star
                    data and perform the analysis.
                  </p>
                </div>

                <button
                  type="submit"
                  className={`w-full rounded-md bg-indigo-600 px-4 py-3 font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden ${
                    isAuthenticating ? "cursor-not-allowed opacity-70" : ""
                  }`}
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Authenticating...
                    </span>
                  ) : (
                    "Analyze Repository"
                  )}
                </button>
              </form>
            </Form>
          </div>
        </div>

        {/* Right column - Info */}
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold">About StarScout</h2>
            <div className="space-y-4">
              <p>
                <a
                  href="https://arxiv.org/abs/2412.13459"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  StarScout{" "}
                  <svg
                    className="ml-0.5 inline-block h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>{" "}
                is an approach that helps detect fake GitHub stars and evaluates
                the risk of a repository being part of a fake-star campaign.
              </p>

              <h3 className="text-md font-bold">How StarScout Works:</h3>
              <ul className="list-disc space-y-2 pl-5 text-gray-700 dark:text-gray-300">
                <li>
                  <span className="font-semibold">Low-activity signature:</span>{" "}
                  Identifies one-shot or throw-away accounts with minimal GitHub
                  activity
                </li>
                <li>
                  <span className="font-semibold">Lock-step signature:</span>{" "}
                  Detects coordinated star bursts from multiple accounts in
                  short time periods
                </li>
                <li>
                  <span className="font-semibold">Risk filtering:</span> Applies
                  criteria to determine if a repository is likely part of a
                  campaign
                </li>
              </ul>

              <h3 className="text-md mt-4 font-bold">Why This Matters:</h3>
              <ul className="list-disc space-y-2 pl-5 text-gray-700 dark:text-gray-300">
                <li>
                  15.8% of trending repositories in mid-2024 were artificially
                  boosted
                </li>
                <li>
                  Many fake-starred repositories contained malware or other
                  risky code
                </li>
                <li>
                  Fake stars only provide a short-term boost but long-term
                  damage
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
