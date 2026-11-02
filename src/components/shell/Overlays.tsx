import { AlertCircle, CalendarClock, ClipboardList, ExternalLink, FileText } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../lib/cn'
import { FIN_DEFS, PROGRAM_TERMS } from '../../data/cakrawala'
import { EVIDENCE } from '../../data/evidence'
import { isDueThisWeek, isOverdue } from '../../data/registers'
import { useDemo, usePersona } from '../../state/store'
import { useUi } from '../../state/ui'
import { AuthorityLabel } from '../atlas/chips'
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
            <dt className="text-ink-3">Classification</dt><dd className="text-ink-2">Confidential (illustrative scheme)</dd>
          </dl>
          <figure className="rounded-lg bg-atlas-50 p-4">
            <figcaption className="text-[12px] font-medium text-atlas-700">Extract</figcaption>
            <blockquote className="mt-1.5 text-[14px] leading-relaxed text-ink">{doc.extract}</blockquote>
          </figure>
          <Button variant="outline" onClick={() => setPreview(true)}><ExternalLink />Open source</Button>
          {preview && (
            <div className="animate-rise rounded-xl border border-line bg-surface p-6">
              <div className="flex items-center gap-2 text-[12px] text-ink-3"><FileText className="size-4" />{doc.system} · placeholder preview</div>
              <div className="mt-4 space-y-2">
                <div className="text-[15px] font-semibold text-ink">{doc.title}</div>
                <div className="text-[13px] text-ink-3">{doc.location}</div>
                {[90, 96, 72, 88, 60].map((w, i) => <div key={i} className="h-2 rounded bg-sunken" style={{ width: `${w}%` }} />)}
                <p className="rounded-sm bg-[#fff6c9] px-1 py-0.5 text-[13px] text-ink">{doc.extract}</p>
                {[94, 80, 66].map((w, i) => <div key={i} className="h-2 rounded bg-sunken" style={{ width: `${w}%` }} />)}
              </div>
              <p className="mt-4 text-[12px] text-ink-4">Synthetic document for the demonstration. Clause numbers are placeholders.</p>
            </div>
          )}
        </div>
      )}
    </Sheet>
  )
}

export function RegisterSheet() {
  const open = useUi((s) => s.registerOpen)
  const setOpen = useUi((s) => s.setRegisterOpen)
  const actions = useDemo((s) => s.actions)
  const { isPcu } = usePersona()
  const [filter, setFilter] = useState<'all' | 'overdue' | 'week'>('all')
  const list = actions
    .filter((a) => !isPcu || a.authority !== 'Shareholder (Denera)')
    .filter((a) => (filter === 'overdue' ? isOverdue(a) : filter === 'week' ? isDueThisWeek(a) : true))
  return (
    <Sheet open={open} onOpenChange={setOpen} title="Action register" description="Shared by Meetings (S5) and the Decision room (S13). Only confirmed items appear here." width="w-[640px]">
      <Segmented value={filter} onChange={setFilter} items={[{ value: 'all', label: 'All open' }, { value: 'overdue', label: 'Overdue' }, { value: 'week', label: 'Due this week' }]} />
      <ul className="mt-4 divide-y divide-line-soft rounded-xl border border-line">
        {list.map((a) => (
          <li key={a.id} className="grid gap-1 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <span className="text-[14px] font-medium text-ink">{a.title}</span>
              <AuthorityLabel a={a.authority} />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-3">
              <span>{a.owner}</span>
              <span className={cn('tnum inline-flex items-center gap-1', isOverdue(a) && 'font-medium text-bad')}>
                {isOverdue(a) ? <AlertCircle className="size-3.5" /> : <CalendarClock className="size-3.5" />}
                {isOverdue(a) ? 'Overdue, was due ' : 'Due '}{a.due}{a.dueNote ? ` (${a.dueNote})` : ''}
              </span>
              <span>{a.status}</span>
              <span>Linked: {a.linked}</span>
              <span className="text-ink-4">{a.id} · {a.source}</span>
            </div>
          </li>
        ))}
        {list.length === 0 && <li className="px-4 py-8 text-center text-[13px] text-ink-3">No actions match this filter.</li>}
      </ul>
      {isPcu && <p className="mt-3 text-[12px] text-ink-3">Project company view. Denera-only actions are hidden.</p>}
    </Sheet>
  )
}

export function DefinitionsSheet() {
  const open = useUi((s) => s.definitionsOpen)
  const setOpen = useUi((s) => s.setDefinitionsOpen)
  return (
    <Sheet open={open} onOpenChange={setOpen} title="Definitions" description="Financial definitions first, then programme and platform terms." width="w-[600px]">
      <h3 className="text-[13px] font-semibold text-ink">Financial definitions</h3>
      <dl className="mt-2 divide-y divide-line-soft">
        {FIN_DEFS.map((d) => (
          <div key={d.term} className="py-2.5">
            <dt className="text-[13px] font-medium text-ink">{d.plain} <span className="font-normal text-ink-3">· {d.term}</span></dt>
            <dd className="mt-0.5 text-[13px] leading-relaxed text-ink-2">{d.def}</dd>
          </div>
        ))}
      </dl>
      <h3 className="mt-6 text-[13px] font-semibold text-ink">Programme and platform terms</h3>
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
    <Sheet open={open} onOpenChange={setOpen} title="Audit log" description="Read-only. Every state change is recorded with persona and time.">
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
