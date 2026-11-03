import { CheckCircle2, CircleDashed, FileSpreadsheet, Lock, Send, ShieldCheck, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { WaveTag, StatePill } from '../components/atlas/chips'
import { ScreenFrame, SectionTitle } from '../components/atlas/frame'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Modal, Sheet } from '../components/ui/sheet'
import { Segmented, Tabs, TabsContent, TabsList } from '../components/ui/tabs'
import { DATA_DOMAINS, FEEDS, PHASE2_RIGHTS, type Feed } from '../data/registers'
import { cn } from '../lib/cn'
import { useDemo, usePersona } from '../state/store'
import { RequestModal, type RequestSpec } from '../components/atlas/RequestModal'
import { useUi } from '../state/ui'

export function S04PartnerData() {
  const [req, setReq] = useState<RequestSpec | null>(null)
  const { isPcu } = usePersona()
  const projects = isPcu ? ['cakrawala'] : ['cakrawala', 'nusa', 'sinar']
  const [params] = useSearchParams()
  const asked = params.get('project')
  const [proj, setProj] = useState(asked && projects.includes(asked) ? asked : 'cakrawala')
  const [compare, setCompare] = useState(false)
  const [tpl, setTpl] = useState<Feed | null>(null)
  const [rej, setRej] = useState<Feed | null>(null)
  const requests = useDemo((s) => s.requests)
  const addRequest = useDemo((s) => s.addRequest)
  const audit = useDemo((s) => s.audit)
  const openEv = useUi((s) => s.openEvidence)
  const setAudit = useUi((s) => s.setAuditOpen)
  const P = FEEDS[proj]
  const agreed = P.feeds.filter((f) => f.agreed).length

  const requestFeed = () =>
    setReq({ key: 'waste-feed', title: 'Request the missing data feed', to: 'Project company board, PSEL Cakrawala Raya', route: 'Shareholder (Denera) request to the project company board', authority: 'Shareholder (Denera)', subject: 'Request project company to provide waste supply and regional reports feed', message: 'Under SHA cl. 9.1 to 9.3, please agree a template for the waste supply and regional reports feed and send the first submission.', due: '2027-07-12', owner: 'PMO Director', linked: 'Waste supply feed (SHA cl. 9.1)', source: 'Partner data and rights' })

  return (
    <ScreenFrame
      headline="Denera sees what its shareholder agreement entitles it to see. PSEL Cakrawala Raya has 3 of 4 required data feeds agreed."
      status="Yellow"
      statusLabel="Coverage 9 of 12 feeds"
    >
      <Tabs defaultValue="construction">
        <TabsList items={[{ value: 'construction', label: 'Construction projects' }, ...(isPcu ? [] : [{ value: 'phase2', label: 'Pre-investment agreements' }])]} />
        <TabsContent value="construction" className="pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {!compare ? (
              <Segmented label="Project" value={proj} onChange={setProj} items={projects.map((p) => ({ value: p, label: `${FEEDS[p].project.replace('PSEL ', '')} · ${FEEDS[p].feeds.filter((f) => f.agreed).length} of 4` }))} />
            ) : <span className="text-[13px] font-semibold text-ink">Feed coverage by partner</span>}
            {!isPcu && <Button variant="outline" size="sm" onClick={() => setCompare((v) => !v)} aria-pressed={compare}>{compare ? 'Back to project' : 'Compare coverage'}</Button>}
          </div>

          {compare ? (
            <Card className="mt-4 px-[18px] py-4">
              <ul className="space-y-3">
                {['nusa', 'cakrawala', 'sinar'].map((k) => {
                  const n = FEEDS[k].feeds.filter((f) => f.agreed).length
                  return (
                    <li key={k} className="grid grid-cols-[180px_1fr_60px] items-center gap-4 text-[13px]">
                      <span className="font-medium text-ink">{FEEDS[k].project}</span>
                      <span className="flex gap-1">{[0, 1, 2, 3].map((i) => <span key={i} className={cn('h-4 flex-1 rounded-sm', i < n ? 'bg-series-verified' : 'border border-dashed border-ink-4')} />)}</span>
                      <span className="tnum text-right font-semibold">{n} of 4</span>
                    </li>
                  )
                })}
              </ul>
              <p className="mt-4 text-[13px] text-ink-3">Press first: PSEL Sinar Lestari (2 of 4). Its Green health covers schedule and cost only.</p>
            </Card>
          ) : (
            <Card className="mt-4 overflow-x-auto">
              <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 pt-4">
                <h2 className="text-[16px] font-semibold text-ink">{P.project}: <span className="tnum">{agreed} of {P.required}</span> feeds agreed</h2>
                <button onClick={() => openEv('sha-9')} className="press text-[13px] font-medium text-atlas-700 hover:underline">Right granted by {P.clause}</button>
              </div>
              <table className="mt-3 w-full min-w-[820px] text-[13px]">
                <thead className="border-y border-line text-left text-[12px] text-ink-3"><tr><th className="font-medium">Required feed</th><th className="font-medium">Agreed</th><th className="font-medium">Template</th><th className="font-medium">Latest submission</th><th className="font-medium">Validation</th></tr></thead>
                <tbody className="divide-y divide-line-soft">
                  {P.feeds.map((f) => (
                    <tr key={f.name}>
                      <td className="font-medium text-ink">{f.name}</td>
                      <td><StatePill s={f.agreed ? 'Agreed' : 'Not yet agreed'} /></td>
                      <td>{f.template ? <button onClick={() => setTpl(f)} className="press inline-flex items-center gap-1 font-medium text-atlas-700 hover:underline"><FileSpreadsheet className="size-3.5" />{f.template}</button> : <span className="text-ink-4">No template</span>}</td>
                      <td className="tnum text-ink-2">{f.last ?? 'n/a'}</td>
                      <td>
                        {f.result === 'Accepted' && <StatePill s="Accepted" />}
                        {f.result === 'Rejected' && <button onClick={() => setRej(f)} className="press rounded-full hover:opacity-80" aria-label="Rejected, see reasons"><StatePill s="Rejected" label="Rejected, see reasons" /></button>}
                        {!f.agreed && proj === 'cakrawala' && f.name.startsWith('Waste') && (
                          <div className="flex flex-col items-start gap-1">
                            <Button size="sm" disabled={requests.includes('waste-feed') || isPcu} onClick={requestFeed}><Send />{requests.includes('waste-feed') ? 'Request raised' : 'Request project company to provide missing feed'}</Button>
                            <span className="text-[12px] text-ink-3">Route: Shareholder (Denera) request to the project company board</span>
                          </div>
                        )}
                        {!f.agreed && !(proj === 'cakrawala' && f.name.startsWith('Waste')) && <span className="text-ink-4">n/a</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="phase2" className="pt-5">
          <Card className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="border-b border-line text-left text-[12px] text-ink-3"><tr><th className="font-medium">Project</th><th className="font-medium">Information-rights clause</th><th className="font-medium">Data annex</th></tr></thead>
              <tbody className="divide-y divide-line-soft">
                {PHASE2_RIGHTS.map((r) => (
                  <tr key={r.id}><td className="font-semibold text-ink">{r.id}</td><td><Flag v={r.clause} /></td><td><Flag v={r.annex} /></td></tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-line-soft px-5 py-3 text-[12px] text-ink-3">Recommended: secure information and audit rights in the shareholder agreement template, with a data annex, before FID.</p>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <section>
          <SectionTitle>Where data comes from</SectionTitle>
          <Card className="px-[18px] py-4">
            <ul className="space-y-3">
              {DATA_DOMAINS.map((d) => (
                <li key={d.wave} className="flex items-start gap-3"><WaveTag wave={d.wave} /><span className="text-[13px] text-ink-2">{d.items.join(', ')}</span></li>
              ))}
            </ul>
          </Card>
        </section>
        <section>
          <SectionTitle aside={<Button variant="link" size="sm" onClick={() => setAudit(true)}>Full audit log</Button>}>Access and audit</SectionTitle>
          <Card className="px-[18px] py-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {[[ShieldCheck, 'Role-based views', 'Each role sees only what it is entitled to'], [Lock, 'Partner separation', 'A project company sees only its own project']].map(([I, t, d]) => {
                const Icon = I as typeof Lock
                return <div key={t as string} className="rounded-md bg-sunken p-3"><Icon className="size-4 text-atlas-700" /><div className="mt-1.5 text-[13px] font-medium text-ink">{t as string}</div><div className="text-[12px] text-ink-3">{d as string}</div></div>
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[12px]">
              {['Public', 'Internal', 'Confidential', 'Restricted'].map((c) => <span key={c} className="rounded-full border border-line bg-sunken px-[9px] py-0.5 text-[12px] font-medium text-ink-2">{c}</span>)}
            </div>
            <ol className="mt-4 space-y-1.5 text-[12px]">
              {audit.slice(0, 5).map((a, i) => <li key={i} className="flex gap-3"><span className="tnum w-[104px] shrink-0 text-ink-3">{a.t}</span><span className="text-ink-2"><b className="font-medium text-ink">{a.action}</b> {a.object}</span></li>)}
            </ol>
          </Card>
        </section>
      </div>

      <Sheet open={!!tpl} onOpenChange={(v) => !v && setTpl(null)} title={`Template ${tpl?.template ?? ''}`} description={tpl?.name}>
        <div className="overflow-x-auto rounded-md border border-line">
          <table className="w-full text-[12px]">
            <thead className="bg-sunken text-left text-ink-3"><tr>{['project_id', 'wbs_code', 'period_end', 'quantity', 'unit', 'evidence_ref'].map((c) => <th key={c} className="font-mono font-medium">{c}</th>)}</tr></thead>
            <tbody><tr className="font-mono text-ink-2">{['CKR', 'BI-03.2', '2027-06-30', '412.5', 't', 'INS-0612'].map((c) => <td key={c}>{c}</td>)}</tr></tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] text-ink-3">Files that fail schema checks are rejected with reasons. No partner data loads before access control and the audit log are in place.</p>
      </Sheet>

      <Modal open={!!rej} onOpenChange={(v) => !v && setRej(null)} title="Submission rejected" description={`${rej?.name ?? ''} · ${rej?.last ?? ''}`} footer={<><Button variant="ghost" onClick={() => setRej(null)}>Close</Button><Button onClick={() => { addRequest('resubmit', 'Corrected procurement submission'); setRej(null) }} disabled={requests.includes('resubmit')}><Send />Request corrected submission</Button></>}>
        <ul className="space-y-2">{rej?.reasons?.map((r) => <li key={r} className="flex gap-2 text-[14px] text-ink"><XCircle className="mt-0.5 size-4 shrink-0 text-bad" />{r}</li>)}</ul>
      </Modal>
      <RequestModal spec={req} onClose={() => setReq(null)} />
    </ScreenFrame>
  )
}

function Flag({ v }: { v: string }) {
  if (v === 'Present') return <span className="inline-flex items-center gap-1 text-ok"><CheckCircle2 className="size-4" />Present</span>
  if (v === 'Missing') return <span className="inline-flex items-center gap-1 font-medium text-bad"><XCircle className="size-4" />Missing</span>
  return <span className="inline-flex items-center gap-1 text-warn"><CircleDashed className="size-4" />{v}</span>
}
