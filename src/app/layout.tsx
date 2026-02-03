import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ITQ Market Intelligence Portal",
  description:
    "Research library and market intelligence hub for ITQ consulting services",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans">
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex h-14 max-w-7xl items-center px-6">
            <a href="/" className="flex items-center gap-2 font-semibold text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
              </svg>
              ITQ Market Intelligence
            </a>
            <nav className="ml-8 flex items-center gap-6 text-sm">
              <a
                href="/"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </a>
              <a
                href="/research"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Research Library
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
