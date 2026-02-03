"use client";

import React, { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Save,
  X,
} from "lucide-react";

import { cn, generateId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DOMAINS } from "@/data/domains";

import { useToast } from "./use-toast";

import type { Domain } from "@/types";

// =============================================================================
// DomainsTab
// =============================================================================

export function DomainsTab(): React.JSX.Element {
  const [domains, setDomains] = useState<Domain[]>([...DOMAINS]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    default_sources: "",
    itq_service_catalogue_ref: "",
  });
  const { show, Toast } = useToast();

  const resetForm = (): void => {
    setForm({
      name: "",
      code: "",
      description: "",
      default_sources: "",
      itq_service_catalogue_ref: "",
    });
    setIsFormVisible(false);
    setEditingId(null);
  };

  const handleSave = (): void => {
    if (!form.name.trim() || !form.code.trim()) return;

    const sources = form.default_sources
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingId) {
      setDomains((prev) =>
        prev.map((d) =>
          d.id === editingId
            ? {
                ...d,
                name: form.name,
                code: form.code,
                description: form.description,
                default_sources: sources,
                itq_service_catalogue_ref: form.itq_service_catalogue_ref,
              }
            : d
        )
      );
      show(`Domain "${form.name}" updated successfully`);
    } else {
      const newDomain: Domain = {
        id: generateId(),
        name: form.name,
        code: form.code.toUpperCase(),
        description: form.description,
        default_sources: sources,
        itq_service_catalogue_ref: form.itq_service_catalogue_ref,
      };
      setDomains((prev) => [...prev, newDomain]);
      show(`Domain "${form.name}" added successfully`);
    }
    resetForm();
  };

  const handleEdit = (domain: Domain): void => {
    setForm({
      name: domain.name,
      code: domain.code,
      description: domain.description,
      default_sources: domain.default_sources.join("\n"),
      itq_service_catalogue_ref: domain.itq_service_catalogue_ref,
    });
    setEditingId(domain.id);
    setIsFormVisible(true);
  };

  const handleDelete = (id: string): void => {
    const domain = domains.find((d) => d.id === id);
    setDomains((prev) => prev.filter((d) => d.id !== id));
    show(`Domain "${domain?.name}" deleted`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {domains.length} domains configured
        </p>
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setIsFormVisible(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Domain
        </Button>
      </div>

      {isFormVisible && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <h4 className="mb-3 text-sm font-semibold">
            {editingId ? "Edit Domain" : "New Domain"}
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Name
              </label>
              <Input
                placeholder="e.g. Cloud Networking"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Code
              </label>
              <Input
                placeholder="e.g. CN"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Description
              </label>
              <Input
                placeholder="Brief description of the domain"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Default Sources (one per line)
              </label>
              <Textarea
                placeholder={"Gartner MQ\nForrester Wave\nIDC Tracker"}
                rows={4}
                value={form.default_sources}
                onChange={(e) =>
                  setForm({ ...form, default_sources: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                ITQ Service Catalogue Ref
              </label>
              <Input
                placeholder="e.g. SC-CN-001"
                value={form.itq_service_catalogue_ref}
                onChange={(e) =>
                  setForm({
                    ...form,
                    itq_service_catalogue_ref: e.target.value,
                  })
                }
              />
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
              <th className="w-8 px-4 py-3" />
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Name
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Code
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Description
              </th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                Sources
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {domains.map((domain, idx) => (
              <React.Fragment key={domain.id}>
                <tr
                  className={cn(
                    "border-b border-border transition-colors hover:bg-muted/30",
                    idx % 2 === 0 ? "bg-background" : "bg-muted/10"
                  )}
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        setExpandedId(
                          expandedId === domain.id ? null : domain.id
                        )
                      }
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {expandedId === domain.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-medium">{domain.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{domain.code}</Badge>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                    {domain.description}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="secondary">
                      {domain.default_sources.length}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(domain)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(domain.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
                {expandedId === domain.id && (
                  <tr className="bg-muted/20">
                    <td colSpan={6} className="px-8 py-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Default Sources
                      </p>
                      <ul className="space-y-1">
                        {domain.default_sources.map((source, sIdx) => (
                          <li
                            key={sIdx}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            {source}
                          </li>
                        ))}
                      </ul>
                      {domain.itq_service_catalogue_ref && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Catalogue ref:{" "}
                          <span className="font-mono">
                            {domain.itq_service_catalogue_ref}
                          </span>
                        </p>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {Toast}
    </div>
  );
}
