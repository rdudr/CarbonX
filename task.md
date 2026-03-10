# CarbonX PowerByte Implementation Tasks

## Phase 1: Project Repository & Global Setup
- [x] Create and update project architecture documentation.
- [x] Initialize Git repository from `https://github.com/rdudr/CarbonX.git`.
- [x] Create detailed `README.md` outlining the platform purpose and architecture.
- [x] Commit and push documentation to GitHub.

## Phase 2: Core Skeleton Setup & Styling
- [ ] Initialize Next.js project with Tailwind CSS.
- [ ] Install and initialize `shadcn/ui` preset framework.
- [ ] Add and integrate `@react-bits/dock-js-css`.
- [ ] Configure Liquid Glass UI themes and base color palette (`#F7F0F0`, `#25671E`, `#48A111`, `#F2B50B`).
- [ ] Layout the main Dashboard and responsive navigation.

## Phase 3: Real-Time Data Processing (Backend / IoT)
- [ ] Develop Firebase Realtime DB schema and Node.js ingestion logic.
- [ ] Write MQTT topic listeners (e.g. `carbonx/rx/telemetry`).
- [ ] Implement mathematical aggregation (Phase Power, Energy Integrals, RX/TX Total Sums).

## Phase 4: AI & Machine Analytics Logic
- [ ] Write AI Machine Health Score logic (0-100 gauge calc).
- [ ] Create Python integration or external API stubs for Predictive Forecasting (7 days / 24 hrs horizon).
- [ ] Process Machine Carbon Emission versus theoretical Grid factors.

## Phase 5: Component Implementation (Dashboard UI)
- [ ] Build Carbon Speedometer Gauge & 3-Phase Monitor components.
- [ ] Build Machine Health Panel (with Dynamic Condition Indicators).
- [ ] Build Performance Analytics Panel & Prediction Panel with charts.
- [ ] Create Download Center layout with Export buttons.

## Phase 6: Report Generation & Export System
- [ ] Develop `/api/export/csv` to generate AI-ready datasets from telemetry history.
- [ ] Integrate PDF export functions for "Machine Performance Report".
- [ ] Integrate Excel/CSV report downloads.

## Phase 7: Verification & Final Polish
- [ ] Verify End-to-end data flow with mocked ESP32 nodes.
- [ ] Performance and API rate-limiting checks.
- [ ] Final UI Polish (animations, smooth tooltips).
