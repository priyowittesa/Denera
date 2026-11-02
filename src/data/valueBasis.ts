/**
 * Value basis for the five leading use cases (master Tables 43 and 44).
 * Project values are derived from the prototype's own inputs, never typed.
 */
export const INPUTS = { mw: 33.5, availability: 0.85, tariff: 0.2, fx: 16500, capex: 2800, stake: 0.3 }

/** USD revenue deferred per day of COD delay, one plant. */
export function revenuePerDay(mw = INPUTS.mw, availability = INPUTS.availability, tariff = INPUTS.tariff) {
  return (mw * 8760 * availability * 1000 * tariff) / 365
}

export const perDay = Math.round(revenuePerDay()) // 136,680

export interface ValueRow {
  uc: string
  name: string
  lever: string
  range: string
  rangeLo: number
  rangeHi: number
  value: number
  valueLabel: string
  derivation: string
  denaraShare?: boolean
  gate: string
  /** product wording shown under the answer figure */
  metric: string
  /** optional caveat shown under the value line */
  caption?: string
  measure: string
}

export const VALUE_ROWS: Record<string, ValueRow> = {
  UC01: {
    metric: 'Revenue deferred per day of delay, Denera share',
    caption: 'Project revenue, not profit. Deferred, not necessarily lost; depends on PPA terms.',
    uc: 'UC01', name: 'Portfolio health and early warning', lever: 'Days of COD delay seen earlier across Phase I',
    range: 'USD 114k to 132k a day, Denera share, if three Phase I plants slip', rangeLo: 114000, rangeHi: 132000,
    value: Math.round(3 * perDay * INPUTS.stake), valueLabel: `USD ${Math.round(3 * perDay * INPUTS.stake).toLocaleString('en-US')} a day`,
    derivation: `3 x USD ${perDay.toLocaleString('en-US')} x 30%`, denaraShare: true,
    gate: 'Move from light status to computed health when the three Phase I partners have submitted the weekly template for four consecutive weeks (A).',
    measure: 'Days from first signal to executive awareness; board pack preparation time.',
  },
  UC07: {
    metric: 'Value of one week recovered, Denera share',
    uc: 'UC07', name: 'Long-lead procurement control tower', lever: 'Weeks of COD delay avoided on a long-lead package',
    range: 'USD 0.27m to 0.31m per avoided week, one plant, Denera share', rangeLo: 270000, rangeHi: 310000,
    value: 7 * perDay * INPUTS.stake, valueLabel: `USD ${(7 * perDay * INPUTS.stake / 1e6).toFixed(2)}m per week`,
    derivation: `7 x USD ${perDay.toLocaleString('en-US')} x 30%`, denaraShare: true,
    gate: 'Proceed when one Phase I partner provides vendor milestones for its long-lead package list (A).',
    measure: 'Float lost to unnoticed delay; days of early warning. Baseline: the Phase I long-lead package list and delays to date.',
  },
  UC07pc: {
    metric: 'Value of one week recovered',
    uc: 'UC07', name: 'Long-lead procurement control tower', lever: 'Weeks of COD delay avoided on a long-lead package',
    range: 'USD 0.89m to 1.03m per avoided week, one plant', rangeLo: 890000, rangeHi: 1030000,
    value: 7 * perDay, valueLabel: `USD ${(7 * perDay / 1e6).toFixed(2)}m per week`,
    derivation: `7 x USD ${perDay.toLocaleString('en-US')}`,
    gate: 'Proceed when one Phase I partner provides vendor milestones for its long-lead package list (A).',
    measure: 'Float lost to unnoticed delay; days of early warning.',
  },
  UC08: {
    metric: 'Value of one progress point',
    uc: 'UC08', name: 'Verified progress, S-curve and EVM', lever: 'Progress points verified before payment',
    range: 'Rp25 to 30 bn per progress point, one plant', rangeLo: 25, rangeHi: 30,
    value: INPUTS.capex * 0.01, valueLabel: `Rp${INPUTS.capex * 0.01} bn per point`,
    derivation: '1% of Rp2,800 bn',
    gate: 'Proceed when a shared WBS and progress rules are agreed with one Phase I partner and three months of monthly files have been received (A).',
    measure: 'Gap between reported and verified progress; forecast error. Baseline: the first three monthly reports.',
  },
  UC09: {
    metric: 'Value of 1% of CAPEX',
    uc: 'UC09', name: 'Cost, commitment and EAC forecasting', lever: 'Capex overrun seen and decided earlier',
    range: 'Rp25 to 30 bn per 1% of capex, one plant; Denera share Rp7.5 to 9 bn', rangeLo: 25, rangeHi: 30,
    value: INPUTS.capex * 0.01, valueLabel: `Rp${INPUTS.capex * 0.01} bn per 1%; Denera share Rp${(INPUTS.capex * 0.01 * INPUTS.stake).toFixed(1)} bn`,
    derivation: '1% of Rp2,800 bn; 30% share',
    gate: 'Proceed when cost code mapping and the contingency definition are agreed for one Phase I project (A).',
    measure: 'EAC error at 25, 50 and 75 percent progress; days from first variance signal to decision. Baseline: Phase I reporting history.',
  },
  UC10: {
    metric: 'Value of one week recovered',
    uc: 'UC10', name: 'Critical path, look-ahead and delay indicators', lever: 'Weeks of delay found earlier (overlaps UC07, never added)',
    range: 'USD 0.89m to 1.03m per avoided week, one plant', rangeLo: 890000, rangeHi: 1030000,
    value: 7 * perDay, valueLabel: `USD ${(7 * perDay / 1e6).toFixed(2)}m per week`,
    derivation: `7 x USD ${perDay.toLocaleString('en-US')}`,
    gate: 'Proceed when schedule exports with logic are available for two Phase I plants (A).',
    measure: 'Lead time of delay detection. Baseline: delays found late in the first monthly reports.',
  },
}

export const inRange = (r: ValueRow) => r.value >= r.rangeLo && r.value <= r.rangeHi
