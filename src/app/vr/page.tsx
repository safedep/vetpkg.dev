"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Shield, Book, Star, Activity } from "lucide-react";
import { FileUpload } from "./FileUpload";
import { VetData } from "./types";
import sampleData from "./sample.json";
import { ViolationsTab } from "./components/tabs/ViolationsTab";
import { VulnerabilitiesTab } from "./components/tabs/VulnerabilitiesTab";
import { LicensesTab } from "./components/tabs/LicensesTab";
import { PopularityTab } from "./components/tabs/PopularityTab";
import { AdviceTab } from "./components/tabs/AdviceTab";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function Page() {
  const [data, setData] = useState<VetData | null>(null);
  const [showTabs, setShowTabs] = useState(false);

  const handleDataUpdate = (newData: VetData) => {
    setData(newData);
    setShowTabs(true);
  };

  const handleShowExample = () => {
    setData(sampleData as VetData);
    setShowTabs(true);
  };

  return (
    <div className="container mx-auto p-6">
      {!showTabs ? (
        <div className="flex items-center justify-center min-h-screen flex-col">
          <div className="w-full max-w-3xl">
            <h2 className="text-center text-4xl font-bold mb-4">
              <a
                href="https://github.com/safedep/vet"
                target="_blank"
                rel="noopener noreferrer"
              >
                🛠️ <span className="text-indigo-500">vet</span> JSON Report
                Viewer
              </a>
            </h2>
          </div>
          <div className="w-full max-w-3xl">
            <Card className="w-full max-w-3xl mx-auto shadow-lg">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <FileUpload onDataUpdate={handleDataUpdate} />
                  <div className="text-center text-sm text-gray-400">
                    <span>or </span>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-normal text-indigo-500 hover:text-indigo-600"
                      onClick={handleShowExample}
                    >
                      📊 view example analysis
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center p-4 rounded-lg shadow-md">
            <Tabs defaultValue="violations" className="w-full">
              <TabsList className="grid w-full grid-cols-5 gap-2">
                <TabsTrigger
                  value="violations"
                  className="flex items-center justify-center p-2 bg-indigo-100 hover:bg-indigo-200 rounded-md"
                >
                  <AlertCircle className="w-4 h-4 mr-2 text-indigo-500" />
                  <span className="font-semibold text-indigo-600">
                    🚨 Policy Violations
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="vulnerabilities"
                  className="flex items-center justify-center p-2 bg-indigo-100 hover:bg-indigo-200 rounded-md"
                >
                  <Shield className="w-4 h-4 mr-2 text-indigo-500" />
                  <span className="font-semibold text-indigo-600">
                    🛡️ Vulnerabilities
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="licenses"
                  className="flex items-center justify-center p-2 bg-indigo-100 hover:bg-indigo-200 rounded-md"
                >
                  <Book className="w-4 h-4 mr-2 text-indigo-500" />
                  <span className="font-semibold text-indigo-600">
                    📚 License Info
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="popularity"
                  className="flex items-center justify-center p-2 bg-indigo-100 hover:bg-indigo-200 rounded-md"
                >
                  <Star className="w-4 h-4 mr-2 text-indigo-500" />
                  <span className="font-semibold text-indigo-600">
                    ⭐ Popularity
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="other"
                  className="flex items-center justify-center p-2 bg-indigo-100 hover:bg-indigo-200 rounded-md"
                >
                  <Activity className="w-4 h-4 mr-2 text-indigo-500" />
                  <span className="font-semibold text-indigo-600">
                    ℹ️ Other Info
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="violations">
                <ViolationsTab data={data?.packages || []} />
              </TabsContent>

              <TabsContent value="vulnerabilities">
                <VulnerabilitiesTab data={data?.packages || []} />
              </TabsContent>

              <TabsContent value="licenses">
                <LicensesTab data={data?.packages || []} />
              </TabsContent>

              <TabsContent value="popularity">
                <PopularityTab data={data?.packages || []} />
              </TabsContent>

              <TabsContent value="other">
                <AdviceTab data={data?.packages || []} />
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
}
