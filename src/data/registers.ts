import type { Action, Authority } from './types'

export const DATA_DATE_ISO = '2027-06-30'
export const WEEK_END_ISO = '2027-07-06'

export const isOverdue = (a: Action) => a.status !== 'Done' && !!a.dueIso && a.dueIso < DATA_DATE_ISO
export const isDueThisWeek = (a: Action) => a.status !== 'Done' && !!a.dueIso && a.dueIso >= DATA_DATE_ISO && a.dueIso <= WEEK_END_ISO

/** Pre-populated register (decision D11): the brief's four actions plus two earlier overdue ones. */
export const INITIAL_ACTIONS: Action[] = [
  { id: 'A-01', title: 'Issue EPC notice', owner: 'Commercial Lead', authority: 'Joint', due: '2 Jul 2027', dueIso: '2027-07-02', dueNote: 'Deadline 6 Jul', status: 'In progress', linked: 'Contractual entitlement', source: 'Steering committee' },
  { id: 'A-02', title: 'Close engineering interface', owner: 'Technical Director', authority: 'Project company', due: '2 Jul 2027', dueIso: '2027-07-02', status: 'Not started', linked: 'Boiler package', source: 'Steering committee' },
  { id: 'A-03', title: 'Obtain vendor recovery programme', owner: 'Procurement Lead', authority: 'Project company', due: '5 Jul 2027', dueIso: '2027-07-05', status: 'In progress', linked: 'Manufacturing delay', source: 'Steering committee' },
  { id: 'A-04', title: 'Update cashflow forecast', owner: 'Finance Lead', authority: 'Shareholder (Denera)', due: '5 Jul 2027', dueIso: '2027-07-05', status: 'Not started', linked: 'Funding drawdown', source: 'Steering committee' },
  { id: 'A-05', title: 'Confirm cashflow data template with project company', owner: 'Finance Lead', authority: 'Shareholder (Denera)', due: '18 Jun 2027', dueIso: '2027-06-18', status: 'Not started', linked: 'Cost feed', source: 'Earlier PMO meeting' },
  { id: 'A-06', title: 'Update permit register for P2-06', owner: 'Investment and legal lead', authority: 'Shareholder (Denera)', due: '24 Jun 2027', dueIso: '2027-06-24', status: 'Not started', linked: 'P2-06 permits', source: 'Earlier PMO meeting' },
]

export interface Notice {
  id: string
  project: string
  obligation: string
  clause: string
  doc: string
  due: string
  dueIso: string
  days: number
  owner: string
  authority: Authority
  pack: string
  badge: 'Confirmed' | 'Extracted'
  confirmedBy?: string
}

export const NOTICES: Notice[] = [
  { id: 'N1', project: 'Cakrawala', obligation: 'EPC notice of delay event', clause: 'EPC cl. 14.2', doc: 'epc-14-2', due: 'Tue 6 Jul 2027', dueIso: '2027-07-06', days: 6, owner: 'Commercial and Legal Lead', authority: 'Joint', pack: 'In progress', badge: 'Confirmed', confirmedBy: 'Commercial and Legal Lead, 29 Jun 2027' },
  { id: 'N2', project: 'Cakrawala', obligation: 'Response to contractor correspondence on interface', clause: 'EPC cl. 8.4', doc: 'epc-8-4', due: '9 Jul 2027', dueIso: '2027-07-09', days: 9, owner: 'Technical Director', authority: 'Project company', pack: 'Not started', badge: 'Extracted' },
  { id: 'N3', project: 'Cakrawala', obligation: 'PPA delay notification to PLN', clause: 'PPA cl. 6.3', doc: 'ppa-6-3', due: '30 Jul 2027', dueIso: '2027-07-30', days: 30, owner: 'Commercial and Legal Lead', authority: 'Joint', pack: 'Not started', badge: 'Extracted' },
  { id: 'N4', project: 'Cakrawala', obligation: 'Lender quarterly report', clause: 'Facility cl. 12.1', doc: 'facility-12-1', due: '15 Jul 2027', dueIso: '2027-07-15', days: 15, owner: 'Finance Lead', authority: 'Joint', pack: 'In progress', badge: 'Confirmed', confirmedBy: 'Lender liaison, 25 Jun 2027' },
  { id: 'N5', project: 'Cakrawala', obligation: 'Shareholder information request for waste supply feed', clause: 'SHA cl. 9.1', doc: 'sha-9', due: '12 Jul 2027', dueIso: '2027-07-12', days: 12, owner: 'PMO Director', authority: 'Shareholder (Denera)', pack: 'Not started', badge: 'Extracted' },
  { id: 'N6', project: 'Nusa Bahari', obligation: 'EPC notice for imported equipment delay event', clause: 'EPC cl. 14.2', doc: 'epc-14-2-nb', due: '21 Jul 2027', dueIso: '2027-07-21', days: 21, owner: 'Commercial and Legal Lead', authority: 'Joint', pack: 'Not started', badge: 'Confirmed', confirmedBy: 'Commercial and Legal Lead, 24 Jun 2027' },
  { id: 'N7', project: 'P2-06', obligation: 'Permit approval clock, two months', clause: 'Permit register', doc: 'permit-register', due: '28 Jul 2027', dueIso: '2027-07-28', days: 28, owner: 'Investment and legal lead', authority: 'Shareholder (Denera)', pack: 'n/a', badge: 'Confirmed', confirmedBy: 'Investment and legal lead, 21 Jun 2027' },
  { id: 'N8', project: 'P2-07', obligation: 'Permit approval clock, two months', clause: 'Permit register', doc: 'permit-register', due: '4 Aug 2027', dueIso: '2027-08-04', days: 35, owner: 'Investment and legal lead', authority: 'Shareholder (Denera)', pack: 'n/a', badge: 'Confirmed', confirmedBy: 'Investment and legal lead, 21 Jun 2027' },
]

export interface Feed {
  name: string
  agreed: boolean
  template?: string
  last?: string
  result?: 'Accepted' | 'Rejected'
  reasons?: string[]
}

export const FEEDS: Record<string, { project: string; required: number; clause: string; feeds: Feed[] }> = {
  cakrawala: {
    project: 'PSEL Cakrawala Raya', required: 4, clause: 'SHA cl. 9.1 to 9.3',
    feeds: [
      { name: 'Schedule and progress', agreed: true, template: 'v1.2', last: '28 Jun 2027', result: 'Accepted' },
      { name: 'Cost and commitments', agreed: true, template: 'v1.1', last: '28 Jun 2027', result: 'Accepted' },
      { name: 'Procurement, engineering transmittals and correspondence', agreed: true, template: 'v1.0', last: '25 Jun 2027', result: 'Rejected', reasons: ['Purchase order line codes missing in 14 rows', 'Date format not ISO in 6 rows'] },
      { name: 'Waste supply and regional reports', agreed: false },
    ],
  },
  nusa: {
    project: 'PSEL Nusa Bahari', required: 4, clause: 'SHA cl. 9.1 to 9.3',
    feeds: [
      { name: 'Schedule and progress', agreed: true, template: 'v1.2', last: '29 Jun 2027', result: 'Accepted' },
      { name: 'Cost and commitments', agreed: true, template: 'v1.1', last: '29 Jun 2027', result: 'Accepted' },
      { name: 'Procurement, engineering transmittals and correspondence', agreed: true, template: 'v1.0', last: '28 Jun 2027', result: 'Accepted' },
      { name: 'Waste supply and regional reports', agreed: true, template: 'v1.0', last: '27 Jun 2027', result: 'Accepted' },
    ],
  },
  sinar: {
    project: 'PSEL Sinar Lestari', required: 4, clause: 'SHA cl. 9.1 to 9.3',
    feeds: [
      { name: 'Schedule and progress', agreed: true, template: 'v1.2', last: '27 Jun 2027', result: 'Accepted' },
      { name: 'Cost and commitments', agreed: true, template: 'v1.1', last: '26 Jun 2027', result: 'Accepted' },
      { name: 'Procurement, engineering transmittals and correspondence', agreed: false },
      { name: 'Waste supply and regional reports', agreed: false },
    ],
  },
}

export const PHASE2_RIGHTS = [
  { id: 'P2-01', clause: 'Present', annex: 'Present' },
  { id: 'P2-02', clause: 'Present', annex: 'Present' },
  { id: 'P2-03', clause: 'Present', annex: 'Present' },
  { id: 'P2-04', clause: 'Present', annex: 'Present' },
  { id: 'P2-05', clause: 'Present', annex: 'Present' },
  { id: 'P2-06', clause: 'In negotiation', annex: 'Missing' },
  { id: 'P2-07', clause: 'Missing', annex: 'Missing' },
  { id: 'P2-08', clause: 'SHA not yet drafted', annex: 'SHA not yet drafted' },
]

export const DATA_DOMAINS = [
  { wave: 'W1' as const, items: ['Contracts', 'Governance', 'Permits', 'Financing'] },
  { wave: 'W2' as const, items: ['Schedule', 'Cost', 'Procurement', 'Progress', 'Engineering', 'Offtake'] },
  { wave: 'W3' as const, items: ['Waste supply', 'HSE and quality', 'Visual evidence'] },
]

export interface MeetingItem {
  id: string
  kind: 'Action' | 'Decision'
  title: string
  owner: string
  due: string
  dueIso: string | null
  authority: Authority
  linked: string
  confidence: 'High' | 'Medium' | 'Low'
  sentence: number
  note?: string
}

export const MEETING_NOTE = {
  title: 'Denera Project Steering Committee, PSEL Cakrawala Raya',
  date: 'Tuesday 29 June 2027',
  chair: 'PMO Director',
  paragraphs: [
    'The committee reviewed the boiler island package. The vendor technical submittal is now 18 days overdue and manufacturing completion has been revised to 3 August 2027. The existing actions to obtain the vendor recovery programme and close the engineering interface are in hand.',
    'Commercial asked that the EPC notice of delay event be prepared for legal review by Thursday, so the project company board can issue it before the 6 July deadline.',
    'The Technical Director agreed to convene a technical task force on the boiler feed interface, with the waste-receiving designer present.',
    'Procurement will ask the vendor for weekly manufacturing evidence until the factory acceptance test is scheduled.',
    'Finance will brief the Investment Committee chair on the Rp45 billion shareholder funding route before the board meets. The cashflow forecast update is already in hand.',
    'The recovery strategy decision was deferred to the Decision Room pending the revised recovery programme. In passing, a member noted that more site inspectors might help.',
  ],
}

export const MEETING_ITEMS: MeetingItem[] = [
  { id: 'M1', kind: 'Action', title: 'Prepare AI-draft EPC notice for legal review', owner: 'Commercial Lead', due: '1 Jul 2027', dueIso: '2027-07-01', authority: 'Joint', linked: 'Contractual entitlement', confidence: 'High', sentence: 1 },
  { id: 'M2', kind: 'Action', title: 'Convene technical task force on the boiler feed interface', owner: 'Technical Director', due: '1 Jul 2027', dueIso: '2027-07-01', authority: 'Project company', linked: 'Boiler package', confidence: 'High', sentence: 2 },
  { id: 'M3', kind: 'Action', title: 'Request weekly manufacturing evidence from the vendor', owner: 'Procurement Lead', due: '4 Jul 2027 (a Sunday)', dueIso: '2027-07-04', authority: 'Project company', linked: 'Manufacturing delay', confidence: 'Medium', sentence: 3 },
  { id: 'M4', kind: 'Action', title: 'Brief the Investment Committee chair on the Rp45 bn funding route', owner: 'Finance Lead', due: '6 Jul 2027', dueIso: '2027-07-06', authority: 'Shareholder (Denera)', linked: 'Funding drawdown', confidence: 'High', sentence: 4 },
  { id: 'M5', kind: 'Decision', title: 'Decision: Boiler island recovery strategy', owner: 'Steering committee', due: 'Deferred to Decision Room', dueIso: null, authority: 'Joint', linked: 'Boiler package', confidence: 'High', sentence: 5, note: 'Deferred pending revised recovery programme' },
  { id: 'M6', kind: 'Action', title: 'Mobilise additional site inspectors', owner: 'Unclear', due: 'No date', dueIso: null, authority: 'Project company', linked: 'Quality', confidence: 'Low', sentence: 5 },
]

export const RISKS = [
  { id: 'R-01', risk: 'Boiler island late delivery', p: 'High', i: 'High', owner: 'Procurement Lead', status: 'In progress', pkg: 'Boiler island' },
  { id: 'R-02', risk: 'Unresolved boiler and waste-receiving interface', p: 'High', i: 'High', owner: 'Technical Director', status: 'In progress', pkg: 'Boiler island' },
  { id: 'R-03', risk: 'EPC recovery programme not credible', p: 'High', i: 'High', owner: null, status: 'Not started', pkg: 'All' },
  { id: 'R-04', risk: 'FX exposure on imported equipment', p: 'Medium', i: 'High', owner: 'Finance Lead', status: 'In progress', pkg: 'All' },
  { id: 'R-05', risk: 'Port and logistics transit', p: 'Medium', i: 'Medium', owner: 'Procurement Lead', status: 'Not started', pkg: 'Boiler island' },
  { id: 'R-06', risk: 'Grid connection date unconfirmed', p: 'Medium', i: 'High', owner: null, status: 'Not started', pkg: 'Grid switchgear' },
  { id: 'R-07', risk: 'Collection fleet plan not evidenced', p: 'Medium', i: 'Medium', owner: 'Regional government liaison', status: 'In progress', pkg: 'Waste supply' },
  { id: 'R-08', risk: 'One approval at risk of delay', p: 'Low', i: 'Medium', owner: 'Permits lead', status: 'In progress', pkg: 'Utilities' },
] as const

export const CHANGE_ORDERS = [
  { id: 'CO-01', event: 'Interface redesign, waste-receiving to boiler feed', raised: '14 Jun 2027', cost: 'Rp11 bn', schedule: 'plus 10 days', status: 'Under assessment', route: 'Joint' as Authority },
  { id: 'CO-02', event: 'Alternative logistics routing', raised: '26 Jun 2027', cost: 'Rp12 bn', schedule: 'minus 14 days if approved', status: 'Draft', route: 'Project company' as Authority },
  { id: 'CO-03', event: 'Extended preliminaries', raised: '28 Jun 2027', cost: 'Rp14 bn', schedule: 'None', status: 'Raised', route: 'Project company' as Authority },
]

export const BUNDLE: { n: number; text: string; authority: Authority; owner: string; due: string; dueIso: string; links?: string; evidence: string }[] = [
  { n: 1, text: 'Request the project company board to issue formal notice to the EPC contractor by 5 PM Friday 2 July 2027.', authority: 'Joint', owner: 'Commercial Lead', due: '2 Jul 2027', dueIso: '2027-07-02', links: 'A-01', evidence: 'epc-14-2' },
  { n: 2, text: 'Require a revised recovery programme within three working days.', authority: 'Project company', owner: 'Project Director', due: '5 Jul 2027', dueIso: '2027-07-05', evidence: 'epc-schedule' },
  { n: 3, text: 'Approve a technical task force to close the interface decision within 48 hours.', authority: 'Project company', owner: 'Technical Director', due: '2 Jul 2027', dueIso: '2027-07-02', links: 'A-02', evidence: 'review-comment' },
  { n: 4, text: 'Request the vendor factory recovery plan and weekly manufacturing evidence.', authority: 'Project company', owner: 'Procurement Lead', due: '5 Jul 2027', dueIso: '2027-07-05', links: 'A-03', evidence: 'vendor-email' },
  { n: 5, text: 'Assess the alternative logistics route and cost-sharing position.', authority: 'Joint', owner: 'Procurement Lead', due: '6 Jul 2027', dueIso: '2027-07-06', evidence: 'logistics-note' },
  { n: 6, text: 'Escalate to the Denera Project Steering Committee and, if needed, the Investment Committee.', authority: 'Shareholder (Denera)', owner: 'PMO Director', due: '6 Jul 2027', dueIso: '2027-07-06', evidence: 'steering-minute' },
]
