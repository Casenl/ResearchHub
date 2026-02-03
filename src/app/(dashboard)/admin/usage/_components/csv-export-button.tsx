"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CsvExportButtonProps {
  headers: string[];
  rows: (string | number)[][];
  filename: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CsvExportButton({ headers, rows, filename }: CsvExportButtonProps): React.JSX.Element {
  const handleExport = () => {
    const csvLines: string[] = [headers.join(",")];
    for (const row of rows) {
      csvLines.push(
        row
          .map((cell) => {
            const str = String(cell);
            // Wrap in quotes if the value contains commas, quotes, or newlines
            if (str.includes(",") || str.includes('"') || str.includes("\n")) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(","),
      );
    }
    const csvContent = csvLines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
      <Download className="h-3.5 w-3.5" />
      Export CSV
    </Button>
  );
}
