"use client";

import Footer from "@/components/app/footer";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";
import vetActionDemo from "./vet-actions-demo.png";
import { useState } from "react";
import { initiateGithubAuth } from "./auth";

const githubRepoFormSchema = z.object({
  repoUrl: z
    .string()
    .min(1, { message: "Repository URL is required" })
    .url({ message: "Please enter a valid URL" })
    .regex(/github\.com\/[\w-]+\/[\w-.]+/i, {
      message: "Please enter a valid GitHub repository URL",
    }),
});

export default function GitHubActionsIntegration() {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const githubRepoForm = useForm<z.infer<typeof githubRepoFormSchema>>({
    resolver: zodResolver(githubRepoFormSchema),
    defaultValues: {
      repoUrl: "",
    },
  });

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
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8">
      {/* Image Modal */}
      {isImageModalOpen && (
        <div
          className="bg-opacity-80 fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative max-h-screen w-full max-w-7xl">
            <button
              className="absolute top-4 right-4 rounded-full bg-white p-2 text-black transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                setIsImageModalOpen(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="relative h-auto w-full">
              <Image
                src={vetActionDemo}
                alt="Vet Action Demo - Full View"
                className="mx-auto max-h-[90vh] rounded-md object-contain"
                width={1200}
                height={800}
              />
            </div>
          </div>
        </div>
      )}

      <h1 className="mb-4 scroll-m-20 text-center font-mono text-4xl font-extrabold tracking-tight lg:text-5xl">
        <span role="img" aria-label="robot">
          🤖
        </span>{" "}
        <span className="text-indigo-500 dark:text-indigo-400">vet</span> GitHub
        Actions PR Bot
      </h1>

      <p className="mx-auto mb-8 max-w-3xl text-center font-mono text-lg text-gray-600 dark:text-gray-300">
        Automatically integrate{" "}
        <a href="https://github.com/safedep/vet" target="_blank">
          SafeDep vet
        </a>{" "}
        into your GitHub Actions workflow to secure your open source supply
        chain with a single pull request
      </p>

      {/* Two-column layout */}
      <div className="flex w-full flex-col justify-between gap-8 md:flex-row">
        {/* Left column - Form */}
        <div className="min-w-0 flex-1">
          <div className="h-full rounded-lg border border-indigo-200 bg-white p-6 shadow-lg dark:border-indigo-800 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold">Start Integration</h2>
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
                    You&apos;ll need to authenticate with GitHub to verify your
                    access to the repository. We ensure only a repository
                    contributor can initiate the integration to avoid spam.
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
                    "Create Pull Request 🚀"
                  )}
                </button>
              </form>
            </Form>
            <div className="mt-4 space-y-3">
              <h3 className="font-semibold">
                After integration, you will get:
              </h3>
              <ul className="list-disc space-y-2 pl-5 text-gray-700 dark:text-gray-300">
                <li>Automated OSS component scanning in your workflow</li>
                <li>Custom policy to check for common OSS risks</li>
                <li>Protect against malicious code and other risks</li>
                <li>Security guardrails to catch issues early</li>
              </ul>
              <p className="mt-3 text-sm text-gray-600 italic dark:text-gray-400">
                All results are integrated directly in your GitHub workflow.
                <br />
                Like what you see?{" "}
                <a
                  href="https://github.com/safedep/vet"
                  className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  ⭐️ us on GitHub!
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Right column - Preview */}
        <div className="min-w-0 flex-1">
          <div className="h-full rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold">How it works</h2>
            <div
              className="mb-4 flex h-80 w-full cursor-pointer items-center justify-center overflow-hidden rounded-md border border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700"
              onClick={() => setIsImageModalOpen(true)}
            >
              <div className="relative h-full w-full">
                <Image
                  src={vetActionDemo}
                  alt="Vet Action Demo"
                  fill
                  className="object-contain"
                  priority
                />
                <div className="bg-opacity-0 hover:bg-opacity-20 absolute inset-0 flex items-center justify-center bg-black transition-all">
                  <div className="bg-opacity-75 dark:bg-opacity-75 rounded-md bg-white p-2 opacity-0 transition-opacity hover:opacity-100 dark:bg-gray-800">
                    <span className="dark:text-gray-200">Click to enlarge</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <h3 className="font-semibold">
                <a
                  href="https://github.com/safedep/vet-action"
                  className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  vet-action
                </a>{" "}
                integrates{" "}
                <span className="text-indigo-500 dark:text-indigo-400">
                  <a
                    href="https://github.com/safedep/vet"
                    className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    vet
                  </a>
                </span>{" "}
                into your GitHub workflow
              </h3>
              <ul className="list-disc space-y-2 pl-5 text-gray-700 dark:text-gray-300">
                <li>Scan only changes files in the pull request</li>
                <li>
                  Enables policy driven guardrails against risky OSS components
                </li>
                <li>Blocks the pull request if policy violations are found</li>
                <li>
                  Scans{" "}
                  <span className="text-indigo-500 dark:text-indigo-400">
                    code
                  </span>{" "}
                  for malicious intent
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
