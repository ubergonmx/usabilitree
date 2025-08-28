"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileTextIcon } from "@/components/icons";
import { useState } from "react";
import { toast } from "sonner";
import * as Sentry from "@sentry/react";

interface ExportTabProps {
  studyId: string;
}

export function ExportTab({ studyId }: ExportTabProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/export/${studyId}`);

      if (!response.ok) {
        throw new Error("Failed to export study data");
      }

      const blob = await response.blob();

      // Extract filename from Content-Disposition header or use fallback
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `study-export.xlsx`; // fallback

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=(["']?)([^"'\n]*)\1/);
        if (filenameMatch && filenameMatch[2]) {
          filename = filenameMatch[2];
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Study data exported successfully");
    } catch (error) {
      console.error("Failed to export study data:", error);
      toast.error("Failed to export study data");
      Sentry.captureException(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Export Study Data</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileTextIcon className="h-5 w-5" />
            Export to Excel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Download all study data including participant information, task results, and performance
            metrics in an Excel (.xlsx) format.
          </p>

          <div className="space-y-2">
            <h4 className="font-medium">Export includes:</h4>
            <ul className="ml-4 space-y-1 text-sm text-muted-foreground">
              <li>• Participant status and completion times</li>
              <li>• Task completion, success, and skip rates</li>
              <li>• Path directness scores</li>
              <li>• Detailed task paths and outcomes</li>
              <li>• Confidence ratings</li>
            </ul>
          </div>

          <Button onClick={handleExport} disabled={isExporting} className="w-full sm:w-auto">
            <FileTextIcon className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Download Excel File"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
