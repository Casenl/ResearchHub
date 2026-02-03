"use client";

import React, { useState, useCallback } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import {
  Tags,
  Globe,
  Shield,
  Building2,
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
import { MARKETS } from "@/data/markets";
import { DOMAINS } from "@/data/domains";
import { SECTORS } from "@/data/sectors";
import { SYSTEM_TAGS } from "@/data/tags";
import type { Market, Domain, Sector, Tag, TagType } from "@/types";

// =============================================================================
// Helpers
// =============================================================================

function getParentName(parentId: string | null, markets: Market[]): string {
  if (!parentId) return "\u2014";
  const parent = markets.find((m) => m.id === parentId);
  return parent ? parent.name : "\u2014";
}

function getIndentLevel(market: Market, markets: Market[]): number {
  let level = 0;
  let current = market;
  while (current.parent_id) {
    level++;
    const parent = markets.find((m) => m.id === current.parent_id);
    if (!parent) break;
    current = parent;
  }
  return level;
}

// =============================================================================
// Alert Toast (lightweight inline feedback)
// =============================================================================

function useToast() {
  const [message, setMessage] = useState<string | null>(null);

  const show = useCallback((msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const Toast = message ? (
    <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 shadow-lg">
      {message}
    </div>
  ) : null;

  return { show, Toast };
}

// =============================================================================
// Markets Tab
// =============================================================================

function MarketsTab() {
  const [markets, setMarkets] = useState<Market[]>([...MARKETS]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "", parent_id: "" });
  const { show, Toast } = useToast();

  const resetForm = () => {
    setForm({ name: "", code: "", parent_id: "" });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.code.trim()) return;

    if (editingId) {
      setMarkets((prev) =>
        prev.map((m) =>
          m.id === editingId
            ? { ...m, name: form.name, code: form.code, parent_id: form.parent_id || null }
            : m
        )
      );
      show(`Market "${form.name}" updated successfully`);
    } else {
      const newMarket: Market = {
        id: generateId(),
        name: form.name,
        code: form.code.toUpperCase(),
        parent_id: form.parent_id || null,
      };
      setMarkets((prev) => [...prev, newMarket]);
      show(`Market "${form.name}" added successfully`);
    }
    resetForm();
  };

  const handleEdit = (market: Market) => {
    setForm({
      name: market.name,
      code: market.code,
      parent_id: market.parent_id || "",
    });
    setEditingId(market.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const market = markets.find((m) => m.id === id);
    setMarkets((prev) => prev.filter((m) => m.id !== id));
    show(`Market "${market?.name}" deleted`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {markets.length} markets configured
        </p>
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Market
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <h4 className="mb-3 text-sm font-semibold">
            {editingId ? "Edit Market" : "New Market"}
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Name
              </label>
              <Input
                placeholder="e.g. Netherlands"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Code
              </label>
              <Input
                placeholder="e.g. NL"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Parent
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.parent_id}
                onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
              >
                <option value="">None (root)</option>
                {markets
                  .filter((m) => m.id !== editingId)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.code})
                    </option>
                  ))}
              </select>
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
                Code
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Parent
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {markets.map((market, idx) => {
              const indent = getIndentLevel(market, markets);
              return (
                <tr
                  key={market.id}
                  className={cn(
                    "border-b border-border transition-colors hover:bg-muted/30",
                    idx % 2 === 0 ? "bg-background" : "bg-muted/10"
                  )}
                >
                  <td className="px-4 py-3 font-medium">
                    <span style={{ paddingLeft: `${indent * 1.25}rem` }}>
                      {indent > 0 && (
                        <span className="mr-1 text-muted-foreground">\u2514</span>
                      )}
                      {market.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{market.code}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {getParentName(market.parent_id, markets)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(market)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(market.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {Toast}
    </div>
  );
}

// =============================================================================
// Domains Tab
// =============================================================================

function DomainsTab() {
  const [domains, setDomains] = useState<Domain[]>([...DOMAINS]);
  const [showForm, setShowForm] = useState(false);
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

  const resetForm = () => {
    setForm({
      name: "",
      code: "",
      description: "",
      default_sources: "",
      itq_service_catalogue_ref: "",
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSave = () => {
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

  const handleEdit = (domain: Domain) => {
    setForm({
      name: domain.name,
      code: domain.code,
      description: domain.description,
      default_sources: domain.default_sources.join("\n"),
      itq_service_catalogue_ref: domain.itq_service_catalogue_ref,
    });
    setEditingId(domain.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
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
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Domain
        </Button>
      </div>

      {showForm && (
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

// =============================================================================
// Sectors Tab
// =============================================================================

function SectorsTab() {
  const [sectors, setSectors] = useState<Sector[]>([...SECTORS]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "", regulations: "" });
  const [regInput, setRegInput] = useState("");
  const [regTags, setRegTags] = useState<string[]>([]);
  const { show, Toast } = useToast();

  const resetForm = () => {
    setForm({ name: "", code: "", regulations: "" });
    setRegInput("");
    setRegTags([]);
    setShowForm(false);
    setEditingId(null);
  };

  const addRegulation = () => {
    const trimmed = regInput.trim();
    if (trimmed && !regTags.includes(trimmed)) {
      setRegTags((prev) => [...prev, trimmed]);
      setRegInput("");
    }
  };

  const removeRegulation = (reg: string) => {
    setRegTags((prev) => prev.filter((r) => r !== reg));
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.code.trim()) return;

    if (editingId) {
      setSectors((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? {
                ...s,
                name: form.name,
                code: form.code,
                relevant_regulations: regTags,
              }
            : s
        )
      );
      show(`Sector "${form.name}" updated successfully`);
    } else {
      const newSector: Sector = {
        id: generateId(),
        name: form.name,
        code: form.code.toUpperCase(),
        relevant_regulations: regTags,
      };
      setSectors((prev) => [...prev, newSector]);
      show(`Sector "${form.name}" added successfully`);
    }
    resetForm();
  };

  const handleEdit = (sector: Sector) => {
    setForm({
      name: sector.name,
      code: sector.code,
      regulations: "",
    });
    setRegTags([...sector.relevant_regulations]);
    setEditingId(sector.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const sector = sectors.find((s) => s.id === id);
    setSectors((prev) => prev.filter((s) => s.id !== id));
    show(`Sector "${sector?.name}" deleted`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {sectors.length} sectors configured
        </p>
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Sector
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <h4 className="mb-3 text-sm font-semibold">
            {editingId ? "Edit Sector" : "New Sector"}
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Name
              </label>
              <Input
                placeholder="e.g. Telecommunications"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Code
              </label>
              <Input
                placeholder="e.g. TEL"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Relevant Regulations
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a regulation and press Enter or Add"
                  value={regInput}
                  onChange={(e) => setRegInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addRegulation();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addRegulation}
                >
                  Add
                </Button>
              </div>
              {regTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {regTags.map((reg) => (
                    <Badge
                      key={reg}
                      variant="secondary"
                      className="gap-1 pr-1"
                    >
                      {reg}
                      <button
                        onClick={() => removeRegulation(reg)}
                        className="ml-0.5 rounded-sm p-0.5 hover:bg-muted-foreground/20"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
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
                Code
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Relevant Regulations
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sectors.map((sector, idx) => (
              <tr
                key={sector.id}
                className={cn(
                  "border-b border-border transition-colors hover:bg-muted/30",
                  idx % 2 === 0 ? "bg-background" : "bg-muted/10"
                )}
              >
                <td className="px-4 py-3 font-medium">{sector.name}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{sector.code}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {sector.relevant_regulations.map((reg) => (
                      <Badge key={reg} variant="secondary">
                        {reg}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(sector)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(sector.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {Toast}
    </div>
  );
}

// =============================================================================
// Tags Tab
// =============================================================================

function TagsTab() {
  const [tags, setTags] = useState<Tag[]>([...SYSTEM_TAGS]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ name: string; type: TagType }>({
    name: "",
    type: "system",
  });
  const [filter, setFilter] = useState<"all" | "system" | "free">("all");
  const { show, Toast } = useToast();

  const resetForm = () => {
    setForm({ name: "", type: "system" });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSave = () => {
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

  const handleEdit = (tag: Tag) => {
    setForm({ name: tag.name, type: tag.type });
    setEditingId(tag.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
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
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Tag
        </Button>
      </div>

      {showForm && (
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

// =============================================================================
// Main Page
// =============================================================================

const TAB_CONFIG = [
  { value: "markets", label: "Markets", icon: Globe },
  { value: "domains", label: "Domains", icon: Shield },
  { value: "sectors", label: "Sectors", icon: Building2 },
  { value: "tags", label: "Tags", icon: Tags },
] as const;

export default function TaxonomyPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Taxonomy Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage markets, domains, sectors, and tags used across the portal
        </p>
      </div>

      {/* Tabs */}
      <Tabs.Root defaultValue="markets">
        <Tabs.List className="flex border-b border-border">
          {TAB_CONFIG.map(({ value, label, icon: Icon }) => (
            <Tabs.Trigger
              key={value}
              value={value}
              className={cn(
                "flex items-center gap-2 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors",
                "hover:text-foreground",
                "data-[state=active]:border-primary data-[state=active]:text-primary"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <div className="mt-6">
          <Tabs.Content value="markets">
            <MarketsTab />
          </Tabs.Content>
          <Tabs.Content value="domains">
            <DomainsTab />
          </Tabs.Content>
          <Tabs.Content value="sectors">
            <SectorsTab />
          </Tabs.Content>
          <Tabs.Content value="tags">
            <TagsTab />
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
}
