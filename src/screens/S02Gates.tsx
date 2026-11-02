import { ArrowUpRight, Check, FileText, Sparkles, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { GateIcon, Stamp, StatusChip } from '../components/atlas/chips'
import { AtlasCard, ScreenFrame } from '../components/atlas/frame'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Tip } from '../components/ui/tooltip'
import { ANSWERS } from '../data/answers'
import { GATES, GATE_MATRIX, PRE_INVESTMENT, type GateState } from '../data/portfolio'
import { cn } from '../lib/cn'
import { useDemo, usePersona } from '../state/store'
import { useUi } from '../state/ui'

const LABEL: Record<GateState, string> = { M: 'Met', P: 'In progress', R: 'At risk', N: 'Not started', C: 'Evidence linked, awaiting confirmation' }

const OWNERS = ['Investment and legal lead', 'Technical lead', 'Permits lead', 'Regional liaison', 'Regional liaison', 'Investment and legal lead', 'Commercial and Legal Lead', 'Finance Lead', 'Danantara', 'Investment Committee']

export function S02Gates() {
  const [params] = useSearchParams()
  const [sel, setSel] = useState(params.get('project') ?? 'P2-08')
  const [cond, setCond] = useState<number | null>(params.get('project') === 'P2-08' ? 1 : null)
  const confirmed = useDemo((s) => s.confirmed)
  const confirm = useDemo((s) => s.confirm)
  const log = useDemo((s) => s.log)
  const addRequest = useDemo((s) => s.addRequest)
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
      project="Phase II, 8 pre-investment projects"
      headline="Three of eight Phase II projects can reach final investment decision by 30 September 2027; two have a permit dependency that puts FID at risk by three weeks."
      status="Yellow"
      statusLabel="Two gates at risk"
      aside={<Button variant="outline" onClick={() => ask('A-03', ANSWERS['A-03'].q)}><Sparkles />Which can reach FID by 30 Sep 2027?</Button>}
    >
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[740px] text-[12.5px]">
            <thead>
              <tr className="border-b border-line">
                <th className="sticky left-0 bg-surface px-4 py-3 text-left text-[12px] font-medium text-ink-3">Project</th>
                {GATES.map((g) => <th key={g} className="px-1 py-3 text-center align-bottom text-[11px] font-medium leading-tight text-ink-3"><span className="mx-auto block max-w-[68px]">{g}</span></th>)}
              </tr>
            </thead>
            <tbody>
              {PRE_INVESTMENT.map((p) => (
                <tr key={p.id} onClick={() => { setSel(p.id); setCond(null) }} className={cn('cursor-pointer border-b border-line-soft transition-colors hover:bg-atlas-50/50', sel === p.id && 'bg-atlas-50')}>
                  <td className="sticky left-0 bg-inherit px-4 py-2.5">
                    <button className="press text-left" aria-pressed={sel === p.id}>
                      <span className="block font-semibold text-ink">{p.id}</span>
                      <span className="flex items-center gap-1.5 text-[11.5px] text-ink-3">{p.island}{p.floa && <span className="rounded-sm bg-ok-bg px-1 text-[10.5px] font-medium text-ok">FLOA</span>}</span>
                    </button>
                  </td>
                  {GATES.map((g, i) => {
                    const s = state(p.id, i)
                    return (
                      <td key={g} className="px-1 py-2.5 text-center">
                        <Tip content={`${p.id} · ${g}: ${LABEL[s]}${confirmed[`gate-${p.id}-${i}`] ? ` (confirmed by ${confirmed[`gate-${p.id}-${i}`].by})` : ''}`}>
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
            <span className="ml-auto">Gate sequence is illustrative, to be confirmed in workshop W4.</span>
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[15px] font-semibold text-ink">{project.id} · {project.island}</h2>
              <span className="text-[12px] text-ink-3">FID target {project.fidTarget}</span>
            </div>
            <MiniTimeline pid={sel} state={state} />
            <h3 className="mt-4 text-[12.5px] font-semibold text-ink-2">{open.length} open condition{open.length === 1 ? '' : 's'}</h3>
            <ul className="mt-2 space-y-1">
              {open.map(({ g, i, s }) => (
                <li key={g}>
                  <button onClick={() => setCond(i)} className={cn('press flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] hover:bg-sunken', cond === i && 'bg-sunken')}>
                    <GateIcon s={s} /><span className="flex-1 text-ink">{g}</span><span className="text-[11.5px] text-ink-3">{LABEL[s]}</span>
                  </button>
                </li>
              ))}
            </ul>
            {cond !== null && (
              <div key={cond} className="mt-3 animate-rise rounded-md border border-line p-3.5">
                <div className="text-[13px] font-semibold text-ink">{GATES[cond]}</div>
                <dl className="mt-2 grid grid-cols-[72px_1fr] gap-y-1 text-[12.5px]">
                  <dt className="text-ink-3">Owner</dt><dd className="text-ink">{OWNERS[cond]}</dd>
                  <dt className="text-ink-3">Due</dt><dd className="tnum text-ink">{sel === 'P2-08' && cond === 1 ? '15 Jul 2027' : project.date}</dd>
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
                  <p className="mt-2 text-[11.5px] text-ink-3">A condition is met only with a linked evidence document and a named confirmer.</p>
                </div>
              </div>
            )}
          </Card>

          <AtlasCard title="ATLAS alert" sources={[{ label: 'Permit register', doc: 'permit-register' }, { label: 'Gate checklists', doc: 'gate-checklist' }]} classification="Forecast" confidence="Medium">
            <p className="font-medium text-ink">Two projects have a permit dependency that puts the FID date at risk by three weeks.</p>
            <ul className="mt-3 space-y-2 text-[12.5px]">
              {[['P2-06', '28 Jul 2027', '15 Dec 2027', '5 Jan 2028'], ['P2-07', '4 Aug 2027', '31 Jan 2028', '21 Feb 2028']].map(([p, clock, t, f]) => (
                <li key={p} className="rounded-md bg-sunken px-3 py-2">
                  <div className="flex items-center justify-between"><b className="text-ink">{p}</b><StatusChip h="Yellow" label="At risk" /></div>
                  <div className="tnum mt-1 text-ink-2">Two-month approval clock ends {clock}. FID {t}, forecast {f}.</div>
                </li>
              ))}
            </ul>
          </AtlasCard>

          <Card className="p-5">
            <h3 className="text-[13px] font-semibold text-ink">Shareholder (Denera) actions</h3>
            <div className="mt-3 flex flex-col gap-2">
              <Button variant="outline" disabled={requests.includes(`esc-${sel}`)} onClick={() => addRequest(`esc-${sel}`, `Escalate slipping gate, ${sel}`)}><TriangleAlert />{requests.includes(`esc-${sel}`) ? 'Escalated' : `Escalate slipping gate (${sel})`}</Button>
              <Button variant="outline" onClick={() => { log('Requested agreement change', sel) ; addRequest(`chg-${sel}`, `Agreement change request, ${sel}`) }} disabled={requests.includes(`chg-${sel}`)}><ArrowUpRight />{requests.includes(`chg-${sel}`) ? 'Change requested' : 'Request agreement change'}</Button>
            </div>
          </Card>
        </div>
      </div>
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
      <div className="mt-1 flex justify-between text-[10.5px] text-ink-4"><span>Feasibility</span><span>FLOA</span><span>FID</span></div>
    </div>
  )
}
