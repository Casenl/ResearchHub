"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";

import { cn, generateId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SYSTEM_TAGS } from "@/data/tags";

import { useToast } from "./use-toast";

import type { Tag, TagType } from "@/types";

// =============================================================================
// TagsTab
// =============================================================================

export function TagsTab(): React.JSX.Element {
  const [tags, setTags] = useState<Tag[]>([...SYSTEM_TAGS]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ name: string; type: TagType }>({
    name: "",
    type: "system",
  });
  const [filter, setFilter] = useState<"all" | "system" | "free">("all");
  const { show, Toast } = useToast();

  const resetForm = (): void => {
    setForm({ name: "", type: "system" });
    setIsFormVisible(false);
    setEditingId(null);
  };

  const handleSave = (): void => {
    if (!form.name.trim()) return;

    if (editingId) {
      setTags((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? { ...t, name: form.name, type: form.type }
            : t
        )
      );
      show(`Tag "${form.name}" updated successfully`);
    } else {
      const newTag: Tag = {
        id: generateId(),
        name: form.name,
        type: form.type,
      };
      setTags((prev) => [...prev, newTag]);
      show(`Tag "${form.name}" added successfully`);
    }
    resetForm();
  };

  const handleEdit = (tag: Tag): void => {
    setForm({ name: tag.name, type: tag.type });
    setEditingId(tag.id);
    setIsFormVisible(true);
  };

  const handleDelete = (id: string): void => {
    const tag = tags.find((t) => t.id === id);
    setTags((prev) => prev.filter((t) => t.id !== id));
    show(`Tag "${tag?.name}" deleted`);
  };

  const filteredTags =
    filter === "all" ? tags : tags.filter((t) => t.type === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {filteredTags.length} of {tags.length} tags shown
          </p>
          <div className="flex rounded-md border border-border">
            {(["all", "system", "free"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setIsFormVisible(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Tag
        </Button>
      </div>

      {isFormVisible && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <h4 className="mb-3 text-sm font-semibold">
            {editingId ? "Edit Tag" : "New Tag"}
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Name
              </label>
              <Input
                placeholder="e.g. Supply Chain"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-muted-foreground">
                Type
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="tag-type"
                    value="system"
                    checked={form.type === "system"}
                    onChange={() => setForm({ ...form, type: "system" })}
                    className="h-4 w-4 accent-primary"
                  />
                  System
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="tag-type"
                    value="free"
                    checked={form.type === "free"}
                    onChange={() => setForm({ ...form, type: "free" })}
                    className="h-4 w-4 accent-primary"
                  />
                  Free
                </label>
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4" />
              {editingId ? "Update" : "Save"}
            </Button>
            <Button size="sm" variant="outline" onClick={resetForm}>
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Name
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Type
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTags.map((tag, idx) => (
              <tr
                key={tag.id}
                className={cn(
                  "border-b border-border transition-colors hover:bg-muted/30",
                  idx % 2 === 0 ? "bg-background" : "bg-muted/10"
                )}
              >
                <td className="px-4 py-3 font-medium">{tag.name}</td>
                <td className="px-4 py-3">
                  <Badge
                    variant={tag.type === "system" ? "default" : "secondary"}
                  >
                    {tag.type}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(tag)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(tag.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredTags.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No tags match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {Toast}
    </div>
  );
}
