"use client";

import { useState, useCallback } from "react";

interface UseToastReturn {
  show: (msg: string) => void;
  Toast: React.JSX.Element | null;
}

export function useToast(): UseToastReturn {
  const [message, setMessage] = useState<string | null>(null);

  const show = useCallback((msg: string): void => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const Toast: React.JSX.Element | null = message ? (
    <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 shadow-lg">
      {message}
    </div>
  ) : null;

  return { show, Toast };
}
