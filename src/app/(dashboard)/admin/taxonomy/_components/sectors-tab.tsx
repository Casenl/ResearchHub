"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";

import { cn, generateId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SECTORS } from "@/data/sectors";

import { useToast } from "./use-toast";

import type { Sector } from "@/types";

// =============================================================================
// SectorsTab
// =============================================================================

export function SectorsTab(): React.JSX.Element {
  const [sectors, setSectors] = useState<Sector[]>([...SECTORS]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "", regulations: "" });
  const [regInput, setRegInput] = useState("");
  const [regTags, setRegTags] = useState<string[]>([]);
  const { show, Toast } = useToast();

  const resetForm = (): void => {
    setForm({ name: "", code: "", regulations: "" });
    setRegInput("");
    setRegTags([]);
    setIsFormVisible(false);
    setEditingId(null);
  };

  const addRegulation = (): void => {
    const trimmed = regInput.trim();
    if (trimmed && !regTags.includes(trimmed)) {
      setRegTags((prev) => [...prev, trimmed]);
      setRegInput("");
    }
  };

  const removeRegulation = (reg: string): void => {
    setRegTags((prev) => prev.filter((r) => r !== reg));
  };

  const handleSave = (): void => {
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

  const handleEdit = (sector: Sector): void => {
    setForm({
      name: sector.name,
      code: sector.code,
      regulations: "",
    });
    setRegTags([...sector.relevant_regulations]);
    setEditingId(sector.id);
    setIsFormVisible(true);
  };

  const handleDelete = (id: string): void => {
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
            setIsFormVisible(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Sector
        </Button>
      </div>

      {isFormVisible && (
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
