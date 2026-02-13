"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useContextDocumentById,
  useDeleteContextDocument,
} from "@/hooks/use-context-documents";
import { useGlobalToast } from "@/hooks/use-global-toast";

import { BackToLibraryLink } from "../_components/back-to-library-link";
import { DocumentHeader } from "../_components/document-header";
import { DocumentContent } from "../_components/document-content";
import { DocumentSidebar } from "../_components/document-sidebar";

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function ContextDocumentDetailPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: document, isLoading } = useContextDocumentById(id);
  const { deleteContextDocument } = useDeleteContextDocument();
  const { showToast } = useGlobalToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="space-y-6">
        <BackToLibraryLink />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-1 text-lg font-semibold text-foreground">
            Document not found
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            The document with ID &quot;{id}&quot; could not be found.
          </p>
          <Link href="/context-library">
            <Button variant="outline">Return to library</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleDelete = (): void => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async (): Promise<void> => {
    setIsDeleting(true);
    try {
      await deleteContextDocument(id);
      showToast("Document deleted", "success");
      router.push("/context-library");
    } catch (error) {
      console.error("Failed to delete context document:", error);
      showToast("Failed to delete document", "error");
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <BackToLibraryLink />

      <DocumentHeader document={document} onDelete={handleDelete} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DocumentContent document={document} />
        <DocumentSidebar document={document} />
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Document"
        description={`Are you sure you want to delete "${document.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
