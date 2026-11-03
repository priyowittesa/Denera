import { CalendarDays, Check, FileText, List, Send, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AuthorityLabel, Stamp, StatusChip, StatePill } from '../components/atlas/chips'
import { ScreenFrame } from '../components/atlas/frame'
import { AnswerView } from '../components/atlas/AnswerView'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Sheet } from '../components/ui/sheet'
import { ReasonModal } from '../components/atlas/ReasonModal'
import { NoResults, ResultFooter, SearchBox } from '../components/ui/toolbar'
import { ReadOnly } from '../components/ui/form'
import { Segmented } from '../components/ui/tabs'
import { NOTICES, type Notice } from '../data/registers'
import type { Authority } from '../data/types'
import { cn } from '../lib/cn'
import { useDemo, usePersona } from '../state/store'
import { RequestModal, type RequestSpec } from '../components/atlas/RequestModal'
import { useUi } from '../state/ui'

type View = 'list' | 'calendar'

export function S03Notices() {
  const [req, setReq] = useState<RequestSpec | null>(null)
  const [params] = useSearchParams()
  const [view, setView] = useState<View>('list')
  const [proj, setProj] = useState('All')
  const [auth, setAuth] = useState<'All' | Authority>('All')
  const [draft, setDraft] = useState(params.get('draft') === '1')
  const [rejecting, setRejecting] = useState<Notice | null>(null)
  const [qa, setQa] = useState(false)
  const confirmed = useDemo((s) => s.confirmed)
  const rejected = useDemo((s) => s.rejected)
  const confirm = useDemo((s) => s.confirm)
  const reject = useDemo((s) => s.reject)
  const requests = useDemo((s) => s.requests)
  const openEv = useUi((s) => s.openEvidence)
  const { id: pid, isPcu } = usePersona()
  const canConfirm = pid === 'cll'

  useEffect(() => { if (params.get('draft') === '1') setDraft(true) }, [params])

  const badge = (n: Notice) => (confirmed[`notice-${n.id}`] ? 'Confirmed' : rejected[`notice-${n.id}`] ? 'Rejected' : n.badge)
  const [q, setQ] = useState('')
  const visible = NOTICES.filter((n) => !isPcu || (n.project === 'Cakrawala' && n.authority !== 'Shareholder (Denera)'))
  const rows = visible
    .filter((n) => proj === 'All' || n.project === proj)
    .filter((n) => auth === 'All' || n.authority === auth)
    .filter((n) => !q.trim() || `${n.obligation} ${n.clause} ${n.owner} ${n.project} ${n.due}`.toLowerCase().includes(q.trim().toLowerCase()))
  const filtered = proj !== 'All' || auth !== 'All' || !!q.trim()
  const resetFilters = () => { setProj('All'); setAuth('All'); setQ('') }
  const projects = ['All', ...new Set(NOTICES.filter((n) => !isPcu || n.project === 'Cakrawala').map((n) => n.project))]

  const status = (n: (typeof rows)[number]) => {
    const b = badge(n)
    const stamp = confirmed[`notice-${n.id}`]
    return (b === 'Confirmed' ? <Stamp kind="confirmed" who={stamp ? stamp.by : n.confirmedBy?.split(',')[0]} when={stamp ? stamp.at : n.confirmedBy?.split(', ')[1]} />
                        : b === 'Rejected' ? <span className="text-[12px] text-ink-3">Rejected: {rejected[`notice-${n.id}`]}</span>
                        : (
                          <div className="flex flex-col items-start gap-1.5">
                            <Stamp kind="extracted" />
                            <div className="flex gap-1.5">
                              <Button size="sm" variant="outline" disabled={!canConfirm} onClick={() => setRejecting(n)} title={canConfirm ? undefined : 'Commercial and Legal Lead only'}><X />Reject</Button>
                              <Button size="sm" disabled={!canConfirm} onClick={() => confirm(`notice-${n.id}`, `${n.clause} deadline ${n.due}`)} title={canConfirm ? undefined : 'Commercial and Legal Lead only'}><Check />Confirm</Button>
                            </div>
                          </div>
                        ))
  }

  return (
    <ScreenFrame
      headline="One confirmed notice deadline falls within seven days: the EPC notice for PSEL Cakrawala Raya, due Tuesday 6 July 2027."
      status="Red"
      statusLabel="6 days left"
      sub="Alerts rely only on confirmed deadlines."
      aside={<Button variant="outline" onClick={() => setDraft(true)}><Sparkles />Draft the 6 July notice</Button>}
    >
      <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3">
        <SearchBox value={q} onChange={setQ} label="Search obligations" placeholder="Search obligation, clause or owner" className="w-full lg:w-[320px]" />
        <Segmented<View> label="View" value={view} onChange={setView} items={[{ value: 'list', label: <span className="inline-flex items-center gap-1.5"><List className="size-3.5" />List</span> }, { value: 'calendar', label: <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" />Calendar</span> }]} />
        <Segmented label="Project" size="sm" value={proj} onChange={setProj} items={projects.map((p) => ({ value: p, label: p }))} />
        <Segmented<'All' | Authority> label="Authority" size="sm" value={auth} onChange={setAuth} items={(['All', 'Joint', 'Project company', 'Shareholder (Denera)'] as const).map((a) => ({ value: a, label: a }))} />
      </div>

      {view === 'list' ? (
        <>
        {/* Phones and tablets: one card per obligation, as in the ATLAS module card list */}
        <div className="mt-4 flex flex-col gap-2.5 md:hidden">
          {rows.map((n) => {
            const b = badge(n)
            return (
              <article key={n.id} className={cn('rounded-xl border border-line bg-surface px-3.5 py-3', n.id === 'N1' && 'border-bad-line bg-bad-bg/40', b === 'Rejected' && 'opacity-50')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-ink">{n.obligation}</div>
                    <div className="text-[12px] text-ink-3">{n.project} · {n.owner}</div>
                  </div>
                  <span className={cn('tnum shrink-0 rounded-full border px-2 py-0.5 text-[12px] font-semibold', n.days <= 7 ? 'border-bad-line bg-bad-bg text-bad' : 'border-line bg-sunken text-ink-2')}>{n.days} days</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-ink-2">
                  <button onClick={() => openEv(n.doc)} className="press inline-flex items-center gap-1 font-medium text-atlas-700 hover:underline"><FileText className="size-3.5" />{n.clause}</button>
                  <span className="tnum">Due {n.due}</span>
                  <AuthorityLabel a={n.authority} />
                  <span className="inline-flex items-center gap-1.5 text-ink-3">Evidence pack <StatePill s={n.pack} /></span>
                </div>
                <div className="mt-2.5 border-t border-line-soft pt-2.5">{status(n)}</div>
              </article>
            )
          })}
          {rows.length === 0 && <div className="rounded-xl border border-line bg-surface"><NoResults noun="obligations" onReset={resetFilters} /></div>}
          <ResultFooter shown={rows.length} total={visible.length} noun="obligations" filtered={filtered} onReset={resetFilters} className="rounded-xl border border-line bg-surface" />
          {!canConfirm && <p className="px-1 text-[12px] text-ink-3">Only the Commercial and Legal Lead can confirm or reject extracted deadlines.</p>}
        </div>
        <Card className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[1000px] text-[13px]">
            <thead className="border-b border-line text-left text-[12px] text-ink-3">
              <tr><th className="font-medium">Obligation</th><th className="font-medium">Source clause</th><th className="font-medium">Due</th><th className="text-right font-medium">Days</th><th className="font-medium">Owner</th><th className="font-medium">Authority</th><th className="font-medium">Evidence pack</th><th className="font-medium">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {rows.map((n) => {
                const b = badge(n)
                return (
                  <tr key={n.id} className={cn(n.id === 'N1' && 'bg-bad-bg/30', b === 'Rejected' && 'opacity-50')}>
                    <td><div className="font-medium text-ink">{n.obligation}</div><div className="text-[12px] text-ink-3">{n.project}</div></td>
                    <td><button onClick={() => openEv(n.doc)} className="press inline-flex items-center gap-1 whitespace-nowrap font-medium text-atlas-700 hover:underline"><FileText className="size-3.5" />{n.clause}</button></td>
                    <td className="tnum whitespace-nowrap">{n.due}</td>
                    <td className={cn('tnum px-3 py-3 text-right font-semibold', n.days <= 7 ? 'text-bad' : 'text-ink')}>{n.days}</td>
                    <td className="text-ink-2">{n.owner}</td>
                    <td><AuthorityLabel a={n.authority} /></td>
                    <td className="whitespace-nowrap">{n.pack === 'n/a' ? <span className="text-ink-4">n/a</span> : <StatePill s={n.pack} />}</td>
                    <td className="w-[260px] min-w-[260px]">
                      {status(n)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {rows.length === 0 && <NoResults noun="obligations" onReset={resetFilters} />}
          <ResultFooter shown={rows.length} total={visible.length} noun="obligations" filtered={filtered} onReset={resetFilters} aside={!canConfirm ? <span>Only the Commercial and Legal Lead can confirm or reject extracted deadlines.</span> : undefined} />
        </Card>
        </>
      ) : (
        <CalendarView rows={rows} badge={badge} />
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="px-[18px] py-4">
          <h2 className="text-[16px] font-semibold text-ink">Ask about a clause</h2>
          <p className="mt-1 text-[13px] text-ink-3">Cited answers from executed agreements.</p>
          {!qa ? (
            <button onClick={() => setQa(true)} className="press mt-3 w-full rounded-md border border-atlas-200 bg-atlas-50 px-3 py-2.5 text-left text-[13px] text-atlas-800 hover:border-atlas-300">
              What does the EPC contract say about the notice period for delay events?
            </button>
          ) : <div className="mt-4 animate-rise"><AnswerView id="A-06" compact /></div>}
        </Card>
        <Card className="px-[18px] py-4">
          <h2 className="text-[16px] font-semibold text-ink">Requests to the project company</h2>
          <p className="mt-1 text-[13px] text-ink-3">Denera cannot issue the EPC notice; the project company board does.</p>
          <div className="mt-4 flex flex-col items-start gap-2">
            <Button variant="outline" disabled={requests.includes('board-notice') || isPcu} onClick={() => setReq({ key: 'board-notice', title: 'Request the board to issue the EPC notice', to: 'Project company board', route: 'Joint: Denera asks through its board nominee; the board decides', authority: 'Joint', subject: 'Project company board to issue EPC notice (cl. 14.2)', message: 'Please issue formal notice of the boiler island delay event to the EPC contractor under cl. 14.2 by 5 PM Friday 2 July 2027. The notice window closes on 6 July.', due: '2027-07-02', owner: 'Commercial and Legal Lead', linked: 'Contractual entitlement', source: 'Notice calendar' })}>
              <Send />{requests.includes('board-notice') ? 'Request sent to the board' : 'Request project company board to issue notice'}
            </Button>
            <span className="text-[12px] text-ink-3"><StatusChip h="Red" label="Deadline Tue 6 Jul 2027" /></span>
          </div>
        </Card>
      </div>

      <DraftNotice open={draft} onOpenChange={setDraft} />

      <ReasonModal open={!!rejecting} onClose={() => setRejecting(null)} title="Reject extracted deadline" description={rejecting ? `${rejecting.clause}, ${rejecting.obligation}` : ''} onConfirm={(r) => reject(`notice-${rejecting!.id}`, r, rejecting!.clause)} danger>
        {rejecting && <ReadOnly items={[['Due', rejecting.due], ['Owner', rejecting.owner], ['Project', rejecting.project], ['Badge', 'Extracted by ATLAS']]} />}
      </ReasonModal>
      <RequestModal spec={req} onClose={() => setReq(null)} />
    </ScreenFrame>
  )
}

function CalendarView({ rows, badge }: { rows: Notice[]; badge: (n: Notice) => string }) {
  const months = [{ m: 'Jul', y: 2027, days: 31, start: 4 }, { m: 'Aug', y: 2027, days: 31, start: 0 }]
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      {months.map((mo, mi) => (
        <Card key={mo.m} className="p-4">
          <h3 className="text-[14px] font-semibold text-ink">{mo.m === 'Jul' ? 'July' : 'August'} {mo.y}</h3>
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
  const [req, setReq] = useState<RequestSpec | null>(null)
  const sent = requests.includes('legal-review')
  return (
    <>
    <RequestModal spec={req} onClose={() => setReq(null)} />
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="EPC notice of delay event"
      description="PSEL Cakrawala Raya · EPC cl. 14.2 · due Tue 6 Jul 2027"
      width="w-[620px]"
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12px] text-ink-3">AI drafts, a lawyer sends. There is no send control here.</span>
          <Button disabled={sent} onClick={() => setReq({ key: 'legal-review', title: 'Send the draft for legal review', to: 'Commercial and Legal Lead', route: 'Review only: a lawyer sends, never ATLAS', authority: 'Joint', subject: 'EPC notice draft sent for legal review (cl. 14.2)', message: 'Please review the AI draft notice of delay event under EPC cl. 14.2 and mark up any changes. The project company board must issue it by 5 PM Friday 2 July 2027.', due: '2027-07-01', owner: 'Commercial and Legal Lead', linked: 'Contractual entitlement', source: 'Notice calendar', confirmLabel: 'Send for review' })}><Send />{sent ? 'With legal for review' : 'Send for legal review'}</Button>
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
    </>
  )
}
