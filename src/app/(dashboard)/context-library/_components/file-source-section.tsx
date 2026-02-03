import React from "react";
import { Upload, FileUp, Link as LinkIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type UploadMode = "file" | "url";

interface FileSourceSectionProps {
  uploadMode: UploadMode;
  onUploadModeChange: (mode: UploadMode) => void;
  externalUrl: string;
  onExternalUrlChange: (url: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FileSourceSection({
  uploadMode,
  onUploadModeChange,
  externalUrl,
  onExternalUrlChange,
}: FileSourceSectionProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>File Source</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode Toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onUploadModeChange("file")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              uploadMode === "file"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <FileUp className="h-4 w-4" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => onUploadModeChange("url")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              uploadMode === "url"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <LinkIcon className="h-4 w-4" />
            External URL
          </button>
        </div>

        {uploadMode === "file" ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 px-6 py-10 transition-colors hover:border-primary/40 hover:bg-muted/30">
            <Upload className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="mb-1 text-sm font-medium text-foreground">
              Drag and drop your file here
            </p>
            <p className="mb-4 text-xs text-muted-foreground">
              or click to browse from your computer
            </p>
            <Button type="button" variant="outline" size="sm">
              <FileUp className="mr-1.5 h-4 w-4" />
              Choose File
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Accepted formats: PDF, DOCX, Markdown
            </p>
          </div>
        ) : (
          <div>
            <label
              htmlFor="external-url"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              External URL
            </label>
            <Input
              id="external-url"
              type="url"
              placeholder="https://example.com/document.pdf"
              value={externalUrl}
              onChange={(e) => onExternalUrlChange(e.target.value)}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Provide a direct link to the external document or resource.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
