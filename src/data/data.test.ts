import { describe, expect, it } from 'vitest'
import { DRIVERS, VARIANCE_BY_PACKAGE } from './cost'
import { INITIAL_ACTIONS, MEETING_ITEMS, isDueThisWeek, isOverdue } from './registers'
import { RUNS } from './runs'
import { PACKAGES_COST, weighted } from './scurve'
import { VALUE_ROWS, inRange, revenuePerDay } from './valueBasis'
import type { Action } from './types'

const sum = (xs: { v: number }[]) => xs.reduce((s, x) => s + x.v, 0)

describe('Denera synthetic data reconciles', () => {
  it('discipline weights give 42% reported and 39% verified', () => {
    expect(Math.round(weighted('reported'))).toBe(42)
    expect(Math.round(weighted('verified'))).toBe(39)
  })
  it('work packages sum to actual cost and commitments', () => {
    expect(PACKAGES_COST.reduce((s, p) => s + p.ac, 0)).toBe(1138)
    expect(PACKAGES_COST.reduce((s, p) => s + p.commit, 0)).toBe(318)
  })
  it('cost drivers and package variance sum to Rp110 bn', () => {
    expect(sum(DRIVERS)).toBe(110)
    expect(sum(VARIANCE_BY_PACKAGE)).toBe(110)
  })
  it('delay revenue: 42 days is Rp95 bn and 64 days is Rp144 bn', () => {
    const rp = (d: number) => Math.round((revenuePerDay() * d * 16500) / 1e9)
    expect(rp(42)).toBe(95)
    expect(rp(64)).toBe(144)
    expect(Math.round((revenuePerDay() * 42 * 16500 * 0.3) / 1e9)).toBe(28)
    expect(Math.round((revenuePerDay() * 64 * 16500 * 0.3) / 1e9)).toBe(43)
  })
  it('every value panel figure sits inside its master range', () => {
    for (const r of Object.values(VALUE_ROWS)) expect(inRange(r), r.uc).toBe(true)
  })
  it('run board is 11 jobs: 5 completed, 5 waiting, 1 blocked', () => {
    expect(RUNS).toHaveLength(11)
    expect(RUNS.filter((r) => r.state.startsWith('Completed'))).toHaveLength(5)
    expect(RUNS.filter((r) => r.state === 'Waiting for human')).toHaveLength(5)
    expect(RUNS.filter((r) => r.state === 'Blocked')).toHaveLength(1)
  })
  it('action bar starts at 6 / 2 / 4 and reaches 10 / 2 / 8 after four meeting items', () => {
    const counts = (a: Action[]) => [a.length, a.filter(isOverdue).length, a.filter(isDueThisWeek).length]
    expect(counts(INITIAL_ACTIONS)).toEqual([6, 2, 4])
    const added = MEETING_ITEMS.filter((m) => m.kind === 'Action' && m.dueIso).map((m, i) => ({ ...INITIAL_ACTIONS[0], id: `x${i}`, dueIso: m.id === 'M3' ? '2027-07-06' : m.dueIso }))
    expect(counts([...INITIAL_ACTIONS, ...added])).toEqual([10, 2, 8])
  })
})
