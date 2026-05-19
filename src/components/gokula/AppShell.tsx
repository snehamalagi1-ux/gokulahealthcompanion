import { Link, useLocation } from "@tanstack/react-router";
import { Home, Milk, Syringe, Plus } from "lucide-react";
import type { ReactNode } from "react";

export function AppShell({ children, title, action }: { children: ReactNode; title?: string; action?: ReactNode }) {
  const loc = useLocation();
  const tabs = [
    { to: "/", label: "Herd", icon: Home },
    { to: "/milk", label: "Milk", icon: Milk },
    { to: "/vaccinations", label: "Vaccines", icon: Syringe },
  ] as const;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto max-w-xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-primary text-primary-foreground grid place-items-center text-lg font-bold shadow-sm">
              ग
            </div>
            <div className="leading-tight">
              <div className="text-base font-semibold tracking-tight">Gokula-Health</div>
              <div className="text-[11px] text-muted-foreground">{title ?? "Digital Cattle Card"}</div>
            </div>
          </Link>
          {action}
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-xl px-4 pt-4 pb-28">{children}</main>

      <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-xl px-2 py-2 grid grid-cols-3 gap-1">
          {tabs.map(({ to, label, icon: Icon }) => {
            const active = loc.pathname === to || (to !== "/" && loc.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center justify-center py-2 rounded-lg text-xs transition-colors ${
                  active ? "text-primary font-medium bg-secondary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-5 mb-0.5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function FAB({ to }: { to: string }) {
  return (
    <Link
      to={to}
      className="fixed bottom-24 right-5 z-40 size-14 rounded-full bg-accent text-accent-foreground shadow-lg grid place-items-center hover:scale-105 active:scale-95 transition-transform"
      aria-label="Add"
    >
      <Plus className="size-6" />
    </Link>
  );
}