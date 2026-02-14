"use client";

import React, { useState, useCallback } from "react";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useLegislation,
  useCreateLegislation,
  useUpdateLegislation,
  useDeleteLegislation,
} from "@/hooks/use-legislation";
import { useMarkets, useSectors } from "@/hooks/use-taxonomy";
import { useAuth } from "@/hooks/use-auth";

import { LegislationTable } from "./_components/legislation-table";
import {
  LegislationForm,
  type LegislationFormData,
} from "./_components/legislation-form";

import type { Legislation } from "@/types";

// =============================================================================
// Toast (local lightweight)
// =============================================================================

function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const show = useCallback((msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const ToastNode: React.ReactNode = message ? (
    <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 shadow-lg dark:border-green-800 dark:bg-green-950 dark:text-green-200">
      {message}
    </div>
  ) : null;

  return { show, ToastNode };
}

// =============================================================================
// Main Page
// =============================================================================

export default function LegislationPage(): React.JSX.Element {
  const { user } = useAuth();
  const { data: legislation, isLoading } = useLegislation();
  const { data: markets } = useMarkets();
  const { data: sectors } = useSectors();
  const { createLegislation } = useCreateLegislation();
  const { updateLegislation } = useUpdateLegislation();
  const { deleteLegislation, isDeleting } = useDeleteLegislation();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Legislation | null>(null);
  const [deletingItem, setDeletingItem] = useState<Legislation | null>(null);
  const { show, ToastNode } = useToast();

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleSave = async (data: LegislationFormData) => {
    try {
      if (editingItem) {
        await updateLegislation(editingItem.id, data);
        show(`"${data.name}" updated`);
      } else {
        await createLegislation({
          ...data,
          created_by: user?.uid ?? "",
        });
        show(`"${data.name}" created`);
      }
      setIsFormVisible(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Error saving legislation:", err);
    }
  };

  const handleEdit = (item: Legislation) => {
    setEditingItem(item);
    setIsFormVisible(true);
  };

  const handleDelete = (item: Legislation) => {
    setDeletingItem(item);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteLegislation(deletingItem.id);
      show(`"${deletingItem.name}" deleted`);
      setDeletingItem(null);
    } catch (err) {
      console.error("Error deleting legislation:", err);
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsFormVisible(true);
  };

  const handleCancelForm = () => {
    setIsFormVisible(false);
    setEditingItem(null);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Legislation Registry
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage legislation and regulations by market and sector
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          Add Legislation
        </Button>
      </div>

      {/* Loading */}
      {isLoading && legislation.length === 0 && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Form */}
      {isFormVisible && (
        <LegislationForm
          initial={editingItem}
          markets={markets}
          sectors={sectors}
          onSave={handleSave}
          onCancel={handleCancelForm}
        />
      )}

      {/* Table */}
      <LegislationTable
        items={legislation}
        markets={markets}
        sectors={sectors}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deletingItem !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingItem(null);
        }}
        title="Delete Legislation"
        description={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />

      {ToastNode}
    </div>
  );
}
