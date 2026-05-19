import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/gokula/AppShell";
import { Avatar } from "./index";
import { useStore, monthlyAverage, last30Days, todayIso, uid, daysUntil } from "@/lib/gokula-store";
import { ArrowLeft, Droplet, Syringe, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/cattle/$id")({ component: CattleDetail });

function CattleDetail() {
  const { id } = Route.useParams();
  const { store, update } = useStore();
  const nav = useNavigate();
  const cow = store.cattle.find((c) => c.id === id);

  const data = useMemo(() => last30Days(store.milk, id), [store.milk, id]);
  const avg = monthlyAverage(store.milk, id);
  const recent7 = data.slice(-7).reduce((s, r) => s + r.total, 0) / 7;
  const prev7 = data.slice(-14, -7).reduce((s, r) => s + r.total, 0) / 7;
  const trend = recent7 - prev7;

  const today = todayIso();
  const todayEntry = store.milk.find((m) => m.cattleId === id && m.date === today);
  const [morning, setMorning] = useState<string>(todayEntry?.morning?.toString() ?? "");
  const [evening, setEvening] = useState<string>(todayEntry?.evening?.toString() ?? "");

  const vacs = store.vaccinations
    .filter((v) => v.cattleId === id)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const [vName, setVName] = useState("FMD");
  const [vDate, setVDate] = useState("");

  if (!cow) {
    return (
      <AppShell title="Not found">
        <p className="text-muted-foreground">This cattle was not found.</p>
        <Link to="/" className="text-primary text-sm">← Back to herd</Link>
      </AppShell>
    );
  }

  function saveMilk() {
    const m = parseFloat(morning) || 0;
    const e = parseFloat(evening) || 0;
    if (m === 0 && e === 0) {
      toast.error("Enter morning or evening yield");
      return;
    }
    update((s) => {
      const existing = s.milk.find((x) => x.cattleId === id && x.date === today);
      if (existing) {
        return {
          ...s,
          milk: s.milk.map((x) => (x.id === existing.id ? { ...x, morning: m, evening: e } : x)),
        };
      }
      return {
        ...s,
        milk: [...s.milk, { id: uid(), cattleId: id, date: today, morning: m, evening: e }],
      };
    });
    toast.success("Milk yield saved");
  }

  function addVac() {
    if (!vName.trim() || !vDate) {
      toast.error("Vaccine name and due date required");
      return;
    }
    update((s) => ({
      ...s,
      vaccinations: [
        ...s.vaccinations,
        { id: uid(), cattleId: id, name: vName.trim(), dueDate: vDate },
      ],
    }));
    setVName("FMD");
    setVDate("");
    toast.success("Reminder added");
  }

  function toggleGiven(vid: string) {
    update((s) => ({
      ...s,
      vaccinations: s.vaccinations.map((v) =>
        v.id === vid ? { ...v, givenDate: v.givenDate ? undefined : todayIso() } : v
      ),
    }));
  }

  function removeCattle() {
    if (!confirm(`Remove ${cow!.name} and all its records?`)) return;
    update((s) => ({
      cattle: s.cattle.filter((c) => c.id !== id),
      milk: s.milk.filter((m) => m.cattleId !== id),
      vaccinations: s.vaccinations.filter((v) => v.cattleId !== id),
    }));
    nav({ to: "/" });
  }

  return (
    <AppShell
      title={cow.name}
      action={
        <Link to="/" className="text-sm text-muted-foreground inline-flex items-center gap-1">
          <ArrowLeft className="size-4" /> Back
        </Link>
      }
    >
      <div className="flex items-center gap-3 mb-5">
        <Avatar photo={cow.photo} name={cow.name} size={64} />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold truncate">{cow.name}</h1>
          <p className="text-sm text-muted-foreground truncate">
            #{cow.earTag}
            {cow.breed ? ` · ${cow.breed}` : ""}
          </p>
        </div>
        <button
          onClick={removeCattle}
          className="size-10 rounded-lg grid place-items-center text-muted-foreground hover:text-destructive"
          aria-label="Remove"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <section className="grid grid-cols-2 gap-2 mb-5">
        <div className="rounded-xl bg-card border border-border p-3">
          <div className="text-[11px] text-muted-foreground">Monthly avg/day</div>
          <div className="text-2xl font-semibold tabular-nums">{avg.toFixed(1)}<span className="text-sm text-muted-foreground"> L</span></div>
        </div>
        <div className="rounded-xl bg-card border border-border p-3">
          <div className="text-[11px] text-muted-foreground">7-day trend</div>
          <div className={`text-2xl font-semibold tabular-nums flex items-center gap-1 ${trend < 0 ? "text-destructive" : "text-primary"}`}>
            {trend >= 0 ? <TrendingUp className="size-5" /> : <TrendingDown className="size-5" />}
            {trend >= 0 ? "+" : ""}{trend.toFixed(1)}<span className="text-sm text-muted-foreground"> L</span>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Last 30 days</h2>
        <div className="rounded-xl bg-card border border-border p-2 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="milkFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--milk)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--milk)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} interval={5} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                formatter={(v: number) => [`${v} L`, "Yield"]}
              />
              <Area type="monotone" dataKey="total" stroke="var(--milk)" strokeWidth={2} fill="url(#milkFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
          <Droplet className="size-3.5 text-[color:var(--milk)]" /> Today's milk
        </h2>
        <div className="rounded-xl bg-card border border-border p-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="Morning (L)" value={morning} onChange={setMorning} />
            <NumberField label="Evening (L)" value={evening} onChange={setEvening} />
          </div>
          <button
            onClick={saveMilk}
            className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-medium"
          >
            {todayEntry ? "Update today's yield" : "Save today's yield"}
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
          <Syringe className="size-3.5 text-accent" /> Vaccinations
        </h2>
        <div className="space-y-2 mb-3">
          {vacs.length === 0 && (
            <p className="text-sm text-muted-foreground">No reminders yet — add the first one below.</p>
          )}
          {vacs.map((v) => {
            const days = daysUntil(v.dueDate);
            return (
              <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <button
                  onClick={() => toggleGiven(v.id)}
                  className={`size-6 rounded-md border-2 grid place-items-center ${
                    v.givenDate ? "bg-primary border-primary text-primary-foreground" : "border-border"
                  }`}
                  aria-label="toggle"
                >
                  {v.givenDate && <span className="text-xs">✓</span>}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${v.givenDate ? "line-through text-muted-foreground" : ""}`}>{v.name}</div>
                  <div className="text-xs text-muted-foreground">Due {v.dueDate}</div>
                </div>
                {!v.givenDate && (
                  <span className={`text-xs font-medium ${days < 0 ? "text-destructive" : days <= 7 ? "text-accent" : "text-muted-foreground"}`}>
                    {days < 0 ? `${Math.abs(days)}d late` : days === 0 ? "Today" : `in ${days}d`}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-xl bg-card border border-border p-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Vaccine</span>
              <select
                value={vName}
                onChange={(e) => setVName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-card px-2 py-2.5 text-sm"
              >
                <option>FMD</option>
                <option>Brucellosis</option>
                <option>HS (Haemorrhagic Septicaemia)</option>
                <option>BQ (Black Quarter)</option>
                <option>Theileriosis</option>
                <option>Deworming</option>
                <option>Other</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Due date</span>
              <input
                type="date"
                value={vDate}
                onChange={(e) => setVDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-card px-2 py-2.5 text-sm"
              />
            </label>
          </div>
          <button
            onClick={addVac}
            className="w-full rounded-lg bg-accent text-accent-foreground py-2.5 text-sm font-medium"
          >
            Add reminder
          </button>
        </div>
      </section>
    </AppShell>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        step="0.1"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
    </label>
  );
}