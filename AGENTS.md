# Ha Linh Travel Client

## Product context

Ha Linh Travel is an internal operations system for a coach and tourist-bus company in Hai Phong. Its users are dispatchers, accountants, and managers. The product manages employee shuttle trips, tourist trips, vehicles, drivers, routes, customers, external carriers, expenses, receivables/payables, driver advances, payroll, and profit reports.

Treat it as an operations workspace, not a consumer travel-booking site. Do not invent live GPS, maps, tracking, or vehicle telemetry unless a real data source and product requirement exist.

## Design direction

The visual language is **"bảng điều độ theo tuyến"** (route dispatch board): time, route, vehicle plate, driver, and operational state are the primary visual units. Reuse this route strip/timeline across dashboards, trip lists, trip details, and reports.

- Prioritize work that needs action today: unassigned trips, missing documents, overdue reconciliation, vehicle/driver issues, and unpaid balances.
- Show status with both a short Vietnamese label and color. Use the same state names everywhere: `Chờ phân công`, `Đã xác nhận`, `Đang chạy`, `Hoàn tất`, `Cần đối soát`, `Quá hạn`.
- Vehicle registration plates, departure/return times, and money amounts are operational identifiers. Make them easy to scan.
- Use cards only for a distinct summary or decision. Dense operational lists belong in tables, timelines, or route strips—not grids of identical cards.
- Use Vietnamese, sentence case, plain verbs, and consistent action labels. Never use filler copy or English admin jargon when a clear Vietnamese label exists.
- Motion must respond to user action or clarify a state change. Respect `prefers-reduced-motion`; avoid decorative looping motion beyond the small brand mark.

## Visual tokens

Use the shared tokens in `src/assets/style.css`; do not introduce one-off page palettes.

- `#10233B` — harbour ink / sidebar / strong text
- `#1769C2` — operational blue / primary action
- `#2F8A68` — complete / reconciled
- `#E6A93D` — requires attention
- `#C84C46` — overdue / destructive
- `#F5F7FA` — workspace background

Typography uses `Be Vietnam Pro`. Use a compact but readable scale: 13–14px for tabular information, 16px for section headings, 24px for page headings. Prefer tabular numerals for time, registration plates, and currency.

## Frontend conventions

- Stack: Vue 3, TypeScript, Vite, Tailwind CSS v4, Pinia, Vue Router, Lucide icons.
- Use `@/` aliases and `<script setup lang="ts">`.
- Keep page-level data and display helpers near the page until a real API/domain module exists.
- Reuse semantic tokens (`bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`) rather than hard-coded colors.
- Design desktop first for operational density, then preserve a clear mobile single-column experience.
- Preserve keyboard focus, touch targets, contrast, empty states, error states, and loading states.

## Verification

Run these after UI changes:

```powershell
npm.cmd run type-check
npm.cmd run build-only
```

Do not commit, stage, push, reset, or discard user work unless the user explicitly asks.
