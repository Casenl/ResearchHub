import { Providers } from "./providers";
import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ITQ Market Intelligence Portal",
  description:
    "Research library and market intelligence hub for ITQ consulting services",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
