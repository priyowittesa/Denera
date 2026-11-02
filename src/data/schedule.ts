export const SCHEDULE_QUALITY = { rating: 'Amber', logic: 88, openEnds: 41, negativeFloat: 23 }

export const CHAIN = [
  { id: 's1', title: 'Late vendor technical submittal', date: 'Due 12 Jun 2027, 18 days overdue', status: 'Red' as const, evidence: ['e1'] },
  { id: 's2', title: 'Delayed engineering approval', date: 'Review comment open since 19 Jun', status: 'Red' as const, evidence: ['e2'] },
  { id: 's3', title: 'Manufacturing release delayed', date: 'Completion revised 12 Jul to 3 Aug 2027', status: 'Red' as const, evidence: ['e3'] },
  { id: 's4', title: 'Shipment window missed', date: 'Booking not confirmed', status: 'Yellow' as const, evidence: ['e3', 'e4'] },
  { id: 's5', title: 'Equipment arrival delayed', date: 'Forecast 25 Sep vs required 14 Aug 2027', status: 'Red' as const, evidence: ['e4'] },
  { id: 's6', title: 'Installation start delayed', date: 'No recovery logic in EPC update', status: 'Yellow' as const, evidence: ['e5'] },
  { id: 's7', title: 'Mechanical completion delayed', date: 'Contractor correspondence awaits decision', status: 'Yellow' as const, evidence: ['e6'] },
  { id: 's8', title: 'Commissioning and COD exposure', date: 'COD 11 Aug 2028, plus 42 days', status: 'Red' as const, evidence: ['e7'] },
]

export const SCHEDULE_EVIDENCE = [
  { id: 'e1', title: 'Technical submittal overdue by 18 days at the data date', doc: 'transmittal-boiler' },
  { id: 'e2', title: 'Engineering review comment unresolved', doc: 'review-comment' },
  { id: 'e3', title: 'Vendor manufacturing completion revised from 12 July to 3 August 2027; shipment booking not yet confirmed', doc: 'vendor-email' },
  { id: 'e4', title: 'Port and logistics transit risk elevated', doc: 'logistics-note' },
  { id: 'e5', title: 'EPC schedule update has no credible recovery logic', doc: 'epc-schedule' },
  { id: 'e6', title: 'Contractor correspondence requires a decision', doc: 'contractor-letter' },
  { id: 'e7', title: 'Contractual notice or response deadline 6 July 2027', doc: 'epc-14-2', link: '/notices' },
]

export const EXPLANATION =
  'The package delay is not solely a supplier problem. The late release originated from an unresolved engineering interface between the waste-receiving system and the boiler feed arrangement. The current recovery programme does not include parallel pre-assembly or alternate logistics routing.'

export const LOOK_AHEAD = [
  { activity: 'Waste receiving crane shipping booking', constraint: 'Shipment slot', owner: 'Procurement Lead', float: 2, evidence: 'vendor-email', steps: ['s4'] },
  { activity: 'Boiler feed arrangement interface freeze', constraint: 'Design approval', owner: 'Technical Director', float: 0, evidence: 'review-comment', steps: ['s2', 's3'] },
  { activity: 'Boiler island foundations final inspection', constraint: 'Access', owner: 'Site manager', float: 6, evidence: 'epc-schedule', steps: ['s6'] },
  { activity: 'Structural steel erection bay 3', constraint: 'Labour', owner: 'EPC contractor', float: 4, evidence: 'epc-schedule', steps: [] },
  { activity: 'Flue-gas treatment fabrication verification', constraint: 'Material', owner: 'Procurement Lead', float: 3, evidence: 'logistics-note', steps: [] },
  { activity: 'Grid switchgear delivery date confirmation', constraint: 'Vendor confirmation', owner: 'Project Director', float: null, evidence: 'contractor-letter', steps: [] },
  { activity: 'Utilities and water treatment tie-in', constraint: 'Permit amendment', owner: 'Permits lead', float: 9, evidence: 'epc-schedule', steps: [] },
  { activity: 'Turbine hall roof cladding', constraint: 'Material', owner: 'EPC contractor', float: 11, evidence: 'epc-schedule', steps: [] },
]

export const CORRESPONDENCE = [
  { date: '12 Jun 2027', who: 'Vendor A', what: 'Technical submittal for boiler feed arrangement issued late', kind: 'Transmittal' },
  { date: '19 Jun 2027', who: 'Owner engineer', what: 'Review comment on waste-receiving to boiler feed interface, still open', kind: 'Review comment' },
  { date: '28 Jun 2027', who: 'Vendor A', what: 'Manufacturing completion revised to 3 Aug 2027', kind: 'Email' },
  { date: '29 Jun 2027', who: 'Steering committee', what: 'Minute: prepare EPC notice, convene technical task force', kind: 'Meeting minute' },
]
