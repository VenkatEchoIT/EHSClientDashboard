# Operations & Quality Performance Dashboard

A responsive dashboard application for monitoring **Operations** and
**Quality Performance** metrics.

The project is built with **React, TypeScript, Vite, Tailwind CSS,
Recharts, and Lucide React**.

## Features

The application has one main dashboard page with two tabs:

-   **Operations** --- KPIs, chart pipeline, daily throughput,
    turnaround time, chart aging, workload by priority, team workload,
    reassignment rate, and operational insights.
-   **Quality Performance** --- quality KPIs, trends, specialty
    performance, rejection reasons, top performers, audit performance,
    audit throughput, accuracy analysis, and quality insights.

The selected tab and date filter are managed from the main
`Operations.tsx` page.

## Getting Started

Install dependencies:

``` bash
npm install
```

Start the development server:

``` bash
npm run dev
```

Open the local URL shown by Vite in the terminal.

## Available Commands

``` bash
npm run dev
npm run build
npm run lint
npm run preview
```

-   `npm run dev` --- starts the development server.
-   `npm run build` --- runs TypeScript checks and creates a production
    build.
-   `npm run lint` --- runs Oxlint.
-   `npm run preview` --- previews the production build locally.

## Project Structure

``` text
src/
├── assets/
│
├── components/
│   ├── operations/
│   │   ├── KPICard.tsx
│   │   ├── KPIGrid.tsx
│   │   ├── PipelineCard.tsx
│   │   ├── ChartPipeline.tsx
│   │   ├── DailyThroughput.tsx
│   │   ├── TurnaroundTime.tsx
│   │   ├── ChartAging.tsx
│   │   ├── WorkloadByPriority.tsx
│   │   ├── WorkloadByTeam.tsx
│   │   ├── ReassignmentRate.tsx
│   │   ├── OperationalInsights.tsx
│   │   └── ...
│   │
│   └── quality/
│       ├── QualityPerformance.tsx
│       ├── QualityKPIGrid.tsx
│       ├── QualityKPICard.tsx
│       ├── QualityTrendVsTarget.tsx
│       ├── QualityBySpecialty.tsx
│       ├── RejectionReasons.tsx
│       ├── TopPerformers.tsx
│       ├── AuditPerformance.tsx
│       ├── AuditThroughput.tsx
│       ├── QualityInsights.tsx
│       └── ...
│
├── context/
│   └── QualityPerformanceContext.tsx
│
├── data/
│   └── dashboardData.ts
│
├── pages/
│   └── Operations.tsx
│
├── services/
│   ├── operationsService.ts
│   └── qualityPerformanceService.ts
│
├── types/
│   ├── operations.ts
│   └── qualityPerformance.ts
│
├── App.tsx
├── index.css
└── main.tsx
```

## How the Project Works

The application has **one page**: `src/pages/Operations.tsx`.

`App.tsx` renders this page:

``` text
main.tsx
   ↓
App.tsx
   ↓
Operations.tsx
```

`Operations.tsx` contains two dashboard tabs:

``` text
Operations.tsx
├── Operations tab
└── Quality tab
```

When the **Operations** tab is selected, Operations components are
displayed.

When the **Quality** tab is selected, `QualityPerformance.tsx` is
displayed.

Because Quality Performance is a tab inside the same page, it is kept
under `components/quality/` instead of creating a separate page in
`pages/`.

## Data Layer

### `src/data/dashboardData.ts`

This file contains the application's mock/seed dashboard data.

It is the current data source while the project does not have a backend
API.

Keeping the data separate from UI components makes it easier to replace
mock data with backend data later.

## Service Layer

### `operationsService.ts`

Operations components use the Operations service to access dashboard
data.

The basic flow is:

``` text
dashboardData.ts
       ↓
operationsService.ts
       ↓
Operations components
```

Operations data is mainly lookup/display data, so Operations components
can call the required service functions directly.

### `qualityPerformanceService.ts`

The Quality service handles Quality Performance data and related data
operations.

The Quality side has more state and calculations than Operations, so it
also works with `QualityPerformanceContext`.

## Quality Context

### `QualityPerformanceContext.tsx`

Quality Performance needs shared data across many sibling components.

It also needs derived calculations such as quality KPIs, pass/rework
metrics, specialty performance, top performers, and other Quality
insights.

The context keeps this shared state and calculated data in one place:

``` text
dashboardData.ts
       ↓
qualityPerformanceService.ts
       ↓
QualityPerformanceContext.tsx
       ↓
Quality components
```

Operations does **not** currently need an `OperationsContext` because
its data does not require the same shared derived state or
cross-component CRUD behavior.

## Components

### `components/operations/`

Contains UI components used by the Operations tab.

Examples include KPI cards, pipeline cards, throughput charts, workload
sections, turnaround metrics, and operational insights.

### `components/quality/`

Contains UI components used by the Quality Performance tab.

`QualityPerformance.tsx` acts as the main container for the Quality tab
and combines the smaller Quality components into the complete Quality
dashboard.

## Types

### `types/operations.ts`

Contains TypeScript types used by Operations data and components.

### `types/qualityPerformance.ts`

Contains TypeScript types used by Quality Performance data and
components.

These types provide compile-time checking and help keep component and
service data structures consistent.

The project currently uses TypeScript types/interfaces and does **not**
use Zod for runtime schema validation.

## Styling

Global styles are defined in:

``` text
src/index.css
```

The UI uses Tailwind CSS utility classes together with shared CSS
variables for colors and styling.

The dashboard is responsive across mobile, tablet, and desktop layouts.

## Main Data Flow

Operations:

``` text
dashboardData.ts
       ↓
operationsService.ts
       ↓
Operations components
       ↓
Operations.tsx
```

Quality Performance:

``` text
dashboardData.ts
       ↓
qualityPerformanceService.ts
       ↓
QualityPerformanceContext.tsx
       ↓
Quality components
       ↓
QualityPerformance.tsx
       ↓
Operations.tsx
```

## Tech Stack

-   React 19
-   TypeScript
-   Vite
-   Tailwind CSS
-   Recharts
-   Lucide React
-   Oxlint

## Future Backend Integration

The current project uses mock/seed data from `dashboardData.ts`.

When a backend API is available, the service layer can be updated to
fetch API data while keeping most UI components unchanged:

``` text
Current:
dashboardData.ts → services → UI

Future:
Backend API → services → UI
```

This separation keeps data access, application logic, shared state, and
UI responsibilities easier to maintain.
