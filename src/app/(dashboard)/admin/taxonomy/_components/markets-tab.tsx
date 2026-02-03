"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";

import { cn, generateId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MARKETS } from "@/data/markets";

import { useToast } from "./use-toast";

import type { Market } from "@/types";

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
// MarketsTab
// =============================================================================

export function MarketsTab(): React.JSX.Element {
  const [markets, setMarkets] = useState<Market[]>([...MARKETS]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "", parent_id: "" });
  const { show, Toast } = useToast();

  const resetForm = (): void => {
    setForm({ name: "", code: "", parent_id: "" });
    setIsFormVisible(false);
    setEditingId(null);
  };

  const handleSave = (): void => {
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

  const handleEdit = (market: Market): void => {
    setForm({
      name: market.name,
      code: market.code,
      parent_id: market.parent_id || "",
    });
    setEditingId(market.id);
    setIsFormVisible(true);
  };

  const handleDelete = (id: string): void => {
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
            setIsFormVisible(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Market
        </Button>
      </div>

      {isFormVisible && (
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
                        <span className="mr-1 text-muted-foreground">{"\u2514"}</span>
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
