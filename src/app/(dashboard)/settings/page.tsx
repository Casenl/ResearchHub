"use client";

import { AppearanceSettings } from "./_components/appearance-settings";
import { NotificationSettings } from "./_components/notification-settings";

export default function SettingsPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Customize your portal experience.
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Appearance
        </h2>
        <AppearanceSettings />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Notifications
        </h2>
        <NotificationSettings />
      </div>
    </div>
  );
}
