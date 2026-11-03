import { CheckCircle2, FileSearch, FileText, Gavel, Inbox, Pencil, Plus, Scale, Send, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthorityLabel, StatusChip } from '../components/atlas/chips'
import { ScreenFrame, SectionTitle } from '../components/atlas/frame'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Modal } from '../components/ui/sheet'
import { ReasonModal } from '../components/atlas/ReasonModal'
import { ActionStatus } from '../components/shell/Overlays'
import { Field, ReadOnly, SelectInput } from '../components/ui/form'
import { Tabs, TabsContent, TabsList } from '../components/ui/tabs'
import { BUNDLE, CHANGE_ORDERS, NOTICES, isOverdue } from '../data/registers'
import type { Level, Risk, RiskStatus } from '../data/types'
import { RiskModal } from '../components/atlas/RiskModal'
import { ChangeReviewModal } from '../components/atlas/ChangeReview'
import { cn } from '../lib/cn'
import { useDemo, usePersona } from '../state/store'
import { RequestModal, type RequestSpec } from '../components/atlas/RequestModal'
import { useUi } from '../state/ui'

const RESPONSES = [
  { id: 'approve', label: 'Approve the recommended action plan', primary: true },
  { id: 'analysis', label: 'Request further analysis' },
  { id: 'assign', label: 'Assign to the Project Director' },
  { id: 'board', label: 'Route to the project company board' },
  { id: 'ic', label: 'Escalate to the Investment Committee', denera: true },
  { id: 'defer', label: 'Reject or defer with a recorded reason' },
]

export function S13Decisions() {
  const [req, setReq] = useState<RequestSpec | null>(null)
  const [params] = useSearchParams()
  const decision = useDemo((s) => s.decision)
  const respond = useDemo((s) => s.respond)
  const actions = useDemo((s) => s.actions)
  const addAction = useDemo((s) => s.addAction)
  const risks = useDemo((s) => s.risks)
  const [riskForm, setRiskForm] = useState<Risk | 'new' | null>(null)
  const [reviewing, setReviewing] = useState<(typeof CHANGE_ORDERS)[number] | null>(null)
  const reviews = useDemo((s) => s.coReviews)
  const assignRisk = useDemo((s) => s.assignRisk)
  const requests = useDemo((s) => s.requests)
  const openEv = useUi((s) => s.openEvidence)
  const { id: pid, isPcu } = usePersona()
  const [defer, setDefer] = useState(false)
  const setRegister = useUi((s) => s.setRegisterOpen)
  const [assign, setAssign] = useState<string | null>(null)

  const approve = () => {
    respond('Approved the recommended action plan')
    BUNDLE.filter((b) => !b.links && !(isPcu && b.authority === 'Shareholder (Denera)')).forEach((b) =>
      addAction({ title: b.text.replace(/\.$/, ''), owner: b.owner, authority: b.authority, due: b.due, dueIso: b.dueIso, status: 'Not started', linked: 'Boiler Island Recovery Strategy', source: 'Decision room' }, 'Action created from the approved plan'),
    )
    toast.success('Plan approved', { description: 'Actions 1, 3 and 4 linked to existing register items; 2, 5 and 6 created. Monitoring started.' })
  }

  const onRespond = (id: string, label: string) => {
    if (id === 'approve') return approve()
    if (id === 'defer') return setDefer(true)
    respond(label)
    toast.success('Response recorded', { description: label })
  }

  const notices = NOTICES.filter((n) => n.project === 'Cakrawala')

  return (
    <ScreenFrame
      headline="One decision is needed now: the Boiler Island Recovery Strategy."
      status="Red"
      statusLabel="Decide this week"
      sub="Why now: the forecast creates a 42-day COD exposure, a contractual notice deadline falls on 6 July 2027 and the EPC recovery programme is incomplete."
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-4">
            <h2 className="flex items-center gap-2 text-[16px] font-semibold text-ink"><Scale className="size-4 text-atlas-700" />Recommended action bundle</h2>
            <span className="text-[12px] text-ink-3">ATLAS recommends; a person decides. Advisory.</span>
          </div>
          <ol className="mt-3 divide-y divide-line-soft">
            {BUNDLE.filter((b) => !(isPcu && b.authority === 'Shareholder (Denera)')).map((b) => (
              <li key={b.n} className="grid gap-2 px-5 py-3.5 sm:grid-cols-[28px_1fr_auto]">
                <span className="tnum grid size-6 place-items-center rounded-full bg-sunken text-[12px] font-semibold text-ink-2">{b.n}</span>
                <div className="min-w-0">
                  <p className="text-[14px] font-medium leading-snug text-ink">{b.text}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-3">
                    <span>{b.owner}</span><span className="tnum">Due {b.due}</span>
                    {b.links && <span>Links to {b.links}</span>}
                    <button onClick={() => openEv(b.evidence)} className="press inline-flex items-center gap-1 font-medium text-atlas-700 hover:underline"><FileText className="size-3" />Evidence</button>
                  </div>
                </div>
                <div className="sm:text-right"><AuthorityLabel a={b.authority} /></div>
              </li>
            ))}
          </ol>
          <div className="border-t border-line px-5 py-4">
            {decision ? (
              <div className="flex flex-wrap items-center gap-3 rounded-md bg-ok-bg/60 px-4 py-3 text-[13px]">
                <CheckCircle2 className="size-4 text-ok" /><span className="font-medium text-ink">{decision.response}</span>{decision.reason && <span className="text-ink-2">Reason: {decision.reason}</span>}<span className="tnum ml-auto text-[12px] text-ink-3">{decision.at}</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {RESPONSES.filter((r) => !(isPcu && r.denera)).map((r) => (
                  <Button key={r.id} variant={r.primary ? 'primary' : 'outline'} size="sm" onClick={() => onRespond(r.id, r.label)}>
                    {r.primary && <Gavel />}{!isPcu && r.id === 'board' ? 'Route to the project company board (request)' : r.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          {decision?.response.startsWith('Approved') && <Monitoring />}
          {pid === 'bn' && (
            <Card className="border-atlas-300 px-[18px] py-4">
              <h3 className="text-[16px] font-semibold text-ink">Information needed to vote</h3>
              <p className="mt-1 text-[13px] text-ink-3">Joint items go to the project company board, where you vote.</p>
              {BUNDLE.filter((b) => b.authority === 'Joint').map((b) => (
                <div key={b.n} className="mt-3 rounded-md bg-sunken p-3 text-[13px]">
                  <div className="font-medium text-ink">Action {b.n}</div>
                  <div className="mt-1 text-ink-2"><span className="text-ink-3">Available: </span>{b.n === 1 ? 'EPC cl. 14.2, transmittal log, steering minute' : 'Logistics risk note, CO-02 draft'}</div>
                  <div className="text-ink-2"><span className="text-ink-3">Gaps: </span>{b.n === 1 ? 'Contractor response to the interface comment' : 'Cost-sharing position and freight quotes'}</div>
                  <Button size="sm" variant="outline" className="mt-2" disabled={requests.includes(`info-${b.n}`)} onClick={() => setReq({ key: `info-${b.n}`, title: `Request information for action ${b.n}`, to: 'Project company management', route: 'Shareholder (Denera) information right, SHA cl. 9.1', authority: 'Shareholder (Denera)', subject: `Information request under shareholder rights, action ${b.n}`, message: b.n === 1 ? 'Before the board votes, please provide the contractor response to the interface comment.' : 'Before the board votes, please provide the cost-sharing position and the freight quotes for the alternative route.', due: '2027-07-01', owner: 'Board nominee (Denera)', linked: 'Boiler Island Recovery Strategy', source: 'Decision room' })}>
                    <FileSearch />{requests.includes(`info-${b.n}`) ? 'Requested' : 'Request information under shareholder rights'}
                  </Button>
                </div>
              ))}
            </Card>
          )}
          <Card className="px-[18px] py-4">
            <div className="flex items-center justify-between gap-2"><h3 className="text-[16px] font-semibold text-ink">Action register</h3><Button variant="link" size="sm" onClick={() => setRegister(true)}>Open all</Button></div>
            <ul className="mt-3 divide-y divide-line-soft">
              {actions.filter((a) => !isPcu || a.authority !== 'Shareholder (Denera)').slice(0, 8).map((a) => (
                <li key={a.id} className="py-2.5 text-[13px] first:pt-0 last:pb-0">
                  <div className={cn('font-medium text-ink', a.status === 'Done' && 'text-ink-3 line-through decoration-ink-4')}>{a.title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] text-ink-3"><span>{a.owner}</span><span className={cn('tnum', isOverdue(a) && 'font-medium text-bad')}>{isOverdue(a) ? 'Overdue' : 'Due'} {a.due}</span><ActionStatus s={a.status} /></div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <section className="mt-8">
        <SectionTitle>Risk, change and claims</SectionTitle>
        <Card>
          <Tabs defaultValue={params.get('tab') ?? 'risks'}>
            <TabsList className="px-[18px] pb-3 pt-4" items={[{ value: 'risks', label: 'Risk register' }, { value: 'changes', label: 'Change orders and variations' }, { value: 'claims', label: 'Notices and claims' }]} />
            <TabsContent value="risks" className="overflow-x-auto">
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-[18px] py-3">
                <span className="text-[12.5px] text-ink-3">{risks.filter((r) => r.status !== 'Closed').length} open · {risks.filter((r) => !r.owner && r.status !== 'Closed').length} without an effective owner</span>
                {pid !== 'bn' && <Button size="sm" variant="accent" onClick={() => setRiskForm('new')}><Plus />Add risk</Button>}
              </div>
              <table className="w-full min-w-[880px] text-[13px]">
                <thead className="border-b border-line text-left text-[12px] text-ink-3"><tr><th className="px-5 py-2.5 font-medium">Risk</th><th className="px-3 py-2.5 font-medium">Probability</th><th className="px-3 py-2.5 font-medium">Impact</th><th className="px-3 py-2.5 font-medium">Owner</th><th className="px-3 py-2.5 font-medium">Mitigation</th><th className="px-5 py-2.5 font-medium">Package</th><th className="w-12 px-3 py-2.5"><span className="sr-only">Actions</span></th></tr></thead>
                <tbody className="divide-y divide-line-soft">
                  {risks.map((r) => {
                    const own = r.owner
                    const closed = r.status === 'Closed'
                    return (
                      <tr key={r.id} className={cn(!own && !closed && 'bg-warn-bg/50', closed && 'text-ink-3')}>
                        <td className="px-5 py-3"><span className="tnum text-ink-3">{r.id}</span> <span className={cn('font-medium', closed ? 'text-ink-3 line-through decoration-ink-4' : 'text-ink')}>{r.risk}</span></td>
                        <td className="px-3 py-3"><LevelPill l={r.p} /></td><td className="px-3 py-3"><LevelPill l={r.i} /></td>
                        <td className="px-3 py-3">{own ?? (closed ? <span className="text-ink-3">n/a</span> : <Button size="sm" variant="outline" onClick={() => setAssign(r.id)}><UserPlus />No effective owner: assign</Button>)}</td>
                        <td className="px-3 py-3"><RiskStatusPill s={r.status} /></td><td className="px-5 py-3 text-ink-2">{r.pkg}</td>
                        <td className="px-3 py-3 text-right">{pid !== 'bn' && <Button size="iconSm" variant="ghost" aria-label={`Edit ${r.id}`} onClick={() => setRiskForm(r)}><Pencil /></Button>}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </TabsContent>
            <TabsContent value="changes" className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-[13px]">
                <thead className="border-b border-line text-left text-[12px] text-ink-3"><tr><th className="px-5 py-2.5 font-medium">Change event</th><th className="px-3 py-2.5 font-medium">Raised</th><th className="px-3 py-2.5 text-right font-medium">Cost effect</th><th className="px-3 py-2.5 font-medium">Schedule effect</th><th className="px-3 py-2.5 font-medium">Status</th><th className="px-5 py-2.5 font-medium">Approval route</th><th className="w-28 px-3 py-2.5"><span className="sr-only">Review</span></th></tr></thead>
                <tbody className="tnum divide-y divide-line-soft">
                  {CHANGE_ORDERS.map((c) => <tr key={c.id}><td className="px-5 py-3"><span className="text-ink-3">{c.id}</span> <span className="font-medium text-ink">{c.event}</span></td><td className="px-3 py-3">{c.raised}</td><td className="px-3 py-3 text-right">{c.cost}</td><td className="px-3 py-3">{c.schedule}</td><td className="px-3 py-3"><COStatus c={c} /></td><td className="px-5 py-3"><AuthorityLabel a={c.route} /></td><td className="px-3 py-3 text-right">{pid !== 'bn' && <Button size="sm" variant="accent" onClick={() => setReviewing(c)}><Gavel />{reviews[c.id] ? 'Update' : 'Review'}</Button>}</td></tr>)}
                </tbody>
              </table>
            </TabsContent>
            <TabsContent value="claims" className="p-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-md bg-sunken p-4"><div className="text-[12px] text-ink-3">Extension-of-time evidence pack</div><div className="tnum mt-1 text-[22px] font-semibold text-ink">4 of 7</div><div className="mt-2 h-1.5 rounded-full bg-surface"><div className="h-full rounded-full bg-series-verified" style={{ width: `${(4 / 7) * 100}%` }} /></div></div>
                <div className="rounded-md bg-sunken p-4"><div className="text-[12px] text-ink-3">Claims readiness score</div><div className="tnum mt-1 text-[22px] font-semibold text-warn">62%</div><div className="text-[12px] text-ink-3">Notices, records and correspondence</div></div>
                <div className="rounded-md bg-sunken p-4"><div className="text-[12px] text-ink-3">Notices issued and due</div><div className="tnum mt-1 text-[22px] font-semibold text-ink">0 issued · {notices.length} due</div><div className="text-[12px] text-ink-3">PSEL Cakrawala Raya</div></div>
              </div>
              <ul className="mt-4 divide-y divide-line-soft rounded-md border border-line">
                {notices.filter((n) => !isPcu || n.authority !== 'Shareholder (Denera)').map((n) => (
                  <li key={n.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-[13px]">
                    <span><button onClick={() => openEv(n.doc)} className="press font-medium text-atlas-700 hover:underline">{n.clause}</button> <span className="text-ink">{n.obligation}</span></span>
                    <span className="flex items-center gap-2"><span className="tnum text-ink-2">{n.due}</span>{n.days <= 7 ? <StatusChip h="Red" label={`${n.days} days`} /> : <span className="tnum text-[12px] text-ink-3">{n.days} days</span>}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        </Card>
      </section>

      <ReasonModal open={defer} onClose={() => setDefer(false)} title="Reject or defer the decision" description="Boiler Island Recovery Strategy. A reason is required before the decision is recorded." confirmLabel="Record decision" confirmIcon={<Send />} onConfirm={(r) => respond('Deferred', r)} />
      <RiskModal risk={riskForm} onClose={() => setRiskForm(null)} />
      <ChangeReviewModal co={reviewing} onClose={() => setReviewing(null)} />
      <AssignOwnerModal riskId={assign} onClose={() => setAssign(null)} onSave={(o) => assignRisk(assign!, o)} />
      <RequestModal spec={req} onClose={() => setReq(null)} />
    </ScreenFrame>
  )
}

function Monitoring() {
  const actions = useDemo((s) => s.actions)
  const linked = actions.filter((a) => a.source === 'Decision room' || ['A-01', 'A-02', 'A-03'].includes(a.id))
  return (
    <Card className="animate-rise border-ok/30 px-[18px] py-4">
      <h3 className="flex items-center gap-2 text-[16px] font-semibold text-ink"><Inbox className="size-4 text-ok" />Monitoring the approved plan</h3>
      <div className="mt-3 flex items-end gap-1.5" aria-label="COD exposure trend, 42 days today">
        {[42, 42, 42, 42].map((v, i) => <span key={i} className={cn('w-6 rounded-t-sm', i === 3 ? 'bg-warn' : 'bg-atlas-200')} style={{ height: `${v}px` }} />)}
        <span className="tnum ml-2 text-[13px] text-ink-2"><b className="text-[18px] font-semibold text-ink">42</b> days today; target after plan +12</span>
      </div>
      <ul className="mt-3 space-y-1.5 text-[13px]">
        {linked.map((a) => <li key={a.id} className="flex justify-between gap-3"><span className="truncate text-ink">{a.title}</span><span className="shrink-0 text-ink-3">{a.status}</span></li>)}
      </ul>
    </Card>
  )
}

const RISK_OWNERS = ['Project Director', 'Technical Director', 'Procurement Lead', 'PMO Director', 'Grid interface lead', 'Finance Lead']

/** Name an owner for a risk that has no effective owner. */
function AssignOwnerModal({ riskId, onClose, onSave }: { riskId: string | null; onClose: () => void; onSave: (owner: string) => void }) {
  const risk = useDemo((s) => s.risks).find((r) => r.id === riskId)
  const [owner, setOwner] = useState('')
  const [tried, setTried] = useState(false)
  useEffect(() => { if (riskId) { setOwner(''); setTried(false) } }, [riskId])
  const err = tried && !owner && 'Choose who owns the mitigation.'
  return (
    <Modal
      open={!!riskId}
      onOpenChange={(v) => !v && onClose()}
      title={`Assign owner, ${riskId ?? ''}`}
      description={risk?.risk}
      onSubmit={() => { setTried(true); if (owner) { onSave(owner); onClose() } }}
      footer={<><Button variant="outline" type="button" onClick={onClose}>Cancel</Button><Button type="submit"><UserPlus />Assign owner</Button></>}
    >
      {risk && <ReadOnly items={[['Probability', risk.p], ['Impact', risk.i], ['Mitigation status', risk.status], ['Linked package', risk.pkg]]} />}
      <Field label="Owner" required error={err} hint="The owner is written to the risk register and the audit log.">
        {(id, dsc) => (
          <SelectInput id={id} aria-describedby={dsc} value={owner} onChange={(e) => setOwner(e.target.value)} invalid={!!err}>
            <option value="">Choose an owner</option>
            {RISK_OWNERS.map((o) => <option key={o}>{o}</option>)}
          </SelectInput>
        )}
      </Field>
    </Modal>
  )
}

const LEVEL_CLS: Record<Level, string> = { High: 'border-bad-line bg-bad-bg text-bad', Medium: 'border-warn-line bg-warn-bg text-warn', Low: 'border-line bg-sunken text-ink-2' }
function LevelPill({ l }: { l: Level }) {
  return <span className={cn('inline-flex rounded-full border px-2 py-px text-[12px] font-medium', LEVEL_CLS[l])}>{l}</span>
}
const RS_CLS: Record<RiskStatus, string> = { 'Not started': 'border-line bg-sunken text-ink-2', 'In progress': 'border-info-line bg-info-bg text-info', Mitigated: 'border-ok-line bg-ok-bg text-ok', Closed: 'border-line bg-surface text-ink-3' }
function RiskStatusPill({ s }: { s: RiskStatus }) {
  return <span className={cn('inline-flex whitespace-nowrap rounded-full border px-2 py-px text-[12px] font-medium', RS_CLS[s])}>{s}</span>
}

function COStatus({ c }: { c: (typeof CHANGE_ORDERS)[number] }) {
  const r = useDemo((s) => s.coReviews[c.id])
  const st = r?.status ?? c.status
  const cls = /Approved|Supported/.test(st) ? 'border-ok-line bg-ok-bg text-ok' : /Rejected|objection/.test(st) ? 'border-bad-line bg-bad-bg text-bad' : /requested/.test(st) ? 'border-info-line bg-info-bg text-info' : 'border-line bg-sunken text-ink-2'
  return (
    <span className="flex flex-col items-start gap-0.5">
      <span className={cn('inline-flex whitespace-nowrap rounded-full border px-2 py-px text-[12px] font-medium', cls)}>{st}</span>
      {r && <span className="text-[11.5px] text-ink-3">{r.by}, {r.at.slice(-5)}</span>}
    </span>
  )
}
