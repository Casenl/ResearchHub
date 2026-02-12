"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { RESEARCH_STEP_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { usePromptTemplates } from "@/hooks/use-admin-data";
import { useDomains } from "@/hooks/use-taxonomy";

import { useToast } from "./use-toast";
import { TemplateEditor } from "./template-editor";

import type { PromptTemplate } from "@/types";

// =============================================================================
// TemplatesTab
// =============================================================================

export function TemplatesTab(): React.JSX.Element {
  const { data: templates, createTemplate, updateTemplate, deleteTemplate: deleteTemplateService } = usePromptTemplates();
  const { data: domains } = useDomains();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { show, Toast } = useToast();

  const domainLabel = (domainId: string): string => {
    if (domainId === "_default") return "Default";
    return domains.find((d) => d.id === domainId)?.name ?? domainId;
  };

  const filteredTemplates = templates.filter((t) => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;
    return (
      domainLabel(t.domain).toLowerCase().includes(query) ||
      RESEARCH_STEP_LABELS[t.research_step].toLowerCase().includes(query) ||
      t.content.toLowerCase().includes(query)
    );
  });

  const selectedTemplate = selectedId
    ? templates.find((t) => t.id === selectedId) ?? null
    : null;

  const handleSave = async (updated: PromptTemplate): Promise<void> => {
    if (isCreating) {
      const { id: _id, created_at: _ca, ...rest } = updated;
      await createTemplate(rest);
      show(`Template for ${domainLabel(updated.domain)} / ${RESEARCH_STEP_LABELS[updated.research_step]} created`);
    } else if (selectedId) {
      const { id: _id, ...rest } = updated;
      await updateTemplate(selectedId, rest);
      show(`Template updated to v${updated.version}`);
    }
    setSelectedId(null);
    setIsCreating(false);
  };

  const handleDelete = async (id: string): Promise<void> => {
    const tpl = templates.find((t) => t.id === id);
    await deleteTemplateService(id);
    if (selectedId === id) setSelectedId(null);
    show(`Template "${domainLabel(tpl?.domain ?? "")}" deleted`);
  };

  const handleCancel = (): void => {
    setSelectedId(null);
    setIsCreating(false);
  };

  const handleCreate = (): void => {
    setSelectedId(null);
    setIsCreating(true);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""}
          </p>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Add Template
          </Button>
        </div>
      </div>

      {/* Editor panel */}
      {(isCreating || selectedId) && (
        <TemplateEditor
          template={isCreating ? null : selectedTemplate}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Domain</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Step</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Version</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Variables</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTemplates.map((tpl, idx) => (
              <tr
                key={tpl.id}
                className={cn(
                  "border-b border-border transition-colors cursor-pointer",
                  selectedId === tpl.id
                    ? "bg-primary/5 ring-1 ring-inset ring-primary/20"
                    : idx % 2 === 0
                    ? "bg-background hover:bg-muted/30"
                    : "bg-muted/10 hover:bg-muted/30"
                )}
                onClick={() => {
                  setIsCreating(false);
                  setSelectedId(selectedId === tpl.id ? null : tpl.id);
                }}
              >
                <td className="px-4 py-3 font-medium">{domainLabel(tpl.domain)}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{RESEARCH_STEP_LABELS[tpl.research_step]}</Badge>
                </td>
                <td className="px-4 py-3 text-center font-mono text-xs">v{tpl.version}</td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="outline">{tpl.variables.length}</Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={tpl.is_active ? "success" : "warning"}>
                    {tpl.is_active ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setIsCreating(false);
                        setSelectedId(tpl.id);
                      }}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(tpl.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredTemplates.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No templates match your search.
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
