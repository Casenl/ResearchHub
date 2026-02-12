"use client";

import { useState } from "react";
import { Copy, Edit, FileDown, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useResearchTransition } from "@/hooks/use-research-transition";
import { getAvailableActions } from "@/lib/research-workflow";
import { RESEARCH_STATUS_LABELS } from "@/lib/constants";

import type { Research } from "@/types";
import type { TransitionAction } from "@/lib/research-workflow";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ResearchHeaderActionsProps {
  research: Research;
}

export function ResearchHeaderActions({ research }: ResearchHeaderActionsProps): React.JSX.Element {
  const { user, role } = useAuth();
  const { isTransitioning, handleTransition } = useResearchTransition();
  const { show: showToast, ToastNode } = useToast();
  const [confirmAction, setConfirmAction] = useState<TransitionAction | null>(null);

  const isAuthor = user?.uid === research.author_id;
  const actions = getAvailableActions(research.status, role, isAuthor);

  const handleAction = async (action: TransitionAction) => {
    if (action.requiresConfirm) {
      setConfirmAction(action);
      return;
    }
    await executeTransition(action);
  };

  const executeTransition = async (action: TransitionAction) => {
    const isSuccess = await handleTransition(
      research.id,
      action.from,
      action.to,
      research.title
    );
    setConfirmAction(null);
    if (isSuccess) {
      showToast(
        `Status changed to ${RESEARCH_STATUS_LABELS[action.to]}`,
        "success"
      );
    } else {
      showToast("Failed to update status", "error");
    }
  };

  return (
    <>
      <div className="flex shrink-0 gap-2">
        {/* Workflow action buttons */}
        {actions.map((action) => (
          <Button
            key={`${action.from}-${action.to}`}
            variant={action.variant === "destructive" ? "destructive" : action.variant === "outline" ? "outline" : "default"}
            size="sm"
            disabled={isTransitioning}
            onClick={() => handleAction(action)}
          >
            {isTransitioning && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            {action.label}
          </Button>
        ))}

        {/* Static actions */}
        <Button variant="outline" size="sm">
          <Edit className="mr-1 h-4 w-4" />
          Edit
        </Button>
        <Button variant="outline" size="sm">
          <FileDown className="mr-1 h-4 w-4" />
          Export PDF
        </Button>
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-1 h-4 w-4" />
          Start Refresh
        </Button>
        <Button variant="outline" size="sm">
          <Copy className="mr-1 h-4 w-4" />
          Clone
        </Button>
      </div>

      {/* Confirm dialog for destructive transitions */}
      {confirmAction && (
        <ConfirmDialog
          isOpen={!!confirmAction}
          onOpenChange={(open) => {
            if (!open) setConfirmAction(null);
          }}
          title={`${confirmAction.label}?`}
          description={`Are you sure you want to ${confirmAction.label.toLowerCase()} "${research.title}"? This action changes the status from ${RESEARCH_STATUS_LABELS[confirmAction.from]} to ${RESEARCH_STATUS_LABELS[confirmAction.to]}.`}
          confirmLabel={confirmAction.label}
          variant={confirmAction.variant === "destructive" ? "destructive" : "default"}
          isLoading={isTransitioning}
          onConfirm={() => executeTransition(confirmAction)}
        />
      )}

      {ToastNode}
    </>
  );
}
