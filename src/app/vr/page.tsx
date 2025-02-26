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

export default function Page() {
  const [data, setData] = useState<VetData>(sampleData as VetData);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Package Analysis Viewer</h1>

      <FileUpload onDataUpdate={setData} />

      <Tabs defaultValue="violations" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="violations">
            <AlertCircle className="w-4 h-4 mr-2" />
            Policy Violations
          </TabsTrigger>
          <TabsTrigger value="vulnerabilities">
            <Shield className="w-4 h-4 mr-2" />
            Vulnerabilities
          </TabsTrigger>
          <TabsTrigger value="licenses">
            <Book className="w-4 h-4 mr-2" />
            License Info
          </TabsTrigger>
          <TabsTrigger value="popularity">
            <Star className="w-4 h-4 mr-2" />
            Popularity
          </TabsTrigger>
          <TabsTrigger value="other">
            <Activity className="w-4 h-4 mr-2" />
            Other Info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="violations">
          <ViolationsTab data={data.packages} />
        </TabsContent>

        <TabsContent value="vulnerabilities">
          <VulnerabilitiesTab data={data.packages} />
        </TabsContent>

        <TabsContent value="licenses">
          <LicensesTab data={data.packages} />
        </TabsContent>

        <TabsContent value="popularity">
          <PopularityTab data={data.packages} />
        </TabsContent>

        <TabsContent value="other">
          <AdviceTab data={data.packages} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
