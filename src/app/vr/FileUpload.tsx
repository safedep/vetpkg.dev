"use client";

import { useState, useCallback } from "react";
import { Upload, FileJson } from "lucide-react";
import { VetData } from "@/app/vr/types";

interface FileUploadProps {
  onDataUpdate: (data: VetData) => void;
}

export function FileUpload({ onDataUpdate }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type !== "application/json") {
        console.error("Please upload a JSON file");
        return;
      }

      setFileName(file.name);
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
    },
    [onDataUpdate],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  return (
    <div className="w-full">
      <div
        className={`
          relative rounded-lg border-2 border-dashed p-6
          ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
          transition-colors duration-200
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept="application/json"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          title="Choose a JSON file or drag it here"
        />
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            {fileName ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileJson className="w-8 h-8" />
                <span className="text-sm">{fileName}</span>
              </div>
            ) : (
              <Upload className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {fileName
                ? "Drop another file or click to replace"
                : "Drop your vet JSON report here"}
            </p>
            <p className="text-xs text-muted-foreground">
              or click to select a file from your computer
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
