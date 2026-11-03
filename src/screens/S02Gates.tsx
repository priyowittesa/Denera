import { ArrowUpRight, Check, FileText, Sparkles, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { GateIcon, Stamp, StatusChip } from '../components/atlas/chips'
import { AtlasCard, ScreenFrame } from '../components/atlas/frame'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Tip } from '../components/ui/tooltip'
import { ANSWERS } from '../data/answers'
import { GATES, GATE_MATRIX, GATE_STATE_LABEL, PRE_INVESTMENT, gateCell, type GateState } from '../data/portfolio'
import { cn } from '../lib/cn'
import { useDemo, usePersona } from '../state/store'
import { RequestModal, type RequestSpec } from '../components/atlas/RequestModal'
import { useUi } from '../state/ui'

const LABEL = GATE_STATE_LABEL


export function S02Gates() {
  const [params] = useSearchParams()
  const [sel, setSel] = useState(params.get('project') ?? 'P2-08')
  const [cond, setCond] = useState<number | null>(params.get('project') === 'P2-08' ? 1 : null)
  const confirmed = useDemo((s) => s.confirmed)
  const confirm = useDemo((s) => s.confirm)
  const [req, setReq] = useState<RequestSpec | null>(null)
  const requests = useDemo((s) => s.requests)
  const ask = useDemo((s) => s.ask)
  const openEv = useUi((s) => s.openEvidence)
  const { id: pid } = usePersona()
  const canConfirm = pid === 'cll' || pid === 'ceo'

  const state = (p: string, i: number): GateState => (confirmed[`gate-${p}-${i}`] ? 'M' : GATE_MATRIX[p][i])
  const project = PRE_INVESTMENT.find((p) => p.id === sel)!
  const open = GATES.map((g, i) => ({ g, i, s: state(sel, i) })).filter((x) => x.s !== 'M')

  return (
    <ScreenFrame
      project="Pre-investment portfolio, 8 projects"
      headline="Three of eight pre-investment projects can reach final investment decision by 30 September 2027; two have a permit dependency that puts FID at risk by three weeks."
      status="Yellow"
      statusLabel="Two gates at risk"
      aside={<Button variant="outline" onClick={() => ask('A-03', ANSWERS['A-03'].q)}><Sparkles />Which can reach FID by 30 Sep 2027?</Button>}
    >
      {/* The ten-gate matrix needs the full width; the project panel moves beside it only on wide screens. */}
      <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_340px] [&>*:last-child]:2xl:sticky [&>*:last-child]:2xl:top-4">
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-[13px]">
            <thead>
              <tr className="border-b border-line">
                <th className="sticky left-0 z-[1] bg-head px-4 py-3 text-left align-bottom">Project</th>
                {GATES.map((g) => <th key={g} className="min-w-[94px] px-1 py-3 text-center align-bottom leading-tight"><span className="mx-auto block max-w-[100px] hyphens-auto">{g}</span></th>)}
              </tr>
            </thead>
            <tbody>
              {PRE_INVESTMENT.map((p) => (
                <tr key={p.id} onClick={() => { setSel(p.id); setCond(null) }} className={cn('cursor-pointer border-b border-line-soft transition-colors hover:bg-atlas-50/50', sel === p.id && 'bg-atlas-50')}>
                  <td className="sticky left-0 bg-inherit px-4 py-2.5">
                    <button className="press text-left" aria-pressed={sel === p.id}>
                      <span className="block font-semibold text-ink">{p.id}</span>
                      <span className="flex items-center gap-1.5 text-[12px] text-ink-3">{p.island}{p.floa && <span className="rounded-full border border-ok-line bg-ok-bg px-1.5 text-[11.5px] font-medium text-ok">FLOA</span>}</span>
                    </button>
                  </td>
                  {GATES.map((g, i) => {
                    const s = state(p.id, i)
                    return (
                      <td key={g} className="px-1 py-2.5 text-center">
                        <Tip content={<GateTip pid={p.id} gate={g} i={i} by={confirmed[`gate-${p.id}-${i}`]?.by} />}>
                          <span tabIndex={0} className={cn('inline-grid size-7 place-items-center rounded-md', s === 'R' && 'bg-warn-bg', s === 'C' && 'bg-atlas-100')}><GateIcon s={s} /></span>
                        </Tip>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-line-soft px-4 py-3 text-[12px] text-ink-3">
            {(Object.keys(LABEL) as GateState[]).map((k) => <span key={k} className="inline-flex items-center gap-1.5"><GateIcon s={k} />{LABEL[k]}</span>)}
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <Card className="px-[18px] py-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[16px] font-semibold text-ink">{project.id} · {project.island}</h2>
              <span className="text-[12px] text-ink-3">FID target {project.fidTarget}</span>
            </div>
            <MiniTimeline pid={sel} state={state} />
            <h3 className="mt-4 text-[14px] font-semibold text-ink-2">{open.length} open condition{open.length === 1 ? '' : 's'}</h3>
            <ul className="mt-2 space-y-1">
              {open.map(({ g, i, s }) => (
                <li key={g}>
                  <button onClick={() => setCond(i)} className={cn('press flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] hover:bg-sunken', cond === i && 'bg-sunken')}>
                    <GateIcon s={s} /><span className="flex-1 text-ink">{g}</span><span className="text-[12px] text-ink-3">{LABEL[s]}</span>
                  </button>
                </li>
              ))}
            </ul>
            {cond !== null && (
              <div key={cond} className="mt-3 animate-rise rounded-md border border-line p-3.5">
                <div className="text-[13px] font-semibold text-ink">{GATES[cond]}</div>
                <dl className="mt-2 grid grid-cols-[72px_1fr] gap-y-1 text-[13px]">
                  <dt className="text-ink-3">Owner</dt><dd className="text-ink">{gateCell(sel, cond, confirmed[`gate-${sel}-${cond}`]?.by).owner}</dd>
                  <dt className="text-ink-3">Due</dt><dd className="tnum text-ink">{gateCell(sel, cond, confirmed[`gate-${sel}-${cond}`]?.by).due}</dd>
                  <dt className="text-ink-3">Evidence</dt>
                  <dd>{state(sel, cond) === 'C' || (sel === 'P2-08' && cond === 1)
                    ? <button onClick={() => openEv('gate-checklist')} className="press inline-flex items-center gap-1 font-medium text-atlas-700 hover:underline"><FileText className="size-3.5" />Design package v3 and review comments</button>
                    : <span className="text-ink-3">No evidence linked</span>}</dd>
                </dl>
                <div className="mt-3">
                  {confirmed[`gate-${sel}-${cond}`]
                    ? <Stamp kind="confirmed" who={confirmed[`gate-${sel}-${cond}`].by} when={confirmed[`gate-${sel}-${cond}`].at} />
                    : state(sel, cond) === 'C' ? (
                      <Tip content={canConfirm ? 'Evidence is linked; your confirmation closes the condition.' : 'Only the Investment and legal lead (Commercial and Legal persona) or the CEO can confirm.'}>
                        <span><Button size="sm" disabled={!canConfirm} onClick={() => confirm(`gate-${sel}-${cond}`, `${sel} ${GATES[cond]}`)}><Check />Confirm condition</Button></span>
                      </Tip>
                    ) : (
                      <Tip content="Evidence required"><span><Button size="sm" disabled><Check />Confirm condition</Button></span></Tip>
                    )}
                  <p className="mt-2 text-[12px] text-ink-3">A condition is met only with a linked evidence document and a named confirmer.</p>
                </div>
              </div>
            )}
          </Card>

          <AtlasCard title="ATLAS alert" sources={[{ label: 'Permit register', doc: 'permit-register' }, { label: 'Gate checklists', doc: 'gate-checklist' }]} classification="Forecast" confidence="Medium">
            <p className="font-medium text-ink">Two projects have a permit dependency that puts the FID date at risk by three weeks.</p>
            <ul className="mt-3 space-y-2 text-[13px]">
              {[['P2-06', '28 Jul 2027', '15 Dec 2027', '5 Jan 2028'], ['P2-07', '4 Aug 2027', '31 Jan 2028', '21 Feb 2028']].map(([p, clock, t, f]) => (
                <li key={p} className="rounded-md bg-sunken px-3 py-2">
                  <div className="flex items-center justify-between"><b className="text-ink">{p}</b><StatusChip h="Yellow" label="At risk" /></div>
                  <div className="tnum mt-1 text-ink-2">Two-month approval clock ends {clock}. FID {t}, forecast {f}.</div>
                </li>
              ))}
            </ul>
          </AtlasCard>

          <Card className="px-[18px] py-4">
            <h3 className="text-[14px] font-semibold text-ink">Shareholder (Denera) actions</h3>
            <div className="mt-3 flex flex-col gap-2">
              <Button variant="outline" disabled={requests.includes(`esc-${sel}`)} onClick={() => setReq({ key: `esc-${sel}`, title: `Escalate slipping gate, ${sel}`, to: 'Denera Project Steering Committee', route: 'Shareholder (Denera) escalation', authority: 'Shareholder (Denera)', subject: `Escalation: ${sel} gate slipping`, message: `${sel}: the next gate (${PRE_INVESTMENT.find((p) => p.id === sel)?.nextGate ?? 'gate'}) is at risk. Please confirm the recovery date and the owner of each open condition.`, due: '2027-07-07', owner: 'Investment and legal lead', linked: `${sel} gates`, source: 'Pre-investment gates', confirmLabel: 'Escalate' })}><TriangleAlert />{requests.includes(`esc-${sel}`) ? 'Escalated' : `Escalate slipping gate (${sel})`}</Button>
              <Button variant="outline" disabled={requests.includes(`chg-${sel}`)} onClick={() => setReq({ key: `chg-${sel}`, title: `Request agreement change, ${sel}`, to: 'Partner consortium', route: 'Shareholder (Denera) request under the draft shareholder agreement', authority: 'Shareholder (Denera)', subject: `Agreement change request: ${sel}`, message: `Please add the information-rights clause and data annex to the ${sel} draft shareholder agreement before signing.`, due: '2027-07-14', owner: 'Commercial and Legal Lead', linked: `${sel} shareholder agreement`, source: 'Pre-investment gates' })}><ArrowUpRight />{requests.includes(`chg-${sel}`) ? 'Change requested' : 'Request agreement change'}</Button>
            </div>
          </Card>
        </div>
      </div>
      <RequestModal spec={req} onClose={() => setReq(null)} />
    </ScreenFrame>
  )
}

function MiniTimeline({ pid, state }: { pid: string; state: (p: string, i: number) => GateState }) {
  return (
    <div className="mt-3">
      <div className="text-[12px] font-medium text-ink-3">Critical path to FID</div>
      <div className="mt-2 flex items-center">
        {GATES.map((g, i) => {
          const s = state(pid, i)
          return (
            <Tip key={g} content={`${g}: ${LABEL[s]}`}>
              <span tabIndex={0} className="flex flex-1 items-center">
                <span className={cn('size-3 shrink-0 rounded-full border-2', s === 'M' ? 'border-ok bg-ok' : s === 'R' ? 'border-warn bg-warn-bg' : s === 'C' ? 'border-atlas-600 bg-atlas-100' : s === 'P' ? 'border-info bg-info-bg' : 'border-ink-4 bg-surface')} />
                {i < GATES.length - 1 && <span className={cn('h-0.5 flex-1', s === 'M' ? 'bg-ok' : 'bg-line')} />}
              </span>
            </Tip>
          )
        })}
      </div>
      <div className="mt-1 flex justify-between text-[12px] text-ink-4"><span>Feasibility</span><span>FLOA</span><span>FID</span></div>
    </div>
  )
}

function GateTip({ pid, gate, i, by }: { pid: string; gate: string; i: number; by?: string }) {
  const c = gateCell(pid, i, by)
  return (
    <div className="space-y-0.5">
      <div className="font-semibold">{pid} · {gate}</div>
      <div>{c.status}</div>
      <div><span className="opacity-70">Owner </span>{c.owner}</div>
      <div><span className="opacity-70">Due </span>{c.due}</div>
      <div><span className="opacity-70">Evidence </span>{c.evidence}</div>
    </div>
  )
}
