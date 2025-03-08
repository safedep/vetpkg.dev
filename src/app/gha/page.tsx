"use client";

import Footer from "@/components/app/footer";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";
import vetActionDemo from "./vet-actions-demo.png";
import { useState } from "react";

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
  // Router declared but commented out until needed for actual implementation
  // const router = useRouter();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const githubRepoForm = useForm<z.infer<typeof githubRepoFormSchema>>({
    resolver: zodResolver(githubRepoFormSchema),
    defaultValues: {
      repoUrl: "",
    },
  });

  const onSubmitGitHubRepoForm = (
    data: z.infer<typeof githubRepoFormSchema>,
  ) => {
    // This would connect to the backend to create a PR
    console.log("Submitting repository URL:", data.repoUrl);
    // Placeholder for actual implementation
    alert(
      "GitHub authentication required. Redirecting to authentication page...",
    );
    // Future implementation: router.push("/gha/auth") or API call
  };

  return (
    <div className="min-h-screen py-8 px-4 max-w-7xl mx-auto">
      {/* Image Modal */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative max-w-7xl w-full max-h-screen">
            <button
              className="absolute top-4 right-4 bg-white rounded-full p-2 text-black hover:bg-gray-200 transition-colors"
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
            <div className="relative w-full h-auto">
              <Image
                src={vetActionDemo}
                alt="Vet Action Demo - Full View"
                className="mx-auto object-contain max-h-[90vh] rounded-md"
                width={1200}
                height={800}
              />
            </div>
          </div>
        </div>
      )}

      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 font-mono text-center">
        <span className="ml-2" role="img" aria-label="github">
          🛡️
        </span>{" "}
        <span className="text-indigo-500">
          <a href="https://github.com/safedep/vet">vet</a>
        </span>{" "}
        GitHub Integration
      </h1>

      <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto font-mono text-center">
        Automatically integrate vet into your GitHub Actions workflow to secure
        your open source supply chain with a single pull request.
      </p>

      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row gap-8 justify-between w-full">
        {/* Left column - Form */}
        <div className="flex-1 min-w-0">
          <div className="border border-indigo-200 rounded-lg shadow-lg bg-white p-6 h-full">
            <h2 className="text-xl font-bold mb-4">Start Integration</h2>
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
                      <div className="font-mono text-sm text-gray-500 mb-2">
                        GitHub Repository URL
                      </div>
                      <input
                        {...field}
                        type="text"
                        placeholder="https://github.com/username/repository"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm transition-all"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                  <p className="font-medium mb-1">
                    GitHub Authentication Required
                  </p>
                  <p>
                    You&apos;ll need to authenticate with GitHub to verify your
                    access to the repository. This allows us to create a pull
                    request on your behalf.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors font-semibold"
                >
                  Create Pull Request 🚀
                </button>
              </form>
            </Form>
            <div className="space-y-3 mt-4">
              <h3 className="font-semibold">
                After integration, you will get:
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Automated dependency scanning in your workflow</li>
                <li>Security vulnerability detection and alerts</li>
                <li>Supply chain risk assessment</li>
                <li>Actionable recommendations for dependency issues</li>
              </ul>
              <p className="text-sm text-gray-600 italic mt-3">
                All results are integrated directly in your GitHub workflow,
                with no additional tools required.
              </p>
            </div>
          </div>
        </div>

        {/* Right column - Preview */}
        <div className="flex-1 min-w-0">
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-lg h-full">
            <h2 className="text-xl font-bold mb-4">How it works</h2>
            <div
              className="bg-gray-100 w-full h-80 flex items-center justify-center rounded-md border border-gray-300 mb-4 overflow-hidden cursor-pointer"
              onClick={() => setIsImageModalOpen(true)}
            >
              <div className="relative w-full h-full">
                <Image
                  src={vetActionDemo}
                  alt="Vet Action Demo"
                  fill
                  style={{ objectFit: "contain" }}
                  priority
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 transition-all">
                  <div className="bg-white bg-opacity-75 p-2 rounded-md opacity-0 hover:opacity-100 transition-opacity">
                    <span>Click to enlarge</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3 mt-4">
              <h3 className="font-semibold">
                <a href="https://github.com/safedep/vet-action">vet-action</a>{" "}
                integrates <span className="text-indigo-500">vet</span> into
                your GitHub workflow
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Scan only changes files in the pull request</li>
                <li>
                  Enables policy driven guardrails against risky OSS components
                </li>
                <li>Blocks the pull request if policy violations are found</li>
                <li>
                  Scans <span className="text-indigo-500">code</span> for
                  malicious intent
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
