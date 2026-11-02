import { ArrowRight, Ban, CheckCircle2, ChevronRight, Hourglass, Plug, Search, ShieldCheck, Sparkles, Waypoints } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenFrame } from '../components/atlas/frame'
import { Card } from '../components/ui/card'
import { Sheet } from '../components/ui/sheet'
import { Button } from '../components/ui/button'
import { APPROVAL_QUEUE, GUARDRAILS, RUNS, type Lane, type Run, type RunState } from '../data/runs'
import { FEEDS } from '../data/registers'
import { screenByPath } from '../data/screens'
import { cn } from '../lib/cn'
import { useDemo, usePersona } from '../state/store'

const LANES: { id: Lane; icon: typeof Plug; note: string }[] = [
  { id: 'Connect', icon: Plug, note: 'Agreed templates and exports, schema validation' },
  { id: 'Identify', icon: Search, note: 'Deadlines, gates, progress, health, procurement' },
  { id: 'Explain', icon: Sparkles, note: 'Root cause, scenarios, Ask ATLAS on demand' },
  { id: 'Act and track', icon: Waypoints, note: 'Meeting capture, packs, decisions, register' },
]

const STATE: Record<RunState, { I: typeof CheckCircle2; c: string; bar: string }> = {
  Completed: { I: CheckCircle2, c: 'text-ok', bar: 'bg-ok' },
  'Completed with exceptions': { I: CheckCircle2, c: 'text-warn', bar: 'bg-ok' },
  'Waiting for human': { I: Hourglass, c: 'text-atlas-700', bar: 'bg-atlas-500' },
  Blocked: { I: Ban, c: 'text-bad', bar: 'bg-bad' },
}

export function S14Orchestration() {
  const nav = useNavigate()
  const { isPcu } = usePersona()
  const confirmed = useDemo((s) => s.confirmed)
  const [trace, setTrace] = useState<Run | null>(null)
  const runs = RUNS.filter((r) => !(isPcu && r.denaraOnly)).map((r) =>
    r.id === 'R7' && confirmed['interface-conflict'] ? { ...r, state: 'Completed' as RunState, waiting: `Confirmed by ${confirmed['interface-conflict'].by}` } : r,
  )
  const count = (pred: (r: Run) => boolean) => runs.filter(pred).length
  const completed = count((r) => r.state.startsWith('Completed'))
  const waiting = count((r) => r.state === 'Waiting for human')
  const blocked = count((r) => r.state === 'Blocked')

  return (
    <ScreenFrame
      headline={`ATLAS ran ${runs.length} jobs this week: ${completed} completed, ${waiting} are waiting for a person, ${blocked} is blocked for missing data.`}
      status="Yellow"
      statusLabel={`${waiting} waiting for a person`}
      sub="A view of the two ATLAS modes at work. Orchestration jobs run on rules and schedules; Assistant jobs run when a person asks."
      confidence={false}
    >
      <section className="overflow-hidden rounded-lg bg-atlas-950 text-white">
        <div className="grid gap-px bg-white/10 md:grid-cols-4">
          {LANES.map((l, i) => {
            const lr = runs.filter((r) => r.lane === l.id)
            return (
              <div key={l.id} className="relative bg-atlas-950 px-5 py-4">
                <div className="flex items-center gap-2 text-[13px] font-semibold"><l.icon className="size-4 text-atlas-300" />{l.id}<span className="tnum ml-auto rounded-sm bg-white/10 px-1.5 text-[12px]">{lr.length}</span></div>
                <p className="mt-1 text-[12px] leading-snug text-atlas-200">{l.note}</p>
                <div className="mt-3 flex h-1.5 gap-0.5 overflow-hidden rounded-full">{lr.map((r) => <span key={r.id} className={cn('flex-1', STATE[r.state].bar)} />)}</div>
                {i < 3 && <ChevronRight className="absolute -right-2.5 top-1/2 z-10 hidden size-5 -translate-y-1/2 rounded-full bg-atlas-700 p-0.5 md:block" />}
              </div>
            )
          })}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/10 px-5 py-2.5 text-[12px] text-atlas-200">
          <ShieldCheck className="size-4 text-[#f05a24]" /><span className="font-medium text-white">Human approval gates</span>
          {['Deadlines', 'Meeting items', 'Interface conflict', 'Pack release', 'Notice draft', 'Gate condition'].map((g) => <span key={g} className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-[#f05a24]" />{g}</span>)}
        </div>
      </section>

      <Card className="mt-5 overflow-x-auto">
        <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 pt-4">
          <h2 className="text-[15px] font-semibold text-ink">Run board</h2>
          <span className="tnum text-[13px] text-ink-3">{runs.length} jobs · {completed} completed · {waiting} waiting for human · {blocked} blocked</span>
        </div>
        <table className="mt-3 w-full min-w-[1060px] text-[13px]">
          <thead className="border-y border-line text-left text-[12px] text-ink-3"><tr><th className="px-5 py-2.5 font-medium">Job</th><th className="px-3 py-2.5 font-medium">Mode</th><th className="px-3 py-2.5 font-medium">Lane</th><th className="px-3 py-2.5 font-medium">Trigger</th><th className="px-3 py-2.5 font-medium">State</th><th className="px-3 py-2.5 font-medium">Waiting on</th><th className="px-5 py-2.5 font-medium">Output</th></tr></thead>
          <tbody className="divide-y divide-line-soft">
            {runs.map((r) => {
              const S = STATE[r.state]
              return (
                <tr key={r.id} onClick={() => setTrace(r)} className="cursor-pointer hover:bg-atlas-50/50">
                  <td className="px-5 py-3"><button className="press text-left font-medium text-ink hover:text-atlas-700"><span className="tnum text-ink-3">{r.id}</span> {r.job}</button></td>
                  <td className="px-3 py-3"><span className={cn('rounded-sm px-1.5 py-0.5 text-[12px] font-medium', r.mode === 'Assistant' ? 'bg-info-bg text-info' : 'bg-sunken text-ink-2')}>{r.mode}</span></td>
                  <td className="px-3 py-3 text-ink-2">{r.lane}</td>
                  <td className="px-3 py-3 text-ink-2">{r.trigger}</td>
                  <td className="px-3 py-3"><span className={cn('inline-flex items-center gap-1 font-medium', S.c)}><S.I className="size-3.5" />{r.state === 'Blocked' ? 'Blocked: feed not agreed' : r.state}</span></td>
                  <td className="px-3 py-3 text-[13px] text-ink-2">{r.waiting}</td>
                  <td className="px-5 py-3"><button onClick={(e) => { e.stopPropagation(); nav(r.to) }} className="press inline-flex items-center gap-1 whitespace-nowrap font-medium text-atlas-700 hover:underline">{screenByPath(r.to)?.short ?? r.output}<ArrowRight className="size-3.5" /></button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-3">
        <Card className="p-5">
          <h3 className="text-[14px] font-semibold text-ink">Approval queue</h3>
          <ul className="mt-3 space-y-1">
            {APPROVAL_QUEUE.filter((q) => !(isPcu && q.denaraOnly)).map((q) => (
              <li key={q.text}>
                <button onClick={() => nav(q.to)} className="press group flex w-full items-start gap-2.5 rounded-md px-2 py-2 text-left hover:bg-sunken">
                  <Hourglass className="mt-0.5 size-4 shrink-0 text-atlas-600" />
                  <span className="min-w-0 flex-1"><span className="block text-[13px] font-medium text-ink">{q.text}</span><span className="block text-[12px] text-ink-3">{q.who}</span></span>
                  <ArrowRight className="mt-0.5 size-4 text-atlas-700 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="text-[14px] font-semibold text-ink">Guardrails, across every run</h3>
          <ol className="mt-3 space-y-2">
            {GUARDRAILS.map((g, i) => <li key={g} className="flex gap-2.5 text-[13px] leading-snug text-ink-2"><ShieldCheck className={cn('mt-0.5 size-3.5 shrink-0', i < 2 ? 'text-atlas-700' : 'text-ink-3')} />{g}</li>)}
          </ol>
        </Card>
        <Card className="p-5">
          <h3 className="text-[14px] font-semibold text-ink">Data freshness, PSEL Cakrawala Raya</h3>
          <ul className="mt-3 space-y-2.5">
            {FEEDS.cakrawala.feeds.map((f) => (
              <li key={f.name} className="text-[13px]">
                <div className="font-medium text-ink">{f.name}</div>
                <div className={cn('flex items-center gap-1.5', f.result === 'Accepted' ? 'text-ok' : f.result === 'Rejected' ? 'text-bad' : 'text-bad')}>
                  {f.agreed ? `${f.last}, ${f.result?.toLowerCase()}` : <button onClick={() => nav('/partner-data')} className="press inline-flex items-center gap-1 font-medium hover:underline"><Ban className="size-3.5" />Blocked: feed not agreed</button>}
                </div>
              </li>
            ))}
          </ul>
          <p className="tnum mt-3 border-t border-line-soft pt-3 text-[13px] text-ink-2">Data confidence <b className="text-ink">91%</b></p>
        </Card>
      </div>

      <Sheet open={!!trace} onOpenChange={(v) => !v && setTrace(null)} title={trace ? `${trace.id} ${trace.job}` : ''} description={trace ? `${trace.mode} · ${trace.lane}` : ''} footer={trace && <Button onClick={() => nav(trace.to)}>Open where it appears<ArrowRight /></Button>}>
        {trace?.trace && (
          <ol className="relative ml-2 border-l border-line pl-6">
            {[
              ['Trigger', trace.trigger],
              ['Inputs and sources', trace.trace.inputs.join('; ') + '. Refreshed 30 Jun 2027 08:30.'],
              ['Method or rule applied', trace.trace.method],
              ['Result and confidence', `${trace.trace.result}. Confidence ${trace.trace.confidence}.`],
              ['Human gate', `${trace.trace.gate}. State: ${trace.state}.`],
              ['Where it appears', screenByPath(trace.to)?.title ?? trace.output],
            ].map(([k, v], i) => (
              <li key={k} className="relative mb-5 animate-rise" style={{ animationDelay: `${i * 40}ms` }}>
                <span className="tnum absolute -left-[35px] top-0 grid size-5 place-items-center rounded-full bg-atlas-700 text-[12px] font-semibold text-white">{i + 1}</span>
                <div className="text-[12px] font-medium text-ink-3">{k}</div>
                <div className="text-[14px] leading-relaxed text-ink">{v}</div>
              </li>
            ))}
          </ol>
        )}
      </Sheet>
    </ScreenFrame>
  )
}
