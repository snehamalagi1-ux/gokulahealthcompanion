import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, FAB } from "@/components/gokula/AppShell";
import { useStore, monthlyAverage, daysUntil } from "@/lib/gokula-store";
import { Beef, Droplet, Syringe, ChevronRight, Calendar } from "lucide-react";

export const Route = createFileRoute("/")({ component: Herd });

function Herd() {
  const { store } = useStore();
  const { cattle, milk, vaccinations } = store;

  const upcoming = vaccinations
    .filter((v) => !v.givenDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);

  return (
    <AppShell title="Your Herd">
      <section className="mb-5">
        <div className="grid grid-cols-3 gap-2">
          <Stat icon={<Beef className="size-4" />} label="Cattle" value={cattle.length} />
          <Stat
            icon={<Droplet className="size-4 text-[color:var(--milk)]" />}
            label="Logs"
            value={milk.length}
          />
          <Stat
            icon={<Syringe className="size-4 text-accent" />}
            label="Due"
            value={upcoming.length}
          />
        </div>
      </section>

      {upcoming.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Upcoming reminders</h2>
          <div className="space-y-2">
            {upcoming.map((v) => {
              const cow = cattle.find((c) => c.id === v.cattleId);
              const days = daysUntil(v.dueDate);
              const overdue = days < 0;
              return (
                <Link
                  key={v.id}
                  to="/vaccinations"
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors"
                >
                  <div
                    className={`size-10 rounded-lg grid place-items-center ${
                      overdue ? "bg-destructive/15 text-destructive" : "bg-accent/15 text-accent"
                    }`}
                  >
                    <Syringe className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{v.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {cow?.name ?? "Unknown"} · #{cow?.earTag}
                    </div>
                  </div>
                  <div className={`text-xs font-medium ${overdue ? "text-destructive" : "text-foreground"}`}>
                    {overdue ? `${Math.abs(days)}d late` : days === 0 ? "Today" : `in ${days}d`}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground">Cattle</h2>
          <Link to="/add-cattle" className="text-xs text-primary font-medium">+ Add new</Link>
        </div>

        {cattle.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="space-y-2">
            {cattle.map((c) => {
              const avg = monthlyAverage(milk, c.id);
              return (
                <li key={c.id}>
                  <Link
                    to="/cattle/$id"
                    params={{ id: c.id }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors"
                  >
                    <Avatar photo={c.photo} name={c.name} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        Ear tag #{c.earTag}
                        {c.breed ? ` · ${c.breed}` : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold tabular-nums">{avg.toFixed(1)}L</div>
                      <div className="text-[10px] text-muted-foreground">avg/day</div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <FAB to="/add-cattle" />
    </AppShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl bg-card border border-border p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">{icon}<span className="text-[11px]">{label}</span></div>
      <div className="text-2xl font-semibold mt-1 tabular-nums">{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card">
      <div className="mx-auto size-14 rounded-full bg-secondary grid place-items-center mb-3">
        <Beef className="size-7 text-primary" />
      </div>
      <div className="font-semibold">Register your first cow</div>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        Add a photo, ear tag and breed to start tracking milk yield and vaccinations.
      </p>
      <Link
        to="/add-cattle"
        className="inline-flex items-center gap-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
      >
        <Calendar className="size-4" /> Add Cattle
      </Link>
    </div>
  );
}

export function Avatar({ photo, name, size = 48 }: { photo?: string; name: string; size?: number }) {
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className="rounded-xl object-cover border border-border"
        style={{ width: size, height: size }}
      />
    );
  }
  const initial = name.trim().charAt(0).toUpperCase() || "🐄";
  return (
    <div
      className="rounded-xl bg-secondary text-secondary-foreground grid place-items-center font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initial}
    </div>
  );
}