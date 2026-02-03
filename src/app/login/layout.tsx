export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login page gets a plain layout — no sidebar, no header
  return <>{children}</>;
}
