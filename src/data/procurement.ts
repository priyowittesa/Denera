import type { Authority, Health } from './types'

export type DateBasis = 'ATLAS-estimated' | 'Vendor-reported' | 'Not available'

export interface Package {
  id: string
  name: string
  vendor: string
  required: string
  forecast: string
  basis: DateBasis
  effect: string
  effectDays: number | null
  float: string
  risk: Health
  action: string
  authority: Authority | null
}

export const PACKAGES: Package[] = [
  { id: 'boiler', name: 'Boiler island', vendor: 'Vendor A', required: '14 Aug 2027', forecast: '25 Sep 2027', basis: 'ATLAS-estimated', effect: '42 days', effectDays: 42, float: 'Minus 42 days', risk: 'Red', action: 'Executive escalation', authority: 'Shareholder (Denera)' },
  { id: 'crane', name: 'Waste receiving crane', vendor: 'Vendor B', required: '2 Jul 2027', forecast: '11 Jul 2027', basis: 'Vendor-reported', effect: '9 days', effectDays: 9, float: 'Minus 9 days', risk: 'Yellow', action: 'Expedite shipping', authority: 'Project company' },
  { id: 'turbine', name: 'Turbine-generator', vendor: 'Vendor C', required: '6 Oct 2027', forecast: '6 Oct 2027', basis: 'Vendor-reported', effect: 'None', effectDays: 0, float: '0 days', risk: 'Green', action: 'Monitor', authority: null },
  { id: 'fgt', name: 'Flue-gas treatment', vendor: 'Vendor D', required: '18 Sep 2027', forecast: '5 Oct 2027', basis: 'Vendor-reported', effect: '17 days', effectDays: 17, float: 'Minus 17 days', risk: 'Yellow', action: 'Verify fabrication', authority: 'Project company' },
  { id: 'switchgear', name: 'Grid switchgear', vendor: 'Vendor E', required: '22 Nov 2027', forecast: 'To be confirmed', basis: 'Not available', effect: 'Unknown', effectDays: null, float: 'Unknown', risk: 'Yellow', action: 'Confirm interface and delivery', authority: 'Project company' },
]

export const BOILER_DETAIL: [string, string][] = [
  ['Purchase order status', 'Issued 3 Sep 2026'],
  ['Manufacturing progress', '58%'],
  ['Factory acceptance test readiness', 'Not yet scheduled'],
  ['Inspection status', '2 of 5 stage inspections passed'],
  ['Technical-document approval', 'Overdue 18 days'],
  ['Incoterms', 'FOB origin port'],
  ['Shipment route', 'Origin port to Indonesian port to site by road'],
  ['Port and customs status', 'Pre-clearance not started'],
  ['Site readiness', 'Foundations 70% complete'],
  ['Linked WBS activities', 'Boiler island, Waste receiving system'],
  ['Linked cashflow exposure', 'Rp120 bn open commitment'],
  ['Contractual responsibilities', 'EPC contractor responsible for vendor performance'],
  ['Latest supplier communication', 'Vendor A email, 28 Jun 2027: manufacturing completion revised to 3 Aug 2027.'],
]
