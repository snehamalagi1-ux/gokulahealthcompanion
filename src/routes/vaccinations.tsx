import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/gokula/AppShell";
import { useStore, daysUntil, todayIso } from "@/lib/gokula-store";
import { Syringe, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/vaccinations")({ component: VacPage });

function VacPage() {
  const { store, update } = useStore();

  const pending = store.vaccinations
    .filter((v) => !v.givenDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const done = store.vaccinations
    .filter((v) => v.givenDate)
    .sort((a, b) => (b.givenDate ?? "").localeCompare(a.givenDate ?? ""))
    .slice(0, 20);

  function markDone(id: string) {
    update((s) => ({
      ...s,
      vaccinations: s.vaccinations.map((v) => (v.id === id ? { ...v, givenDate: todayIso() } : v)),
    }));
  }

  return (
    <AppShell title="Vaccination Schedule">
      <section className="mb-6">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Upcoming</h2>
        {pending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center bg-card">
            <CheckCircle2 className="size-8 mx-auto text-primary mb-2" />
            <div className="text-sm">All caught up. No pending vaccinations.</div>
          </div>
        ) : (
          <ul className="space-y-2">
            {pending.map((v) => {
              const cow = store.cattle.find((c) => c.id === v.cattleId);
              const days = daysUntil(v.dueDate);
              const overdue = days < 0;
              const soon = days >= 0 && days <= 7;
              return (
                <li
                  key={v.id}
                  className={`flex items-center gap-3 p-3 rounded-xl bg-card border ${
                    overdue ? "border-destructive/40" : soon ? "border-accent/40" : "border-border"
                  }`}
                >
                  <div
                    className={`size-10 rounded-lg grid place-items-center ${
                      overdue ? "bg-destructive/15 text-destructive" : soon ? "bg-accent/15 text-accent" : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <Syringe className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{v.name}</div>
                    <Link to="/cattle/$id" params={{ id: v.cattleId }} className="text-xs text-muted-foreground truncate">
                      {cow?.name ?? "Unknown"} · #{cow?.earTag} · {v.dueDate}
                    </Link>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs font-medium ${overdue ? "text-destructive" : soon ? "text-accent" : "text-muted-foreground"}`}>
                      {overdue ? `${Math.abs(days)}d late` : days === 0 ? "Today" : `in ${days}d`}
                    </span>
                    <button
                      onClick={() => markDone(v.id)}
                      className="text-[11px] px-2 py-1 rounded-md bg-primary text-primary-foreground"
                    >
                      Mark given
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {done.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">History</h2>
          <ul className="space-y-2">
            {done.map((v) => {
              const cow = store.cattle.find((c) => c.id === v.cattleId);
              return (
                <li key={v.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                  <CheckCircle2 className="size-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{v.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {cow?.name ?? "—"} · given {v.givenDate}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </AppShell>
  );
}