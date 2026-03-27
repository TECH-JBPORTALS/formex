export default function Header({ children }: { children: React.ReactNode }) {
  return (
    <header className="flex h-14 bg-sidebar text-sidebar-foreground shrink-0 sticky inset-0 top-0 items-center gap-2 border-b px-4">
      {children}
    </header>
  );
}
