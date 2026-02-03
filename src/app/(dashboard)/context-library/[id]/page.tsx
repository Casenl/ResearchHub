"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  useContextDocumentById,
  useDeleteContextDocument,
} from "@/hooks/use-context-documents";

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

  const handleDelete = async (): Promise<void> => {
    if (
      window.confirm(
        `Are you sure you want to delete "${document.title}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteContextDocument(id);
        router.push("/context-library");
      } catch (error) {
        console.error("Failed to delete context document:", error);
      }
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
    </div>
  );
}
