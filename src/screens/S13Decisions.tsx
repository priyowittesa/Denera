import { CheckCircle2, FileSearch, FileText, Gavel, Inbox, Scale, Send, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthorityLabel, StatusChip } from '../components/atlas/chips'
import { ScreenFrame, SectionTitle } from '../components/atlas/frame'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Modal } from '../components/ui/sheet'
import { Tabs, TabsContent, TabsList } from '../components/ui/tabs'
import { BUNDLE, CHANGE_ORDERS, NOTICES, RISKS, isOverdue } from '../data/registers'
import { cn } from '../lib/cn'
import { useDemo, usePersona } from '../state/store'
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
  const [params] = useSearchParams()
  const decision = useDemo((s) => s.decision)
  const respond = useDemo((s) => s.respond)
  const actions = useDemo((s) => s.actions)
  const addAction = useDemo((s) => s.addAction)
  const riskOwners = useDemo((s) => s.riskOwners)
  const assignRisk = useDemo((s) => s.assignRisk)
  const requests = useDemo((s) => s.requests)
  const addRequest = useDemo((s) => s.addRequest)
  const openEv = useUi((s) => s.openEvidence)
  const { id: pid, isPcu } = usePersona()
  const [defer, setDefer] = useState(false)
  const [reason, setReason] = useState('')
  const [assign, setAssign] = useState<string | null>(null)
  const [owner, setOwner] = useState('Project Director')

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
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink"><Scale className="size-4 text-atlas-700" />Recommended action bundle</h2>
            <span className="text-[12px] text-ink-3">ATLAS recommends; a person decides. Advisory.</span>
          </div>
          <ol className="mt-3 divide-y divide-line-soft">
            {BUNDLE.filter((b) => !(isPcu && b.authority === 'Shareholder (Denera)')).map((b) => (
              <li key={b.n} className="grid gap-2 px-5 py-3.5 sm:grid-cols-[28px_1fr_auto]">
                <span className="tnum grid size-6 place-items-center rounded-full bg-sunken text-[12px] font-semibold text-ink-2">{b.n}</span>
                <div className="min-w-0">
                  <p className="text-[13.5px] font-medium leading-snug text-ink">{b.text}</p>
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
            <Card className="border-atlas-300 p-5">
              <h3 className="text-[14px] font-semibold text-ink">Information needed to vote</h3>
              <p className="mt-1 text-[12.5px] text-ink-3">Joint items go to the project company board, where you vote.</p>
              {BUNDLE.filter((b) => b.authority === 'Joint').map((b) => (
                <div key={b.n} className="mt-3 rounded-md bg-sunken p-3 text-[12.5px]">
                  <div className="font-medium text-ink">Action {b.n}</div>
                  <div className="mt-1 text-ink-2"><span className="text-ink-3">Available: </span>{b.n === 1 ? 'EPC cl. 14.2, transmittal log, steering minute' : 'Logistics risk note, CO-02 draft'}</div>
                  <div className="text-ink-2"><span className="text-ink-3">Gaps: </span>{b.n === 1 ? 'Contractor response to the interface comment' : 'Cost-sharing position and freight quotes'}</div>
                  <Button size="sm" variant="outline" className="mt-2" disabled={requests.includes(`info-${b.n}`)} onClick={() => addRequest(`info-${b.n}`, `Information request under shareholder rights, action ${b.n}`)}>
                    <FileSearch />{requests.includes(`info-${b.n}`) ? 'Requested' : 'Request information under shareholder rights'}
                  </Button>
                </div>
              ))}
            </Card>
          )}
          <Card className="p-5">
            <h3 className="text-[13px] font-semibold text-ink">Action register</h3>
            <ul className="mt-2 space-y-2">
              {actions.filter((a) => !isPcu || a.authority !== 'Shareholder (Denera)').slice(0, 8).map((a) => (
                <li key={a.id} className="text-[12.5px]">
                  <div className="font-medium text-ink">{a.title}</div>
                  <div className="flex flex-wrap items-center gap-x-2 text-ink-3"><span>{a.owner}</span><span className={cn('tnum', isOverdue(a) && 'font-medium text-bad')}>{isOverdue(a) ? 'Overdue' : 'Due'} {a.due}</span><span>{a.status}</span></div>
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
            <TabsList className="px-4 pt-1" items={[{ value: 'risks', label: 'Risk register' }, { value: 'changes', label: 'Change orders and variations' }, { value: 'claims', label: 'Notices and claims' }]} />
            <TabsContent value="risks" className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-[13px]">
                <thead className="border-b border-line text-left text-[12px] text-ink-3"><tr><th className="px-5 py-2.5 font-medium">Risk</th><th className="px-3 py-2.5 font-medium">Probability</th><th className="px-3 py-2.5 font-medium">Impact</th><th className="px-3 py-2.5 font-medium">Owner</th><th className="px-3 py-2.5 font-medium">Mitigation</th><th className="px-5 py-2.5 font-medium">Package</th></tr></thead>
                <tbody className="divide-y divide-line-soft">
                  {RISKS.map((r) => {
                    const own = r.owner ?? riskOwners[r.id]
                    return (
                      <tr key={r.id} className={cn(!own && 'bg-warn-bg/50')}>
                        <td className="px-5 py-3"><span className="tnum text-ink-3">{r.id}</span> <span className="font-medium text-ink">{r.risk}</span></td>
                        <td className="px-3 py-3">{r.p}</td><td className="px-3 py-3">{r.i}</td>
                        <td className="px-3 py-3">{own ?? <Button size="sm" variant="outline" onClick={() => { setAssign(r.id); setOwner('Project Director') }}><UserPlus />No effective owner: assign</Button>}</td>
                        <td className="px-3 py-3 text-ink-2">{r.status}</td><td className="px-5 py-3 text-ink-2">{r.pkg}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </TabsContent>
            <TabsContent value="changes" className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-[13px]">
                <thead className="border-b border-line text-left text-[12px] text-ink-3"><tr><th className="px-5 py-2.5 font-medium">Change event</th><th className="px-3 py-2.5 font-medium">Raised</th><th className="px-3 py-2.5 text-right font-medium">Cost effect</th><th className="px-3 py-2.5 font-medium">Schedule effect</th><th className="px-3 py-2.5 font-medium">Status</th><th className="px-5 py-2.5 font-medium">Approval route</th></tr></thead>
                <tbody className="tnum divide-y divide-line-soft">
                  {CHANGE_ORDERS.map((c) => <tr key={c.id}><td className="px-5 py-3"><span className="text-ink-3">{c.id}</span> <span className="font-medium text-ink">{c.event}</span></td><td className="px-3 py-3">{c.raised}</td><td className="px-3 py-3 text-right">{c.cost}</td><td className="px-3 py-3">{c.schedule}</td><td className="px-3 py-3 text-ink-2">{c.status}</td><td className="px-5 py-3"><AuthorityLabel a={c.route} /></td></tr>)}
                </tbody>
              </table>
            </TabsContent>
            <TabsContent value="claims" className="p-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-md bg-sunken p-4"><div className="text-[12px] text-ink-3">Extension-of-time evidence pack</div><div className="tnum mt-1 text-[22px] font-semibold text-ink">4 of 7</div><div className="mt-2 h-1.5 rounded-full bg-surface"><div className="h-full rounded-full bg-series-verified" style={{ width: `${(4 / 7) * 100}%` }} /></div></div>
                <div className="rounded-md bg-sunken p-4"><div className="text-[12px] text-ink-3">Claims readiness score</div><div className="tnum mt-1 text-[22px] font-semibold text-warn">62%</div><div className="text-[12px] text-ink-3">Synthetic</div></div>
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

      <Modal open={defer} onOpenChange={setDefer} title="Reject or defer" description="A reason is required before the decision is recorded." footer={<><Button variant="ghost" onClick={() => setDefer(false)}>Cancel</Button><Button disabled={!reason.trim()} onClick={() => { respond('Deferred', reason.trim()); setDefer(false) }}><Send />Record decision</Button></>}>
        <label htmlFor="dr" className="text-[12.5px] font-medium text-ink-2">Reason</label>
        <textarea id="dr" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 w-full rounded-md border border-line bg-sunken px-3 py-2 text-[13.5px] outline-none focus:border-atlas-500" />
      </Modal>
      <Modal open={!!assign} onOpenChange={(v) => !v && setAssign(null)} title={`Assign owner, ${assign}`} description={RISKS.find((r) => r.id === assign)?.risk} footer={<><Button variant="ghost" onClick={() => setAssign(null)}>Cancel</Button><Button onClick={() => { assignRisk(assign!, owner); setAssign(null) }}><UserPlus />Assign</Button></>}>
        <label htmlFor="ow" className="text-[12.5px] font-medium text-ink-2">Owner</label>
        <select id="ow" value={owner} onChange={(e) => setOwner(e.target.value)} className="mt-1 block w-full rounded-md border border-line bg-sunken px-3 py-2 text-[13.5px] outline-none focus:border-atlas-500">
          {['Project Director', 'Technical Director', 'Procurement Lead', 'PMO Director', 'Grid interface lead'].map((o) => <option key={o}>{o}</option>)}
        </select>
      </Modal>
    </ScreenFrame>
  )
}

function Monitoring() {
  const actions = useDemo((s) => s.actions)
  const linked = actions.filter((a) => a.source === 'Decision room' || ['A-01', 'A-02', 'A-03'].includes(a.id))
  return (
    <Card className="animate-rise border-ok/30 p-5">
      <h3 className="flex items-center gap-2 text-[14px] font-semibold text-ink"><Inbox className="size-4 text-ok" />Monitoring the approved plan</h3>
      <div className="mt-3 flex items-end gap-1.5" aria-label="COD exposure trend, 42 days today">
        {[42, 42, 42, 42].map((v, i) => <span key={i} className={cn('w-6 rounded-t-sm', i === 3 ? 'bg-warn' : 'bg-atlas-200')} style={{ height: `${v}px` }} />)}
        <span className="tnum ml-2 text-[13px] text-ink-2"><b className="text-[18px] font-semibold text-ink">42</b> days today; target after plan +12</span>
      </div>
      <ul className="mt-3 space-y-1.5 text-[12.5px]">
        {linked.map((a) => <li key={a.id} className="flex justify-between gap-3"><span className="truncate text-ink">{a.title}</span><span className="shrink-0 text-ink-3">{a.status}</span></li>)}
      </ul>
    </Card>
  )
}
