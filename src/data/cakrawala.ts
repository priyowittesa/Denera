import type { Health } from './types'

/** PSEL Cakrawala Raya. Synthetic, inherited from archived Prototype Brief v3.0 (ledger L19). */
export const PROJECT = {
  name: 'PSEL Cakrawala Raya',
  island: 'Java',
  stage: 'EPC execution',
  groundbreaking: '3 Aug 2026',
  targetCod: '30 Jun 2028',
  dataDate: '30 Jun 2027',
  refresh: '08:30 WIB',
  verified: 39,
  reported: 42,
  planned: 46,
  progressGap: 7.0,
  weeklyGain: 1.8,
  capex: 2800,
  eac: 2910,
  eacLow: 2846,
  eacHigh: 2918,
  ac: 1138,
  commitments: 318,
  acPlusCommit: 1456,
  cashPaid: 1190,
  advances: 52,
  pv: 1288,
  ev: 1092,
  spi: 0.85,
  cpi: 0.96,
  cv: -46,
  eacVariance: 110,
  exposureDays: 42,
  exposureNoIntervention: 64,
  forecastCod: '11 Aug 2028',
  noticeDue: 'Tue 6 Jul 2027',
  noticeDaysLeft: 6,
  dataConfidence: 91,
  confFreshness: 95,
  confQuality: 90,
  confAgreement: 85,
  infoRights: '3 of 4',
  contingency: 176,
  contingencyUse: 65,
  contingencyRemaining: 111,
  contingencyRemainingPct: 63,
  alertThreshold: 17.6,
  shareholderFunding: 45,
  nextQuarterFunding: 312,
  committedPct: 52,
  gapPoints: 13,
  gapValue: 364,
  gapAtRisk: 106,
  gapAtRiskPct: 29,
} as const

export const NARRATIVE =
  'The primary completion risk is no longer civil productivity. The main exposure is the late waste-receiving and boiler island package, compounded by an unresolved technical interface and an unvalidated recovery programme. Without intervention this week, COD exposure is likely to increase from 42 to 64 days, which moves the overall status from Yellow to Red. This is an advisory forecast based on the assumptions listed on screen.'

export const WEEKLY_MOVEMENT =
  'Physical progress improved by 1.8% this week but remains 7.0 points behind plan. The primary completion risk has shifted from structural steel productivity to the late waste-receiving and boiler island package. ATLAS recommends executive intervention this week to secure a recovery plan, evaluate alternative logistics and protect contractual entitlement. Two of the six recommended actions, both labelled Joint, require a project company board decision.'

export interface Scorecard {
  id: string
  name: string
  status: Health
  text: string
  to?: string
  wave?: 'W1' | 'W2' | 'W3'
  panel?: boolean
}

export const SCORECARDS: Scorecard[] = [
  { id: 'schedule', name: 'Schedule', status: 'Red', text: 'Forecast COD slip of 42 days.', to: '/critical-path' },
  { id: 'cost', name: 'Cost', status: 'Red', text: 'Rp45 bn of forecast cost needs shareholder funding approval; management EAC 3.9% above approved CAPEX.', to: '/cost' },
  { id: 'procurement', name: 'Procurement', status: 'Red', text: 'Two critical packages late.', to: '/procurement' },
  { id: 'commercial', name: 'Commercial', status: 'Red', text: 'Formal notice due in six days.', to: '/decisions?tab=claims' },
  { id: 'progress', name: 'Physical progress', status: 'Yellow', text: '39% verified against 46% planned.', to: '/progress' },
  { id: 'engineering', name: 'Engineering', status: 'Yellow', text: 'Eleven overdue technical submittals.', to: '/critical-path' },
  { id: 'readiness', name: 'Construction readiness', status: 'Yellow', text: 'Access and utility interfaces unresolved.', to: '/critical-path' },
  { id: 'waste', name: 'Waste supply', status: 'Yellow', text: 'Regional commitment of 1,000 tonnes a day confirmed, collection fleet plan not yet evidenced.', to: '/partner-data' },
  { id: 'financing', name: 'Financing conditions', status: 'Yellow', text: 'Two conditions precedent open for the next drawdown.', to: '/packs?version=lender' },
  { id: 'permits', name: 'Permits and stakeholders', status: 'Yellow', text: 'One approval at risk of delay.', panel: true, wave: 'W1' },
  { id: 'hse', name: 'HSE', status: 'Green', text: 'No lost-time incident; 94% of actions closed.', panel: true, wave: 'W3' },
  { id: 'quality', name: 'Quality and commissioning', status: 'Green', text: 'Inspection and test plan completion aligns with verified work.', panel: true, wave: 'W3' },
]

export const FIN_DEFS: { plain: string; term: string; def: string }[] = [
  { plain: 'Value of work done', term: 'Earned value (EV)', def: 'Approved CAPEX x verified physical progress: Rp2,800 bn x 39% = Rp1,092 bn' },
  { plain: 'Value of work planned', term: 'Planned value (PV)', def: 'Approved CAPEX x planned progress: Rp2,800 bn x 46% = Rp1,288 bn' },
  { plain: 'Cost incurred', term: 'Actual cost (AC)', def: 'From invoices and accruals: Rp1,138 bn' },
  { plain: 'Ordered, not yet incurred', term: 'Open commitments', def: 'Rp318 bn' },
  { plain: 'Cash out the door', term: 'Cash paid', def: 'Rp1,190 bn, including Rp52 bn advance payments to vendors' },
  { plain: 'Schedule efficiency', term: 'Schedule Performance Index (SPI)', def: 'EV / PV = 0.85' },
  { plain: 'Cost efficiency', term: 'Cost Performance Index (CPI)', def: 'EV / AC = 0.96' },
  { plain: 'Cost gap', term: 'Cost variance (CV)', def: 'EV minus AC = minus Rp46 bn' },
  { plain: 'Forecast final cost', term: 'Management EAC', def: 'Rp2,910 bn, built from commitments, expected change orders and risks' },
  { plain: 'Forecast range', term: 'EAC range', def: 'Method (a), remaining work at budget: 1,138 + 1,708 = Rp2,846 bn. Method (b), CPI trend: 2,800 / 0.96 = Rp2,918 bn. ATLAS flags a gap above 2% between management EAC and the CPI-trend figure; here 0.3%.' },
  { plain: 'Contingency', term: 'Reserve outside approved CAPEX', def: 'Rp176 bn (6.3% of CAPEX), drawn only for delivery risk events approved by the steering committee. Forecast use Rp65 bn, leaving Rp111 bn (63%). Alert when remaining falls below 10% (Rp17.6 bn). Illustrative until Denera finance confirms.' },
]

export const PROGRAM_TERMS: { term: string; def: string }[] = [
  { term: 'PSEL', def: 'Pengolahan Sampah menjadi Energi Listrik, waste-to-electricity' },
  { term: 'BUPP', def: 'Project company formed by Denera (30%) and a partner consortium (70%)' },
  { term: 'DIM', def: 'PT Danantara Investment Management, parent of Denera' },
  { term: 'FLOA', def: 'Final letter of award' },
  { term: 'FID', def: 'Final investment decision' },
  { term: 'COD', def: 'Commercial operation date' },
  { term: 'PPA', def: 'Power purchase agreement with PLN' },
  { term: 'SHA', def: 'Shareholder agreement' },
  { term: 'CP', def: 'Condition precedent' },
  { term: 'EPC', def: 'Engineering, procurement and construction' },
  { term: 'WBS', def: 'Work breakdown structure' },
  { term: 'FABRIX', def: 'ATLAS data and lakehouse layer' },
  { term: 'ONTRIX', def: 'ATLAS ontology and semantic layer' },
  { term: 'NEXA', def: 'ATLAS AI, agents and orchestration layer' },
  { term: 'Assistant', def: 'Answers and drafts when a person asks' },
  { term: 'Orchestration', def: 'Monitors data and deadlines, alerts and tracks actions to closure' },
]
