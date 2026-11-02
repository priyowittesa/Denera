import type { Authority } from './types'
import { HISTORY } from './scurve'

/** Synthetic (ledger L9). Every list here sums to Rp110 bn where stated. */
export const DRIVERS = [
  { name: 'Foreign-exchange exposure', v: 30 },
  { name: 'Acceleration and recovery', v: 22 },
  { name: "Owner's cost and project management", v: 15 },
  { name: 'Extended preliminaries', v: 14 },
  { name: 'Freight and alternative shipping', v: 12 },
  { name: 'Design change and interface rework', v: 11 },
  { name: 'Claims and variation position', v: 6 },
]

export const VARIANCE_BY_PACKAGE = [
  { name: 'Boiler island', v: 47 },
  { name: 'Waste receiving system', v: 28 },
  { name: "Owner's cost", v: 15 },
  { name: 'Balance of plant', v: 6 },
  { name: 'Grid interconnection', v: 5 },
  { name: 'Turbine-generator', v: 4 },
  { name: 'Civil and foundations', v: 3 },
  { name: 'Utilities and water treatment', v: 2 },
]

export const COST_RISKS = [
  { name: 'FX movement on imported equipment', v: 30 },
  { name: 'Boiler acceleration', v: 22 },
  { name: 'Extended preliminaries', v: 14 },
  { name: 'Freight and alternative shipping', v: 12 },
  { name: 'Design change and interface rework', v: 11 },
]

export const CONTINGENCY_PATH = [
  { date: 'Jun 27', current: 9, none: 9 },
  { date: 'Sep 27', current: 24, none: 48 },
  { date: 'Dec 27', current: 40, none: 95 },
  { date: 'Mar 28', current: 55, none: 135 },
  { date: 'Jun 28', current: 62, none: null },
  { date: 'Aug 28', current: 65, none: 157 },
]

export const ALERT_LINE_USED = 158.4

/** Monthly bars derived from the cumulative series (planned value vs actual cost). */
export const MONTHLY_CASHFLOW = HISTORY.slice(1).map((r, i) => {
  const prev = HISTORY[i]
  const d = new Date(r.date)
  return {
    month: d.toLocaleString('en-GB', { month: 'short' }) + ' ' + String(d.getFullYear()).slice(2),
    planned: r.pv - prev.pv,
    actual: r.ac - prev.ac,
  }
})

export interface WhatIf {
  id: string
  name: string
  delay: string
  cost: string
  remaining: string
  remainingV: number | null
  rating: string
  route: Authority | 'n/a' | 'Project company, with Denera board approval'
  scenario?: 'none' | 'expedite' | 'resequence' | 'both'
}

export const WHAT_IFS: WhatIf[] = [
  { id: 'none', name: 'No intervention', delay: 'plus 64 days', cost: 'Rp92 bn', remaining: 'Rp19 bn (11%)', remainingV: 19, rating: 'Red', route: 'n/a', scenario: 'none' },
  { id: 'expedite', name: 'Expedite vendor only', delay: 'plus 34 days', cost: 'Rp29 bn', remaining: 'Rp82 bn (47%)', remainingV: 82, rating: 'Yellow', route: 'Project company', scenario: 'expedite' },
  { id: 'resequence', name: 'Resequence works only', delay: 'plus 27 days', cost: 'Rp18 bn', remaining: 'Rp93 bn (53%)', remainingV: 93, rating: 'Yellow', route: 'Project company', scenario: 'resequence' },
  { id: 'both', name: 'Expedite and resequence', delay: 'plus 12 days', cost: 'Rp47 bn', remaining: 'Rp64 bn (36%)', remainingV: 64, rating: 'Yellow', route: 'Project company, with Denera board approval', scenario: 'both' },
  { id: 'alt', name: 'Alternative supplier', delay: 'plus 45 to 90 days', cost: 'To be confirmed', remaining: 'To be confirmed', remainingV: null, rating: 'Yellow to Red', route: 'Joint' },
]

export const COST_INSIGHT =
  "The project remains within total approved contingency, but the Rp45 billion of foreign-exchange and owner's cost needs shareholder funding approval. In the no-intervention case the reserve falls to Rp19 billion, which is within Rp1.4 billion of the Rp17.6 billion alert threshold, so any further cost risk would breach it."
