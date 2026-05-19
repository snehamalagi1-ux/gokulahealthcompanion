import { useEffect, useState, useCallback } from "react";

export type Cattle = {
  id: string;
  earTag: string;
  name: string;
  breed?: string;
  dob?: string; // ISO date
  photo?: string; // data URL
  createdAt: string;
};

export type MilkEntry = {
  id: string;
  cattleId: string;
  date: string; // YYYY-MM-DD
  morning: number; // liters
  evening: number;
};

export type Vaccination = {
  id: string;
  cattleId: string;
  name: string; // e.g. FMD, Brucellosis
  dueDate: string; // YYYY-MM-DD
  givenDate?: string;
  notes?: string;
};

type Store = {
  cattle: Cattle[];
  milk: MilkEntry[];
  vaccinations: Vaccination[];
};

const KEY = "gokula-health:v1";
const empty: Store = { cattle: [], milk: [], vaccinations: [] };

function read(): Store {
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    return { ...empty, ...JSON.parse(raw) };
  } catch {
    return empty;
  }
}

function write(s: Store) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent("gokula-store-change"));
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function useStore() {
  const [store, setStore] = useState<Store>(() => read());

  useEffect(() => {
    const onChange = () => setStore(read());
    window.addEventListener("gokula-store-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("gokula-store-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const update = useCallback((fn: (s: Store) => Store) => {
    const next = fn(read());
    write(next);
    setStore(next);
  }, []);

  return { store, update };
}

// Helpers
export function monthlyAverage(entries: MilkEntry[], cattleId: string, monthIso?: string) {
  const month = (monthIso ?? new Date().toISOString()).slice(0, 7);
  const rows = entries.filter((e) => e.cattleId === cattleId && e.date.startsWith(month));
  if (rows.length === 0) return 0;
  const total = rows.reduce((s, r) => s + (r.morning || 0) + (r.evening || 0), 0);
  return total / rows.length;
}

export function last30Days(entries: MilkEntry[], cattleId: string) {
  const today = new Date();
  const out: { date: string; total: number; label: string }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const e = entries.find((x) => x.cattleId === cattleId && x.date === key);
    out.push({
      date: key,
      total: e ? (e.morning || 0) + (e.evening || 0) : 0,
      label: `${d.getDate()}/${d.getMonth() + 1}`,
    });
  }
  return out;
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function daysUntil(dateIso: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateIso);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}