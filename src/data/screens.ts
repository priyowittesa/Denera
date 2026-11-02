import type { Wave } from './types'

export interface ScreenMeta {
  n: number
  path: string
  title: string
  short: string
  group: 'leading' | 'enabling' | 'platform'
  uc: string
  waves: Wave[]
  waveNote?: string
  tier?: string
  leading?: boolean
  dataNeeded: { sources: string[]; owner: string }
  hiddenForPcu?: boolean
}

export const SCREENS: ScreenMeta[] = [
  { n: 1, path: '/portfolio', title: 'Portfolio Command Centre', short: 'Portfolio', group: 'leading', uc: 'UC01', waves: ['W1', 'W2'], waveNote: 'Wave 1 light status from the weekly template; computed health in Wave 2', tier: 'Tier 1', leading: true, hiddenForPcu: true, dataNeeded: { sources: ['Weekly status template from each project company', 'Milestones, permit and agreement status', 'Procurement status and cost summary'], owner: 'Project companies via PMO Director' } },
  { n: 8, path: '/cockpit', title: 'Project Assurance Cockpit', short: 'Cockpit', group: 'leading', uc: 'UC01 · UC12', waves: ['W2', 'W3'], tier: 'UC01 Tier 1 · UC12 Tier 2', leading: true, dataNeeded: { sources: ['Schedule, cost and procurement signals', 'Permit and obligation signals'], owner: 'Project company (PSEL Cakrawala Raya)' } },
  { n: 9, path: '/progress', title: 'Progress, S-curve and Earned Value', short: 'Progress and S-curve', group: 'leading', uc: 'UC08 · UC09', waves: ['W2'], tier: 'Tier 1', leading: true, dataNeeded: { sources: ['Schedule baseline and updates (P6 or equivalent)', 'Quantities and inspection records', 'Cost actuals and site photos', 'Shared WBS and progress rules agreed with partners'], owner: 'Project company, EPC contractor' } },
  { n: 10, path: '/critical-path', title: 'Critical Path and Root Cause', short: 'Critical path', group: 'leading', uc: 'UC10 · UC11 · UC12', waves: ['W2', 'W3'], tier: 'Tier 2', leading: true, dataNeeded: { sources: ['Schedule files with logic', 'Constraint logs', 'Transmittal logs and correspondence'], owner: 'Project company, EPC contractor' } },
  { n: 11, path: '/procurement', title: 'Long-lead Procurement Control Tower', short: 'Procurement', group: 'leading', uc: 'UC07', waves: ['W2'], tier: 'Tier 1', leading: true, dataNeeded: { sources: ['Purchase order status', 'Manufacturing milestones and inspections', 'Technical document approvals', 'Shipping and customs'], owner: 'Project company, vendors via EPC' } },
  { n: 12, path: '/cost', title: 'Cost, Cashflow and Investment Protection', short: 'Cost and investment', group: 'leading', uc: 'UC09', waves: ['W2'], tier: 'Tier 1', leading: true, dataNeeded: { sources: ['Budget, commitments, invoices', 'Change orders and FX rates', 'Cashflow plan; cost code mapping per project company'], owner: 'Project company finance' } },
  { n: 2, path: '/gates', title: 'Pre-investment Gate Readiness', short: 'Pre-investment gates', group: 'enabling', uc: 'UC02', waves: ['W1'], tier: 'Tier 1', hiddenForPcu: true, dataNeeded: { sources: ['Gate checklist per project', 'Permit register and agreement status', 'Lender conditions'], owner: 'Investment and legal lead' } },
  { n: 3, path: '/notices', title: 'Notice and Obligation Calendar', short: 'Notices and obligations', group: 'enabling', uc: 'UC03', waves: ['W1'], tier: 'Tier 1', dataNeeded: { sources: ['Executed agreements (EPC, PPA, SHA, facility)', 'Correspondence and event logs'], owner: 'Commercial and Legal Lead' } },
  { n: 4, path: '/partner-data', title: 'Partner Data and Information Rights', short: 'Partner data and rights', group: 'enabling', uc: 'E1', waves: ['W1'], tier: 'Tier 1 (enabler)', dataNeeded: { sources: ['Shareholder agreement clauses and data annex', 'Agreed data templates v1'], owner: 'PMO, legal, partner representatives' } },
  { n: 5, path: '/meetings', title: 'Meeting, Decision and Action Capture', short: 'Meetings and actions', group: 'enabling', uc: 'UC06', waves: ['W1'], tier: 'Tier 2', dataNeeded: { sources: ['Meeting notes', 'Action register'], owner: 'PMO Director as chair' } },
  { n: 6, path: '/ask', title: 'Ask ATLAS', short: 'Ask ATLAS', group: 'enabling', uc: 'UC05', waves: ['W1', 'W2'], waveNote: 'Documents in Wave 1; governed tables in Wave 2', tier: 'Tier 2', dataNeeded: { sources: ['Indexed documents with permissions', 'Governed tables'], owner: 'PMO' } },
  { n: 7, path: '/packs', title: 'Weekly PMO, Committee, Sponsor and Lender Pack', short: 'Governance packs', group: 'enabling', uc: 'UC04', waves: ['W1'], tier: 'Tier 1', dataNeeded: { sources: ['Portfolio health, gate status and notices', 'Cost summary', 'Lender reporting templates'], owner: 'PMO lead, finance' } },
  { n: 13, path: '/decisions', title: 'Decision Room: Risk, Change and Claims', short: 'Decision room', group: 'platform', uc: 'UC12 · UC03 · UC06', waves: ['W2', 'W3'], tier: 'UC03 Tier 1 · UC12, UC06 Tier 2', dataNeeded: { sources: ['Risk and action registers', 'Change events and correspondence', 'Contract terms'], owner: 'PMO, Commercial and Legal' } },
  { n: 14, path: '/orchestration', title: 'Orchestration Console', short: 'Orchestration Console', group: 'platform', uc: 'View of E1, UC01 to UC12', waves: [], dataNeeded: { sources: ['Outputs of the jobs on this screen'], owner: 'ATLAS platform' } },
]

export const screenByPath = (p: string) => SCREENS.find((s) => s.path === p)

export const GROUPS: { id: ScreenMeta['group']; label: string }[] = [
  { id: 'leading', label: 'Delivery' },
  { id: 'enabling', label: 'Governance' },
  { id: 'platform', label: 'Decisions and automation' },
]
