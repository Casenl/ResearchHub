"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// LocalStorage keys
// ---------------------------------------------------------------------------

const EMAIL_NOTIFICATIONS_KEY = "itq-email-notifications";
const INAPP_NOTIFICATIONS_KEY = "itq-inapp-notifications";

// ---------------------------------------------------------------------------
// Toggle component
// ---------------------------------------------------------------------------

function Toggle({
  isEnabled,
  onToggle,
  label,
  description,
}: {
  isEnabled: boolean;
  onToggle: () => void;
  label: string;
  description: string;
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isEnabled ? "bg-primary" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
            isEnabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NotificationSettings(): React.JSX.Element {
  const [isEmailEnabled, setIsEmailEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem(EMAIL_NOTIFICATIONS_KEY);
    return stored !== null ? stored === "true" : true;
  });
  const [isInAppEnabled, setIsInAppEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem(INAPP_NOTIFICATIONS_KEY);
    return stored !== null ? stored === "true" : true;
  });

  const toggleEmail = () => {
    const newValue = !isEmailEnabled;
    setIsEmailEnabled(newValue);
    localStorage.setItem(EMAIL_NOTIFICATIONS_KEY, String(newValue));
  };

  const toggleInApp = () => {
    const newValue = !isInAppEnabled;
    setIsInAppEnabled(newValue);
    localStorage.setItem(INAPP_NOTIFICATIONS_KEY, String(newValue));
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <Toggle
          isEnabled={isEmailEnabled}
          onToggle={toggleEmail}
          label="Email Notifications"
          description="Receive email updates about research status changes and assignments."
        />
        <Toggle
          isEnabled={isInAppEnabled}
          onToggle={toggleInApp}
          label="In-App Notifications"
          description="Show notification badges and alerts within the portal."
        />
      </CardContent>
    </Card>
  );
}
