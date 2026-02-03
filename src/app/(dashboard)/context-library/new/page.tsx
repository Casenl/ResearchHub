"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  FileUp,
  Link as LinkIcon,
  X,
  Plus,
  Calendar,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { CONTEXT_CATEGORY_LABELS } from "@/lib/constants";
import { DOMAINS } from "@/data/domains";
import { MARKETS } from "@/data/markets";
import { SECTORS } from "@/data/sectors";
import type { ContextDocumentCategory, FileType } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function UploadContextDocumentPage() {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ContextDocumentCategory | "">("");
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [externalUrl, setExternalUrl] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Toggle helpers
  const toggleDomain = (domainId: string) => {
    setSelectedDomains((prev) =>
      prev.includes(domainId)
        ? prev.filter((d) => d !== domainId)
        : [...prev, domainId]
    );
  };

  const toggleMarket = (marketId: string) => {
    setSelectedMarkets((prev) =>
      prev.includes(marketId)
        ? prev.filter((m) => m !== marketId)
        : [...prev, marketId]
    );
  };

  const toggleSector = (sectorId: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sectorId)
        ? prev.filter((s) => s !== sectorId)
        : [...prev, sectorId]
    );
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a document title.");
      return;
    }

    if (!category) {
      alert("Please select a category.");
      return;
    }

    alert(
      `Document "${title}" uploaded successfully (mock). Redirecting to Context Library.`
    );
    router.push("/context-library");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back Link */}
      <Link
        href="/context-library"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Context Library
      </Link>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Upload Context Document
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new supporting document to the Context Library for use in
          research projects.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
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
                onChange={(e) => setTitle(e.target.value)}
                required
              />
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
                onChange={(e) => setDescription(e.target.value)}
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
                  setCategory(e.target.value as ContextDocumentCategory)
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
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>File Source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mode Toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUploadMode("file")}
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
                onClick={() => setUploadMode("url")}
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
                  onChange={(e) => setExternalUrl(e.target.value)}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Provide a direct link to the external document or resource.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dimensions */}
        <Card>
          <CardHeader>
            <CardTitle>Dimensions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Domains */}
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                Domains
              </p>
              <div className="flex flex-wrap gap-2">
                {DOMAINS.map((domain) => (
                  <label
                    key={domain.id}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                      selectedDomains.includes(domain.id)
                        ? "border-purple-300 bg-purple-50 text-purple-800"
                        : "border-border bg-white text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDomains.includes(domain.id)}
                      onChange={() => toggleDomain(domain.id)}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    {domain.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Markets */}
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                Markets
              </p>
              <div className="flex flex-wrap gap-2">
                {MARKETS.map((market) => (
                  <label
                    key={market.id}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                      selectedMarkets.includes(market.id)
                        ? "border-blue-300 bg-blue-50 text-blue-800"
                        : "border-border bg-white text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMarkets.includes(market.id)}
                      onChange={() => toggleMarket(market.id)}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    {market.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Sectors */}
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                Sectors
              </p>
              <div className="flex flex-wrap gap-2">
                {SECTORS.map((sector) => (
                  <label
                    key={sector.id}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                      selectedSectors.includes(sector.id)
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                        : "border-border bg-white text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSectors.includes(sector.id)}
                      onChange={() => toggleSector(sector.id)}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    {sector.name}
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validity Period */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Validity Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="valid-from"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Valid from
                </label>
                <Input
                  id="valid-from"
                  type="date"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="valid-until"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Valid until
                </label>
                <Input
                  id="valid-until"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={addTag}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="px-2 py-0.5 text-xs gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-gray-300/50 transition-colors"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Press Enter or click Add to create a tag. Tags help organize and
              filter documents.
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/context-library">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit">
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </form>
    </div>
  );
}
