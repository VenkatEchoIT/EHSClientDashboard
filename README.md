# Operations Dashboard

A production-quality Operations Dashboard UI for a medical coding/workflow platform, built with React, TypeScript, Vite, Tailwind CSS, Recharts and lucide-react.

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  components/operations/   # All dashboard UI building blocks
  pages/Operations.tsx      # Assembles the dashboard page
  data/operationsData.ts    # Static mock data (swap for API data later)
  types/operations.ts       # Shared TypeScript types
```

## Notes

- All data lives in `src/data/operationsData.ts` so it can be replaced with real API calls without touching any component.
- Date filters, the sub-project dropdown, Operations/Quality tabs, refresh, and export all have working mock interactions.
- Layout is responsive: KPI cards and the pipeline row scroll horizontally on small screens, two-column sections stack to one column, and the team table scrolls horizontally rather than breaking.
