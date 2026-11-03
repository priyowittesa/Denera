import { DEFS, METRIC_VALUES, type WfNode, type Workflow } from '../data/workflows'

export type NodeStatus = 'idle' | 'running' | 'done' | 'waiting' | 'skipped' | 'error'
export interface NodeRun { status: NodeStatus; ms?: number; out?: string }
export type RunResult = 'Completed' | 'Stopped' | 'Rejected'

export interface RunHooks {
  setNode: (id: string, run: NodeRun) => void
  log: (node: string, text: string) => void
  cancelled: () => boolean
  /** Resolves true when approved, false when rejected */
  approve: (node: WfNode) => Promise<boolean>
  sleep: (ms: number) => Promise<void>
  /** Live figures; anything missing falls back to the sample project values */
  metrics?: Record<string, number>
  effects: {
    createAction: (title: string, owner: string, dueInDays: number) => string
    notify: (to: string, message: string) => void
    addToPack: (note: string) => void
  }
}

export function compare(a: number, op: string, b: number): boolean {
  switch (op) {
    case '>': return a > b
    case '>=': return a >= b
    case '<': return a < b
    case '<=': return a <= b
    default: return a === b
  }
}

type Exec = { out: string; branch?: string; wait?: boolean }

function exec(n: WfNode, h: RunHooks, upstream: string): Exec {
  const p = n.params
  switch (n.type) {
    case 'schedule': return { out: `Started: ${p.every.toLowerCase()} at ${p.time}` }
    case 'file': return { out: `New file from ${p.source.toLowerCase()}` }
    case 'threshold': return { out: `${p.metric} ${p.op} ${p.value}` }
    case 'manual': return { out: 'Started by hand' }
    case 'readFeed': return { out: `${p.feed}: latest submission read, 28 Jun 2027` }
    case 'readCost': return { out: 'Cost report June 2027 read: 8 work packages' }
    case 'readSchedule': return { out: 'Schedule export 28 Jun 2027 read: 344 activities' }
    case 'health': return { out: 'Overall Yellow, escalation. Four dimensions Red, exposure 42 days' }
    case 'progress': return { out: 'Verified 39% against reported 42%, planned 46%' }
    case 'deadlines': return { out: '3 deadlines extracted, 1 within seven days (6 Jul 2027)' }
    case 'condition': {
      const value = (h.metrics ?? {})[p.metric] ?? METRIC_VALUES[p.metric] ?? NaN
      const yes = compare(value, p.op, Number(p.value))
      return { out: `${p.metric} is ${value}. ${p.op} ${p.value}? ${yes ? 'Yes' : 'No'}`, branch: yes ? 'yes' : 'no' }
    }
    case 'ask': return { out: `NEXA answered with 2 sources: "${p.prompt.slice(0, 60)}${p.prompt.length > 60 ? '...' : ''}"` }
    case 'summary': return { out: `AI draft written for ${p.audience}, awaiting a reviewer` }
    case 'approval': return { out: '', wait: true }
    case 'createAction': return { out: h.effects.createAction(p.title, p.owner, Number(p.due) || 0) }
    case 'notify': h.effects.notify(p.to, p.message); return { out: `Sent to ${p.to}` }
    case 'pack': h.effects.addToPack(upstream); return { out: 'Added to the weekly pack draft' }
  }
}

/**
 * Runs a workflow from its triggers. Each node runs once, in order along the connections.
 * An If node follows only the branch its condition picks; an approval node pauses until a person decides.
 */
export async function runWorkflow(wf: Workflow, h: RunHooks, stepMs = 420): Promise<{ result: RunResult; ms: number }> {
  const start = wf.nodes.filter((n) => DEFS[n.type].trigger)
  const t0 = Date.now()
  const visited = new Set<string>()
  const queue: { node: WfNode; upstream: string }[] = start.map((node) => ({ node, upstream: '' }))
  let result: RunResult = 'Completed'

  while (queue.length) {
    if (h.cancelled()) { result = 'Stopped'; break }
    const { node, upstream } = queue.shift()!
    if (visited.has(node.id)) continue
    visited.add(node.id)

    h.setNode(node.id, { status: 'running' })
    const t = Date.now()
    await h.sleep(stepMs)
    if (h.cancelled()) { h.setNode(node.id, { status: 'idle' }); result = 'Stopped'; break }

    const r = exec(node, h, upstream)
    if (r.wait) {
      h.setNode(node.id, { status: 'waiting' })
      h.log(node.name, `Waiting for ${node.params.who} to decide: ${node.params.note}`)
      const ok = await h.approve(node)
      if (h.cancelled()) { result = 'Stopped'; break }
      if (!ok) {
        h.setNode(node.id, { status: 'error', ms: Date.now() - t, out: `Rejected by ${node.params.who}` })
        h.log(node.name, `Rejected by ${node.params.who}. The flow stops here.`)
        result = 'Rejected'
        continue
      }
      r.out = `Approved by ${node.params.who}`
    }

    h.setNode(node.id, { status: 'done', ms: Date.now() - t, out: r.out })
    h.log(node.name, r.out)
    for (const e of wf.edges) {
      if (e.from !== node.id) continue
      if (r.branch && e.port !== r.branch) continue
      const next = wf.nodes.find((x) => x.id === e.to)
      if (next) queue.push({ node: next, upstream: r.out })
    }
  }

  for (const n of wf.nodes) if (!visited.has(n.id)) h.setNode(n.id, { status: 'skipped' })
  return { result, ms: Date.now() - t0 }
}
