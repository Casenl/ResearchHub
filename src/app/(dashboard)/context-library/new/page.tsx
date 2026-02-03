"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";

import { BackToLibraryLink } from "../_components/back-to-library-link";
import { BasicInfoSection } from "../_components/basic-info-section";
import { FileSourceSection } from "../_components/file-source-section";
import { DimensionsSection } from "../_components/dimensions-section";
import { ValidityPeriodSection } from "../_components/validity-period-section";
import { TagsSection } from "../_components/tags-section";

import type { ContextDocumentCategory } from "@/types";
import type { UploadMode } from "../_components/file-source-section";

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function UploadContextDocumentPage(): React.JSX.Element {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ContextDocumentCategory | "">("");
  const [uploadMode, setUploadMode] = useState<UploadMode>("file");
  const [externalUrl, setExternalUrl] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Toggle helpers
  const toggleDomain = (domainId: string): void => {
    setSelectedDomains((prev) =>
      prev.includes(domainId)
        ? prev.filter((d) => d !== domainId)
        : [...prev, domainId]
    );
  };

  const toggleMarket = (marketId: string): void => {
    setSelectedMarkets((prev) =>
      prev.includes(marketId)
        ? prev.filter((m) => m !== marketId)
        : [...prev, marketId]
    );
  };

  const toggleSector = (sectorId: string): void => {
    setSelectedSectors((prev) =>
      prev.includes(sectorId)
        ? prev.filter((s) => s !== sectorId)
        : [...prev, sectorId]
    );
  };

  const handleSubmit = (e: React.FormEvent): void => {
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
      <BackToLibraryLink />

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
        <BasicInfoSection
          title={title}
          onTitleChange={setTitle}
          description={description}
          onDescriptionChange={setDescription}
          category={category}
          onCategoryChange={setCategory}
        />

        <FileSourceSection
          uploadMode={uploadMode}
          onUploadModeChange={setUploadMode}
          externalUrl={externalUrl}
          onExternalUrlChange={setExternalUrl}
        />

        <DimensionsSection
          selectedDomains={selectedDomains}
          onToggleDomain={toggleDomain}
          selectedMarkets={selectedMarkets}
          onToggleMarket={toggleMarket}
          selectedSectors={selectedSectors}
          onToggleSector={toggleSector}
        />

        <ValidityPeriodSection
          validFrom={validFrom}
          onValidFromChange={setValidFrom}
          validUntil={validUntil}
          onValidUntilChange={setValidUntil}
        />

        <TagsSection tags={tags} onTagsChange={setTags} />

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
