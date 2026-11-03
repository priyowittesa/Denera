import { describe, expect, it } from 'vitest'
import { DRIVERS, VARIANCE_BY_PACKAGE, WHAT_IFS } from './cost'
import { MAP_H, MAP_W, project } from './indonesiaMap'
import { CONSTRUCTION, PRE_INVESTMENT, gateCell } from './portfolio'
import { INITIAL_ACTIONS, MEETING_ITEMS, isDueThisWeek, isOverdue } from './registers'
import { RUNS } from './runs'
import { PERSONAS, PERSONA_ORDER } from './personas'
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
    expect(PACKAGES_COST.reduce((s, p) => s + p.budget, 0)).toBe(2800)
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

  it('what-if table holds the five scenarios only', () => {
    expect(WHAT_IFS.map((w) => w.name)).toEqual(['No intervention', 'Expedite vendor only', 'Resequence works only', 'Expedite and resequence'])
  })

  it('every project lands inside the map', () => {
    for (const p of [...CONSTRUCTION, ...PRE_INVESTMENT]) {
      const [x, y] = project(p.geo.lon, p.geo.lat)
      expect(x).toBeGreaterThan(0); expect(x).toBeLessThan(MAP_W)
      expect(y).toBeGreaterThan(0); expect(y).toBeLessThan(MAP_H)
    }
  })

  it('gate cells carry owner, due date and evidence', () => {
    expect(gateCell('P2-08', 1)).toMatchObject({ owner: 'Technical lead', due: '15 Jul 2027', evidence: 'Design package v3 and review comments' })
    expect(gateCell('P2-06', 2).due).toBe('28 Jul 2027')
    expect(gateCell('P2-06', 9).due).toBe('Date to be set')
  })
})

describe('master data workbook alignment', () => {
  it('six personas land where spec 1.5 says (C30)', () => {
    expect(PERSONA_ORDER.map((p) => PERSONAS[p].landing)).toEqual(['/portfolio', '/cockpit', '/cockpit', '/notices', '/decisions', '/cockpit'])
  })
  it('Phase II islands and construction contingency match the workbook', () => {
    expect(PRE_INVESTMENT.map((p) => p.island)).toEqual(['Java', 'Sumatra', 'Java', 'Kalimantan', 'Sulawesi', 'Java', 'Sumatra', 'Bali-Nusa Tenggara'])
    expect(CONSTRUCTION.map((p) => [p.contingencyBn, p.forecastUseBn])).toEqual([[176, 65], [148, 26.6], [132, null]])
    expect(Math.round((26.6 / 148) * 100)).toBe(18)
  })
})
