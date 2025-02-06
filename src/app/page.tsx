"use client";

import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const verboseInputFormSchema = z.object({
  ecosystem: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
});

const purlInputFormSchema = z.object({
  purl: z.string().min(5),
});

export default function Home() {
  const [usePurlBasedQuery, setUsePurlBasedQuery] = useState<boolean>(false);

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
    console.log("Verbose input form data: ", data);
  };

  const onSubmitPurlInputForm = (data: z.infer<typeof purlInputFormSchema>) => {
    console.log("PURL input form data: ", data);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 max-w-4xl mx-auto p-4">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        <span className="text-indigo-500">vet</span> an Open Source Package
      </h1>
      <div className="flex items-center justify-around max-w-4xl mt-6 sm:w-full">
        <div className="flex w-full max-w-lg items-center border-b border-b-1 border-indigo-500 py-2">
          {usePurlBasedQuery && (
            <Form {...purlInputForm}>
              <form
                className="w-full max-w-lg"
                onSubmit={purlInputForm.handleSubmit(onSubmitPurlInputForm)}
              >
                <FormField
                  control={purlInputForm.control}
                  name="purl"
                  render={({ field }) => (
                    <FormItem>
                      <input
                        {...field}
                        type="text"
                        placeholder="pkg:npm/express@4.17.1"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      ></input>
                      <FormMessage />
                    </FormItem>
                  )}
                ></FormField>
                <button
                  type="submit"
                  className="w-full px-3 py-2 mt-2 text-white bg-indigo-600 border border-indigo-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  Lets go!
                </button>

                <p className="w-full mt-2 text-sm text-gray-500 text-right">
                  Lost? Switch to{" "}
                  <a
                    href="#"
                    onClick={() => setUsePurlBasedQuery(false)}
                    className="text-indigo-600"
                  >
                    verbose input
                  </a>
                </p>
              </form>
            </Form>
          )}

          {!usePurlBasedQuery && (
            <Form {...verboseInputForm}>
              <form
                className="w-full max-w-lg"
                onSubmit={verboseInputForm.handleSubmit(
                  onSubmitVerboseInputForm,
                )}
              >
                <FormField
                  control={verboseInputForm.control}
                  name="ecosystem"
                  render={({ field }) => (
                    <FormItem>
                      <select
                        {...field}
                        className="w-full px-3 py-2 mb-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        aria-placeholder="Select an ecosystem"
                      >
                        <option>Select an ecosystem</option>
                        <option value="npm">npm</option>
                        <option value="pypi">pypi</option>
                        <option value="maven">maven</option>
                        <option value="rubygem">rubygem</option>
                        <option value="Go">Go</option>
                      </select>
                      <FormMessage />
                    </FormItem>
                  )}
                ></FormField>
                <FormField
                  control={verboseInputForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <input
                        {...field}
                        type="text"
                        placeholder="express"
                        className="w-full px-3 py-2 mb-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      ></input>
                      <FormMessage />
                    </FormItem>
                  )}
                ></FormField>
                <FormField
                  control={verboseInputForm.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <input
                        {...field}
                        type="text"
                        placeholder="4.17.1"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      ></input>
                      <FormMessage />
                    </FormItem>
                  )}
                ></FormField>
                <button
                  type="submit"
                  className="w-full px-3 py-2 mt-2 text-white bg-indigo-600 border border-indigo-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  Lets go!
                </button>

                <p className="mt-2 text-sm text-gray-500 text-right">
                  Boring? Switch to{" "}
                  <a
                    href="#"
                    onClick={() => setUsePurlBasedQuery(true)}
                    className="text-indigo-600"
                  >
                    PURL based query
                  </a>
                </p>
              </form>
            </Form>
          )}
        </div>
      </div>
      <div className="flex items-center justify-around max-w-4xl mt-6 sm:w-full">
        <p className="text-sm text-gray-500 text-center">
          Built with <span className="text-indigo-600">♥</span> by
          <a
            href="https://safedep.io"
            className="text-indigo-600"
            target="_blank"
          >
            SafeDep Team
          </a>{" "}
          using
          <a
            href="https://docs.safedep.io/cloud"
            className="text-indigo-600"
            target="_blank"
          >
            {" "}
            SafeDep Cloud API{" "}
          </a>
        </p>
      </div>
    </div>
  );
}
