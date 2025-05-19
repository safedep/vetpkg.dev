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
    <div className="min-h-screen py-8 px-4 max-w-6xl mx-auto">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 font-mono text-center">
        <span role="img" aria-label="magnifying glass">
          🔍
        </span>{" "}
        <span className="text-indigo-500 dark:text-indigo-400">StarScout</span>
      </h1>

      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto text-center">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Left column - Form */}
        <div className="space-y-6">
          <div className="border border-indigo-200 dark:border-indigo-800 rounded-lg shadow-lg bg-white dark:bg-gray-800 p-6">
            <h2 className="text-xl font-bold mb-4">Analyze Repository</h2>
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
                      <div className="font-mono text-sm text-gray-500 dark:text-gray-400 mb-2">
                        GitHub Repository URL
                      </div>
                      <input
                        {...field}
                        type="text"
                        placeholder="https://github.com/username/repository"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm transition-all dark:text-gray-200"
                        disabled={isAuthenticating}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                  <p className="font-medium mb-1">
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
                  className={`w-full px-4 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors font-semibold ${
                    isAuthenticating ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 bg-white dark:bg-gray-800">
            <h2 className="text-xl font-bold mb-4">About StarScout</h2>
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
                    className="inline-block w-4 h-4 ml-0.5"
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

              <h3 className="font-bold text-md">How StarScout Works:</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
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

              <h3 className="font-bold text-md mt-4">Why This Matters:</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
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
