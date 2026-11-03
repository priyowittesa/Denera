import { describe, expect, it } from 'vitest'
import { DEFS, buildTemplate, wouldCycle, type Workflow } from '../data/workflows'
import { compare, runWorkflow, type NodeRun, type RunHooks } from './workflowRun'

const wf = (kind: Parameters<typeof buildTemplate>[0], mutate?: (w: Workflow) => void): Workflow => {
  const w: Workflow = { id: 'w', name: 't', description: '', active: false, ...buildTemplate(kind, 'w-'), updatedAt: '', runs: 0 }
  mutate?.(w)
  return w
}

function hooks(over: Partial<RunHooks> = {}) {
  const state: Record<string, NodeRun> = {}
  const created: string[] = []
  const notified: string[] = []
  const h: RunHooks = {
    setNode: (id, run) => { state[id] = run },
    log: () => {},
    cancelled: () => false,
    approve: async () => true,
    sleep: async () => {},
    effects: { createAction: (t) => { created.push(t); return `Created ${t}` }, notify: (to) => { notified.push(to) }, addToPack: () => {} },
    ...over,
  }
  return { h, state, created, notified }
}

describe('workflow engine', () => {
  it('compares figures', () => {
    expect(compare(6, '<', 7)).toBe(true)
    expect(compare(63, '<', 20)).toBe(false)
    expect(compare(-42, '<=', 0)).toBe(true)
    expect(compare(5, '=', 5)).toBe(true)
  })

  it('follows the Yes branch when the figure is inside the limit', async () => {
    const { h, state, created, notified } = hooks()
    const r = await runWorkflow(wf('notice'), h)
    expect(r.result).toBe('Completed')
    expect(created).toEqual(['Prepare the notice for legal review'])
    expect(notified).toEqual(['Commercial and Legal Lead'])
    expect(state['w-f'].status).toBe('skipped') // the No branch is not taken
    expect(state['w-d'].status).toBe('done')
  })

  it('follows the No branch when it is outside the limit', async () => {
    const { h, state, created } = hooks()
    const w = wf('notice', (x) => { x.nodes.find((n) => n.type === 'condition')!.params.value = '3' })
    await runWorkflow(w, h)
    expect(created).toEqual([])
    expect(state['w-d'].status).toBe('skipped')
    expect(state['w-f'].status).toBe('done')
  })

  it('pauses at an approval and stops when it is rejected', async () => {
    const { h, state } = hooks({ approve: async () => false })
    const r = await runWorkflow(wf('pack'), h)
    expect(r.result).toBe('Rejected')
    expect(state['w-d'].status).toBe('error')
    expect(state['w-e'].status).toBe('skipped')
  })

  it('stops when cancelled', async () => {
    let n = 0
    const { h } = hooks({ cancelled: () => ++n > 3 })
    const r = await runWorkflow(wf('pack'), h)
    expect(r.result).toBe('Stopped')
  })

  it('rejects loops and knows which nodes are triggers', () => {
    const w = wf('pack')
    expect(wouldCycle(w.edges, 'w-b', 'w-a')).toBe(true)
    expect(wouldCycle(w.edges, 'w-a', 'w-e')).toBe(false)
    expect(DEFS.schedule.trigger).toBe(true)
    expect(DEFS.condition.outputs).toHaveLength(2)
  })
})
