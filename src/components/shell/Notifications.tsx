import * as P from '@radix-ui/react-popover'
import { AlertCircle, Bell, ChevronRight, Hourglass, ScrollText, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { APPROVAL_QUEUE } from '../../data/runs'
import { isOverdue } from '../../data/registers'
import type { PersonaId } from '../../data/types'
import { usePersona, useDemo } from '../../state/store'
import { useUi } from '../../state/ui'

/** Which approval-queue owners each role answers for. */
const MINE: Record<PersonaId, string[]> = {
  ceo: ['Investment and legal lead'],
  coo: [],
  pmo: ['PMO Director', 'PMO lead', 'Technical Director'],
  cll: ['Commercial and Legal Lead', 'Investment and legal lead'],
  bn: [],
  pcu: ['Technical Director'],
}

type Item = { key: string; icon: typeof Bell; tone: string; title: string; sub: string; go: () => void }

/** Bell: what is waiting for the current role (approvals, overdue actions, ATLAS proposals), then the audit log. */
export function Notifications() {
  const nav = useNavigate()
  const { id, isPcu } = usePersona()
  const actions = useDemo((s) => s.actions)
  const proposals = useDemo((s) => s.proposals)
  const confirmed = useDemo((s) => s.confirmed)
  const setAudit = useUi((s) => s.setAuditOpen)
  const setRegister = useUi((s) => s.setRegisterOpen)

  const items: Item[] = [
    ...APPROVAL_QUEUE.filter((q) => MINE[id].includes(q.who) && !(isPcu && q.denaraOnly) && !(q.to.startsWith('/critical-path') && confirmed['interface-conflict']))
      .map((q) => ({ key: q.text, icon: Hourglass, tone: 'bg-atlas-50 text-atlas-600', title: q.text, sub: `Waiting for you · ${q.who}`, go: () => nav(q.to) })),
    ...actions.filter((a) => isOverdue(a) && (!isPcu || a.authority !== 'Shareholder (Denera)'))
      .map((a) => ({ key: a.id, icon: AlertCircle, tone: 'bg-bad-bg text-bad', title: a.title, sub: `Overdue since ${a.due} · ${a.owner}`, go: () => setRegister(true) })),
    ...proposals.map((p) => ({ key: p.text, icon: Sparkles, tone: 'bg-atlas-50 text-atlas-600', title: p.text, sub: 'Proposed by ATLAS · needs a named owner', go: () => setRegister(true) })),
  ]

  return (
    <P.Root>
      <P.Trigger asChild>
        <button className="press relative grid size-9 place-items-center rounded-lg border border-line bg-surface text-ink-2 hover:bg-sunken data-[state=open]:bg-sunken" aria-label={`Notifications, ${items.length}`}>
          <Bell className="size-4" />
          {items.length > 0 && <span className="tnum absolute -right-1 -top-1 grid h-[17px] min-w-[17px] place-items-center rounded-full border-2 border-surface bg-bad px-1 text-[10px] font-bold text-white">{items.length}</span>}
        </button>
      </P.Trigger>
      <P.Portal>
        <P.Content align="end" sideOffset={8} collisionPadding={12} className="float z-[70] w-[380px] max-w-[calc(100vw-24px)] origin-[var(--radix-popover-content-transform-origin)] animate-pop overflow-hidden rounded-[10px] bg-surface outline-none">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="text-[14px] font-semibold text-ink">Notifications</span>
            <span className="text-[12px] text-ink-3">{items.length} need attention</span>
          </div>
          {items.length ? (
            <ul className="max-h-[60vh] overflow-y-auto p-1">
              {items.map((it) => (
                <li key={it.key}>
                  <P.Close asChild>
                    <button onClick={it.go} className="press flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left hover:bg-sunken">
                      <span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg ${it.tone}`}><it.icon className="size-3.5" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-medium leading-snug text-ink">{it.title}</span>
                        <span className="mt-0.5 block text-[12px] text-ink-3">{it.sub}</span>
                      </span>
                      <ChevronRight className="mt-1 size-4 shrink-0 text-ink-4" />
                    </button>
                  </P.Close>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-8 text-center text-[13px] text-ink-3">Nothing is waiting for you.</p>
          )}
          <P.Close asChild>
            <button onClick={() => setAudit(true)} className="press flex w-full items-center gap-2 border-t border-line px-4 py-2.5 text-[13px] font-medium text-atlas-700 hover:bg-sunken">
              <ScrollText className="size-4" />Open audit log
            </button>
          </P.Close>
        </P.Content>
      </P.Portal>
    </P.Root>
  )
}
