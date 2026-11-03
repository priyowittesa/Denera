import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { toast } from 'sonner'
import { DEFS, buildTemplate, defaultParams, seedWorkflows, uid, wouldCycle, type NodeType, type TemplateKind, type WfNode, type WfRun, type Workflow } from '../data/workflows'
import { useDemo } from './store'

const stamp = () => {
  const d = new Date()
  return `30 Jun 2027 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
const audit = (action: string, object: string) => useDemo.getState().log(action, object)

interface WfState {
  workflows: Workflow[]
  createWorkflow: (name: string, description: string, template: TemplateKind) => string
  updateMeta: (id: string, name: string, description: string) => void
  duplicateWorkflow: (id: string) => string | null
  deleteWorkflow: (id: string) => void
  setActive: (id: string, active: boolean) => void
  addNode: (id: string, type: NodeType, x: number, y: number) => string
  moveNode: (id: string, nodeId: string, x: number, y: number) => void
  updateNode: (id: string, nodeId: string, patch: { name?: string; params?: Record<string, string> }) => void
  duplicateNode: (id: string, nodeId: string) => string | null
  removeNode: (id: string, nodeId: string) => void
  connect: (id: string, from: string, port: string, to: string) => 'ok' | 'duplicate' | 'loop' | 'trigger'
  removeEdge: (id: string, edgeId: string) => void
  recordRun: (id: string, run: WfRun) => void
  reset: () => void
}

const patch = (list: Workflow[], id: string, fn: (w: Workflow) => Workflow) => list.map((w) => (w.id === id ? { ...fn(w), updatedAt: stamp() } : w))

export const useWorkflows = create<WfState>()(
  persist(
    (set, get) => ({
      workflows: seedWorkflows(),

      createWorkflow: (name, description, template) => {
        const id = uid('wf-')
        const wf: Workflow = { id, name, description, active: false, ...buildTemplate(template, `${id}-`), updatedAt: stamp(), runs: 0 }
        set((s) => ({ workflows: [wf, ...s.workflows] }))
        audit('Created workflow', name)
        toast.success('Workflow created', { description: name })
        return id
      },

      updateMeta: (id, name, description) => {
        set((s) => ({ workflows: patch(s.workflows, id, (w) => ({ ...w, name, description })) }))
        audit('Edited workflow', name)
        toast.success('Workflow updated', { description: name })
      },

      duplicateWorkflow: (id) => {
        const src = get().workflows.find((w) => w.id === id)
        if (!src) return null
        const nid = uid('wf-')
        const map = new Map(src.nodes.map((n) => [n.id, `${nid}-${n.id.split('-').pop()}`]))
        const copy: Workflow = {
          ...src,
          id: nid,
          name: `${src.name} (copy)`,
          active: false,
          runs: 0,
          lastRun: undefined,
          updatedAt: stamp(),
          nodes: src.nodes.map((n) => ({ ...n, id: map.get(n.id)!, params: { ...n.params } })),
          edges: src.edges.map((e) => ({ ...e, id: `e-${map.get(e.from)}-${e.port}-${map.get(e.to)}`, from: map.get(e.from)!, to: map.get(e.to)! })),
        }
        set((s) => ({ workflows: [copy, ...s.workflows] }))
        audit('Duplicated workflow', src.name)
        toast.success('Workflow duplicated', { description: copy.name })
        return nid
      },

      deleteWorkflow: (id) => {
        const w = get().workflows.find((x) => x.id === id)
        set((s) => ({ workflows: s.workflows.filter((x) => x.id !== id) }))
        if (w) { audit('Deleted workflow', w.name); toast('Workflow deleted', { description: w.name }) }
      },

      setActive: (id, active) => {
        const w = get().workflows.find((x) => x.id === id)
        if (!w) return
        if (active && !w.nodes.some((n) => DEFS[n.type].trigger)) {
          toast.error('Add a trigger first', { description: 'A workflow needs a trigger to start on its own.' })
          return
        }
        set((s) => ({ workflows: patch(s.workflows, id, (x) => ({ ...x, active })) }))
        audit(active ? 'Activated workflow' : 'Paused workflow', w.name)
        toast.success(active ? 'Workflow is active' : 'Workflow paused', { description: w.name })
      },

      addNode: (id, type, x, y) => {
        const nid = uid('n')
        const node: WfNode = { id: nid, type, x: Math.round(x), y: Math.round(y), name: DEFS[type].label, params: defaultParams(type) }
        set((s) => ({ workflows: patch(s.workflows, id, (w) => ({ ...w, nodes: [...w.nodes, node] })) }))
        return nid
      },

      moveNode: (id, nodeId, x, y) =>
        set((s) => ({ workflows: s.workflows.map((w) => (w.id === id ? { ...w, nodes: w.nodes.map((n) => (n.id === nodeId ? { ...n, x: Math.round(x), y: Math.round(y) } : n)) } : w)) })),

      updateNode: (id, nodeId, p) =>
        set((s) => ({
          workflows: patch(s.workflows, id, (w) => ({
            ...w,
            nodes: w.nodes.map((n) => (n.id === nodeId ? { ...n, name: p.name ?? n.name, params: p.params ? { ...n.params, ...p.params } : n.params } : n)),
          })),
        })),

      duplicateNode: (id, nodeId) => {
        const w = get().workflows.find((x) => x.id === id)
        const n = w?.nodes.find((x) => x.id === nodeId)
        if (!w || !n) return null
        const nid = uid('n')
        set((s) => ({ workflows: patch(s.workflows, id, (x) => ({ ...x, nodes: [...x.nodes, { ...n, id: nid, x: n.x + 40, y: n.y + 120, params: { ...n.params } }] })) }))
        return nid
      },

      removeNode: (id, nodeId) =>
        set((s) => ({
          workflows: patch(s.workflows, id, (w) => ({ ...w, nodes: w.nodes.filter((n) => n.id !== nodeId), edges: w.edges.filter((e) => e.from !== nodeId && e.to !== nodeId) })),
        })),

      connect: (id, from, port, to) => {
        const w = get().workflows.find((x) => x.id === id)
        const target = w?.nodes.find((n) => n.id === to)
        if (!w || !target) return 'loop'
        if (DEFS[target.type].trigger) return 'trigger'
        if (w.edges.some((e) => e.from === from && e.port === port && e.to === to)) return 'duplicate'
        if (wouldCycle(w.edges, from, to)) return 'loop'
        set((s) => ({ workflows: patch(s.workflows, id, (x) => ({ ...x, edges: [...x.edges, { id: `e-${from}-${port}-${to}`, from, port, to }] })) }))
        return 'ok'
      },

      removeEdge: (id, edgeId) => set((s) => ({ workflows: patch(s.workflows, id, (w) => ({ ...w, edges: w.edges.filter((e) => e.id !== edgeId) })) })),

      recordRun: (id, run) =>
        set((s) => ({ workflows: s.workflows.map((w) => (w.id === id ? { ...w, runs: w.runs + 1, lastRun: run } : w)) })),

      reset: () => set({ workflows: seedWorkflows() }),
    }),
    {
      name: 'denera-atlas-workflows',
      storage: createJSONStorage(() => {
        try { return sessionStorage } catch { return { getItem: () => null, setItem: () => {}, removeItem: () => {} } }
      }),
    },
  ),
)
