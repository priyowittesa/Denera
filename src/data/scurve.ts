/** Section 1.11 tables, verbatim. Synthetic (ledger L7). */

export interface HistoryRow {
  date: string
  planned: number
  reported: number
  verified: number
  pv: number
  ev: number
  ac: number
  acCommit: number
  cash: number
}

export const HISTORY: HistoryRow[] = [
  { date: '2026-08-03', planned: 0, reported: 0, verified: 0, pv: 0, ev: 0, ac: 0, acCommit: 0, cash: 0 },
  { date: '2026-08-31', planned: 0.5, reported: 0.5, verified: 0.5, pv: 13, ev: 13, ac: 13, acCommit: 14, cash: 13 },
  { date: '2026-09-30', planned: 1.9, reported: 2.2, verified: 1.9, pv: 54, ev: 54, ac: 54, acCommit: 58, cash: 55 },
  { date: '2026-10-31', planned: 4.4, reported: 4.8, verified: 4.4, pv: 124, ev: 123, ac: 124, acCommit: 136, cash: 125 },
  { date: '2026-11-30', planned: 7.7, reported: 8.2, verified: 7.5, pv: 215, ev: 211, ac: 213, acCommit: 239, cash: 216 },
  { date: '2026-12-31', planned: 11.8, reported: 12.4, verified: 11.4, pv: 331, ev: 320, ac: 325, acCommit: 373, cash: 331 },
  { date: '2027-01-31', planned: 16.6, reported: 17.1, verified: 15.9, pv: 465, ev: 444, ac: 451, acCommit: 529, cash: 463 },
  { date: '2027-02-28', planned: 21.4, reported: 21.6, verified: 20.1, pv: 600, ev: 564, ac: 576, acCommit: 687, cash: 592 },
  { date: '2027-03-31', planned: 27.2, reported: 26.9, verified: 25.1, pv: 762, ev: 701, ac: 720, acCommit: 875, cash: 744 },
  { date: '2027-04-30', planned: 33.2, reported: 32.0, verified: 29.8, pv: 929, ev: 835, ac: 861, acCommit: 1066, cash: 893 },
  { date: '2027-05-31', planned: 39.6, reported: 37.2, verified: 34.6, pv: 1109, ev: 970, ac: 1005, acCommit: 1266, cash: 1047 },
  { date: '2027-06-30', planned: 46.0, reported: 42.0, verified: 39.0, pv: 1288, ev: 1092, ac: 1138, acCommit: 1456, cash: 1190 },
]

export const PLANNED_FUTURE: { date: string; planned: number }[] = [
  { date: '2027-07-31', planned: 52.7 },
  { date: '2027-08-31', planned: 59.3 },
  { date: '2027-09-30', planned: 65.5 },
  { date: '2027-10-31', planned: 71.8 },
  { date: '2027-11-30', planned: 77.5 },
  { date: '2027-12-31', planned: 82.9 },
  { date: '2028-01-31', planned: 87.8 },
  { date: '2028-02-29', planned: 91.8 },
  { date: '2028-03-31', planned: 95.2 },
  { date: '2028-04-30', planned: 97.8 },
  { date: '2028-05-31', planned: 99.4 },
  { date: '2028-06-30', planned: 100.0 },
]

export type ScenarioId = 'current' | 'none' | 'expedite' | 'resequence' | 'both'

export interface Scenario {
  id: ScenarioId
  label: string
  short: string
  days: number
  cod: string
  codIso: string
  incremental: number | null
  remaining: number
  remainingPct: number
  rating: 'Yellow, escalation' | 'Red' | 'Yellow'
  color: string
  dash: string
  route: string
}

export const SCENARIOS: Scenario[] = [
  { id: 'current', label: 'Current plan', short: 'Current plan', days: 42, cod: '11 Aug 2028', codIso: '2028-08-11', incremental: null, remaining: 111, remainingPct: 63, rating: 'Yellow, escalation', color: 'var(--color-series-forecast)', dash: '2 4', route: 'n/a' },
  { id: 'none', label: 'No intervention', short: 'No intervention', days: 64, cod: '2 Sep 2028', codIso: '2028-09-02', incremental: 92, remaining: 19, remainingPct: 11, rating: 'Red', color: 'var(--color-series-nointervention)', dash: '6 4', route: 'n/a' },
  { id: 'expedite', label: 'Expedite vendor only', short: 'Expedite only', days: 34, cod: '3 Aug 2028', codIso: '2028-08-03', incremental: 29, remaining: 82, remainingPct: 47, rating: 'Yellow', color: 'var(--color-series-recovery)', dash: '6 4', route: 'Project company' },
  { id: 'resequence', label: 'Resequence works only', short: 'Resequence only', days: 27, cod: '27 Jul 2028', codIso: '2028-07-27', incremental: 18, remaining: 93, remainingPct: 53, rating: 'Yellow', color: 'var(--color-series-recovery)', dash: '6 4', route: 'Project company' },
  { id: 'both', label: 'Expedite and resequence', short: 'Expedite and resequence', days: 12, cod: '12 Jul 2028', codIso: '2028-07-12', incremental: 47, remaining: 64, remainingPct: 36, rating: 'Yellow', color: 'var(--color-series-recovery)', dash: '6 4', route: 'Project company, with Denera board approval' },
]

export const FORECAST: { date: string; current: number; none: number; expedite: number; resequence: number; both: number; planned: number; plannedCost: number; forecastCost: number }[] = [
  { date: '2027-06-30', planned: 46.0, current: 39.0, none: 39.0, expedite: 39.0, resequence: 39.0, both: 39.0, plannedCost: 1288, forecastCost: 1138 },
  { date: '2027-07-31', planned: 52.7, current: 45.7, none: 45.4, expedite: 45.9, resequence: 46.0, both: 46.3, plannedCost: 1474, forecastCost: 1334 },
  { date: '2027-08-31', planned: 59.3, current: 52.5, none: 51.8, expedite: 52.7, resequence: 53.0, both: 53.5, plannedCost: 1660, forecastCost: 1529 },
  { date: '2027-09-30', planned: 65.5, current: 58.9, none: 57.9, expedite: 59.2, resequence: 59.6, both: 60.4, plannedCost: 1835, forecastCost: 1715 },
  { date: '2027-10-31', planned: 71.8, current: 65.3, none: 64.0, expedite: 65.8, resequence: 66.2, both: 67.2, plannedCost: 2010, forecastCost: 1901 },
  { date: '2027-11-30', planned: 77.5, current: 71.2, none: 69.7, expedite: 71.8, resequence: 72.3, both: 73.5, plannedCost: 2169, forecastCost: 2074 },
  { date: '2027-12-31', planned: 82.9, current: 77.0, none: 75.3, expedite: 77.7, resequence: 78.3, both: 79.6, plannedCost: 2322, forecastCost: 2242 },
  { date: '2028-01-31', planned: 87.8, current: 82.3, none: 80.5, expedite: 83.0, resequence: 83.7, both: 85.1, plannedCost: 2458, forecastCost: 2397 },
  { date: '2028-02-29', planned: 91.8, current: 86.8, none: 85.0, expedite: 87.6, resequence: 88.2, both: 89.6, plannedCost: 2569, forecastCost: 2528 },
  { date: '2028-03-31', planned: 95.2, current: 91.1, none: 89.2, expedite: 91.7, resequence: 92.3, both: 93.6, plannedCost: 2667, forecastCost: 2650 },
  { date: '2028-04-30', planned: 97.8, current: 94.5, none: 92.8, expedite: 95.1, resequence: 95.6, both: 96.7, plannedCost: 2738, forecastCost: 2749 },
  { date: '2028-05-31', planned: 99.4, current: 97.2, none: 95.8, expedite: 97.7, resequence: 98.1, both: 98.9, plannedCost: 2784, forecastCost: 2829 },
  { date: '2028-06-30', planned: 100.0, current: 99.0, none: 98.0, expedite: 99.3, resequence: 99.6, both: 99.9, plannedCost: 2800, forecastCost: 2881 },
  { date: '2028-07-31', planned: 100.0, current: 99.9, none: 99.4, expedite: 100.0, resequence: 100.0, both: 100.0, plannedCost: 2800, forecastCost: 2908 },
  { date: '2028-08-31', planned: 100.0, current: 100.0, none: 100.0, expedite: 100.0, resequence: 100.0, both: 100.0, plannedCost: 2800, forecastCost: 2910 },
  { date: '2028-09-30', planned: 100.0, current: 100.0, none: 100.0, expedite: 100.0, resequence: 100.0, both: 100.0, plannedCost: 2800, forecastCost: 2910 },
]

export const EVENT_PINS = [
  { n: 1, date: '2026-08-03', text: 'Groundbreaking, 3 Aug 2026' },
  { n: 2, date: '2027-04-15', text: 'Earlier gap driven by structural steel productivity (Mar to Apr 2027)' },
  { n: 3, date: '2027-06-12', text: 'Boiler vendor technical submittal due 12 Jun 2027, now 18 days overdue' },
  { n: 4, date: '2027-07-06', text: 'Contractual notice due 6 Jul 2027' },
]

export const WBS = [
  { name: 'Civil and foundations', status: 'Green' as const },
  { name: 'Waste receiving system', status: 'Red' as const },
  { name: 'Boiler island', status: 'Red' as const, link: '/critical-path' },
  { name: 'Turbine-generator', status: 'Yellow' as const },
  { name: 'Balance of plant', status: 'Yellow' as const },
  { name: 'Grid interconnection', status: 'Yellow' as const },
  { name: 'Utilities and water treatment', status: 'Green' as const },
  { name: 'Commissioning and performance testing', status: 'Not started' as const },
]

export const DISCIPLINES = [
  { name: 'Civil', weight: 30, reported: 74, verified: 72 },
  { name: 'Structural', weight: 20, reported: 58, verified: 52 },
  { name: 'Mechanical', weight: 25, reported: 20, verified: 16 },
  { name: 'Electrical', weight: 12, reported: 20, verified: 18 },
  { name: 'Instrumentation and control', weight: 13, reported: 8, verified: 6 },
]

export const CONTRACTORS = [
  { name: 'EPC contractor (overall)', reported: 42, verified: 39, overdue: 1 },
  { name: 'Civil subcontractor', reported: 74, verified: 72, overdue: 0 },
  { name: 'Structural steel subcontractor', reported: 58, verified: 52, overdue: 3 },
  { name: 'Mechanical erection subcontractor', reported: 20, verified: 16, overdue: 5 },
  { name: 'Electrical and I&C subcontractor', reported: 14, verified: 12, overdue: 2 },
]

export const PACKAGES_COST = [
  { name: 'Civil and foundations', ac: 360, commit: 20 },
  { name: 'Waste receiving system', ac: 175, commit: 70 },
  { name: 'Boiler island', ac: 190, commit: 120 },
  { name: 'Turbine-generator', ac: 130, commit: 40 },
  { name: 'Balance of plant', ac: 95, commit: 30 },
  { name: 'Grid interconnection', ac: 45, commit: 20 },
  { name: 'Utilities and water treatment', ac: 75, commit: 10 },
  { name: "Owner's cost and preliminaries", ac: 68, commit: 8 },
]

export const weighted = (key: 'reported' | 'verified') =>
  DISCIPLINES.reduce((s, d) => s + (d.weight * d[key]) / 100, 0)
