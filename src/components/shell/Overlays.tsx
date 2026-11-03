import { AlertCircle, CalendarClock, Check, CheckCircle2, CircleDashed, ClipboardList, Clock3, ExternalLink, FileText, Pencil, Plus, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../lib/cn'
import { FIN_DEFS, PROGRAM_TERMS } from '../../data/cakrawala'
import { EVIDENCE } from '../../data/evidence'
import { isDueThisWeek, isOverdue } from '../../data/registers'
import { useDemo, usePersona } from '../../state/store'
import { useUi } from '../../state/ui'
import { AuthorityLabel } from '../atlas/chips'
import { ActionFormModal, type ActionForm } from '../atlas/ActionEdit'
import { ReasonModal } from '../atlas/ReasonModal'
import type { Action } from '../../data/types'
import { Button } from '../ui/button'
import { Sheet } from '../ui/sheet'
import { Segmented } from '../ui/tabs'

export function EvidenceDrawer() {
  const id = useUi((s) => s.evidence)
  const close = useUi((s) => s.closeEvidence)
  const doc = id ? EVIDENCE[id] : null
  const [preview, setPreview] = useState(false)
  return (
    <Sheet open={!!doc} onOpenChange={(v) => { if (!v) { close(); setPreview(false) } }} title="Evidence" description={doc?.title}>
      {doc && (
        <div className="space-y-5">
          <dl className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2.5 text-[13px]">
            <dt className="text-ink-3">Document</dt><dd className="font-medium text-ink">{doc.title}</dd>
            <dt className="text-ink-3">Source system</dt><dd className="text-ink-2">{doc.system}</dd>
            <dt className="text-ink-3">Location</dt><dd className="text-ink-2">{doc.location}</dd>
            <dt className="text-ink-3">Refreshed</dt><dd className="tnum text-ink-2">{doc.refreshed}</dd>
            {doc.classification && (<><dt className="text-ink-3">Status</dt><dd className="text-ink-2">{doc.classification}</dd></>)}
            <dt className="text-ink-3">Classification</dt><dd className="text-ink-2">Confidential</dd>
          </dl>
          <figure className="rounded-lg bg-atlas-50 p-4">
            <figcaption className="text-[12px] font-medium text-atlas-700">Extract</figcaption>
            <blockquote className="mt-1.5 text-[14px] leading-relaxed text-ink">{doc.extract}</blockquote>
          </figure>
          <Button variant="outline" onClick={() => setPreview(true)}><ExternalLink />Open source</Button>
          {preview && (
            <div className="animate-rise rounded-xl border border-line bg-surface p-6">
              <div className="flex items-center gap-2 text-[12px] text-ink-3"><FileText className="size-4" />{doc.system}</div>
              <div className="mt-4 space-y-2">
                <div className="text-[15px] font-semibold text-ink">{doc.title}</div>
                <div className="text-[13px] text-ink-3">{doc.location}</div>
                {[90, 96, 72, 88, 60].map((w, i) => <div key={i} className="h-2 rounded bg-sunken" style={{ width: `${w}%` }} />)}
                <p className="rounded-sm bg-[#fff6c9] px-1 py-0.5 text-[13px] text-ink">{doc.extract}</p>
                {[94, 80, 66].map((w, i) => <div key={i} className="h-2 rounded bg-sunken" style={{ width: `${w}%` }} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </Sheet>
  )
}

export const STATUS_PILL: Record<Action['status'], { cls: string; Icon: typeof CircleDashed }> = {
  'Not started': { cls: 'border-line bg-sunken text-ink-2', Icon: CircleDashed },
  'In progress': { cls: 'border-info-line bg-info-bg text-info', Icon: Clock3 },
  Done: { cls: 'border-ok-line bg-ok-bg text-ok', Icon: CheckCircle2 },
}

/** Action status as a bordered pill, used wherever an action is listed. */
export function ActionStatus({ s }: { s: Action['status'] }) {
  const st = STATUS_PILL[s]
  return <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-px text-[12px] font-medium', st.cls)}><st.Icon className="size-3" />{s}</span>
}

export function RegisterSheet() {
  const open = useUi((s) => s.registerOpen)
  const setOpen = useUi((s) => s.setRegisterOpen)
  const actions = useDemo((s) => s.actions)
  const { isPcu } = usePersona()
  const [filter, setFilter] = useState<'all' | 'overdue' | 'week' | 'done'>('all')
  const [form, setForm] = useState<ActionForm | null>(null)
  const [dismissing, setDismissing] = useState<string | null>(null)
  const proposals = useDemo((s) => s.proposals)
  const dismiss = useDemo((s) => s.dismissProposal)
  const vis = actions.filter((a) => !isPcu || a.authority !== 'Shareholder (Denera)')
  const by = {
    all: vis.filter((a) => a.status !== 'Done'),
    overdue: vis.filter(isOverdue),
    week: vis.filter(isDueThisWeek),
    done: vis.filter((a) => a.status === 'Done'),
  }
  const list = by[filter]
  const chip = (label: string, n: number) => <span className="inline-flex items-center gap-1.5">{label}<span className="tnum text-[11.5px] opacity-75">{n}</span></span>
  return (
    <>
      <Sheet open={open} onOpenChange={setOpen} title="Action register" description="Shared by Meetings and the Decision room. Only confirmed items appear here.">
        {proposals.length > 0 && (
          <section className="relative mb-4 overflow-hidden rounded-xl border border-line px-4 pb-3 pt-4">
            <span className="absolute inset-x-0 top-0 h-[3px] bg-atlas-500" />
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md border border-atlas-200 bg-atlas-50 px-2 py-[3px] text-[10.5px] font-bold uppercase tracking-[0.06em] text-atlas-700"><Sparkles className="size-3" />Proposed by ATLAS</span>
              <span className="text-[12.5px] text-ink-3">{proposals.length} waiting for a named person</span>
            </div>
            <ul className="mt-2 divide-y divide-line-soft">
              {proposals.map((p) => (
                <li key={p.text} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-medium text-ink">{p.text}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-ink-3"><AuthorityLabel a={p.authority} />From {p.from}</div>
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="accent" onClick={() => setForm({ kind: 'proposal', proposal: p })}><Check />Accept</Button>
                    <Button size="sm" variant="secondary" onClick={() => setDismissing(p.text)}>Dismiss</Button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
        <Segmented value={filter} onChange={setFilter} label="Filter actions" items={[
          { value: 'all', label: chip('All open', by.all.length) },
          { value: 'overdue', label: chip('Overdue', by.overdue.length) },
          { value: 'week', label: chip('Due this week', by.week.length) },
          { value: 'done', label: chip('Done', by.done.length) },
        ]} />
        <Button size="sm" variant="accent" onClick={() => setForm({ kind: 'new' })}><Plus />New action</Button>
        </div>
        <ul className="mt-4 overflow-hidden rounded-xl border border-line">
          {list.map((a) => {
            return (
              <li key={a.id} className="flex items-start gap-3 border-b border-line-soft px-4 py-3 last:border-b-0 hover:bg-[#faf9fe]">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className={cn('text-[14px] font-medium text-ink', a.status === 'Done' && 'text-ink-3 line-through decoration-ink-4')}>{a.title}</span>
                    <AuthorityLabel a={a.authority} />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-ink-3">
                    <span className="text-ink-2">{a.owner}</span>
                    <span className={cn('tnum inline-flex items-center gap-1', isOverdue(a) && 'font-medium text-bad')}>
                      {isOverdue(a) ? <AlertCircle className="size-3.5" /> : <CalendarClock className="size-3.5" />}
                      {isOverdue(a) ? 'Overdue, was due ' : 'Due '}{a.due}{a.dueNote ? ` (${a.dueNote})` : ''}
                    </span>
                    <ActionStatus s={a.status} />
                    <span>Linked: {a.linked}</span>
                    <span className="text-ink-4">{a.id} · {a.source}</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setForm({ kind: 'edit', action: a })} aria-label={`Edit ${a.title}`}><Pencil />Edit</Button>
              </li>
            )
          })}
          {list.length === 0 && (
            <li className="px-5 py-12 text-center">
              <span className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-atlas-50 text-atlas-600"><ClipboardList className="size-6" /></span>
              <p className="text-[15px] font-semibold text-ink">No actions here</p>
              <p className="mt-1 text-[13px] text-ink-3">{filter === 'done' ? 'Closed actions appear here once an owner marks them done.' : 'No open actions match this filter.'}</p>
            </li>
          )}
        </ul>
        {isPcu && <p className="mt-3 text-[12px] text-ink-3">Project company view. Denera-only actions are hidden.</p>}
      </Sheet>
      <ActionFormModal form={form} onClose={() => setForm(null)} />
      <ReasonModal open={!!dismissing} onClose={() => setDismissing(null)} title="Dismiss proposed action" description={dismissing ?? ''} confirmLabel="Dismiss with reason" onConfirm={(r) => dismiss(dismissing!, r)} />
    </>
  )
}

export function DefinitionsSheet() {
  const open = useUi((s) => s.definitionsOpen)
  const setOpen = useUi((s) => s.setDefinitionsOpen)
  return (
    <Sheet open={open} onOpenChange={setOpen} title="Definitions" description="Financial definitions first, then programme and platform terms." width="w-[600px]">
      <h3 className="text-[14px] font-semibold text-ink">Financial definitions</h3>
      <dl className="mt-2 divide-y divide-line-soft">
        {FIN_DEFS.map((d) => (
          <div key={d.term} className="py-2.5">
            <dt className="text-[13px] font-medium text-ink">{d.plain} <span className="font-normal text-ink-3">· {d.term}</span></dt>
            <dd className="mt-0.5 text-[13px] leading-relaxed text-ink-2">{d.def}</dd>
          </div>
        ))}
      </dl>
      <h3 className="mt-6 text-[14px] font-semibold text-ink">Programme and platform terms</h3>
      <dl className="mt-2 grid grid-cols-[130px_1fr] gap-x-4 gap-y-2 text-[13px]">
        {PROGRAM_TERMS.map((t) => (
          <div key={t.term} className="contents">
            <dt className="font-medium text-ink">{t.term}</dt>
            <dd className="text-ink-2">{t.def}</dd>
          </div>
        ))}
      </dl>
    </Sheet>
  )
}

export function AuditSheet() {
  const open = useUi((s) => s.auditOpen)
  const setOpen = useUi((s) => s.setAuditOpen)
  const audit = useDemo((s) => s.audit)
  return (
    <Sheet open={open} onOpenChange={setOpen} title="Audit log" description="Read-only. Every change is recorded with the role and time.">
      <ol className="space-y-0">
        {audit.map((l, i) => (
          <li key={i} className="grid grid-cols-[112px_1fr] gap-3 border-b border-line-soft py-2.5 text-[13px] last:border-0">
            <span className="tnum text-ink-3">{l.t}</span>
            <span><span className="font-medium text-ink">{l.action}</span> <span className="text-ink-2">{l.object}</span><span className="block text-ink-3">{l.persona}</span></span>
          </li>
        ))}
      </ol>
    </Sheet>
  )
}

export function ActionBar() {
  const actions = useDemo((s) => s.actions)
  const { isPcu } = usePersona()
  const setOpen = useUi((s) => s.setRegisterOpen)
  const vis = actions.filter((a) => !isPcu || a.authority !== 'Shareholder (Denera)')
  const open = vis.filter((a) => a.status !== 'Done').length
  const overdue = vis.filter(isOverdue).length
  const week = vis.filter(isDueThisWeek).length
  return (
    <div className="pointer-events-none sticky bottom-0 z-20 flex justify-center px-4 pb-3 sm:px-6">
      <button
        onClick={() => setOpen(true)}
        className="press float pointer-events-auto flex h-11 items-center gap-3 rounded-full bg-atlas-950 pl-4 pr-2 sm:gap-4 text-[13px] text-white hover:bg-atlas-900"
        aria-label={`Action register: ${open} open, ${overdue} overdue, ${week} due this week`}
      >
        <ClipboardList className="size-4 text-atlas-300" />
        <span className="hidden font-medium sm:inline">Action register</span>
        <span className="tnum flex items-center gap-3 whitespace-nowrap text-atlas-100">
          <span><b className="font-semibold text-white">{open}</b> open</span>
          <span className="flex items-center gap-1"><AlertCircle className="size-3.5 text-[#ff9c86]" /><b className="font-semibold text-white">{overdue}</b> overdue</span>
          <span className="hidden md:inline"><b className="font-semibold text-white">{week}</b> due this week</span>
        </span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium">Open</span>
      </button>
    </div>
  )
}
