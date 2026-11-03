import { AlertCircle, Check, ClipboardList, Gavel, Hourglass, Pencil, Target, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AuthorityLabel, Stamp } from '../components/atlas/chips'
import { ScreenFrame, StatTile } from '../components/atlas/frame'
import { Button } from '../components/ui/button'
import { Card, CardBody, CardHeader } from '../components/ui/card'
import { Segmented } from '../components/ui/tabs'
import { NoResults, ResultFooter } from '../components/ui/toolbar'
import { Modal } from '../components/ui/sheet'
import { SelectInput } from '../components/ui/form'
import { ReasonModal } from '../components/atlas/ReasonModal'
import { Field, ReadOnly, TextInput } from '../components/ui/form'
import { fmtDate, weekdayOf } from '../lib/date'
import { Tip } from '../components/ui/tooltip'
import { MEETING_ITEMS, MEETING_NOTE, isOverdue, type MeetingItem } from '../data/registers'
import { cn } from '../lib/cn'
import { useDemo, usePersona } from '../state/store'
import { useUi } from '../state/ui'

const CONF = { High: 'text-ok', Medium: 'text-warn', Low: 'text-bad' }
type Filter = 'all' | 'awaiting' | 'confirmed' | 'rejected'

export function S05Meetings() {
  const [hover, setHover] = useState<number | null>(null)
  const [editing, setEditing] = useState<MeetingItem | null>(null)
  const [rejecting, setRejecting] = useState<MeetingItem | null>(null)
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
      addAction({ title: m.title, owner: e?.owner ?? m.owner, authority: m.authority, due: e?.due ?? m.due.replace(' (a Sunday)', ''), dueIso: e?.dueIso ?? m.dueIso, status: 'Not started', linked: m.linked, source: 'Steering committee 29 Jun' }, 'Confirmed by the chair and added to the register')
  }

  const overdue = actions.filter(isOverdue)
  const [f, setF] = useState<Filter>('all')
  const stateOf = (m: MeetingItem) => (confirmed[`meet-${m.id}`] ? 'confirmed' : rejected[`meet-${m.id}`] ? 'rejected' : 'awaiting')
  const awaiting = MEETING_ITEMS.filter((m) => stateOf(m) === 'awaiting')
  const shown = MEETING_ITEMS.filter((m) => f === 'all' || stateOf(m) === f)

  return (
    <ScreenFrame
      headline="Six items were proposed from yesterday's steering meeting. Nothing becomes an action until the chair confirms it."
      status="Yellow"
      statusLabel={`${MEETING_ITEMS.filter((m) => !confirmed[`meet-${m.id}`] && !rejected[`meet-${m.id}`]).length} awaiting the chair`}
      aside={<Button variant="outline" onClick={() => setRegister(true)}><ClipboardList />Open action register</Button>}
    >
      {/* Stat row */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={Hourglass} tone="warn" label="Awaiting the chair" value={awaiting.length} cap="Nothing becomes an action until confirmed" />
        <StatTile icon={AlertCircle} tone="bad" label="Overdue actions" value={overdue.length} cap={overdue.length ? `Oldest was due ${overdue[0].due}` : 'Nothing overdue'} onClick={() => setRegister(true)} />
        <StatTile icon={Gavel} label="Deferred decisions" value="1" cap="Boiler island recovery strategy, now in the Decision room" />
        <StatTile icon={Target} tone="ok" label="Action closure rate" value="71%" cap="Closed on time over the last eight weeks">
          <span className="mt-1.5 block h-1.5 rounded-full bg-sunken"><span className="block h-full rounded-full bg-ok" style={{ width: '71%' }} /></span>
        </StatTile>
      </div>

      <div className="mt-[18px] grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_400px]">
        {/* Proposed items */}
        <Card>
          <CardHeader
            title="Proposed by ATLAS"
            sub={chair ? 'Edit, reject or confirm each item. Confirmed actions enter the register.' : 'View only. The chair confirms.'}
            aside={<Stamp kind="extracted" />}
          />
          <div className="px-[18px] pb-3 pt-3.5">
            <Segmented<Filter> label="Item state" value={f} onChange={setF} items={[
              { value: 'all', label: `All ${MEETING_ITEMS.length}` },
              { value: 'awaiting', label: `Awaiting ${awaiting.length}` },
              { value: 'confirmed', label: `Confirmed ${MEETING_ITEMS.filter((m) => confirmed[`meet-${m.id}`]).length}` },
              { value: 'rejected', label: `Rejected ${MEETING_ITEMS.filter((m) => rejected[`meet-${m.id}`]).length}` },
            ]} />
          </div>
          <ul className="border-t border-line">
            {shown.map((m) => {
              const c = confirmed[`meet-${m.id}`]
              const r = rejected[`meet-${m.id}`]
              const e = edits[m.id]
              return (
                <li key={m.id} onMouseEnter={() => setHover(m.sentence)} onMouseLeave={() => setHover(null)} className={cn('flex flex-wrap items-start gap-x-4 gap-y-3 border-b border-line-soft px-[18px] py-3.5 transition-colors last:border-b-0 hover:bg-[#faf9fe]', r && 'opacity-60')}>
                  <div className="min-w-0 flex-1 basis-[300px]">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-ink-3">
                      <span className="inline-flex items-center rounded-md border border-line bg-sunken px-1.5 py-px font-medium text-ink-2">{m.kind}</span>
                      <span>Confidence <span className={cn('font-medium', CONF[m.confidence])}>{m.confidence}</span></span>
                    </div>
                    <div className="mt-1 text-[14px] font-medium leading-snug text-ink">{m.title}</div>
                    <div className="mt-1 flex flex-wrap gap-x-3.5 gap-y-0.5 text-[13px] text-ink-2">
                      <span><span className="text-ink-3">Owner </span>{e?.owner && e.owner !== m.owner ? <><s className="text-ink-4">{m.owner}</s> {e.owner}</> : m.owner === 'Unclear' ? <span className="font-medium text-bad">Unclear</span> : m.owner}</span>
                      <span className="tnum"><span className="text-ink-3">Due </span>{e ? <><s className="text-ink-4">{m.due}</s> {e.due}</> : m.due}</span>
                      <span><span className="text-ink-3">Linked </span>{m.linked}</span>
                    </div>
                    {m.note && <div className="mt-1 text-[12px] text-ink-3">{m.note}</div>}
                  </div>
                  <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                    <AuthorityLabel a={m.authority} />
                    {c ? <Stamp kind="confirmed" who={c.by} when={c.at} /> : r ? <span className="max-w-[220px] text-[12px] text-ink-3">Rejected: {r}</span> : (
                      <div className="flex items-center gap-1.5">
                        <Tip content={chair ? 'Edit owner or due date before confirming' : 'Chair only'}><span><Button size="iconSm" variant="outline" aria-label={`Edit ${m.title}`} disabled={!chair} onClick={() => setEditing(m)}><Pencil /></Button></span></Tip>
                        <Tip content={chair ? 'Reject with a reason' : 'Chair only'}><span><Button size="iconSm" variant="outline" aria-label={`Reject ${m.title}`} disabled={!chair} onClick={() => setRejecting(m)}><X /></Button></span></Tip>
                        <Tip content={chair ? (m.kind === 'Decision' ? 'Record the deferral' : 'Create the action in the register') : 'Chair only'}><span><Button size="sm" disabled={!chair} onClick={() => doConfirm(m)}><Check />{m.kind === 'Decision' ? 'Confirm deferral' : 'Confirm'}</Button></span></Tip>
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
            {shown.length === 0 && <li><NoResults noun="items" onReset={() => setF('all')} /></li>}
          </ul>
          <ResultFooter shown={shown.length} total={MEETING_ITEMS.length} noun="items" filtered={f !== 'all'} onReset={() => setF('all')} />
        </Card>

        {/* Meeting note and overdue actions */}
        <div className="flex flex-col gap-[18px]">
          <Card>
            <CardHeader title="Meeting note" sub={`${MEETING_NOTE.date} · Chair: ${MEETING_NOTE.chair}`} />
            <CardBody className="pt-3">
              <h3 className="text-[14px] font-semibold leading-snug text-ink">{MEETING_NOTE.title}</h3>
              <div className="mt-3 space-y-1 text-[14px] leading-[1.6] text-ink-2">
                {MEETING_NOTE.paragraphs.map((p, i) => (
                  <p key={i} className={cn('rounded-md px-2 py-1.5 transition-colors', hover === i && 'bg-[#fff6c9] text-ink')}>{p}</p>
                ))}
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Overdue actions" aside={<Button size="sm" variant="link" onClick={() => setRegister(true)}>Open register</Button>} />
            <CardBody className="pt-2">
              {overdue.length ? (
                <ul className="divide-y divide-line-soft">
                  {overdue.map((a) => (
                    <li key={a.id} className="py-2.5 first:pt-0 last:pb-0">
                      <div className="text-[14px] font-medium text-ink">{a.title}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-ink-3"><span>{a.owner}</span><span className="tnum font-medium text-bad">Was due {a.due}</span><AuthorityLabel a={a.authority} /></div>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-[13px] text-ink-3">Nothing is overdue.</p>}
            </CardBody>
          </Card>
        </div>
      </div>

      <EditItemModal item={editing} current={editing ? edits[editing.id] : undefined} onClose={() => setEditing(null)} onSave={(due, dueIso, owner) => setEdit(editing!.id, due, dueIso, owner)} />

      <ReasonModal open={!!rejecting} onClose={() => setRejecting(null)} title="Reject proposed item" description={rejecting?.title} initial={rejecting?.id === 'M6' ? 'Not discussed as an action' : ''} onConfirm={(r) => reject(`meet-${rejecting!.id}`, r, rejecting!.title)} danger />
    </ScreenFrame>
  )
}

const OWNERS = ['Commercial and Legal Lead', 'Commercial Lead', 'Technical Director', 'Procurement Lead', 'Finance Lead', 'PMO Director', 'Project Director', 'Site manager']

/** Chair edits the owner and due date of a proposed item before confirming it. */
function EditItemModal({ item, current, onClose, onSave }: { item: MeetingItem | null; current?: { due: string; dueIso: string; owner?: string }; onClose: () => void; onSave: (due: string, dueIso: string, owner: string) => void }) {
  const [owner, setOwner] = useState('')
  const [due, setDue] = useState('')
  const [tried, setTried] = useState(false)
  useEffect(() => {
    if (!item) return
    setOwner(current?.owner ?? (item.owner === 'Unclear' ? '' : item.owner))
    setDue(current?.dueIso ?? (item.dueIso === '2027-07-04' ? '2027-07-06' : item.dueIso ?? ''))
    setTried(false)
  }, [item, current])
  const ownerErr = tried && !owner && 'Choose a named owner. An item cannot enter the register without one.'
  const dueErr = tried && !due && 'Enter a due date.'
  const weekend = due && [0, 6].includes(weekdayOf(due))
  return (
    <Modal
      open={!!item}
      onOpenChange={(v) => !v && onClose()}
      title="Edit before confirming"
      description={item?.title}
      onSubmit={() => { setTried(true); if (owner && due) { onSave(fmtDate(due, true), due, owner); onClose() } }}
      footer={<><Button variant="outline" type="button" onClick={onClose}>Cancel</Button><Button type="submit"><Check />Save changes</Button></>}
    >
      {item && <ReadOnly items={[['Kind', item.kind], ['Authority', item.authority], ['Linked to', item.linked], ['Proposed by ATLAS', `${item.owner}, ${item.due}`]]} />}
      <Field label="Owner" required error={ownerErr}>
        {(id, d) => (
          <SelectInput id={id} aria-describedby={d} value={owner} onChange={(e) => setOwner(e.target.value)} invalid={!!ownerErr}>
            <option value="">Choose an owner</option>
            {OWNERS.map((o) => <option key={o}>{o}</option>)}
          </SelectInput>
        )}
      </Field>
      <Field label="Due date" required error={dueErr} hint={weekend ? `${fmtDate(due, true)} falls on a weekend.` : item?.id === 'M3' ? 'ATLAS proposed 4 Jul 2027, a Sunday. Tuesday 6 Jul 2027 is suggested.' : undefined}>
        {(id, d) => <TextInput id={id} aria-describedby={d} type="date" value={due} onChange={(e) => setDue(e.target.value)} invalid={!!dueErr} />}
      </Field>
    </Modal>
  )
}
