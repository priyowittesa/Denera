import { Check, ClipboardList, Pencil, X } from 'lucide-react'
import { useState } from 'react'
import { AuthorityLabel, Stamp } from '../components/atlas/chips'
import { ScreenFrame } from '../components/atlas/frame'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Modal } from '../components/ui/sheet'
import { Tip } from '../components/ui/tooltip'
import { MEETING_ITEMS, MEETING_NOTE, isOverdue, type MeetingItem } from '../data/registers'
import { cn } from '../lib/cn'
import { useDemo, usePersona } from '../state/store'
import { useUi } from '../state/ui'

const CONF = { High: 'text-ok', Medium: 'text-warn', Low: 'text-bad' }

export function S05Meetings() {
  const [hover, setHover] = useState<number | null>(null)
  const [editing, setEditing] = useState<MeetingItem | null>(null)
  const [rejecting, setRejecting] = useState<MeetingItem | null>(null)
  const [due, setDue] = useState('2027-07-06')
  const [reason, setReason] = useState('Not discussed as an action')
  const confirmed = useDemo((s) => s.confirmed)
  const rejected = useDemo((s) => s.rejected)
  const edits = useDemo((s) => s.edits)
  const confirm = useDemo((s) => s.confirm)
  const reject = useDemo((s) => s.reject)
  const setEdit = useDemo((s) => s.setEdit)
  const addAction = useDemo((s) => s.addAction)
  const actions = useDemo((s) => s.actions)
  const setRegister = useUi((s) => s.setRegisterOpen)
  const { id: pid } = usePersona()
  const chair = pid === 'pmo'

  const doConfirm = (m: MeetingItem) => {
    const e = edits[m.id]
    confirm(`meet-${m.id}`, m.title)
    if (m.kind === 'Action')
      addAction({ title: m.title, owner: m.owner, authority: m.authority, due: e?.due ?? m.due.replace(' (a Sunday)', ''), dueIso: e?.dueIso ?? m.dueIso, status: 'Not started', linked: m.linked, source: 'Steering committee 29 Jun' }, 'Confirmed by the chair and added to the register')
  }

  const overdue = actions.filter(isOverdue)

  return (
    <ScreenFrame
      headline="Six items were proposed from yesterday's steering meeting. Nothing becomes an action until the chair confirms it."
      status="Yellow"
      statusLabel={`${MEETING_ITEMS.filter((m) => !confirmed[`meet-${m.id}`] && !rejected[`meet-${m.id}`]).length} awaiting the chair`}
      aside={<Button variant="outline" onClick={() => setRegister(true)}><ClipboardList />Open action register</Button>}
    >
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card className="p-6">
          <div className="text-[12px] font-medium text-ink-3">{MEETING_NOTE.date} · Chair: {MEETING_NOTE.chair}</div>
          <h2 className="mt-1 text-[16px] font-semibold text-ink">{MEETING_NOTE.title}</h2>
          <div className="mt-4 space-y-3 text-[13.5px] leading-relaxed text-ink-2">
            {MEETING_NOTE.paragraphs.map((p, i) => (
              <p key={i} className={cn('rounded-md px-2 py-1 transition-colors', hover === i && 'bg-[#fff6c9] text-ink')}>{p}</p>
            ))}
          </div>
        </Card>

        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[15px] font-semibold text-ink">Proposed by ATLAS</h2>
            {!chair && <span className="text-[12px] text-ink-3">View only. Chair confirms.</span>}
          </div>
          <ul className="space-y-2.5">
            {MEETING_ITEMS.map((m) => {
              const c = confirmed[`meet-${m.id}`]
              const r = rejected[`meet-${m.id}`]
              const e = edits[m.id]
              return (
                <li key={m.id} onMouseEnter={() => setHover(m.sentence)} onMouseLeave={() => setHover(null)} className={cn('rounded-xl border bg-surface p-4 transition-colors', c ? 'border-ok/30' : r ? 'border-line opacity-55' : 'border-line hover:border-atlas-300')}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[11.5px] font-medium text-ink-3">{m.kind} · confidence <span className={CONF[m.confidence]}>{m.confidence}</span></div>
                      <div className="text-[14px] font-medium text-ink">{m.title}</div>
                    </div>
                    <AuthorityLabel a={m.authority} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-ink-2">
                    <span><span className="text-ink-3">Owner </span>{m.owner === 'Unclear' ? <span className="font-medium text-bad">Unclear</span> : m.owner}</span>
                    <span className="tnum"><span className="text-ink-3">Due </span>{e ? <><s className="text-ink-4">{m.due}</s> {e.due}</> : m.due}</span>
                    <span><span className="text-ink-3">Linked </span>{m.linked}</span>
                  </div>
                  {m.note && <div className="mt-1 text-[12px] text-ink-3">{m.note}</div>}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {c ? <Stamp kind="confirmed" who={c.by} when={c.at} /> : r ? <span className="text-[12px] text-ink-3">Rejected: {r}</span> : (
                      <>
                        <Stamp kind="extracted" />
                        <span className="flex-1" />
                        <Tip content={chair ? 'Edit owner or due date before confirming' : 'Chair only'}><span><Button size="sm" variant="ghost" disabled={!chair} onClick={() => { setEditing(m); setDue(m.dueIso === '2027-07-04' ? '2027-07-06' : (m.dueIso ?? '2027-07-06')) }}><Pencil />Edit</Button></span></Tip>
                        <Tip content={chair ? 'Reject with a reason' : 'Chair only'}><span><Button size="sm" variant="outline" disabled={!chair} onClick={() => setRejecting(m)}><X />Reject</Button></span></Tip>
                        <Tip content={chair ? (m.kind === 'Decision' ? 'Record the deferral' : 'Create the action in the register') : 'Chair only'}><span><Button size="sm" disabled={!chair} onClick={() => doConfirm(m)}><Check />{m.kind === 'Decision' ? 'Confirm deferral' : 'Confirm'}</Button></span></Tip>
                      </>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <section className="mt-6 grid items-start gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="text-[12.5px] font-medium text-ink-3">Overdue actions</div>
          <div className="tnum text-[28px] font-semibold text-bad">{overdue.length}</div>
          <ul className="mt-2 space-y-1.5 text-[12.5px]">{overdue.map((a) => <li key={a.id}><span className="text-ink">{a.title}</span><span className="block text-ink-3">{a.owner} · was due {a.due} · <AuthorityLabel a={a.authority} /></span></li>)}</ul>
        </Card>
        <Card className="p-5">
          <div className="text-[12.5px] font-medium text-ink-3">Deferred decisions</div>
          <div className="tnum text-[28px] font-semibold text-ink">1</div>
          <p className="mt-2 text-[12.5px] text-ink-2">Boiler island recovery strategy. Reason: waiting for the revised recovery programme. Now in the Decision room.</p>
        </Card>
        <Card className="p-5">
          <div className="text-[12.5px] font-medium text-ink-3">Action closure rate</div>
          <div className="tnum text-[28px] font-semibold text-ink">71%</div>
          <div className="mt-2 h-2 rounded-full bg-sunken"><div className="h-full rounded-full bg-series-verified" style={{ width: '71%' }} /></div>
          <p className="mt-2 text-[12px] text-ink-3">Closed on time over the last eight weeks.</p>
        </Card>
      </section>

      <Modal open={!!editing} onOpenChange={(v) => !v && setEditing(null)} title="Edit before confirming" description={editing?.title} footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={() => { const d = new Date(`${due}T00:00:00Z`); const label = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).replace(',', ''); setEdit(editing!.id, label, due); setEditing(null) }}>Save</Button></>}>
        <label htmlFor="due" className="text-[12.5px] font-medium text-ink-2">Due date</label>
        <input id="due" type="date" value={due} onChange={(e) => setDue(e.target.value)} className="tnum mt-1 block w-full rounded-md border border-line bg-sunken px-3 py-2 text-[14px] outline-none focus:border-atlas-500" />
        {editing?.id === 'M3' && <p className="mt-2 text-[12.5px] text-ink-3">ATLAS proposed 4 Jul 2027, which is a Sunday. Tuesday 6 Jul 2027 is suggested.</p>}
      </Modal>

      <Modal open={!!rejecting} onOpenChange={(v) => !v && setRejecting(null)} title="Reject proposed item" description={rejecting?.title} footer={<><Button variant="ghost" onClick={() => setRejecting(null)}>Cancel</Button><Button disabled={!reason.trim()} onClick={() => { reject(`meet-${rejecting!.id}`, reason.trim(), rejecting!.title); setRejecting(null) }}>Reject with reason</Button></>}>
        <label htmlFor="rr" className="text-[12.5px] font-medium text-ink-2">Reason</label>
        <textarea id="rr" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 w-full rounded-md border border-line bg-sunken px-3 py-2 text-[13.5px] outline-none focus:border-atlas-500" />
      </Modal>
    </ScreenFrame>
  )
}
