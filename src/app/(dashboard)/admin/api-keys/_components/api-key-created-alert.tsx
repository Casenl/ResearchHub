"use client";

import React, { useState } from "react";

import { Copy, Check, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

// =============================================================================
// Alert shown once after a key is created, displaying the plaintext key
// =============================================================================

interface ApiKeyCreatedAlertProps {
  plaintextKey: string;
  onDismiss: () => void;
}

export function ApiKeyCreatedAlert({
  plaintextKey,
  onDismiss,
}: ApiKeyCreatedAlertProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(plaintextKey);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      console.error("Failed to copy key to clipboard");
    }
  };

  return (
    <div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-5 dark:border-amber-500 dark:bg-amber-950/30">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-200">
              API Key Created
            </p>
            <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
              Copy this key now. It will not be shown again.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-md border border-amber-300 bg-white px-3 py-2 font-mono text-sm text-amber-900 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-100">
              {plaintextKey}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <Button variant="secondary" size="sm" onClick={onDismiss}>
            I have saved the key
          </Button>
        </div>
      </div>
    </div>
  );
}
