# 🐄 Gokula-Health

> A digital health card for cattle — helping small-scale dairy farmers track heat cycles, vaccinations, and milk yield so they never miss an income opportunity.

Built with **GenAI-assisted development** on [Lovable](https://lovable.dev).

🔗 **Live demo:** https://gokulahealthcompanion.lovable.app

---

## 🌾 Problem

Small-scale dairy farmers often lose income because they:
- Miss the **heat cycle** of their cattle (lost breeding window)
- Forget **vaccination dates** (preventable disease outbreaks)
- Track livestock health **orally**, with no historical record

Gokula-Health turns every farmer's phone into a precision animal-husbandry tool.

---

## ✨ Features

- 🐮 **Cattle Profiles** — Register each animal with an Ear Tag ID, photo, and breed
- 🥛 **Daily Milk Diary** — Log morning & evening yield; monthly average is auto-calculated
- 💉 **Vaccination Reminders** — FMD, Brucellosis, HS, BQ, Deworming and more, with overdue alerts
- 📈 **Yield Trends** — 30-day milk production charts to spot drops early
- 📴 **Works Offline** — All data stored locally on-device (no login, no internet required)
- 📱 **Mobile-first UI** — Big icons (Cow, Milk, Syringe) designed for low-literacy users

---

## 🛠️ Tech Stack

> **Note:** This is a **mobile-friendly Progressive Web App (PWA)**, not a native Android app.
> Native Android equivalents are substituted with web standards:

| Native Android        | Web Equivalent (Used Here)     |
|-----------------------|--------------------------------|
| Room DB               | `localStorage` / IndexedDB     |
| AlarmManager          | In-app overdue badges          |
| MPAndroidChart        | Recharts                       |
| Jetpack Compose       | React + Tailwind CSS           |

**Stack:**
- ⚛️ React 19 + TypeScript
- 🚦 TanStack Router (file-based routing)
- ⚡ Vite 7
- 🎨 Tailwind CSS v4
- 📊 Recharts
- 🎯 Lucide Icons
- 💾 Browser localStorage (offline-first)

---

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh) (or Node.js 20+)

### Install & run

```bash
# Install dependencies
bun install

# Start the dev server
bun run dev
```

Open http://localhost:5173 in your browser.

### Build for production

```bash
bun run build
```

---

## 📂 Project Structure

```
src/
├── components/gokula/   # Shared layout (AppShell)
├── lib/
│   └── gokula-store.ts  # localStorage data layer + yield calculations
├── routes/
│   ├── index.tsx        # Dashboard (herd + alerts)
│   ├── add-cattle.tsx   # Register new cattle
│   ├── cattle.$id.tsx   # Individual cattle profile + chart
│   ├── milk.tsx         # Herd-wide milk log
│   └── vaccinations.tsx # All vaccinations across the herd
└── styles.css           # Earthy agricultural design system
```

---

## 🧠 Data Model

```typescript
type Cattle      = { id; earTag; name; photo?; breed?; ... }
type MilkEntry   = { id; cattleId; date; morning; evening }
type Vaccination = { id; cattleId; name; dueDate; givenDate? }
```

All data persists in the browser via `localStorage` — no backend required for v1.

---

## ✅ Success Criteria Met

- ✅ Monthly average yield calculated automatically
- ✅ Reminders work without internet (offline-first)
- ✅ Intuitive icon-driven UI for farmers (🐄 🥛 💉)

---

## 🌍 Impact

- **White Revolution 2.0** — Data-driven dairy productivity
- **Farmer Income** — 100% vaccination coverage = fewer losses
- **Rural Digitization** — Precision tech for animal husbandry

---

## 🗺️ Roadmap

- [ ] Multi-language (Hindi, Kannada)
- [ ] Cloud sync (Lovable Cloud) for multi-device backup
- [ ] Heat cycle prediction reminders
- [ ] SMS reminder fallback
- [ ] Veterinarian directory

---

## 📄 License

MIT — Free to use, modify, and distribute for the betterment of dairy farmers everywhere.
