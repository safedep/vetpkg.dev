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
    <div className="flex flex-col items-center justify-center min-h-screen py-2 max-w-4xl mx-auto p-4">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 font-mono">
        <span className="ml-2" role="img" aria-label="magnifying glass">
          🔍
        </span>{" "}
        <span className="text-indigo-500">vet</span> an Open Source Package
      </h1>

      <p className="text-lg text-gray-600 mb-8 max-w-2xl font-mono">
        Analyze OSS dependencies for security vulnerabilities, malicious code,
        maintainability issues, and other supply chain risks to protect your
        application.
      </p>

      <div className="flex items-center justify-around max-w-4xl w-full">
        <div className="flex w-full max-w-lg items-center border border-indigo-200 rounded-lg shadow-lg bg-white p-6">
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
                      <div className="font-mono text-sm text-gray-500 mb-2">
                        Package URL (PURL)
                      </div>
                      <input
                        {...field}
                        type="text"
                        placeholder="pkg:npm/express@4.17.1"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm transition-all"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <button
                  type="submit"
                  className="w-full px-4 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors font-semibold"
                >
                  Analyze Package 🚀
                </button>

                <p className="text-sm text-gray-500 text-right">
                  Need help? Switch to{" "}
                  <a
                    href="#"
                    onClick={() => setUsePurlBasedQuery(false)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
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
                      <div className="font-mono text-sm text-gray-500 mb-2">
                        Package Ecosystem
                      </div>
                      <select
                        {...field}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                      <div className="font-mono text-sm text-gray-500 mb-2">
                        Package Name
                      </div>
                      <input
                        {...field}
                        type="text"
                        placeholder="express"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm transition-all"
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
                      <div className="font-mono text-sm text-gray-500 mb-2">
                        Version
                      </div>
                      <input
                        {...field}
                        type="text"
                        placeholder="4.17.1"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm transition-all"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <button
                  type="submit"
                  className="w-full px-4 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors font-semibold"
                >
                  Analyze Package 🚀
                </button>

                <p className="text-sm text-gray-500 text-right">
                  Know PURL? Switch to{" "}
                  <a
                    href="#"
                    onClick={() => setUsePurlBasedQuery(true)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
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
