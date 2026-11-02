import type { Authority, Classification, Confidence } from './types'

export interface Answer {
  id: string
  q: string
  wave: 'W1' | 'W2' | 'W3'
  kind?: 'full' | 'refusal' | 'permission' | 'oos' | 'text'
  label?: string
  direct: string
  figures?: string
  confidence?: Confidence
  rootCause?: string
  impact?: { delivery: string; capex: string; commercial: string }
  actions?: { text: string; authority: Authority }[]
  sources?: { label: string; doc?: string }[]
  classification?: Classification | string
  followups?: string[]
  table?: boolean
}

export const ANSWERS: Record<string, Answer> = {
  'A-01': {
    id: 'A-01', wave: 'W1', q: 'Which notices or contractual deadlines are due this week?',
    direct: 'One confirmed deadline falls within seven days: the EPC notice of delay event for PSEL Cakrawala Raya, due Tuesday 6 July 2027. Two more deadlines in the next 12 days were extracted by ATLAS and still need confirmation.',
    figures: '1 confirmed (6 days remaining); 2 extracted, due 9 Jul and 12 Jul.', confidence: 'High',
    rootCause: 'The notice follows the delay event on the boiler island package.',
    impact: { delivery: 'Protects entitlement against a 42-day COD exposure', capex: 'Protects the claims and variation position (Rp6 bn)', commercial: 'Notice window closes 6 July' },
    actions: [{ text: 'Request the project company board to issue the EPC notice by 5 PM Friday 2 July', authority: 'Joint' }, { text: 'Confirm or reject the two extracted deadlines', authority: 'Shareholder (Denera)' }],
    sources: [{ label: 'EPC contract cl. 14.2', doc: 'epc-14-2' }, { label: 'Obligation register' }], classification: 'Confirmed and Extracted',
    followups: ['A-06'],
  },
  'A-02': {
    id: 'A-02', wave: 'W1', q: 'What did the partner commit to in the shareholder agreement on information rights?',
    direct: 'The shareholder agreement gives Denera information and audit rights in clauses 9.1 to 9.3, including delivery of agreed data templates. Three of the four required data feeds for PSEL Cakrawala Raya have been agreed so far.',
    figures: 'Clause 9.1 periodic project reports; 9.2 audit and inspection; 9.3 data templates and annex. Feeds agreed 3 of 4.', confidence: 'Medium',
    rootCause: 'The waste supply and regional reports feed has no agreed template.',
    impact: { delivery: 'Waste supply status cannot be computed', capex: 'None directly', commercial: "Denera's visibility depends on this right" },
    actions: [{ text: 'Request the project company to provide the missing feed', authority: 'Shareholder (Denera)' }],
    sources: [{ label: 'Shareholder agreement cl. 9.1 to 9.3', doc: 'sha-9' }, { label: 'Feed register' }], classification: 'Extracted',
    followups: [],
  },
  'A-03': {
    id: 'A-03', wave: 'W1', q: 'Which pre-investment projects can reach final investment decision by 30 September 2027?',
    direct: 'Three: P2-01, P2-02 and P2-03 have all gates before FID met and FID targets on or before 30 September 2027. P2-02 and P2-03 have no float.',
    figures: 'P2-01 FID 15 Sep 2027; P2-02 and P2-03 30 Sep 2027. Five projects hold a FLOA; P2-04 (31 Oct) and P2-05 (30 Nov) fall after 30 Sep.', confidence: 'Medium',
    rootCause: 'P2-06 and P2-07 have a permit dependency that puts FID at risk by three weeks; P2-08 is at an early gate.',
    impact: { delivery: 'Three FIDs inside the quarter', capex: 'Funding calls follow FID', commercial: 'SHAs for P2-06 and P2-07 not yet complete' },
    actions: [{ text: 'Escalate the permit dependency on P2-06 and P2-07', authority: 'Shareholder (Denera)' }, { text: 'Confirm the evidence for P2-08 basic engineering design', authority: 'Shareholder (Denera)' }],
    sources: [{ label: 'Gate checklists', doc: 'gate-checklist' }, { label: 'Permit register', doc: 'permit-register' }], classification: 'Forecast, Advisory',
    followups: [],
  },
  'A-04': {
    id: 'A-04', wave: 'W1', label: 'AI draft, to be reviewed by the PMO lead', q: 'Draft a management brief for the Denera Steering Committee.',
    direct: 'PSEL Cakrawala Raya is Yellow with escalation required. Without action this week, COD exposure rises from 42 to 64 days and the status becomes Red.',
    figures: 'Verified progress 39% against 46% planned; management EAC Rp2,910 bn (3.9% above approved CAPEX); data confidence 91%.', confidence: 'High',
    rootCause: 'The late boiler island and waste-receiving package, an unresolved technical interface and a recovery programme that is not yet credible.',
    impact: { delivery: '42 days', capex: 'Rp110 bn overrun, of which Rp45 bn needs shareholder funding approval', commercial: 'Notice due 6 July 2027' },
    actions: [{ text: 'Approve the Boiler Island Recovery Strategy (six actions, two Joint)', authority: 'Joint' }, { text: 'Approve the Rp45 bn shareholder funding route', authority: 'Shareholder (Denera)' }],
    sources: [{ label: 'Cockpit' }, { label: 'Cost summary', doc: 'cost-report' }, { label: 'Notice calendar', doc: 'epc-14-2' }], classification: 'Advisory',
    followups: ['A-14'],
  },
  'A-05': {
    id: 'A-05', wave: 'W2', q: 'Why is the project behind plan?',
    direct: 'Verified progress is 39% against 46% planned, 7.0 points behind. Earlier the gap came from structural steel productivity; it now comes from the late waste-receiving and boiler island package.',
    figures: 'Reported 42%, verified 39%, planned 46%; structural steel reported 58% against verified 52%.', confidence: 'High',
    rootCause: 'An unresolved engineering interface delayed the boiler submittal approval and manufacturing release.',
    impact: { delivery: '42 days', capex: 'Rp110 bn forecast overrun', commercial: 'Notice due 6 July' },
    actions: [{ text: 'Approve the six-action recovery bundle in the Decision room', authority: 'Joint' }],
    sources: [{ label: 'Schedule update 28 Jun', doc: 'epc-schedule' }, { label: 'Inspection records', doc: 'inspection-records' }, { label: 'Transmittal log', doc: 'transmittal-boiler' }], classification: 'Verified and Forecast',
    followups: ['A-07', 'A-08'],
  },
  'A-06': {
    id: 'A-06', wave: 'W1', q: 'What does the EPC contract say about the notice period for delay events?',
    direct: 'EPC cl. 14.2 requires written notice of a delay event within 28 days of the event first becoming apparent. For the boiler submittal slip, the clock started on 8 June 2027, so notice is due Tuesday 6 July 2027.',
    figures: '28 days; start 8 Jun 2027; due 6 Jul 2027.', confidence: 'Medium',
    rootCause: 'Late vendor technical submittal.',
    impact: { delivery: 'Protects an extension-of-time claim', capex: 'Protects the claims position', commercial: 'Missing the deadline could weaken an extension-of-time claim' },
    actions: [{ text: 'Draft the notice for legal review (AI draft, lawyer sends)', authority: 'Joint' }, { text: 'Request the project company board to issue it', authority: 'Joint' }],
    sources: [{ label: 'EPC contract cl. 14.2', doc: 'epc-14-2' }], classification: 'Confirmed',
    followups: [],
  },
  'A-07': {
    id: 'A-07', wave: 'W2', q: 'Which three issues can delay COD?',
    direct: 'The boiler island delivery (42 days), the unresolved boiler and waste-receiving interface, and an EPC recovery programme that is not yet credible.',
    figures: 'Boiler island float minus 42 days; eleven overdue technical submittals; recovery programme lacks parallel pre-assembly and alternate logistics.', confidence: 'Medium',
    rootCause: 'The interface decision is the origin of the other two.',
    impact: { delivery: '42 to 64 days', capex: 'Rp110 bn', commercial: 'Notice due 6 July' },
    actions: [{ text: 'Technical task force to close the interface in 48 hours', authority: 'Project company' }, { text: 'Require revised recovery programme in three working days', authority: 'Project company' }],
    sources: [{ label: 'Critical path', doc: 'review-comment' }, { label: 'Procurement tower', doc: 'vendor-email' }], classification: 'Forecast',
    followups: ['A-11'],
  },
  'A-08': {
    id: 'A-08', wave: 'W2', q: 'Is EPC contractor progress supported by evidence?',
    direct: 'Partly. The contractor reports 42% against ATLAS-verified 39%; one subcontractor shows a gap of 5 points or more.',
    figures: 'Structural steel reported 58%, verified 52% (flagged). Civil 74% against 72%; mechanical erection 20% against 16%.', confidence: 'Medium',
    rootCause: 'Reported figures count installed quantities not yet inspected.',
    impact: { delivery: 'Forecast relies on verified progress', capex: 'Payments tied to reported progress may be ahead of value', commercial: 'Supports a challenge to the progress claim' },
    actions: [{ text: 'Challenge the structural steel update and request inspection records', authority: 'Project company' }],
    sources: [{ label: 'Inspection records', doc: 'inspection-records' }, { label: 'Quantity reports', doc: 'epc-schedule' }], classification: 'Reported and Verified',
    followups: ['A-12'],
  },
  'A-09': {
    id: 'A-09', wave: 'W2', q: 'Show all packages that can delay COD by more than 14 days.',
    direct: 'Two packages: the boiler island (42 days) and flue-gas treatment (17 days).',
    figures: 'Boiler island required 14 Aug 2027, forecast 25 Sep 2027, ATLAS-estimated; flue-gas treatment required 18 Sep, forecast 5 Oct, vendor-reported. Waste receiving crane is 9 days; grid switchgear date unknown.', confidence: 'Medium',
    rootCause: 'Delayed manufacturing release (boiler); fabrication not verified (flue-gas).',
    impact: { delivery: 'Boiler island drives the 42-day exposure', capex: 'Rp120 bn open commitment on the boiler island', commercial: 'Contractor responsible for vendor performance' },
    actions: [{ text: 'Executive escalation of the boiler island', authority: 'Shareholder (Denera)' }, { text: 'Verify flue-gas fabrication', authority: 'Project company' }],
    sources: [{ label: 'Procurement tower', doc: 'vendor-email' }], classification: 'Forecast',
    followups: ['A-13'],
  },
  'A-10': {
    id: 'A-10', wave: 'W2', q: 'Show CAPEX variance by package.',
    direct: 'The Rp110 bn forecast overrun is concentrated in the boiler island (Rp47 bn) and waste receiving system (Rp28 bn).',
    figures: "Boiler island 47; waste receiving 28; owner's cost 15; balance of plant 6; grid 5; turbine-generator 4; civil 3; utilities 2. Total Rp110 bn.", confidence: 'Medium',
    rootCause: 'Acceleration, freight, extended preliminaries and interface rework.',
    impact: { delivery: 'None directly', capex: 'Rp65 bn from contingency, Rp45 bn needs shareholder funding', commercial: 'Claims position Rp6 bn' },
    actions: [{ text: 'Update the cashflow forecast (Finance Lead)', authority: 'Shareholder (Denera)' }],
    sources: [{ label: 'Cost model', doc: 'cost-report' }], classification: 'Forecast',
    followups: [],
  },
  'A-11': {
    id: 'A-11', wave: 'W2', q: 'Summarise unresolved engineering interfaces.',
    direct: 'Three interfaces are unresolved; the boiler feed and waste-receiving interface is critical.',
    figures: 'Eleven overdue technical submittals; interface conflict awaiting owner confirmation; grid switchgear interface and delivery to be confirmed; access and utility interfaces unresolved.', confidence: 'Medium',
    rootCause: 'Design approvals not closed by the technology provider and EPC contractor.',
    impact: { delivery: 'Drives boiler release', capex: 'Rp11 bn interface rework', commercial: 'Change order CO-01 under assessment' },
    actions: [{ text: 'Confirm the interface conflict (Technical Director)', authority: 'Project company' }, { text: 'Technical task force', authority: 'Project company' }],
    sources: [{ label: 'Transmittal log', doc: 'transmittal-boiler' }, { label: 'Correspondence chain', doc: 'contractor-letter' }], classification: 'Forecast',
    followups: [],
  },
  'A-12': {
    id: 'A-12', wave: 'W2', q: 'Which data points must be validated before approving the next EPC payment?',
    direct: 'Six data points: verified progress against the claim, invoice-to-order match, recoverability of vendor advances, inspection records for claimed work, open interface rework, and liquidated damages exposure.',
    figures: 'Advances to vendors Rp52 bn; structural steel gap 6 points; 11 overdue submittals.', confidence: 'Medium',
    rootCause: 'Reported progress runs ahead of verified progress.',
    impact: { delivery: 'None directly', capex: 'Cash paid Rp1,190 bn against cost incurred Rp1,138 bn', commercial: 'Leverage on the recovery programme' },
    actions: [{ text: 'Request validation before payment through the board nominee', authority: 'Joint' }],
    sources: [{ label: 'Cost actuals', doc: 'cost-report' }, { label: 'Inspection records', doc: 'inspection-records' }], classification: 'Verified',
    followups: ['A-08'],
  },
  'A-13': {
    id: 'A-13', wave: 'W3', q: 'What is the impact if the boiler package slips another 30 days?',
    direct: 'COD exposure would reach about 72 days, above the 60-day line, so the overall status would be Red. ATLAS will not quote a cost for that case until acceleration and preliminaries rates are loaded.',
    figures: '42 plus 30 = 72 days. Revenue deferred about USD 9.8 m (Rp162 bn); Denera 30% share about Rp49 bn.', confidence: 'Low',
    rootCause: 'Further manufacturing or shipment slippage.',
    impact: { delivery: '72 days', capex: 'No-intervention already leaves Rp19 bn (11%) against the Rp17.6 bn alert', commercial: 'Depends on PPA delay and deemed-commissioning terms' },
    actions: [{ text: 'Decide the recovery strategy this week', authority: 'Joint' }],
    sources: [{ label: 'Scenario model' }, { label: 'Delay-revenue calculator' }], classification: 'Advisory',
    followups: [],
  },
  'A-14': {
    id: 'A-14', wave: 'W1', kind: 'text', label: 'AI draft, awaiting reviewer approval', q: 'Simplify the narrative',
    direct: 'PSEL Cakrawala Raya is Yellow and heading for Red. The boiler island package is six weeks late and the recovery plan is not yet credible. We need a decision this week to protect the 6 July notice and keep COD exposure below 60 days.',
  },
  'A-15': {
    id: 'A-15', wave: 'W1', kind: 'oos', q: '',
    direct: 'I can only answer the questions in this demonstration. Try one of the suggested questions, or ask about notices, gates, progress, packages, cost or decisions for PSEL Cakrawala Raya.',
  },
  'A-16': {
    id: 'A-16', wave: 'W3', kind: 'full', table: true, label: 'AI draft', q: 'Prepare a recovery-action tracker for the weekly PMO meeting.',
    direct: 'Here is the tracker: the six bundle actions and the existing register actions with owner, due date, authority and status. Two actions are Joint and need a project company board decision.',
    sources: [{ label: 'Decision room', doc: 'steering-minute' }], classification: 'Advisory', confidence: 'High',
    actions: [{ text: 'Propose all as actions', authority: 'Joint' }],
  },
  'A-17': {
    id: 'A-17', wave: 'W1', kind: 'refusal', q: 'What is the average calorific value of the waste that will be delivered to this project?',
    direct: 'I cannot answer this reliably. No waste characterisation or laboratory data has been loaded for this project. The only figure on file is a design assumption in the feasibility study, which is not measured data. I can raise a data request to the project company, or show the design assumption with its source and confidence level. Which would you like?',
  },
  'A-18': {
    id: 'A-18', wave: 'W1', kind: 'permission', q: '',
    direct: 'I cannot answer that for your role. Portfolio and shareholder funding information is visible only to Denera. I can answer questions about PSEL Cakrawala Raya delivery, schedule and procurement.',
  },
}

export const ASK_CARDS: { wave: 'W1' | 'W2' | 'W3'; ids: string[] }[] = [
  { wave: 'W1', ids: ['A-01', 'A-02', 'A-03', 'A-04'] },
  { wave: 'W2', ids: ['A-05', 'A-07', 'A-09', 'A-08', 'A-10', 'A-11', 'A-12'] },
  { wave: 'W3', ids: ['A-13', 'A-16'] },
]

export const SUGGESTIONS: Record<string, string[]> = {
  '/portfolio': ['A-01', 'A-03', 'A-17'],
  '/gates': ['A-03', 'A-17'],
  '/notices': ['A-01', 'A-06'],
  '/partner-data': ['A-02', 'A-17'],
  '/meetings': ['A-04'],
  '/ask': ['A-05', 'A-07', 'A-17'],
  '/packs': ['A-04', 'A-14'],
  '/cockpit': ['A-05', 'A-07', 'A-17'],
  '/progress': ['A-05', 'A-10', 'A-13'],
  '/critical-path': ['A-07', 'A-11'],
  '/procurement': ['A-09', 'A-13'],
  '/cost': ['A-10', 'A-12', 'A-13'],
  '/decisions': ['A-16', 'A-12'],
  '/orchestration': ['A-08', 'A-17'],
}

const DENERA_ONLY = /portfolio|shareholder funding|funding|investment committee|denera share|all projects|phase ii|pre-investment/i

/** Match free text to an answer. */
export function matchQuestion(text: string, isPcu: boolean): string {
  const t = text.toLowerCase().trim()
  if (isPcu && DENERA_ONLY.test(t)) return 'A-18'
  if (/calorific|heating value|lhv/.test(t)) return 'A-17'
  const exact = Object.values(ANSWERS).find((a) => a.q && a.q.toLowerCase().replace(/[?.]/g, '') === t.replace(/[?.]/g, ''))
  if (exact) return exact.id
  const rules: [RegExp, string][] = [
    [/notice|deadline/, 'A-01'],
    [/information right|shareholder agreement/, 'A-02'],
    [/fid|final investment/, 'A-03'],
    [/brief|steering/, 'A-04'],
    [/behind plan|why.*behind|late/, 'A-05'],
    [/three issues|delay cod|cod/, 'A-07'],
    [/evidence|contractor progress|supported/, 'A-08'],
    [/package|14 days|long-lead|procurement/, 'A-09'],
    [/variance|capex|overrun/, 'A-10'],
    [/interface/, 'A-11'],
    [/payment/, 'A-12'],
    [/slip|30 days/, 'A-13'],
    [/tracker|recovery-action/, 'A-16'],
  ]
  for (const [re, id] of rules) {
    if (re.test(t)) {
      if (isPcu && (id === 'A-03' || id === 'A-04')) return 'A-18'
      return id
    }
  }
  return 'A-15'
}
