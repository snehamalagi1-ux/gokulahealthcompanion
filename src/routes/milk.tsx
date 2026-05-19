import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/gokula/AppShell";
import { useStore, todayIso } from "@/lib/gokula-store";
import { Droplet } from "lucide-react";

export const Route = createFileRoute("/milk")({ component: MilkPage });

function MilkPage() {
  const { store } = useStore();
  const today = todayIso();

  const totalToday = store.milk
    .filter((m) => m.date === today)
    .reduce((s, m) => s + m.morning + m.evening, 0);

  const byCow = store.cattle.map((c) => {
    const t = store.milk.find((m) => m.cattleId === c.id && m.date === today);
    return { cow: c, entry: t };
  });

  return (
    <AppShell title="Milk Diary">
      <section className="rounded-2xl p-5 mb-5 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm">
        <div className="flex items-center gap-2 text-xs opacity-80"><Droplet className="size-4" /> TODAY'S TOTAL</div>
        <div className="text-4xl font-semibold mt-1 tabular-nums">{totalToday.toFixed(1)} <span className="text-lg opacity-80">L</span></div>
        <div className="text-xs opacity-80 mt-1">{today}</div>
      </section>

      <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Log per cow</h2>
      {byCow.length === 0 ? (
        <p className="text-sm text-muted-foreground">No cattle yet. <Link to="/add-cattle" className="text-primary font-medium">Add one →</Link></p>
      ) : (
        <ul className="space-y-2">
          {byCow.map(({ cow, entry }) => (
            <li key={cow.id}>
              <Link
                to="/cattle/$id"
                params={{ id: cow.id }}
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
              >
                <div className="size-10 rounded-lg bg-secondary grid place-items-center font-semibold">
                  {cow.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{cow.name}</div>
                  <div className="text-xs text-muted-foreground">#{cow.earTag}</div>
                </div>
                <div className="text-right">
                  {entry ? (
                    <>
                      <div className="text-sm font-semibold tabular-nums">{(entry.morning + entry.evening).toFixed(1)} L</div>
                      <div className="text-[10px] text-muted-foreground">{entry.morning} AM · {entry.evening} PM</div>
                    </>
                  ) : (
                    <span className="text-xs text-accent font-medium">Tap to log</span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}