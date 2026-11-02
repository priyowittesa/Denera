import type { Health } from './types'

export interface ConstructionProject {
  id: string
  name: string
  island: string
  capex: number
  cod: string
  health: Health
  healthLabel: string
  escalation?: boolean
  rights: string
  rightsN: number
  alert: string
  alertTo?: string
  confidence?: number
  signals: string[]
  exposureDays: number
  contingencyUse: string
  map: { x: number; y: number }
}

export const CONSTRUCTION: ConstructionProject[] = [
  {
    id: 'cakrawala', name: 'PSEL Cakrawala Raya', island: 'Java', capex: 2800, cod: '30 Jun 2028', health: 'Yellow', healthLabel: 'Yellow, escalation required', escalation: true,
    rights: '3 of 4', rightsN: 3, alert: 'Notice due 6 Jul 2027 (6 days)', alertTo: '/notices', exposureDays: 42, contingencyUse: '37%',
    signals: ['Schedule Red: forecast COD slip of 42 days', 'Cost Red: Rp45 bn needs shareholder funding approval', 'Procurement Red: two critical packages late', 'Commercial Red: formal notice due in six days', 'Rule: no limit breached and exposure at or below 60 days, so overall Yellow. Four Red dimensions raise the escalation flag.'],
    map: { x: 318, y: 262 },
  },
  {
    id: 'nusa', name: 'PSEL Nusa Bahari', island: 'Sumatra', capex: 2350, cod: '15 May 2028', health: 'Yellow', healthLabel: 'Yellow',
    rights: '4 of 4', rightsN: 4, alert: 'Imported crane shipment risk, 12-day exposure', exposureDays: 12, contingencyUse: '18%',
    signals: ['Procurement Yellow: imported crane shipment at risk', 'Schedule Yellow: 12-day exposure, no limit forecast to breach', 'Rule: two Yellow dimensions, so overall Yellow'],
    map: { x: 128, y: 150 },
  },
  {
    id: 'sinar', name: 'PSEL Sinar Lestari', island: 'Sulawesi', capex: 2100, cod: '30 Apr 2028', health: 'Green', healthLabel: 'Green', confidence: 74,
    rights: '2 of 4', rightsN: 2, alert: 'Two data feeds not yet agreed', alertTo: '/partner-data', exposureDays: 0, contingencyUse: 'No data',
    signals: ['No adverse indicator on the feeds received', 'Data confidence 74%: only 2 of 4 feeds agreed, so health covers schedule and cost only'],
    map: { x: 470, y: 180 },
  },
]

export interface PreInvestment {
  id: string
  island: string
  nextGate: string
  date: string
  open: number
  atRisk?: boolean
  floa: boolean
  fidTarget: string
  fidForecast?: string
  map: { x: number; y: number }
}

export const PRE_INVESTMENT: PreInvestment[] = [
  { id: 'P2-01', island: 'Java', nextGate: 'FID', date: '15 Sep 2027', open: 1, floa: true, fidTarget: '15 Sep 2027', map: { x: 270, y: 258 } },
  { id: 'P2-02', island: 'Java', nextGate: 'FID', date: '30 Sep 2027', open: 1, floa: true, fidTarget: '30 Sep 2027', map: { x: 348, y: 270 } },
  { id: 'P2-03', island: 'Java', nextGate: 'FID', date: '30 Sep 2027', open: 1, floa: true, fidTarget: '30 Sep 2027', map: { x: 392, y: 272 } },
  { id: 'P2-04', island: 'Sumatra', nextGate: 'FID', date: '31 Oct 2027', open: 1, floa: true, fidTarget: '31 Oct 2027', map: { x: 92, y: 118 } },
  { id: 'P2-05', island: 'Sumatra', nextGate: 'FID', date: '30 Nov 2027', open: 1, floa: true, fidTarget: '30 Nov 2027', map: { x: 176, y: 214 } },
  { id: 'P2-06', island: 'Kalimantan', nextGate: 'Permits', date: '28 Jul 2027', open: 6, atRisk: true, floa: false, fidTarget: '15 Dec 2027', fidForecast: '5 Jan 2028', map: { x: 330, y: 148 } },
  { id: 'P2-07', island: 'Sulawesi', nextGate: 'Permits', date: '4 Aug 2027', open: 7, atRisk: true, floa: false, fidTarget: '31 Jan 2028', fidForecast: '21 Feb 2028', map: { x: 498, y: 214 } },
  { id: 'P2-08', island: 'Bali-Nusa Tenggara', nextGate: 'Basic engineering design confirmation', date: '15 Jul 2027', open: 9, floa: false, fidTarget: 'To be set', map: { x: 452, y: 288 } },
]

export const GATES = [
  'Feasibility study',
  'Basic engineering design',
  'Environmental approval and permits',
  'Land and regional cooperation agreement',
  'Waste supply commitment',
  'Shareholder agreement',
  'PPA readiness',
  'Lender conditions precedent',
  'FLOA',
  'FID',
] as const

export type GateState = 'M' | 'P' | 'R' | 'N' | 'C'

export const GATE_MATRIX: Record<string, GateState[]> = {
  'P2-01': ['M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'P'],
  'P2-02': ['M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'P'],
  'P2-03': ['M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'P'],
  'P2-04': ['M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'P'],
  'P2-05': ['M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'P'],
  'P2-06': ['M', 'M', 'R', 'M', 'M', 'P', 'N', 'N', 'N', 'N'],
  'P2-07': ['M', 'M', 'R', 'P', 'M', 'P', 'N', 'N', 'N', 'N'],
  'P2-08': ['M', 'C', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
}

export const PORTFOLIO_KPIS = {
  capexInConstruction: 7250,
  largestExposure: 42,
  green: 1,
  yellow: 2,
  red: 0,
  longLeadAbove14: 2,
  decisionsThisWeek: 3,
  rightsCoverage: '9 of 12',
  rightsPct: 75,
  gatesAtRisk: 2,
}

export const WEEKLY_BRIEF: { text: string; to: string }[] = [
  { text: 'Three decisions need executive attention, two of them for the project company board.', to: '/decisions' },
  { text: 'Two projects have emerging schedule exposure from imported equipment.', to: '/procurement' },
  { text: 'One project has a notice deadline within seven days.', to: '/notices' },
  { text: 'Two pre-investment projects have a gate date at risk.', to: '/gates' },
]

export const CONTROL_MODEL =
  'Each PSEL is delivered by a project company (BUPP): Denera 30%, partner consortium 70%. The EPC contract and the PPA with PLN sit in the project company. Denera acts through board nominees, shareholder agreement rights, information and audit rights, funding approvals and escalation to Danantara.'
