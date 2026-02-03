"use client";

import { useState, useCallback } from "react";

import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

// =============================================================================
// Component
// =============================================================================

export function CopyablePrompt({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.JSX.Element {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [value]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            isCopied
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          {isCopied ? (
            <>
              <Check className="h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <textarea
        readOnly
        value={value}
        rows={5}
        className="flex w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 font-mono leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
    </div>
  );
}
