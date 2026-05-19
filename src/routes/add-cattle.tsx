import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/gokula/AppShell";
import { useStore, uid } from "@/lib/gokula-store";
import { useState, useRef } from "react";
import { ArrowLeft, Camera } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/add-cattle")({ component: AddCattle });

function AddCattle() {
  const { update } = useStore();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [earTag, setEarTag] = useState("");
  const [breed, setBreed] = useState("");
  const [dob, setDob] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(f);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !earTag.trim()) {
      toast.error("Name and ear tag are required");
      return;
    }
    const id = uid();
    update((s) => ({
      ...s,
      cattle: [
        ...s.cattle,
        {
          id,
          name: name.trim(),
          earTag: earTag.trim(),
          breed: breed.trim() || undefined,
          dob: dob || undefined,
          photo,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
    toast.success(`${name} registered`);
    nav({ to: "/cattle/$id", params: { id } });
  }

  return (
    <AppShell
      title="Add Cattle"
      action={
        <Link to="/" className="text-sm text-muted-foreground inline-flex items-center gap-1">
          <ArrowLeft className="size-4" /> Back
        </Link>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mx-auto block size-32 rounded-2xl border-2 border-dashed border-border bg-card grid place-items-center overflow-hidden"
        >
          {photo ? (
            <img src={photo} alt="cow" className="size-full object-cover" />
          ) : (
            <div className="text-muted-foreground flex flex-col items-center gap-1">
              <Camera className="size-6" />
              <span className="text-xs">Add photo</span>
            </div>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={onPhoto} />

        <Field label="Name *" value={name} onChange={setName} placeholder="Lakshmi" />
        <Field label="Ear Tag ID *" value={earTag} onChange={setEarTag} placeholder="IN-2025-001" />
        <Field label="Breed" value={breed} onChange={setBreed} placeholder="Gir, Sahiwal, HF…" />
        <Field label="Date of Birth" value={dob} onChange={setDob} type="date" />

        <button
          type="submit"
          className="w-full rounded-xl bg-primary text-primary-foreground font-medium py-3 active:scale-[0.99] transition-transform"
        >
          Register cattle
        </button>
      </form>
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
    </label>
  );
}