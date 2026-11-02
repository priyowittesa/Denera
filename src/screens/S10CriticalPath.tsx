import { ArrowRight, Check, FileText, ListTree, Mail, TriangleAlert, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClassChip, HEALTH_ICON, Stamp } from '../components/atlas/chips'
import { AtlasCard, ScreenFrame } from '../components/atlas/frame'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Modal, Sheet } from '../components/ui/sheet'
import { Tabs, TabsContent, TabsList } from '../components/ui/tabs'
import { CHAIN, CORRESPONDENCE, EXPLANATION, LOOK_AHEAD, SCHEDULE_EVIDENCE, SCHEDULE_QUALITY as Q } from '../data/schedule'
import { EVIDENCE } from '../data/evidence'
import { cn } from '../lib/cn'
import { useDemo, usePersona } from '../state/store'
import { useUi } from '../state/ui'

const KEY = 'interface-conflict'

export function S10CriticalPath() {
  const [step, setStep] = useState<string | null>(null)
  const [impacted, setImpacted] = useState(false)
  const [tab, setTab] = useState('look')
  const [chainOpen, setChainOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  const open = useUi((s) => s.openEvidence)
  const nav = useNavigate()
  const confirmed = useDemo((s) => s.confirmed[KEY])
  const rejected = useDemo((s) => s.rejected[KEY])
  const confirm = useDemo((s) => s.confirm)
  const reject = useDemo((s) => s.reject)
  const { id: pid } = usePersona()
  const canConfirm = pid === 'pcu' || pid === 'pmo'
  const active = step ? CHAIN.find((c) => c.id === step)?.evidence ?? [] : []

  return (
    <ScreenFrame
      headline="Boiler island delay is the primary driver of the 42-day COD exposure."
      answer={{ label: 'Under 5 days of float', value: '4 of 8', tone: 'bad', foot: 'In the next six weeks the boiler island chain moves COD: the interface freeze sits at zero float and drives the 42-day exposure.', action: { label: 'See the six-week look-ahead', onClick: () => { setTab('look'); document.getElementById('s10-tabs')?.scrollIntoView({ behavior: 'smooth' }) } }, stake: ['UC10'] }}
      status="Red"
      statusLabel="Schedule Red"
      aside={
        <>
          <Button variant="outline" onClick={() => setImpacted((v) => !v)} aria-pressed={impacted}><ListTree />Show impacted activities</Button>
          <Button variant="outline" onClick={() => setChainOpen(true)}><Mail />View correspondence chain</Button>
          <Button onClick={() => nav('/cost#scenarios')}>Recovery options<ArrowRight /></Button>
        </>
      }
    >
      <section className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-xl border border-warn/30 bg-warn-bg/50 px-5 py-3.5">
        <div className="flex items-center gap-2"><TriangleAlert className="size-4 text-warn" /><span className="text-[14px] font-semibold text-ink">Schedule quality: Amber</span></div>
        <dl className="tnum flex flex-wrap gap-x-6 gap-y-1 text-[13px]">
          <div><dt className="inline text-ink-3">Logic completeness </dt><dd className="inline font-semibold text-ink">{Q.logic}%</dd></div>
          <div><dt className="inline text-ink-3">Open ends </dt><dd className="inline font-semibold text-ink">{Q.openEnds}</dd></div>
          <div><dt className="inline text-ink-3">Negative float activities </dt><dd className="inline font-semibold text-ink">{Q.negativeFloat}</dd></div>
        </dl>
        <p className="text-[13px] text-ink-2">Poor schedule logic produces a warning, not a confident answer.</p>
      </section>

      <Tabs id="s10-tabs" value={tab} onValueChange={setTab} className="mt-6 scroll-mt-6">
        <TabsList items={[{ value: 'look', label: 'Look-ahead, next six weeks' }, { value: 'root', label: 'Root cause' }]} />
        <TabsContent value="root" className="pt-5">
          <div className="grid items-start gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
            <ChainStory step={step} setStep={setStep} impacted={impacted} />

            <div className="flex min-w-0 flex-col gap-5">
              <Card className="overflow-hidden">
                <div className="flex items-baseline justify-between gap-3 px-5 pb-2 pt-4">
                  <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">Evidence behind the chain</h3>
                  <span className="text-[12px] text-ink-3">{step ? 'Showing sources for the selected step' : 'Select a step to trace it'}</span>
                </div>
                <ul className="divide-y divide-line-soft">
                  {SCHEDULE_EVIDENCE.map((e) => {
                    const lit = active.includes(e.id)
                    const doc = EVIDENCE[e.doc]
                    return (
                      <li key={e.id}>
                        <button onClick={() => open(e.doc)} className={cn('press group flex w-full items-start gap-3 px-5 py-3 text-left transition-[opacity,background-color] hover:bg-sunken/70', lit && 'bg-atlas-50/80', step && !lit && 'opacity-40')}>
                          <FileText className={cn('mt-0.5 size-4 shrink-0', lit ? 'text-atlas-600' : 'text-ink-4')} />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[14px] leading-snug text-ink">{e.title}</span>
                            {doc && <span className="mt-0.5 block truncate text-[12px] text-ink-3">{doc.system} · {doc.location}</span>}
                          </span>
                          {doc?.classification && <ClassChip c={doc.classification} />}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </Card>

              <AtlasCard title="ATLAS explanation" sources={[{ label: 'Review comment RC-0193', doc: 'review-comment' }, { label: 'Vendor email 28 Jun', doc: 'vendor-email' }, { label: 'EPC schedule update', doc: 'epc-schedule' }]} classification="Advisory" confidence="Medium">
                <p>{EXPLANATION}</p>
                <p className="mt-2 text-[13px] text-ink-3">Assumptions: schedule logic as exported on 28 Jun; vendor revised date taken as reported; transit 28 days.</p>
              </AtlasCard>

              <section className={cn('rounded-xl border p-5', confirmed ? 'border-ok/30 bg-ok-bg/40' : rejected ? 'border-line bg-sunken' : 'border-atlas-300 bg-atlas-50')}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-[12px] font-medium text-ink-3">AI-detected interface conflict</div>
                    <div className="mt-0.5 text-[15px] font-semibold text-ink">Waste-receiving system and boiler feed arrangement</div>
                    <div className="mt-2">
                      {confirmed ? <Stamp kind="confirmed" who={`${confirmed.by} (interface owner)`} when={confirmed.at} /> : rejected ? <span className="text-[13px] text-ink-3">Rejected: {rejected}</span> : <Stamp kind="extracted" />}
                    </div>
                  </div>
                  {!confirmed && !rejected && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={!canConfirm} onClick={() => setRejectOpen(true)}><X />Reject</Button>
                      <Button size="sm" disabled={!canConfirm} onClick={() => confirm(KEY, 'Interface conflict: waste-receiving and boiler feed')}><Check />Confirm conflict</Button>
                    </div>
                  )}
                </div>
                {!canConfirm && !confirmed && <p className="mt-2 text-[12px] text-ink-3">Only the interface owner (Technical Director, project company) or the PMO Director can confirm. Switch persona to try it.</p>}
              </section>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="look" className="pt-5">
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-[13px]">
              <thead className="border-b border-line text-left text-[12px] text-ink-3"><tr><th className="px-5 py-2.5 font-medium">Activity, 5 Jul to 9 Aug 2027</th><th className="px-3 py-2.5 font-medium">Constraint</th><th className="px-3 py-2.5 font-medium">Owner</th><th className="px-3 py-2.5 text-right font-medium">Float</th><th className="px-5 py-2.5 font-medium">Evidence</th></tr></thead>
              <tbody className="divide-y divide-line-soft">
                {LOOK_AHEAD.map((l) => {
                  const low = l.float === null || l.float < 5
                  return (
                    <tr key={l.activity} className={cn(low && 'bg-warn-bg/40', impacted && l.steps.length > 0 && 'bg-bad-bg/40')}>
                      <td className="px-5 py-3 font-medium text-ink">{low && <TriangleAlert className="mr-1.5 inline size-3.5 text-warn" />}{l.activity}</td>
                      <td className="px-3 py-3 text-ink-2">{l.constraint}</td>
                      <td className="px-3 py-3 text-ink-2">{l.owner}</td>
                      <td className={cn('tnum px-3 py-3 text-right font-semibold', low ? 'text-warn' : 'text-ink')}>{l.float === null ? 'Unknown' : `${l.float} days`}</td>
                      <td className="px-5 py-3">{low ? <button onClick={() => open(l.evidence)} className="press inline-flex items-center gap-1 text-[13px] font-medium text-atlas-700 hover:underline"><FileText className="size-3.5" />Open</button> : <span className="text-ink-4">n/a</span>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p className="border-t border-line-soft px-5 py-3 text-[12px] text-ink-3">Highlighted: float under five days or unknown, each linked to its evidence.</p>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={chainOpen} onOpenChange={setChainOpen} title="Correspondence chain" description="Transmittals, emails and minutes behind the boiler island delay">
        <ol className="relative ml-2 border-l border-line pl-5">
          {CORRESPONDENCE.map((c) => (
            <li key={c.date} className="relative mb-6">
              <span className="absolute -left-[26px] top-1.5 size-2.5 rounded-full bg-atlas-600 ring-4 ring-surface" />
              <div className="tnum text-[12px] font-medium text-ink-3">{c.date} · {c.kind}</div>
              <div className="text-[14px] font-medium text-ink">{c.who}</div>
              <div className="text-[13px] text-ink-2">{c.what}</div>
            </li>
          ))}
        </ol>
      </Sheet>

      <Modal open={rejectOpen} onOpenChange={setRejectOpen} title="Reject the AI-detected conflict" description="A reason is required and is written to the audit log." footer={<><Button variant="ghost" onClick={() => setRejectOpen(false)}>Cancel</Button><Button disabled={!reason.trim()} onClick={() => { reject(KEY, reason.trim(), 'Interface conflict'); setRejectOpen(false) }}>Reject with reason</Button></>}>
        <label className="block text-[13px] font-medium text-ink-2" htmlFor="reason">Reason</label>
        <textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-line bg-sunken px-3 py-2 text-[14px] outline-none focus:border-atlas-500" />
      </Modal>
    </ScreenFrame>
  )
}


const PHASES = [
  { label: 'Engineering', ids: ['s1', 's2', 's3'] },
  { label: 'Supply and logistics', ids: ['s4', 's5'] },
  { label: 'Site and completion', ids: ['s6', 's7', 's8'] },
]

/** Eight linked steps on one continuous rail, grouped by phase, ending in the COD outcome. */
function ChainStory({ step, setStep, impacted }: { step: string | null; setStep: (s: string | null) => void; impacted: boolean }) {
  const reds = CHAIN.filter((c) => c.status === 'Red').length
  const rows = PHASES.flatMap((p) => [{ kind: 'phase' as const, label: p.label }, ...p.ids.map((id) => ({ kind: 'step' as const, c: CHAIN.find((x) => x.id === id)! }))])
  return (
    <Card className="px-3 pb-3 pt-4">
      <div className="flex items-baseline justify-between gap-3 px-2">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">Critical-path story</h2>
        <span className="tnum text-[12px] text-ink-3"><span className="text-bad">{reds} Red</span> · <span className="text-warn">{CHAIN.length - reds} Yellow</span></span>
      </div>
      <p className="mt-0.5 px-2 text-[13px] text-ink-3">Select a step to trace its evidence.</p>
      <ol className="mt-3">
        {rows.map((r, i) => {
          const first = i === 1
          const last = i === rows.length - 1
          const rail = <span aria-hidden className={cn('absolute left-[19.5px] w-px bg-ink-4/30', first ? 'top-[22px] bottom-0' : last ? 'top-0 h-[22px]' : 'inset-y-0')} />
          if (r.kind === 'phase')
            return (
              <li key={r.label} className="relative">
                {i > 0 && rail}
                <div className={cn('eyebrow pl-[44px]', i === 0 ? 'pb-1' : 'pb-1 pt-3')}>{r.label}</div>
              </li>
            )
          const { c } = r
          const n = CHAIN.indexOf(c) + 1
          const sel = step === c.id
          const hit = impacted && n >= 4
          const outcome = c.id === 's8'
          const Icon = HEALTH_ICON[c.status]
          return (
            <li key={c.id} className="relative">
              {rail}
              <button
                onClick={() => setStep(sel ? null : c.id)}
                aria-pressed={sel}
                className={cn('press relative flex w-full items-start gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-sunken/80', sel && 'bg-atlas-50 hover:bg-atlas-50')}
              >
                <span className={cn(
                  'tnum grid size-6 shrink-0 place-items-center rounded-full text-[12px] font-semibold ring-4 ring-surface',
                  outcome ? 'bg-bad text-white' : c.status === 'Red' ? 'bg-bad-bg text-bad' : 'bg-warn-bg text-warn',
                  sel && 'ring-atlas-200',
                )}>{n}</span>
                <span className="min-w-0 flex-1 pt-px">
                  <span className="flex items-start justify-between gap-2">
                    <span className={cn('text-[14px] leading-snug text-ink', outcome ? 'font-semibold' : 'font-medium')}>{c.title}</span>
                    <span className={cn('mt-px inline-flex shrink-0 items-center gap-1 text-[12px] font-medium', c.status === 'Red' ? 'text-bad' : 'text-warn')}><Icon className="size-3" strokeWidth={2.4} />{c.status}</span>
                  </span>
                  <span className={cn('mt-0.5 block text-[13px] leading-snug', outcome ? 'font-medium text-bad' : 'text-ink-3')}>{c.date}</span>
                  {hit && <span className="mt-1.5 inline-flex rounded-sm bg-bad-bg px-1.5 py-0.5 text-[12px] font-medium text-bad">Impacted activity</span>}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </Card>
  )
}
