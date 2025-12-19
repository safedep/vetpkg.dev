"use client";

import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PackageURL } from "packageurl-js";
import Footer from "@/components/app/footer";

const verboseInputFormSchema = z.object({
  ecosystem: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
});

const purlInputFormSchema = z.object({
  purl: z.string().min(5),
});

const PACKAGE_ECOSYSTEM_OPTIONS = [
  { value: "", label: "Select an ecosystem" },
  { value: "npm", label: "npm 📦" },
  { value: "pypi", label: "PyPI 🐍" },
  { value: "maven", label: "Maven ☕️" },
  { value: "rubygem", label: "RubyGems 💎" },
  { value: "Go", label: "Go 🐹" },
  { value: "packagist", label: "PHP Composer 🐘" },
];

export default function Home() {
  const [usePurlBasedQuery, setUsePurlBasedQuery] = useState<boolean>(false);
  const router = useRouter();
  const redirectToPackageInfoPage = (
    ecosystem: string,
    name: string,
    version: string,
  ) => {
    ecosystem = encodeURIComponent(ecosystem);
    name = encodeURIComponent(name);
    version = encodeURIComponent(version);

    router.push(`/v/${ecosystem}/${name}/${version}`);
  };

  const verboseInputForm = useForm<z.infer<typeof verboseInputFormSchema>>({
    resolver: zodResolver(verboseInputFormSchema),
    defaultValues: {
      ecosystem: "npm",
      name: "express",
      version: "4.17.1",
    },
  });

  const purlInputForm = useForm<z.infer<typeof purlInputFormSchema>>({
    resolver: zodResolver(purlInputFormSchema),
    defaultValues: {
      purl: "pkg:npm/express@4.17.1",
    },
  });

  const onSubmitVerboseInputForm = (
    data: z.infer<typeof verboseInputFormSchema>,
  ) => {
    redirectToPackageInfoPage(data.ecosystem, data.name, data.version);
  };

  const onSubmitPurlInputForm = (data: z.infer<typeof purlInputFormSchema>) => {
    const purl = PackageURL.fromString(data.purl);

    const ecosystem = encodeURIComponent(purl.type);
    const name = encodeURIComponent(purl.name);
    const version = encodeURIComponent(purl.version ?? "0.0.0");

    redirectToPackageInfoPage(ecosystem, name, version);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center p-4 py-2">
      <h1 className="mb-4 scroll-m-20 font-mono text-4xl font-extrabold tracking-tight lg:text-5xl">
        <span className="ml-2" role="img" aria-label="magnifying glass">
          🔍
        </span>{" "}
        <span className="text-indigo-500 dark:text-indigo-400">vet</span> an
        Open Source Package
      </h1>

      <p className="mb-8 max-w-2xl font-mono text-lg text-gray-600 dark:text-gray-300">
        Analyze OSS dependencies for security vulnerabilities, malicious code,
        maintainability issues, and other supply chain risks to protect your
        application.
      </p>

      <div className="flex w-full max-w-4xl items-center justify-around">
        <div className="flex w-full max-w-lg items-center rounded-lg border border-indigo-200 bg-white p-6 shadow-lg dark:border-indigo-800 dark:bg-gray-800">
          {usePurlBasedQuery && (
            <Form {...purlInputForm}>
              <form
                className="w-full space-y-4"
                onSubmit={purlInputForm.handleSubmit(onSubmitPurlInputForm)}
              >
                <FormField
                  control={purlInputForm.control}
                  name="purl"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-2 font-mono text-sm text-gray-500 dark:text-gray-400">
                        Package URL (PURL)
                      </div>
                      <input
                        {...field}
                        type="text"
                        placeholder="pkg:npm/express@4.17.1"
                        className="terminal-input font-code w-full px-4 py-3 text-sm"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <button
                  type="submit"
                  className="btn-primary w-full px-4 py-3 font-semibold"
                >
                  Analyze Package 🚀
                </button>

                <p className="text-right text-sm text-gray-500 dark:text-gray-400">
                  Need help? Switch to{" "}
                  <a
                    href="#"
                    onClick={() => setUsePurlBasedQuery(false)}
                    className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    detailed input →
                  </a>
                </p>
              </form>
            </Form>
          )}

          {!usePurlBasedQuery && (
            <Form {...verboseInputForm}>
              <form
                className="w-full space-y-4"
                onSubmit={verboseInputForm.handleSubmit(
                  onSubmitVerboseInputForm,
                )}
              >
                <FormField
                  control={verboseInputForm.control}
                  name="ecosystem"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-2 font-mono text-sm text-gray-500 dark:text-gray-400">
                        Package Ecosystem
                      </div>
                      <select
                        {...field}
                        className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 shadow-xs transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-hidden dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                      >
                        {PACKAGE_ECOSYSTEM_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={verboseInputForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-2 font-mono text-sm text-gray-500 dark:text-gray-400">
                        Package Name
                      </div>
                      <input
                        {...field}
                        type="text"
                        placeholder="express"
                        className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm shadow-xs transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-hidden dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={verboseInputForm.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-2 font-mono text-sm text-gray-500 dark:text-gray-400">
                        Version
                      </div>
                      <input
                        {...field}
                        type="text"
                        placeholder="4.17.1"
                        className="terminal-input font-code w-full px-4 py-3 text-sm"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <button
                  type="submit"
                  className="btn-primary w-full px-4 py-3 font-semibold"
                >
                  Analyze Package 🚀
                </button>

                <p className="text-right text-sm text-gray-500 dark:text-gray-400">
                  Know PURL? Switch to{" "}
                  <a
                    href="#"
                    onClick={() => setUsePurlBasedQuery(true)}
                    className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    quick input →
                  </a>
                </p>
              </form>
            </Form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
