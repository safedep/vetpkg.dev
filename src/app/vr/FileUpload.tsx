"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VetData } from "./types";

interface FileUploadProps {
  onDataUpdate: (data: VetData) => void;
}

export function FileUpload({ onDataUpdate }: FileUploadProps) {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          onDataUpdate(jsonData);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="max-w-md"
          />
          <Button variant="outline">Upload JSON</Button>
        </div>
      </CardContent>
    </Card>
  );
}
