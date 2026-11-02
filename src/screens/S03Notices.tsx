import { CalendarDays, Check, FileText, List, Send, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AuthorityLabel, Stamp, StatusChip } from '../components/atlas/chips'
import { ScreenFrame } from '../components/atlas/frame'
import { AnswerView } from '../components/atlas/AnswerView'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Modal, Sheet } from '../components/ui/sheet'
import { Segmented } from '../components/ui/tabs'
import { NOTICES, type Notice } from '../data/registers'
import type { Authority } from '../data/types'
import { cn } from '../lib/cn'
import { useDemo, usePersona } from '../state/store'
import { useUi } from '../state/ui'

type View = 'list' | 'calendar'

export function S03Notices() {
  const [params] = useSearchParams()
  const [view, setView] = useState<View>('list')
  const [proj, setProj] = useState('All')
  const [auth, setAuth] = useState<'All' | Authority>('All')
  const [draft, setDraft] = useState(params.get('draft') === '1')
  const [rejecting, setRejecting] = useState<Notice | null>(null)
  const [reason, setReason] = useState('')
  const [qa, setQa] = useState(false)
  const confirmed = useDemo((s) => s.confirmed)
  const rejected = useDemo((s) => s.rejected)
  const confirm = useDemo((s) => s.confirm)
  const reject = useDemo((s) => s.reject)
  const requests = useDemo((s) => s.requests)
  const addRequest = useDemo((s) => s.addRequest)
  const openEv = useUi((s) => s.openEvidence)
  const { id: pid, isPcu } = usePersona()
  const canConfirm = pid === 'cll'

  useEffect(() => { if (params.get('draft') === '1') setDraft(true) }, [params])

  const badge = (n: Notice) => (confirmed[`notice-${n.id}`] ? 'Confirmed' : rejected[`notice-${n.id}`] ? 'Rejected' : n.badge)
  const rows = NOTICES
    .filter((n) => !isPcu || (n.project === 'Cakrawala' && n.authority !== 'Shareholder (Denera)'))
    .filter((n) => proj === 'All' || n.project === proj)
    .filter((n) => auth === 'All' || n.authority === auth)
  const projects = ['All', ...new Set(NOTICES.filter((n) => !isPcu || n.project === 'Cakrawala').map((n) => n.project))]

  return (
    <ScreenFrame
      headline="One confirmed notice deadline falls within seven days: the EPC notice for PSEL Cakrawala Raya, due Tuesday 6 July 2027."
      status="Red"
      statusLabel="6 days left"
      sub="Alerts rely only on confirmed deadlines."
      aside={<Button variant="outline" onClick={() => setDraft(true)}><Sparkles />Draft the 6 July notice</Button>}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Segmented<View> label="View" value={view} onChange={setView} items={[{ value: 'list', label: <span className="inline-flex items-center gap-1.5"><List className="size-3.5" />List</span> }, { value: 'calendar', label: <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" />Calendar</span> }]} />
        <Segmented label="Project" size="sm" value={proj} onChange={setProj} items={projects.map((p) => ({ value: p, label: p }))} />
        <Segmented<'All' | Authority> label="Authority" size="sm" value={auth} onChange={setAuth} items={(['All', 'Joint', 'Project company', 'Shareholder (Denera)'] as const).map((a) => ({ value: a, label: a }))} />
      </div>

      {view === 'list' ? (
        <Card className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1160px] text-[13px]">
            <thead className="border-b border-line text-left text-[12px] text-ink-3">
              <tr><th className="px-5 py-2.5 font-medium">Obligation</th><th className="px-3 py-2.5 font-medium">Source clause</th><th className="px-3 py-2.5 font-medium">Due</th><th className="px-3 py-2.5 text-right font-medium">Days</th><th className="px-3 py-2.5 font-medium">Owner</th><th className="px-3 py-2.5 font-medium">Authority</th><th className="px-3 py-2.5 font-medium">Evidence pack</th><th className="px-5 py-2.5 font-medium">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {rows.map((n) => {
                const b = badge(n)
                const stamp = confirmed[`notice-${n.id}`]
                return (
                  <tr key={n.id} className={cn(n.id === 'N1' && 'bg-bad-bg/30', b === 'Rejected' && 'opacity-50')}>
                    <td className="px-5 py-3"><div className="font-medium text-ink">{n.obligation}</div><div className="text-[12px] text-ink-3">{n.project}</div></td>
                    <td className="px-3 py-3"><button onClick={() => openEv(n.doc)} className="press inline-flex items-center gap-1 whitespace-nowrap font-medium text-atlas-700 hover:underline"><FileText className="size-3.5" />{n.clause}</button></td>
                    <td className="tnum whitespace-nowrap px-3 py-3">{n.due}</td>
                    <td className={cn('tnum px-3 py-3 text-right font-semibold', n.days <= 7 ? 'text-bad' : 'text-ink')}>{n.days}</td>
                    <td className="px-3 py-3 text-ink-2">{n.owner}</td>
                    <td className="px-3 py-3"><AuthorityLabel a={n.authority} /></td>
                    <td className="whitespace-nowrap px-3 py-3 text-ink-2">{n.pack}</td>
                    <td className="px-5 py-3">
                      {b === 'Confirmed' ? <Stamp kind="confirmed" who={stamp ? stamp.by : n.confirmedBy?.split(',')[0]} when={stamp ? stamp.at : n.confirmedBy?.split(', ')[1]} />
                        : b === 'Rejected' ? <span className="text-[12px] text-ink-3">Rejected: {rejected[`notice-${n.id}`]}</span>
                        : (
                          <div className="flex flex-col items-start gap-1.5">
                            <Stamp kind="extracted" />
                            <div className="flex gap-1.5">
                              <Button size="sm" variant="outline" disabled={!canConfirm} onClick={() => setRejecting(n)} title={canConfirm ? undefined : 'Commercial and Legal Lead only'}><X />Reject</Button>
                              <Button size="sm" disabled={!canConfirm} onClick={() => confirm(`notice-${n.id}`, `${n.clause} deadline ${n.due}`)} title={canConfirm ? undefined : 'Commercial and Legal Lead only'}><Check />Confirm</Button>
                            </div>
                          </div>
                        )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!canConfirm && <p className="border-t border-line-soft px-5 py-3 text-[12px] text-ink-3">Switch to the Commercial and Legal Lead persona to confirm or reject extracted deadlines.</p>}
        </Card>
      ) : (
        <CalendarView rows={rows} badge={badge} />
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-[15px] font-semibold text-ink">Ask about a clause</h2>
          <p className="mt-1 text-[13px] text-ink-3">Cited answers from executed agreements.</p>
          {!qa ? (
            <button onClick={() => setQa(true)} className="press mt-3 w-full rounded-md border border-atlas-200 bg-atlas-50 px-3 py-2.5 text-left text-[13px] text-atlas-800 hover:border-atlas-300">
              What does the EPC contract say about the notice period for delay events?
            </button>
          ) : <div className="mt-4 animate-rise"><AnswerView id="A-06" compact /></div>}
        </Card>
        <Card className="p-5">
          <h2 className="text-[15px] font-semibold text-ink">Requests to the project company</h2>
          <p className="mt-1 text-[13px] text-ink-3">Denera cannot issue the EPC notice; the project company board does.</p>
          <div className="mt-4 flex flex-col items-start gap-2">
            <Button variant="outline" disabled={requests.includes('board-notice') || isPcu} onClick={() => addRequest('board-notice', 'Issue EPC notice', { title: 'Project company board to issue EPC notice (cl. 14.2)', owner: 'Project company board', authority: 'Joint', due: '2 Jul 2027', dueIso: '2027-07-02', status: 'Not started', linked: 'Contractual entitlement', source: 'Notice calendar' })}>
              <Send />{requests.includes('board-notice') ? 'Request sent to the board' : 'Request project company board to issue notice'}
            </Button>
            <span className="text-[12px] text-ink-3"><StatusChip h="Red" label="Deadline Tue 6 Jul 2027" /></span>
          </div>
        </Card>
      </div>

      <DraftNotice open={draft} onOpenChange={setDraft} />

      <Modal open={!!rejecting} onOpenChange={(v) => !v && setRejecting(null)} title="Reject extracted deadline" description={rejecting ? `${rejecting.clause}, ${rejecting.obligation}` : ''} footer={<><Button variant="ghost" onClick={() => setRejecting(null)}>Cancel</Button><Button disabled={!reason.trim()} onClick={() => { reject(`notice-${rejecting!.id}`, reason.trim(), rejecting!.clause); setRejecting(null); setReason('') }}>Reject with reason</Button></>}>
        <label htmlFor="r" className="text-[13px] font-medium text-ink-2">Reason</label>
        <textarea id="r" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 w-full rounded-md border border-line bg-sunken px-3 py-2 text-[14px] outline-none focus:border-atlas-500" />
      </Modal>
    </ScreenFrame>
  )
}

function CalendarView({ rows, badge }: { rows: Notice[]; badge: (n: Notice) => string }) {
  const months = [{ m: 'Jul', y: 2027, days: 31, start: 4 }, { m: 'Aug', y: 2027, days: 31, start: 0 }]
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      {months.map((mo, mi) => (
        <Card key={mo.m} className="p-4">
          <h3 className="text-[13px] font-semibold text-ink">{mo.m === 'Jul' ? 'July' : 'August'} {mo.y}</h3>
          <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[12px] text-ink-3">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d}>{d}</div>)}</div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {Array.from({ length: mo.start }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: mo.days }).map((_, i) => {
              const iso = `2027-${mi === 0 ? '07' : '08'}-${String(i + 1).padStart(2, '0')}`
              const hits = rows.filter((n) => n.dueIso === iso)
              return (
                <div key={i} className={cn('min-h-[54px] rounded-md border border-line-soft p-1 text-left', hits.length && 'border-atlas-200 bg-atlas-50')}>
                  <div className="tnum text-[12px] text-ink-3">{i + 1}</div>
                  {hits.map((h) => (
                    <div key={h.id} className={cn('mt-0.5 truncate rounded px-1 text-[12px] font-medium', h.id === 'N1' ? 'bg-bad text-white' : badge(h) === 'Confirmed' ? 'bg-atlas-700 text-white' : 'border border-dashed border-ink-4 text-ink-2')} title={`${h.obligation} (${badge(h)})`}>
                      {h.id === 'N1' ? '6 days' : h.clause}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </Card>
      ))}
      <p className="text-[12px] text-ink-3 lg:col-span-2">Solid: confirmed. Dashed: extracted by ATLAS, not yet relied on.</p>
    </div>
  )
}

function DraftNotice({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const requests = useDemo((s) => s.requests)
  const addRequest = useDemo((s) => s.addRequest)
  const sent = requests.includes('legal-review')
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="EPC notice of delay event"
      description="PSEL Cakrawala Raya · EPC cl. 14.2 · due Tue 6 Jul 2027"
      width="w-[620px]"
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12px] text-ink-3">AI drafts, a lawyer sends. There is no send control here.</span>
          <Button disabled={sent} onClick={() => addRequest('legal-review', 'EPC notice draft sent for legal review')}><Send />{sent ? 'With legal for review' : 'Send for legal review'}</Button>
        </div>
      }
    >
      <div className="mb-4 flex items-center gap-2"><Stamp kind="draft" /><span className="text-[12px] text-ink-3">AI draft, lawyer sends</span></div>
      <article className="space-y-3 rounded-xl border border-line bg-surface p-6 text-[14px] leading-relaxed text-ink">
        <p className="text-ink-3">To: The EPC Contractor<br />From: BUPP Cakrawala Raya<br />Date: [to be dated on issue]</p>
        <p className="font-semibold">Notice of delay event under Clause 14.2</p>
        <p>We give notice of a delay event affecting the boiler island package. The vendor technical submittal BI-TS-07, due on 12 June 2027, remained outstanding at 30 June 2027, and the related engineering review comment RC-0193 remains unresolved.</p>
        <p>The event first became apparent on 8 June 2027. This notice is given within the 28-day period required by Clause 14.2.</p>
        <p>We reserve all rights under the Contract, including in respect of extension of time and costs, and request a revised recovery programme within three working days.</p>
        <p className="text-ink-3">[Signature block for the project company]</p>
      </article>
    </Sheet>
  )
}
