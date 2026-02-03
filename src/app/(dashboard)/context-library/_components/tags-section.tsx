"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TagsSectionProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TagsSection({
  tags,
  onTagsChange,
}: TagsSectionProps): React.JSX.Element {
  const [tagInput, setTagInput] = useState("");

  const addTag = (): void => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onTagsChange([...tags, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string): void => {
    onTagsChange(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
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
  );
}
