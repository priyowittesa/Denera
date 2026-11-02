export type RunState = 'Completed' | 'Completed with exceptions' | 'Waiting for human' | 'Blocked'
export type Lane = 'Connect' | 'Identify' | 'Explain' | 'Act and track'

export interface Run {
  id: string
  job: string
  uc: string
  mode: 'Orchestration' | 'Assistant'
  lane: Lane
  trigger: string
  sources: string
  state: RunState
  waiting: string
  output: string
  to: string
  denaraOnly?: boolean
  trace?: { inputs: string[]; method: string; result: string; confidence: string; gate: string }
}

export const RUNS: Run[] = [
  { id: 'R1', job: 'Feed validation', uc: 'E1', mode: 'Orchestration', lane: 'Connect', trigger: 'Submissions received 28 Jun', sources: '3 partner feeds', state: 'Completed with exceptions', waiting: 'n/a', output: 'Screen 4', to: '/partner-data', trace: { inputs: ['Schedule and progress v1.2, 28 Jun', 'Cost and commitments v1.1, 28 Jun', 'Procurement and correspondence v1.0, 25 Jun'], method: 'Schema check against agreed templates; reject with reasons', result: '2 accepted, 1 rejected (PO line codes missing in 14 rows; date format in 6 rows)', confidence: 'High', gate: 'None' } },
  { id: 'R2', job: 'Deadline and clause extraction', uc: 'UC03', mode: 'Orchestration', lane: 'Identify', trigger: 'New contract documents', sources: 'EPC contract, PPA, SHA', state: 'Waiting for human', waiting: 'Commercial and Legal Lead (3 deadlines)', output: 'Screen 3', to: '/notices', trace: { inputs: ['EPC contract', 'PPA', 'Shareholder agreement'], method: 'Clause classification and date extraction', result: '3 deadlines extracted: EPC cl. 8.4, PPA cl. 6.3, SHA cl. 9.1', confidence: 'Medium', gate: 'Commercial and Legal Lead confirms before alerts rely on them' } },
  { id: 'R3', job: 'Gate evidence check', uc: 'UC02', mode: 'Orchestration', lane: 'Identify', trigger: 'Weekly', sources: 'Gate checklists, permit register', state: 'Waiting for human', waiting: 'Investment and legal lead (1 condition)', output: 'Screen 2', to: '/gates', denaraOnly: true, trace: { inputs: ['Gate checklists P2-01 to P2-08', 'Permit register'], method: 'Match evidence documents to gate conditions', result: 'P2-08 basic engineering design: evidence linked, awaiting confirmation', confidence: 'High', gate: 'Investment and legal lead confirms' } },
  { id: 'R4', job: 'Progress verification', uc: 'UC08', mode: 'Orchestration', lane: 'Identify', trigger: 'Schedule update 28 Jun', sources: 'Schedule, quantities, inspections, cost actuals', state: 'Completed', waiting: 'n/a', output: 'Screen 9', to: '/progress', trace: { inputs: ['Schedule file, 28 Jun', 'Quantity reports', 'Inspection records', 'Cost actuals'], method: 'Compare reported progress with evidence-based progress by discipline weight', result: 'Verified 39% against reported 42%; structural steel flagged (58 vs 52)', confidence: '91% data confidence', gate: 'No human gate' } },
  { id: 'R5', job: 'Health computation', uc: 'UC01', mode: 'Orchestration', lane: 'Identify', trigger: 'Data refresh 08:30', sources: 'Named signals, rule in section 1.8', state: 'Completed', waiting: 'n/a', output: 'Screens 1 and 8', to: '/cockpit', trace: { inputs: ['Twelve dimension signals', 'Published health rule'], method: 'Apply the health rule; four Red dimensions raise the escalation flag', result: 'Cakrawala Yellow with escalation; Nusa Bahari Yellow; Sinar Lestari Green', confidence: 'High', gate: 'Ratings cannot be overwritten, only commented on' } },
  { id: 'R6', job: 'Procurement watch', uc: 'UC07', mode: 'Orchestration', lane: 'Identify', trigger: 'Weekly', sources: 'Purchase orders, vendor milestones', state: 'Completed', waiting: 'n/a', output: 'Screen 11', to: '/procurement', trace: { inputs: ['PO register', 'Vendor milestones', 'Logistics note'], method: 'Required-on-site against forecast; float to need date', result: 'Boiler island minus 42 days; flue-gas treatment minus 17 days', confidence: 'Medium', gate: 'None' } },
  { id: 'R7', job: 'Root-cause trace', uc: 'UC10 to UC12', mode: 'Orchestration', lane: 'Explain', trigger: 'Critical-path change', sources: 'Transmittals, correspondence, schedule logic', state: 'Waiting for human', waiting: 'Technical Director (interface conflict)', output: 'Screen 10', to: '/critical-path', trace: { inputs: ['Transmittal log', 'Correspondence chain', 'Schedule logic'], method: 'Link late submittal to approval to manufacturing release', result: 'Interface conflict between the waste-receiving system and the boiler feed arrangement', confidence: 'Medium', gate: 'Technical Director confirms' } },
  { id: 'R8', job: 'Scenario run', uc: 'UC09', mode: 'Assistant', lane: 'Explain', trigger: 'Request from Screen 9 or 12', sources: 'Cost, schedule, contingency', state: 'Completed', waiting: 'n/a', output: 'Screens 9 and 12', to: '/cost', trace: { inputs: ['Cost model', 'Schedule forecast', 'Contingency register'], method: 'Five recovery scenarios against remaining contingency', result: 'Best case plus 12 days at Rp47 bn; no intervention plus 64 days, reserve Rp19 bn', confidence: 'Medium (advisory)', gate: 'A person chooses the scenario' } },
  { id: 'R9', job: 'Meeting capture', uc: 'UC06', mode: 'Orchestration', lane: 'Act and track', trigger: 'Steering meeting 29 Jun', sources: 'Meeting note', state: 'Waiting for human', waiting: 'PMO Director as chair (6 items)', output: 'Screen 5', to: '/meetings', trace: { inputs: ['Steering committee note, 29 Jun'], method: 'Extract decisions and actions with owner and date', result: '6 proposed items: 4 actions, 1 deferred decision, 1 low confidence', confidence: 'High to Low by item', gate: 'Chair confirms each item' } },
  { id: 'R10', job: 'Weekly pack assembly', uc: 'UC04', mode: 'Assistant', lane: 'Act and track', trigger: 'On request, weekly cycle', sources: 'Outputs of Screens 1 to 3, cost summary', state: 'Waiting for human', waiting: 'PMO lead as reviewer', output: 'Screen 7', to: '/packs', denaraOnly: true, trace: { inputs: ['Governed numbers', 'Cost summary', 'Notice calendar'], method: 'Assemble 15 sections from the governed layer', result: 'Draft pack ready in four versions', confidence: 'High', gate: 'PMO lead approves release' } },
  { id: 'R11', job: 'Waste supply feed ingestion', uc: 'E1', mode: 'Orchestration', lane: 'Connect', trigger: 'Not started', sources: 'None', state: 'Blocked', waiting: 'Project company (request raised on Screen 4)', output: 'Screen 4', to: '/partner-data', trace: { inputs: ['None: feed not agreed'], method: 'Not run', result: 'Blocked: feed not agreed', confidence: 'n/a', gate: 'Project company must agree the template' } },
]

export const APPROVAL_QUEUE = [
  { text: 'Confirm 3 extracted deadlines', who: 'Commercial and Legal Lead', to: '/notices' },
  { text: 'Chair to confirm 6 proposed meeting items', who: 'PMO Director', to: '/meetings' },
  { text: 'Interface owner to confirm AI-detected conflict', who: 'Technical Director', to: '/critical-path' },
  { text: 'Reviewer to approve weekly pack', who: 'PMO lead', to: '/packs', denaraOnly: true },
  { text: 'Lawyer to review AI notice draft', who: 'Commercial and Legal Lead', to: '/notices?draft=1' },
  { text: 'Confirm gate condition for P2-08', who: 'Investment and legal lead', to: '/gates?project=P2-08', denaraOnly: true },
]

export const GUARDRAILS = [
  'AI recommends and people decide',
  'Health ratings cannot be overwritten',
  'ATLAS refuses when evidence is missing',
  'Forecasts are advisory with assumptions',
  'Every change is written to the audit log',
  'Partner separation between project companies',
  'Rules and thresholds are published and agreed with partners',
  'Model and prompt change log; the PMO lead reviews a sample of AI outputs each week',
  'A named business owner and one weekly review slot for each use case',
  "Zero Trust access (Entra ID, conditional access, least privilege); Denera and partner data stay in Denera's tenant, separate from Altimeda IP",
]
