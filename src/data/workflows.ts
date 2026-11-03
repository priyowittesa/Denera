import {
  Activity, Bell, CalendarClock, ChartSpline, Database, FileInput, FileStack, FileText, GitBranch, HeartPulse, ListChecks, MousePointerClick, Receipt, Route, Sparkles, Timer, UserCheck, type LucideIcon,
} from 'lucide-react'

/* ---------- Types ---------- */

export type NodeType =
  | 'schedule' | 'file' | 'threshold' | 'manual'
  | 'readFeed' | 'readCost' | 'readSchedule'
  | 'health' | 'progress' | 'deadlines'
  | 'condition'
  | 'ask' | 'summary'
  | 'approval'
  | 'createAction' | 'notify' | 'pack'

export type Category = 'Triggers' | 'Data' | 'Analyse' | 'Logic' | 'NEXA' | 'People' | 'Actions'
export type Tone = 'warn' | 'info' | 'brand' | 'muted' | 'ok' | 'live'

export interface ParamDef {
  key: string
  label: string
  kind: 'text' | 'textarea' | 'select' | 'number'
  options?: string[]
  default: string
  hint?: string
}

export interface NodeDef {
  type: NodeType
  category: Category
  label: string
  blurb: string
  icon: LucideIcon
  tone: Tone
  /** A trigger has no input port and starts a run */
  trigger?: boolean
  outputs: { id: string; label: string }[]
  params: ParamDef[]
}

export interface WfNode { id: string; type: NodeType; x: number; y: number; name: string; params: Record<string, string> }
export interface WfEdge { id: string; from: string; port: string; to: string }
export interface WfRun { at: string; status: 'Completed' | 'Stopped' | 'Rejected'; ms: number }
export interface Workflow {
  id: string
  name: string
  description: string
  active: boolean
  nodes: WfNode[]
  edges: WfEdge[]
  updatedAt: string
  runs: number
  lastRun?: WfRun
}

/* ---------- Catalogue ---------- */

const OUT = [{ id: 'out', label: '' }]
const FEEDS = ['Schedule and progress', 'Cost and commitments', 'Procurement and correspondence', 'Waste supply and regional reports']
const PEOPLE = ['PMO Director', 'PMO lead', 'Commercial and Legal Lead', 'Technical Director', 'Finance Lead', 'Investment and legal lead']

export const METRICS = [
  'COD exposure (days)',
  'Days to next notice',
  'Contingency remaining (%)',
  'Overdue actions',
  'Boiler island float (days)',
  'Data confidence (%)',
] as const

/** Values the sample project reports at the data date. Overdue actions is read live from the register. */
export const METRIC_VALUES: Record<string, number> = {
  'COD exposure (days)': 42,
  'Days to next notice': 6,
  'Contingency remaining (%)': 63,
  'Overdue actions': 2,
  'Boiler island float (days)': -42,
  'Data confidence (%)': 91,
}

export const OPERATORS = ['>', '>=', '<', '<=', '='] as const

export const NODE_DEFS: NodeDef[] = [
  { type: 'schedule', category: 'Triggers', label: 'On a schedule', blurb: 'Start every day, week or month', icon: CalendarClock, tone: 'warn', trigger: true, outputs: OUT,
    params: [
      { key: 'every', label: 'Repeat', kind: 'select', options: ['Every day', 'Every Monday', 'Every Friday', 'Every month'], default: 'Every Monday' },
      { key: 'time', label: 'Time (WIB)', kind: 'text', default: '07:00' },
    ] },
  { type: 'file', category: 'Triggers', label: 'New file received', blurb: 'Start when a partner submits a file', icon: FileInput, tone: 'warn', trigger: true, outputs: OUT,
    params: [{ key: 'source', label: 'Source', kind: 'select', options: ['Contract documents', ...FEEDS], default: 'Contract documents' }] },
  { type: 'threshold', category: 'Triggers', label: 'When a figure crosses a limit', blurb: 'Start when health or cost moves', icon: Activity, tone: 'warn', trigger: true, outputs: OUT,
    params: [
      { key: 'metric', label: 'Figure', kind: 'select', options: [...METRICS], default: 'COD exposure (days)' },
      { key: 'op', label: 'Is', kind: 'select', options: [...OPERATORS], default: '>' },
      { key: 'value', label: 'Value', kind: 'number', default: '60' },
    ] },
  { type: 'manual', category: 'Triggers', label: 'Run by hand', blurb: 'Start when someone presses Run', icon: MousePointerClick, tone: 'warn', trigger: true, outputs: OUT, params: [] },

  { type: 'readFeed', category: 'Data', label: 'Read partner feed', blurb: 'Latest accepted submission', icon: Database, tone: 'info', outputs: OUT,
    params: [{ key: 'feed', label: 'Feed', kind: 'select', options: FEEDS, default: 'Schedule and progress' }] },
  { type: 'readCost', category: 'Data', label: 'Read cost report', blurb: 'Budget, commitments and actuals', icon: Receipt, tone: 'info', outputs: OUT, params: [] },
  { type: 'readSchedule', category: 'Data', label: 'Read schedule export', blurb: 'Activities with logic and float', icon: Route, tone: 'info', outputs: OUT, params: [] },

  { type: 'health', category: 'Analyse', label: 'Compute project health', blurb: 'Rating from the published rule', icon: HeartPulse, tone: 'brand', outputs: OUT, params: [] },
  { type: 'progress', category: 'Analyse', label: 'Verify progress', blurb: 'Reported against verified', icon: ChartSpline, tone: 'brand', outputs: OUT, params: [] },
  { type: 'deadlines', category: 'Analyse', label: 'Extract deadlines', blurb: 'Notice dates from clauses', icon: Timer, tone: 'brand', outputs: OUT, params: [] },

  { type: 'condition', category: 'Logic', label: 'If', blurb: 'Branch on a figure', icon: GitBranch, tone: 'muted',
    outputs: [{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }],
    params: [
      { key: 'metric', label: 'Figure', kind: 'select', options: [...METRICS], default: 'Days to next notice' },
      { key: 'op', label: 'Is', kind: 'select', options: [...OPERATORS], default: '<' },
      { key: 'value', label: 'Value', kind: 'number', default: '7' },
    ] },

  { type: 'ask', category: 'NEXA', label: 'Ask NEXA', blurb: 'Answer a question with sources', icon: Sparkles, tone: 'brand', outputs: OUT,
    params: [{ key: 'prompt', label: 'Question', kind: 'textarea', default: 'Why is the project behind plan?' }] },
  { type: 'summary', category: 'NEXA', label: 'Draft a summary', blurb: 'AI draft for a reviewer', icon: FileText, tone: 'brand', outputs: OUT,
    params: [{ key: 'audience', label: 'Audience', kind: 'select', options: ['PMO', 'Investment Committee', 'Danantara sponsor', 'Lender'], default: 'PMO' }] },

  { type: 'approval', category: 'People', label: 'Ask for approval', blurb: 'Pause until a named person decides', icon: UserCheck, tone: 'live', outputs: OUT,
    params: [
      { key: 'who', label: 'Approver', kind: 'select', options: PEOPLE, default: 'PMO lead' },
      { key: 'note', label: 'What they decide', kind: 'text', default: 'Release the weekly pack' },
    ] },

  { type: 'createAction', category: 'Actions', label: 'Create action', blurb: 'Add to the action register', icon: ListChecks, tone: 'ok', outputs: OUT,
    params: [
      { key: 'title', label: 'Action', kind: 'text', default: 'Confirm the notice with legal' },
      { key: 'owner', label: 'Owner', kind: 'select', options: PEOPLE, default: 'Commercial and Legal Lead' },
      { key: 'due', label: 'Due in (days)', kind: 'number', default: '2' },
    ] },
  { type: 'notify', category: 'Actions', label: 'Send notification', blurb: 'Tell a person or group', icon: Bell, tone: 'ok', outputs: OUT,
    params: [
      { key: 'to', label: 'To', kind: 'select', options: PEOPLE, default: 'PMO Director' },
      { key: 'message', label: 'Message', kind: 'textarea', default: 'A figure you watch has crossed its limit.' },
    ] },
  { type: 'pack', category: 'Actions', label: 'Add to weekly pack', blurb: 'Send the result to the pack draft', icon: FileStack, tone: 'ok', outputs: OUT, params: [] },
]

export const DEFS: Record<NodeType, NodeDef> = Object.fromEntries(NODE_DEFS.map((d) => [d.type, d])) as Record<NodeType, NodeDef>
export const CATEGORIES: Category[] = ['Triggers', 'Data', 'Analyse', 'Logic', 'NEXA', 'People', 'Actions']

export const defaultParams = (t: NodeType): Record<string, string> => Object.fromEntries(DEFS[t].params.map((p) => [p.key, p.default]))

/** One line under the node title. */
export function nodeSummary(n: WfNode): string {
  const p = n.params
  switch (n.type) {
    case 'schedule': return `${p.every} at ${p.time}`
    case 'file': return p.source
    case 'threshold': return `${p.metric} ${p.op} ${p.value}`
    case 'readFeed': return p.feed
    case 'condition': return `${p.metric} ${p.op} ${p.value}`
    case 'ask': return p.prompt
    case 'summary': return `For ${p.audience}`
    case 'approval': return p.who
    case 'createAction': return `${p.owner}, due in ${p.due} days`
    case 'notify': return `To ${p.to}`
    default: return DEFS[n.type].blurb
  }
}

/* ---------- Templates and seeds ---------- */

export type TemplateKind = 'blank' | 'pack' | 'notice' | 'contingency'

export const TEMPLATES: { id: TemplateKind; label: string; note: string }[] = [
  { id: 'blank', label: 'Blank', note: 'Start from a trigger' },
  { id: 'pack', label: 'Weekly pack', note: 'Health, draft, approval, pack' },
  { id: 'notice', label: 'Notice alert', note: 'New contract, deadlines, action' },
  { id: 'contingency', label: 'Contingency watch', note: 'Cost report, check, notify' },
]

let seq = 0
export const uid = (p = 'n') => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`

function node(id: string, type: NodeType, x: number, y: number, params: Record<string, string> = {}, name?: string): WfNode {
  return { id, type, x, y, name: name ?? DEFS[type].label, params: { ...defaultParams(type), ...params } }
}
const edge = (from: string, to: string, port = 'out'): WfEdge => ({ id: `e-${from}-${port}-${to}`, from, port, to })

export function buildTemplate(kind: TemplateKind, p = ''): { nodes: WfNode[]; edges: WfEdge[] } {
  const k = (s: string) => `${p}${s}`
  if (kind === 'pack') {
    return {
      nodes: [
        node(k('a'), 'schedule', 40, 120, { every: 'Every Monday', time: '07:00' }),
        node(k('b'), 'health', 330, 120),
        node(k('c'), 'summary', 620, 120, { audience: 'PMO' }),
        node(k('d'), 'approval', 910, 120, { who: 'PMO lead', note: 'Release the weekly pack' }),
        node(k('e'), 'pack', 1200, 120),
      ],
      edges: [edge(k('a'), k('b')), edge(k('b'), k('c')), edge(k('c'), k('d')), edge(k('d'), k('e'))],
    }
  }
  if (kind === 'notice') {
    return {
      nodes: [
        node(k('a'), 'file', 40, 140, { source: 'Contract documents' }),
        node(k('b'), 'deadlines', 330, 140),
        node(k('c'), 'condition', 620, 140, { metric: 'Days to next notice', op: '<', value: '7' }),
        node(k('d'), 'createAction', 910, 40, { title: 'Prepare the notice for legal review', owner: 'Commercial and Legal Lead', due: '2' }),
        node(k('e'), 'notify', 1200, 40, { to: 'Commercial and Legal Lead', message: 'A notice deadline falls within seven days.' }),
        node(k('f'), 'pack', 910, 240),
      ],
      edges: [edge(k('a'), k('b')), edge(k('b'), k('c')), edge(k('c'), k('d'), 'yes'), edge(k('d'), k('e')), edge(k('c'), k('f'), 'no')],
    }
  }
  if (kind === 'contingency') {
    return {
      nodes: [
        node(k('a'), 'schedule', 40, 120, { every: 'Every day', time: '08:30' }),
        node(k('b'), 'readCost', 330, 120),
        node(k('c'), 'condition', 620, 120, { metric: 'Contingency remaining (%)', op: '<', value: '20' }),
        node(k('d'), 'notify', 910, 40, { to: 'Finance Lead', message: 'Remaining contingency is below the 20% watch line.' }),
      ],
      edges: [edge(k('a'), k('b')), edge(k('b'), k('c')), edge(k('c'), k('d'), 'yes')],
    }
  }
  return { nodes: [node(k('a'), 'manual', 80, 140)], edges: [] }
}

export function seedWorkflows(): Workflow[] {
  const mk = (id: string, name: string, description: string, kind: TemplateKind, active: boolean, last?: WfRun, runs = 0): Workflow => ({
    id, name, description, active, ...buildTemplate(kind, `${id}-`), updatedAt: '29 Jun 2027 17:20', runs, lastRun: last,
  })
  return [
    mk('wf-pack', 'Weekly governance pack', 'Computes health every Monday, drafts the summary and waits for the PMO lead before it joins the pack.', 'pack', true, { at: '28 Jun 2027 07:01', status: 'Completed', ms: 2400 }, 12),
    mk('wf-notice', 'Notice deadline alert', 'When a contract arrives, extracts its deadlines and opens an action if one falls inside seven days.', 'notice', true, { at: '25 Jun 2027 14:12', status: 'Completed', ms: 2100 }, 5),
    mk('wf-contingency', 'Contingency watch', 'Checks remaining contingency each morning and tells Finance when it falls below 20%.', 'contingency', false, undefined, 0),
  ]
}

/* ---------- Graph helpers ---------- */

/** True when adding from -> to would create a loop. */
export function wouldCycle(edges: WfEdge[], from: string, to: string): boolean {
  if (from === to) return true
  const next = new Map<string, string[]>()
  for (const e of edges) next.set(e.from, [...(next.get(e.from) ?? []), e.to])
  const seen = new Set<string>()
  const stack = [to]
  while (stack.length) {
    const n = stack.pop()!
    if (n === from) return true
    if (seen.has(n)) continue
    seen.add(n)
    stack.push(...(next.get(n) ?? []))
  }
  return false
}

export const triggerOf = (w: Workflow) => w.nodes.find((n) => DEFS[n.type].trigger)
