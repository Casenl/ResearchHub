import React from "react";

import { CONTEXT_CATEGORY_LABELS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { ContextDocumentCategory } from "@/types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BasicInfoSectionProps {
  title: string;
  onTitleChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  category: ContextDocumentCategory | "";
  onCategoryChange: (value: ContextDocumentCategory) => void;
  errors?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BasicInfoSection({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  category,
  onCategoryChange,
  errors = {},
}: BasicInfoSectionProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            id="title"
            placeholder="e.g. ITQ Security Services Catalogue 2025"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            required
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.title}</p>}
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Description
          </label>
          <Textarea
            id="description"
            placeholder="Brief description of the document contents and purpose..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) =>
              onCategoryChange(e.target.value as ContextDocumentCategory)
            }
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            required
          >
            <option value="">Select a category...</option>
            {(
              Object.entries(CONTEXT_CATEGORY_LABELS) as [
                ContextDocumentCategory,
                string,
              ][]
            ).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.category}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
