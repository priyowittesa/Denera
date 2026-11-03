import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { toast } from 'sonner'
import { ANSWERS } from '../data/answers'
import { PERSONAS } from '../data/personas'
import { INITIAL_ACTIONS, RISKS } from '../data/registers'
import type { ScenarioId } from '../data/scurve'
import type { Action, Authority, Comment, PersonaId, Proposal, Risk } from '../data/types'

export interface AuditLine {
  t: string
  persona: string
  action: string
  object: string
}

export type Phase = 'thinking' | 'streaming' | 'done' | 'stopped'

export interface ChatMsg {
  id: string
  role: 'user' | 'atlas'
  answerId?: string
  text?: string
  /** atlas only: where the reply is in its life cycle */
  phase?: Phase
  /** atlas only: when the visible text started streaming (ms epoch) */
  startedAt?: number
  /** atlas only: words visible when the user pressed stop */
  shown?: number
  feedback?: 'up' | 'down'
}

export interface Thread {
  id: string
  title: string
  when: string
  messages: ChatMsg[]
}

/** Timing of the scripted reply: a short source-checking step, then the lead answer streams word by word. */
export const THINK_MS = 1300
export const WORD_MS = 32
export const wordsOf = (id?: string) => (id && ANSWERS[id] ? ANSWERS[id].direct.split(/\s+/).length : 0)

export interface Stamp {
  by: string
  at: string
}

interface DemoState {
  persona: PersonaId
  actions: Action[]
  audit: AuditLine[]
  scenario: ScenarioId
  confirmed: Record<string, Stamp>
  rejected: Record<string, string>
  edits: Record<string, { due: string; dueIso: string; owner?: string }>
  risks: Risk[]
  coReviews: Record<string, { decision: string; status: string; note: string; by: string; at: string }>
  comments: Record<string, Comment[]>
  requests: string[]
  proposals: Proposal[]
  decision: { response: string; reason?: string; at: string } | null
  packStage: 'Draft' | 'In review' | 'Approved'
  analyst: boolean
  threads: Thread[]
  activeThread: string | null
  draft: string
  assistantOpen: boolean
  railCollapsed: boolean

  setPersona: (p: PersonaId) => void
  log: (action: string, object: string) => void
  addAction: (a: Omit<Action, 'id'>, msg?: string) => void
  updateAction: (id: string, patch: Partial<Pick<Action, 'owner' | 'due' | 'dueIso' | 'status' | 'dueNote'>>) => void
  confirm: (key: string, label: string) => void
  reject: (key: string, reason: string, label: string) => void
  setEdit: (key: string, due: string, dueIso: string, owner?: string) => void
  setScenario: (s: ScenarioId, from?: string) => void
  assignRisk: (id: string, owner: string) => void
  addRisk: (r: Omit<Risk, 'id'>) => void
  reviewChange: (id: string, decision: string, status: string, note: string) => void
  updateRisk: (id: string, patch: Partial<Omit<Risk, 'id'>>) => void
  addComment: (key: string, label: string, text: string) => void
  deleteComment: (key: string, id: string) => void
  acceptProposal: (text: string, action: Omit<Action, 'id'>) => void
  dismissProposal: (text: string, reason: string) => void
  addRequest: (key: string, label: string, action?: Omit<Action, 'id'>) => void
  propose: (text: string, authority: Authority, from?: string) => void
  respond: (response: string, reason?: string) => void
  setPackStage: (s: DemoState['packStage']) => void
  setAnalyst: (v: boolean) => void
  ask: (answerId: string, userText: string) => void
  stop: () => void
  regenerate: (msgId: string) => void
  rate: (msgId: string, v: 'up' | 'down') => void
  newChat: () => void
  openThread: (id: string) => void
  deleteThread: (id: string) => void
  setDraft: (v: string) => void
  setAssistantOpen: (v: boolean) => void
  setRailCollapsed: (v: boolean) => void
  reset: () => void
}

const now = () => {
  const d = new Date()
  return `30 Jun 2027 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const initial = {
  persona: 'ceo' as PersonaId,
  actions: INITIAL_ACTIONS,
  audit: [
    { t: '30 Jun 2027 08:30', persona: 'ATLAS', action: 'Data refresh', object: 'All feeds' },
    { t: '30 Jun 2027 08:31', persona: 'ATLAS', action: 'Health computed', object: 'PSEL Cakrawala Raya' },
    { t: '29 Jun 2027 17:05', persona: 'Commercial and Legal Lead', action: 'Confirmed deadline', object: 'EPC cl. 14.2 notice' },
    { t: '29 Jun 2027 16:40', persona: 'ATLAS', action: 'Meeting items proposed', object: 'Steering committee 29 Jun' },
    { t: '28 Jun 2027 18:12', persona: 'ATLAS', action: 'Submission rejected', object: 'Procurement feed v1.0' },
  ] as AuditLine[],
  scenario: 'current' as ScenarioId,
  confirmed: {} as Record<string, Stamp>,
  rejected: {} as Record<string, string>,
  edits: {} as Record<string, { due: string; dueIso: string; owner?: string }>,
  risks: RISKS.map((r) => ({ ...r })) as Risk[],
  coReviews: {} as Record<string, { decision: string; status: string; note: string; by: string; at: string }>,
  comments: {} as Record<string, Comment[]>,
  requests: [] as string[],
  proposals: [] as Proposal[],
  decision: null,
  packStage: 'Draft' as const,
  analyst: false,
  threads: [
    { id: 't-seed-1', title: 'EPC notice due this week', when: 'Yesterday', messages: [
      { id: 's1', role: 'user', text: 'Which notices or contractual deadlines are due this week?' },
      { id: 's2', role: 'atlas', answerId: 'A-01', phase: 'done' },
    ] },
    { id: 't-seed-2', title: 'Packages that can move COD', when: 'Mon 28 Jun', messages: [
      { id: 's3', role: 'user', text: 'Show all packages that can delay COD by more than 14 days.' },
      { id: 's4', role: 'atlas', answerId: 'A-09', phase: 'done' },
    ] },
  ] as Thread[],
  activeThread: null as string | null,
  draft: '',
  assistantOpen: false,
  railCollapsed: false,
}

let seq = 100
const timers = new Map<string, number[]>()
const clearTimers = (id: string) => { timers.get(id)?.forEach((t) => window.clearTimeout(t)); timers.delete(id) }
const patchMsg = (threads: Thread[], tid: string | null, mid: string, p: Partial<ChatMsg>) =>
  threads.map((t) => (t.id !== tid ? t : { ...t, messages: t.messages.map((m) => (m.id === mid ? { ...m, ...p } : m)) }))

export const useDemo = create<DemoState>()(
  persist(
    (set, get) => ({
      ...initial,
      setPersona: (p) => {
        set({ persona: p })
        get().log('Switched role', PERSONAS[p].name)
      },
      log: (action, object) =>
        set((s) => ({ audit: [{ t: now(), persona: PERSONAS[s.persona].name, action, object }, ...s.audit].slice(0, 80) })),
      addAction: (a, msg) => {
        const id = `A-${++seq}`
        set((s) => ({ actions: [...s.actions, { ...a, id }] }))
        get().log('Created action', a.title)
        toast.success(msg ?? 'Added to the action register', { description: `${a.title} · ${a.owner} · ${a.due}` })
      },
      updateAction: (id, patch) => {
        const before = get().actions.find((a) => a.id === id)
        if (!before) return
        set((s) => ({ actions: s.actions.map((a) => (a.id === id ? { ...a, ...patch } : a)) }))
        const changes = [
          patch.owner && patch.owner !== before.owner && `owner ${before.owner} to ${patch.owner}`,
          patch.due && patch.due !== before.due && `due ${before.due} to ${patch.due}`,
          patch.status && patch.status !== before.status && `status ${before.status} to ${patch.status}`,
        ].filter(Boolean).join('; ')
        get().log(patch.status === 'Done' && before.status !== 'Done' ? 'Closed action' : 'Edited action', `${before.title}${changes ? ` (${changes})` : ''}`)
        toast.success(patch.status === 'Done' && before.status !== 'Done' ? 'Action closed' : 'Action updated', { description: `${before.title}${changes ? ` · ${changes}` : ''}` })
      },
      confirm: (key, label) => {
        set((s) => ({ confirmed: { ...s.confirmed, [key]: { by: PERSONAS[s.persona].name, at: '30 Jun 2027' } } }))
        get().log('Confirmed', label)
        toast.success('Confirmed', { description: label })
      },
      reject: (key, reason, label) => {
        set((s) => ({ rejected: { ...s.rejected, [key]: reason } }))
        get().log('Rejected', `${label} (${reason})`)
        toast('Rejected with reason', { description: `${label}: ${reason}` })
      },
      setEdit: (key, due, dueIso, owner) => {
        set((s) => ({ edits: { ...s.edits, [key]: { due, dueIso, owner } } }))
        get().log('Edited proposed item', `${key}: due ${due}${owner ? `, owner ${owner}` : ''}`)
        toast.success('Changes saved', { description: `Due ${due}${owner ? ` · ${owner}` : ''}. Confirm the item to add it to the register.` })
      },
      setScenario: (sc, from) => {
        set({ scenario: sc })
        get().log('Selected scenario', `${sc}${from ? ` on ${from}` : ''}`)
      },
      assignRisk: (id, owner) => {
        set((s) => ({ risks: s.risks.map((r) => (r.id === id ? { ...r, owner } : r)) }))
        get().log('Assigned risk owner', `${id} to ${owner}`)
        toast.success('Owner assigned', { description: `${id} · ${owner}` })
      },
      addRequest: (key, label, action) => {
        if (get().requests.includes(key)) return
        set((s) => ({ requests: [...s.requests, key] }))
        if (action) get().addAction(action, 'Request raised and added to the register')
        else {
          get().log('Raised request', label)
          toast.success('Request raised', { description: label })
        }
      },
      reviewChange: (id, decision, status, note) => {
        const s0 = get()
        set((s) => ({ coReviews: { ...s.coReviews, [id]: { decision, status, note, by: PERSONAS[s0.persona].name, at: now() } } }))
        get().log('Reviewed change order', `${id}: ${decision}${note ? ` (${note})` : ''}`)
        toast.success(`${id} ${status.toLowerCase()}`, { description: note || decision })
      },
      addRisk: (r) => {
        const n = get().risks.reduce((m, x) => Math.max(m, Number(x.id.slice(2)) || 0), 0) + 1
        const id = `R-${String(n).padStart(2, '0')}`
        set((s) => ({ risks: [...s.risks, { ...r, id }] }))
        get().log('Added risk', `${id} ${r.risk}`)
        toast.success('Risk added', { description: `${id} · ${r.risk}` })
      },
      updateRisk: (id, patch) => {
        const before = get().risks.find((r) => r.id === id)
        if (!before) return
        set((s) => ({ risks: s.risks.map((r) => (r.id === id ? { ...r, ...patch } : r)) }))
        const changes = (Object.keys(patch) as (keyof typeof patch)[]).filter((k) => patch[k] !== before[k]).map((k) => `${k === 'p' ? 'probability' : k === 'i' ? 'impact' : k} ${before[k] ?? 'none'} to ${patch[k]}`).join('; ')
        get().log('Edited risk', `${id}${changes ? ` (${changes})` : ''}`)
        toast.success(patch.status === 'Closed' && before.status !== 'Closed' ? 'Risk closed' : 'Risk updated', { description: `${id} · ${before.risk}` })
      },
      addComment: (key, label, text) => {
        const s0 = get()
        const c: Comment = { id: `c${Date.now()}`, by: PERSONAS[s0.persona].name, role: s0.persona, at: now(), text }
        set((s) => ({ comments: { ...s.comments, [key]: [...(s.comments[key] ?? []), c] } }))
        get().log('Commented', `${label}: ${text}`)
        toast.success('Comment added', { description: label })
      },
      deleteComment: (key, id) => {
        set((s) => ({ comments: { ...s.comments, [key]: (s.comments[key] ?? []).filter((c) => c.id !== id) } }))
        get().log('Deleted comment', key)
        toast('Comment deleted')
      },
      acceptProposal: (text, action) => {
        set((s) => ({ proposals: s.proposals.filter((p) => p.text !== text) }))
        get().addAction(action, 'Proposal accepted and added to the register')
      },
      dismissProposal: (text, reason) => {
        set((s) => ({ proposals: s.proposals.filter((p) => p.text !== text), rejected: { ...s.rejected, [`proposal-${text}`]: reason } }))
        get().log('Dismissed proposal', `${text} (${reason})`)
        toast('Proposal dismissed', { description: reason })
      },
      propose: (text, authority, from = 'Ask ATLAS') => {
        if (get().proposals.some((p) => p.text === text)) return
        set((s) => ({ proposals: [...s.proposals, { text, authority, from }] }))
        get().log('Proposed action (needs confirmation)', text)
        toast('Proposal created', { description: 'It waits in the Action register until a named person accepts it.' })
      },
      respond: (response, reason) => {
        set({ decision: { response, reason, at: now() } })
        get().log('Decision response', reason ? `${response}: ${reason}` : response)
      },
      setPackStage: (st) => {
        set({ packStage: st })
        get().log('Pack stage', st)
      },
      setAnalyst: (v) => set({ analyst: v }),
      ask: (answerId, userText) => {
        const uid = `m${++seq}`
        const aid = `m${++seq}`
        let tid = get().activeThread
        const user: ChatMsg = { id: uid, role: 'user', text: userText }
        const reply: ChatMsg = { id: aid, role: 'atlas', answerId, phase: 'thinking' }
        set((s) => {
          if (tid && s.threads.some((t) => t.id === tid))
            return { assistantOpen: true, draft: '', threads: s.threads.map((t) => (t.id === tid ? { ...t, when: 'Today', messages: [...t.messages, user, reply] } : t)) }
          tid = `t${++seq}`
          const title = userText.length > 46 ? `${userText.slice(0, 44).trimEnd()}...` : userText
          return { assistantOpen: true, draft: '', activeThread: tid, threads: [{ id: tid, title, when: 'Today', messages: [user, reply] }, ...s.threads] }
        })
        get().regenerate(aid)
      },
      regenerate: (mid) => {
        const tid = get().activeThread
        const msg = get().threads.find((t) => t.id === tid)?.messages.find((m) => m.id === mid)
        if (!msg) return
        clearTimers(mid)
        set((s) => ({ threads: patchMsg(s.threads, tid, mid, { phase: 'thinking', startedAt: undefined, shown: undefined, feedback: undefined }) }))
        const t1 = window.setTimeout(() => set((s) => ({ threads: patchMsg(s.threads, tid, mid, { phase: 'streaming', startedAt: Date.now() }) })), THINK_MS)
        const t2 = window.setTimeout(() => { set((s) => ({ threads: patchMsg(s.threads, tid, mid, { phase: 'done' }) })); timers.delete(mid) }, THINK_MS + wordsOf(msg.answerId) * WORD_MS + 200)
        timers.set(mid, [t1, t2])
      },
      stop: () => {
        const tid = get().activeThread
        const live = get().threads.find((t) => t.id === tid)?.messages.find((m) => m.phase === 'thinking' || m.phase === 'streaming')
        if (!live) return
        clearTimers(live.id)
        const shown = live.phase === 'streaming' && live.startedAt ? Math.floor((Date.now() - live.startedAt) / WORD_MS) : 0
        set((s) => ({ threads: patchMsg(s.threads, tid, live.id, { phase: 'stopped', shown }) }))
      },
      rate: (mid, v) => {
        const tid = get().activeThread
        const cur = get().threads.find((t) => t.id === tid)?.messages.find((m) => m.id === mid)?.feedback
        set((s) => ({ threads: patchMsg(s.threads, tid, mid, { feedback: cur === v ? undefined : v }) }))
        if (cur !== v) toast(v === 'up' ? 'Thanks, marked as helpful' : 'Feedback sent to the ATLAS review queue', { description: v === 'down' ? 'A reviewer checks the sources behind this answer.' : undefined })
      },
      newChat: () => { get().stop(); set({ activeThread: null, draft: '' }) },
      openThread: (id) => { get().stop(); set({ activeThread: id }) },
      deleteThread: (id) => set((s) => ({ threads: s.threads.filter((t) => t.id !== id), activeThread: s.activeThread === id ? null : s.activeThread })),
      setDraft: (v) => set({ draft: v }),
      setAssistantOpen: (v) => set({ assistantOpen: v }),
      setRailCollapsed: (v) => set({ railCollapsed: v }),
      reset: () => {
        set({ ...initial, persona: get().persona, assistantOpen: false })
        toast.success('Session reset', { description: 'Registers, confirmations and scenarios restored.' })
      },
    }),
    {
      name: 'denera-atlas-demo',
      version: 2,
      migrate: () => ({}),
      storage: createJSONStorage(() => {
        try {
          return sessionStorage
        } catch {
          return { getItem: () => null, setItem: () => {}, removeItem: () => {} }
        }
      }),
      partialize: (s) => {
        const { threads: _t, activeThread: _a, draft: _d, ...rest } = s
        void _t; void _a; void _d
        return rest
      },
    },
  ),
)

export const usePersona = () => {
  const id = useDemo((s) => s.persona)
  return { id, persona: PERSONAS[id], isPcu: id === 'pcu', isDenera: id !== 'pcu' }
}

const NO_MSGS: ChatMsg[] = []
export const useChat = () => useDemo((s) => s.threads.find((t) => t.id === s.activeThread)?.messages ?? NO_MSGS)
export const useBusy = () => useDemo((s) => (s.threads.find((t) => t.id === s.activeThread)?.messages ?? NO_MSGS).some((m) => m.phase === 'thinking' || m.phase === 'streaming'))
