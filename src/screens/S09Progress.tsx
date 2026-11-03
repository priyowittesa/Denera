import { ArrowRight, CalendarClock, ChartSpline, Flag, Gauge as GaugeIcon, Info, ShieldCheck, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Area, CartesianGrid, ComposedChart, Line, ReferenceArea, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { AtlasCard, Metric, ScreenFrame, SectionTitle, StatTile } from '../components/atlas/frame'
import { PlainStatus, StatusChip } from '../components/atlas/chips'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Switch } from '../components/ui/switch'
import { Segmented, Tabs, TabsContent, TabsList } from '../components/ui/tabs'
import { CONTRACTORS, DISCIPLINES, EVENT_PINS, FORECAST, HISTORY, PACKAGES_COST, PLANNED_FUTURE, SCENARIOS, WBS, type ScenarioId } from '../data/scurve'
import { cn } from '../lib/cn'
import { AXIS, ChartTooltip, LegendItem, TICKS, fmtMonth, t } from '../lib/chart'
import { useDemo } from '../state/store'
import { useUi } from '../state/ui'

const DD = t('2027-06-30')
const TARGET = t('2028-06-30')
const START = t('2026-08-03')
const END = t('2028-09-30')

type Tab = 'progress' | 'cost' | 'ev'

export function S09Progress() {
  const scenarioId = useDemo((s) => s.scenario)
  const setScenario = useDemo((s) => s.setScenario)
  const analyst = useDemo((s) => s.analyst)
  const setAnalyst = useDemo((s) => s.setAnalyst)
  const [tab, setTab] = useState<Tab>('progress')
  const sc = SCENARIOS.find((s) => s.id === scenarioId)!
  const nav = useNavigate()

  return (
    <ScreenFrame
      headline={<>Only 39% of the reported 42% progress is verified, and at this pace commercial operation slips {sc.days} days to {sc.cod}.</>}
      answer={{ label: 'Verified progress', value: '39%', tone: 'warn', foot: <>Reported 42%, planned 46%. The 3-point gap is about <b className="font-semibold text-ink">Rp84 bn</b> of work at Rp28 bn a point.</>, stake: ['UC08', 'UC09'] }}
      status="Red"
      statusLabel="Schedule forecast breaches target"
      sub="7.0 points behind plan on verified work."
      aside={<Switch id="analyst" checked={analyst} onCheckedChange={setAnalyst} label="Analyst view" />}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
            <Segmented<Tab>
              label="Chart"
              value={tab}
              onChange={setTab}
              items={[
                { value: 'progress', label: 'Physical progress' },
                { value: 'cost', label: 'Cost and commitment' },
                { value: 'ev', label: analyst ? 'Earned value (PV, EV, AC)' : 'Earned value' },
              ]}
            />
          </div>
          <div className="px-2 pt-2">
            {tab === 'progress' && <ProgressChart scenario={sc.id} />}
            {tab === 'cost' && <CostChart />}
            {tab === 'ev' && <EvChart analyst={analyst} />}
          </div>
          {tab === 'progress' && (
            <div className="border-t border-line-soft px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[13px] font-semibold text-ink">Recovery scenario</span>
                <Button variant="link" size="sm" onClick={() => nav('/cost#scenarios')}>See cost of this scenario<ArrowRight /></Button>
              </div>
              <Segmented<ScenarioId>
                className="mt-2.5"
                label="Recovery scenario"
                size="sm"
                value={sc.id}
                onChange={(v) => setScenario(v, 'Progress')}
                items={SCENARIOS.map((s) => ({ value: s.id, label: <span>{s.short} <span className="tnum text-ink-4">+{s.days}</span></span> }))}
              />
              <ScenarioCard id={sc.id} />
              <ol className="mt-4 grid gap-x-6 gap-y-1.5 text-[13px] text-ink-3 md:grid-cols-2">
                {EVENT_PINS.map((p) => (
                  <li key={p.n} className="flex gap-2"><span className="tnum grid size-[18px] shrink-0 place-items-center rounded-full bg-ink text-[12px] font-semibold text-white">{p.n}</span>{p.text}</li>
                ))}
              </ol>
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-5">
          <AtlasCard
            title="Committed money against verified work"
            sources={[{ label: 'Cost report June 2027', doc: 'cost-report' }, { label: 'Inspection records', doc: 'inspection-records' }]}
            classification="Verified"
            confidence="High"
          >
            <p>
              The project has incurred and committed <b className="text-ink">52%</b> of CAPEX while verified physical progress is <b className="text-ink">39%</b>. The 13-point gap is <b className="text-ink">Rp364 billion</b>. Part of this is normal for long-lead procurement, but <b className="text-ink">Rp106 billion of it (29%)</b> is linked to packages with delayed manufacturing or unverified installation readiness.
            </p>
            <GapBar />
          </AtlasCard>
          <Card className="px-[18px] py-4">
            <h3 className="text-[14px] font-semibold text-ink">Reported and verified, always apart</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-3">Reported is what the contractor claims. Verified is what ATLAS has checked against quantities and inspection records. A gap of 5 points or more carries a flag.</p>
            <div className="mt-3 flex items-end gap-6">
              <div><div className="text-[12px] text-ink-3">Reported</div><div className="tnum text-[24px] font-semibold text-ink-3">42%</div></div>
              <div><div className="text-[12px] text-ink-3">Verified</div><div className="tnum text-[24px] font-semibold text-series-verified">39%</div></div>
              <div><div className="text-[12px] text-ink-3">Planned</div><div className="tnum text-[24px] font-semibold text-ink-2">46%</div></div>
            </div>
          </Card>
        </div>
      </div>

      <Indicators analyst={analyst} />

      <section className="mt-8">
        <SectionTitle>Where the gap sits</SectionTitle>
        <Card>
          <Tabs defaultValue="wbs">
            <TabsList className="px-[18px] pb-3 pt-4" items={[{ value: 'wbs', label: 'By WBS' }, { value: 'discipline', label: 'By discipline' }, { value: 'contractor', label: 'By contractor' }, { value: 'package', label: 'By work package' }]} />
            <TabsContent value="wbs" className="p-2"><WbsList /></TabsContent>
            <TabsContent value="discipline" className="p-4"><DisciplineTable /></TabsContent>
            <TabsContent value="contractor" className="p-4"><ContractorTable /></TabsContent>
            <TabsContent value="package" className="p-4"><PackageTable /></TabsContent>
          </Tabs>
        </Card>
      </section>
    </ScreenFrame>
  )
}

function ProgressChart({ scenario }: { scenario: ScenarioId }) {
  const sc = SCENARIOS.find((s) => s.id === scenario)!
  const data = useMemo(() => {
    const rows: Record<string, number | number[] | undefined>[] = HISTORY.map((h) => ({ x: t(h.date), planned: h.planned, reported: h.reported, verified: h.verified }))
    const last = rows[rows.length - 1]
    last.forecast = 39
    last.envelope = [39, 39]
    for (const f of FORECAST.slice(1)) {
      const pf = PLANNED_FUTURE.find((p) => p.date === f.date)
      rows.push({ x: t(f.date), planned: pf?.planned, forecast: f[scenario], envelope: [f.none, f.both] })
    }
    return rows.sort((a, b) => (a.x as number) - (b.x as number))
  }, [scenario])
  const codX = t(sc.codIso)
  const recovery = scenario === 'expedite' || scenario === 'resequence' || scenario === 'both'

  return (
    <div>
      <div className="h-[380px]" role="img" aria-label={`S-curve. Planned 46%, reported 42%, verified 39% at 30 June 2027. Forecast COD ${sc.cod}, ${sc.days} days after target.`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 28, right: 24, bottom: 4, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-line-soft)" />
            <XAxis dataKey="x" type="number" scale="time" domain={[START, END]} ticks={TICKS} tickFormatter={fmtMonth} tick={AXIS} axisLine={{ stroke: 'var(--color-line)' }} tickLine={false} />
            <YAxis domain={[0, 110]} ticks={[0, 20, 40, 60, 80, 100]} tickFormatter={(v) => `${v}%`} tick={AXIS} axisLine={false} tickLine={false} width={44} />
            <ReferenceArea x1={START} x2={DD} fill="var(--color-sunken)" fillOpacity={0.6} ifOverflow="hidden" />
            <Area dataKey="envelope" stroke="none" fill="var(--color-series-envelope)" fillOpacity={0.9} isAnimationActive={false} connectNulls />
            <Line dataKey="planned" stroke="var(--color-series-planned)" strokeWidth={2} strokeDasharray="6 5" dot={false} isAnimationActive={false} connectNulls />
            <Line dataKey="reported" stroke="var(--color-series-reported)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            <Line dataKey="verified" stroke="var(--color-series-verified)" strokeWidth={3} dot={false} isAnimationActive={false} />
            <Line key={scenario} dataKey="forecast" stroke={sc.color} strokeWidth={2.5} strokeDasharray={scenario === 'current' ? '2 5' : '7 5'} strokeLinecap="round" dot={false} isAnimationActive animationDuration={420} animationEasing="ease-out" connectNulls />
            <ReferenceLine x={DD} stroke="var(--color-ink)" strokeWidth={1.25} label={{ value: 'Today, 30 Jun 2027', position: 'top', fill: 'var(--color-ink)', fontSize: 12, fontWeight: 600 }} />
            <ReferenceLine segment={[{ x: DD, y: 39 }, { x: DD, y: 46 }]} stroke="var(--color-bad)" strokeWidth={2.5} label={{ value: '7.0 points behind plan', position: 'right', fill: 'var(--color-bad)', fontSize: 12, fontWeight: 700, offset: 12, stroke: 'white', strokeWidth: 4, paintOrder: 'stroke' }} />
            <ReferenceLine x={TARGET} stroke="var(--color-series-planned)" strokeDasharray="3 3" label={{ value: 'Target COD', position: 'insideBottomRight', fill: 'var(--color-ink-2)', fontSize: 11 }} />
            <ReferenceLine x={codX} stroke={sc.color} strokeWidth={1.5} />
            <ReferenceLine segment={[{ x: TARGET, y: 104 }, { x: codX, y: 104 }]} stroke={sc.color} strokeWidth={3} label={{ value: `${sc.days} days`, position: 'top', fill: scenario === 'none' ? 'var(--color-bad)' : recovery ? 'var(--color-ok)' : 'var(--color-warn)', fontSize: 12, fontWeight: 700 }} />
            <ReferenceDot x={DD} y={46} r={3.5} fill="var(--color-series-planned)" stroke="white" label={{ value: 'Planned 46%', position: 'left', fontSize: 12, fill: 'var(--color-ink-2)', fontWeight: 600, dy: -10, offset: 10, stroke: 'white', strokeWidth: 4, paintOrder: 'stroke' }} />
            <ReferenceDot x={DD} y={42} r={3} fill="var(--color-series-reported)" stroke="white" label={{ value: 'Reported 42%', position: 'left', fontSize: 11, fill: 'var(--color-ink-3)', offset: 10, dy: -2, stroke: 'white', strokeWidth: 4, paintOrder: 'stroke' }} />
            <ReferenceDot x={DD} y={39} r={4.5} fill="var(--color-series-verified)" stroke="white" strokeWidth={2} label={{ value: 'Verified 39%', position: 'left', fontSize: 12, fill: 'var(--color-series-verified)', fontWeight: 700, offset: 10, dy: 12, stroke: 'white', strokeWidth: 4, paintOrder: 'stroke' }} />
            {EVENT_PINS.map((p) => {
              const ys: Record<number, number> = { 1: 3, 2: 16, 3: 22, 4: 62 }
              return <ReferenceDot key={p.n} x={t(p.date)} y={ys[p.n]} r={8} fill="var(--color-ink)" stroke="white" strokeWidth={1.5} label={{ value: String(p.n), fill: 'white', fontSize: 10, fontWeight: 700, position: 'center' }} />
            })}
            <Tooltip
              cursor={{ stroke: 'var(--color-atlas-500)', strokeWidth: 1 }}
              content={(p) => (
                <ChartTooltip
                  {...(p as object)}
                  label={p.label as number}
                  rows={[
                    { key: 'planned', label: 'Planned', color: 'var(--color-series-planned)', fmt: (v) => `${v.toFixed(1)}%` },
                    { key: 'reported', label: 'Reported', color: 'var(--color-series-reported)', fmt: (v) => `${v.toFixed(1)}%` },
                    { key: 'verified', label: 'Verified', color: 'var(--color-series-verified)', fmt: (v) => `${v.toFixed(1)}%` },
                    { key: 'forecast', label: `Forecast, ${sc.short.toLowerCase()}`, color: sc.color, fmt: (v) => `${v.toFixed(1)}%` },
                  ]}
                />
              )}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 px-4 pb-3">
        <LegendItem color="var(--color-series-planned)" dash="6 5" label="Planned (baseline)" />
        <LegendItem color="var(--color-series-reported)" weight={1.5} label="Reported" />
        <LegendItem color="var(--color-series-verified)" weight={3} label="Verified" />
        <LegendItem color={sc.color} dash={scenario === 'current' ? '2 5' : '7 5'} weight={2.5} label={`Forecast, ${sc.short.toLowerCase()} (advisory)`} />
        <span className="inline-flex items-center gap-2 text-[13px] text-ink-2"><span className="h-2.5 w-5 rounded-sm bg-series-envelope" />Range from best recovery to no intervention</span>
      </div>
    </div>
  )
}

function ScenarioCard({ id }: { id: ScenarioId }) {
  const s = SCENARIOS.find((x) => x.id === id)!
  const h = s.rating === 'Red' ? 'Red' : 'Yellow'
  return (
    <div key={id} className="mt-3 grid animate-rise gap-4 rounded-md bg-sunken px-4 py-3 sm:grid-cols-4">
      <Metric label="Forecast COD" value={s.cod} note={`${s.days} days late`} tone={s.days > 60 ? 'bad' : undefined} />
      <Metric label="Incremental cost" value={s.incremental === null ? 'n/a' : `Rp${s.incremental} bn`} />
      <Metric label="Contingency remaining" value={`Rp${s.remaining} bn`} note={`${s.remainingPct}% of reserve`} tone={s.remaining < 20 ? 'bad' : undefined} />
      <div><div className="text-[13px] font-medium text-ink-3">Overall rating</div><div className="mt-1.5"><StatusChip h={h} label={s.rating === 'Yellow, escalation' ? 'Yellow, escalation' : s.rating} /></div></div>
    </div>
  )
}

function CostChart() {
  const data = useMemo(() => {
    const rows: Record<string, number | undefined>[] = HISTORY.map((h) => ({ x: t(h.date), plan: h.pv, ac: h.ac, acCommit: h.acCommit, cash: h.cash }))
    rows[rows.length - 1].fc = 1138
    for (const f of FORECAST.slice(1)) rows.push({ x: t(f.date), plan: f.plannedCost, fc: f.forecastCost })
    return rows
  }, [])
  const rp = (v: number) => `Rp${v.toLocaleString('en-US')} bn`
  return (
    <div>
      <div className="h-[380px]" role="img" aria-label="Cost curve. Incurred and committed Rp1,456 bn at the data date; forecast reaches management EAC Rp2,910 bn against approved CAPEX Rp2,800 bn.">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 24, right: 104, bottom: 4, left: 8 }}>
            <CartesianGrid vertical={false} stroke="var(--color-line-soft)" />
            <XAxis dataKey="x" type="number" scale="time" domain={[START, END]} ticks={TICKS} tickFormatter={fmtMonth} tick={AXIS} axisLine={{ stroke: 'var(--color-line)' }} tickLine={false} />
            <YAxis domain={[0, 3200]} ticks={[0, 800, 1600, 2400, 3200]} tickFormatter={(v) => `${v.toLocaleString('en-US')}`} tick={AXIS} axisLine={false} tickLine={false} width={52} label={{ value: 'Rp bn', angle: -90, position: 'insideLeft', fill: 'var(--color-ink-3)', fontSize: 11 }} />
            <ReferenceArea x1={t('2028-08-11')} x2={END} y1={2846} y2={2918} fill="var(--color-warn-bg)" stroke="var(--color-warn)" strokeOpacity={0.4} />
            <ReferenceLine y={2800} stroke="var(--color-ink)" label={{ value: 'CAPEX 2,800', position: 'right', offset: 8, dy: 9, fontSize: 12, fill: 'var(--color-ink)', fontWeight: 600 }} />
            <ReferenceLine y={2976} stroke="var(--color-ink-3)" strokeDasharray="2 4" label={{ value: 'Reserve 2,976', position: 'right', offset: 8, dy: -8, fontSize: 11, fill: 'var(--color-ink-3)' }} />
            <ReferenceLine x={DD} stroke="var(--color-ink)" strokeWidth={1.25} label={{ value: 'Today', position: 'top', fill: 'var(--color-ink)', fontSize: 12, fontWeight: 600 }} />
            <Line dataKey="plan" stroke="var(--color-series-planned)" strokeDasharray="6 5" strokeWidth={2} dot={false} isAnimationActive={false} connectNulls />
            <Line dataKey="cash" stroke="var(--color-info)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            <Line dataKey="acCommit" stroke="var(--color-warn)" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line dataKey="ac" stroke="var(--color-series-verified)" strokeWidth={3} dot={false} isAnimationActive={false} />
            <Line dataKey="fc" stroke="var(--color-series-forecast)" strokeDasharray="2 5" strokeWidth={2.5} strokeLinecap="round" dot={false} isAnimationActive={false} connectNulls />
            <ReferenceDot x={DD} y={1456} r={4} fill="var(--color-warn)" stroke="white" label={{ value: 'Incurred and committed Rp1,456 bn', position: 'left', fontSize: 12, fill: 'var(--color-ink)', fontWeight: 600, offset: 10 }} />
            <Tooltip cursor={{ stroke: 'var(--color-atlas-500)' }} content={(p) => (
              <ChartTooltip {...(p as object)} label={p.label as number} rows={[
                { key: 'plan', label: 'Planned cashflow', color: 'var(--color-series-planned)', fmt: rp },
                { key: 'ac', label: 'Actual cost', color: 'var(--color-series-verified)', fmt: rp },
                { key: 'acCommit', label: 'Actual plus commitments', color: 'var(--color-warn)', fmt: rp },
                { key: 'cash', label: 'Cash paid', color: 'var(--color-info)', fmt: rp },
                { key: 'fc', label: 'Forecast cumulative cost', color: 'var(--color-series-forecast)', fmt: rp },
              ]} />
            )} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 px-4 pb-4">
        <LegendItem color="var(--color-series-planned)" dash="6 5" label="Planned cashflow" />
        <LegendItem color="var(--color-series-verified)" weight={3} label="Actual cost" />
        <LegendItem color="var(--color-warn)" label="Actual plus open commitments" />
        <LegendItem color="var(--color-info)" weight={1.5} label="Cash paid" />
        <LegendItem color="var(--color-series-forecast)" dash="2 5" weight={2.5} label="Forecast cost (advisory)" />
        <LegendItem color="var(--color-ink)" weight={1} label="Approved CAPEX Rp2,800 bn" />
        <LegendItem color="var(--color-ink-3)" dash="2 4" weight={1} label="CAPEX plus contingency reserve Rp2,976 bn" />
        <span className="inline-flex items-center gap-2 text-[13px] text-ink-2"><span className="h-2.5 w-5 rounded-[2px] border border-warn/40 bg-warn-bg" />Management EAC range Rp2,846 to 2,918 bn</span>
      </div>
    </div>
  )
}

function EvChart({ analyst }: { analyst: boolean }) {
  const data = HISTORY.map((h) => ({ x: t(h.date), pv: h.pv, ev: h.ev, ac: h.ac }))
  const rp = (v: number) => `Rp${v.toLocaleString('en-US')} bn`
  const L = analyst ? { pv: 'Planned value (PV)', ev: 'Earned value (EV)', ac: 'Actual cost (AC)' } : { pv: 'Value of work planned', ev: 'Value of work done', ac: 'Cost incurred' }
  return (
    <div>
      <div className="h-[380px]" role="img" aria-label="Earned value at 30 June 2027: planned Rp1,288 bn, earned Rp1,092 bn, actual cost Rp1,138 bn.">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 24, right: 150, bottom: 4, left: 8 }}>
            <CartesianGrid vertical={false} stroke="var(--color-line-soft)" />
            <XAxis dataKey="x" type="number" scale="time" domain={[START, DD]} ticks={TICKS.filter((x) => x <= DD)} tickFormatter={fmtMonth} tick={AXIS} axisLine={{ stroke: 'var(--color-line)' }} tickLine={false} />
            <YAxis domain={[0, 1400]} ticks={[0, 350, 700, 1050, 1400]} tick={AXIS} tickFormatter={(v) => v.toLocaleString('en-US')} axisLine={false} tickLine={false} width={52} label={{ value: 'Rp bn', angle: -90, position: 'insideLeft', fill: 'var(--color-ink-3)', fontSize: 11 }} />
            <Line dataKey="pv" stroke="var(--color-series-planned)" strokeDasharray="6 5" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line dataKey="ac" stroke="var(--color-warn)" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line dataKey="ev" stroke="var(--color-series-verified)" strokeWidth={3} dot={false} isAnimationActive={false} />
            <ReferenceDot x={DD} y={1288} r={3.5} fill="var(--color-series-planned)" stroke="white" label={{ value: `${analyst ? 'PV' : 'Planned'} Rp1,288 bn`, position: 'right', fontSize: 12, fill: 'var(--color-ink-2)', fontWeight: 600 }} />
            <ReferenceDot x={DD} y={1138} r={3.5} fill="var(--color-warn)" stroke="white" label={{ value: `${analyst ? 'AC' : 'Cost'} Rp1,138 bn`, position: 'right', fontSize: 12, fill: 'var(--color-warn)', fontWeight: 600 }} />
            <ReferenceDot x={DD} y={1092} r={4.5} fill="var(--color-series-verified)" stroke="white" strokeWidth={2} label={{ value: `${analyst ? 'EV' : 'Done'} Rp1,092 bn`, position: 'right', fontSize: 12, fill: 'var(--color-series-verified)', fontWeight: 700, dy: 10 }} />
            <Tooltip cursor={{ stroke: 'var(--color-atlas-500)' }} content={(p) => (
              <ChartTooltip {...(p as object)} label={p.label as number} rows={[
                { key: 'pv', label: L.pv, color: 'var(--color-series-planned)', fmt: rp },
                { key: 'ev', label: L.ev, color: 'var(--color-series-verified)', fmt: rp },
                { key: 'ac', label: L.ac, color: 'var(--color-warn)', fmt: rp },
              ]} />
            )} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 pb-4">
        <LegendItem color="var(--color-series-planned)" dash="6 5" label={L.pv} />
        <LegendItem color="var(--color-series-verified)" weight={3} label={L.ev} />
        <LegendItem color="var(--color-warn)" label={L.ac} />
        <span className="text-[13px] text-ink-3">Management EAC Rp2,910 bn at forecast COD, 11 Aug 2028</span>
        {analyst && (
          <span className="ml-auto flex gap-5">
            <Gauge label="SPI" v={0.85} />
            <Gauge label="CPI" v={0.96} />
          </span>
        )}
      </div>
    </div>
  )
}

function Gauge({ label, v }: { label: string; v: number }) {
  return (
    <span className="inline-flex items-center gap-2 text-[13px]">
      <span className="font-medium text-ink-2">{label}</span>
      <span className="relative h-1.5 w-20 rounded-full bg-sunken">
        <span className="absolute inset-y-0 left-0 rounded-full bg-warn" style={{ width: `${v * 100}%` }} />
        <span className="absolute -top-1 h-3.5 w-px bg-ink" style={{ left: '100%' }} />
      </span>
      <span className="tnum font-semibold text-ink">{v.toFixed(2)}</span>
    </span>
  )
}

function GapBar() {
  return (
    <div className="mt-4" aria-hidden>
      <div className="relative h-3 overflow-hidden rounded-full bg-sunken">
        <div className="absolute inset-y-0 left-0 bg-series-verified" style={{ width: '39%' }} />
        <div className="absolute inset-y-0 bg-atlas-300" style={{ left: '39%', width: `${13 * 0.71}%` }} />
        <div className="absolute inset-y-0 bg-bad" style={{ left: `${39 + 13 * 0.71}%`, width: `${13 * 0.29}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between text-[12px] text-ink-3">
        <span>Verified 39%</span>
        <span className="inline-flex items-center gap-1"><span className="size-2 rounded-[2px] bg-bad" />Rp106 bn at risk</span>
        <span>Committed 52%</span>
      </div>
    </div>
  )
}

function Indicators({ analyst }: { analyst: boolean }) {
  const openDefs = useUi((s) => s.setDefinitionsOpen)
  const items: { plain: string; term: string; value: string; note?: string; tip: string; tone?: 'bad' | 'warn' }[] = [
    { plain: 'Schedule efficiency', term: 'SPI', value: '0.85', tip: 'Schedule Performance Index = EV / PV = 1,092 / 1,288', tone: 'warn' },
    { plain: 'Cost efficiency', term: 'CPI', value: '0.96', tip: 'Cost Performance Index = EV / AC = 1,092 / 1,138', tone: 'warn' },
    { plain: 'Progress gap', term: 'Progress variance', value: '−7.0 pts', tip: 'Verified 39% minus planned 46%', tone: 'bad' },
    { plain: 'Cost gap', term: 'CV', value: '−Rp46 bn', tip: 'Cost variance = EV minus AC = 1,092 minus 1,138', tone: 'warn' },
    { plain: 'Forecast delay', term: 'COD variance', value: '42 days', tip: 'Forecast COD 11 Aug 2028 against target 30 Jun 2028 (current plan)', tone: 'bad' },
    { plain: 'Forecast overrun', term: 'EAC variance', value: '+Rp110 bn', note: 'EAC Rp2,910 bn; range 2,846 to 2,918', tip: 'Management EAC Rp2,910 bn; CPI-trend Rp2,918 bn; range Rp2,846 to 2,918 bn', tone: 'bad' },
    { plain: 'Contingency remaining', term: 'Reserve', value: '63%', note: 'Rp111 bn of Rp176 bn', tip: 'Forecast use Rp65 bn.' },
  ]
  const icons = [GaugeIcon, Wallet, ChartSpline, TrendingDown, CalendarClock, TrendingUp, ShieldCheck]
  return (
    <section className="mt-[18px]">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-semibold text-ink">Indicators at 30 Jun 2027</h2>
        <button onClick={() => openDefs(true)} className="press inline-flex items-center gap-1 text-[13px] font-medium text-atlas-700 hover:underline"><Info className="size-3.5" />Definitions</button>
      </div>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-12">
        {items.map((i, k) => (
          <div key={i.plain} className={cn('min-w-0 xl:col-span-3', k >= 4 && 'xl:col-span-4')}>
          <StatTile icon={icons[k]} label={analyst ? i.term : i.plain} value={i.value} cap={i.note ?? (analyst ? i.plain : i.term)} tone={i.tone} tip={<><b>{i.term}</b>. {i.tip}</>} />
          </div>
        ))}
      </div>
    </section>
  )
}

function WbsList() {
  const nav = useNavigate()
  return (
    <ul className="divide-y divide-line-soft">
      {WBS.map((w) => (
        <li key={w.name}>
          {w.link ? (
            <button onClick={() => nav(w.link!)} className="press group flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left hover:bg-atlas-50">
              <span className="flex items-center gap-2 text-[14px] font-medium text-ink"><Flag className="size-3.5 text-bad" />{w.name}</span>
              <span className="flex items-center gap-3"><PlainStatus s={w.status} /><span className="text-[13px] text-atlas-700 group-hover:underline">Open root cause</span><ArrowRight className="size-4 text-atlas-700" /></span>
            </button>
          ) : (
            <div className="flex items-center justify-between gap-3 px-3 py-2.5">
              <span className="text-[14px] text-ink">{w.name}</span>
              <PlainStatus s={w.status} />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

const th = 'text-left'
const td = ''

function Flagged({ r, v }: { r: number; v: number }) {
  const flag = r - v >= 5
  return flag ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-bad-line bg-bad-bg px-2 py-0.5 text-[12px] font-medium text-bad"><Flag className="size-3" />{r - v} pt gap</span>
  ) : <span className="text-[12px] text-ink-4">within 5 pts</span>
}

function DisciplineTable() {
  return (
    <table className="w-full">
      <thead className="border-b border-line"><tr><th className={th}>Discipline</th><th className={cn(th, 'text-right')}>Weight</th><th className={cn(th, 'text-right')}>Reported</th><th className={cn(th, 'text-right')}>Verified</th><th className={th}>Mismatch</th></tr></thead>
      <tbody className="tnum divide-y divide-line-soft">
        {DISCIPLINES.map((d) => (
          <tr key={d.name}><td className={td}>{d.name}</td><td className={cn(td, 'text-right text-ink-3')}>{d.weight}%</td><td className={cn(td, 'text-right text-ink-3')}>{d.reported}%</td><td className={cn(td, 'text-right font-semibold text-series-verified')}>{d.verified}%</td><td className={td}><Flagged r={d.reported} v={d.verified} /></td></tr>
        ))}
        <tr className="border-t border-line font-semibold"><td className={td}>Weighted</td><td className={cn(td, 'text-right')}>100%</td><td className={cn(td, 'text-right')}>42%</td><td className={cn(td, 'text-right text-series-verified')}>39%</td><td className={td} /></tr>
      </tbody>
    </table>
  )
}

function ContractorTable() {
  return (
    <table className="w-full">
      <thead className="border-b border-line"><tr><th className={th}>Contractor</th><th className={cn(th, 'text-right')}>Reported</th><th className={cn(th, 'text-right')}>Verified</th><th className={th}>Mismatch</th><th className={cn(th, 'text-right')}>Overdue deliverables</th></tr></thead>
      <tbody className="tnum divide-y divide-line-soft">
        {CONTRACTORS.map((c) => (
          <tr key={c.name}><td className={td}>{c.name}</td><td className={cn(td, 'text-right text-ink-3')}>{c.reported}%</td><td className={cn(td, 'text-right font-semibold text-series-verified')}>{c.verified}%</td><td className={td}><Flagged r={c.reported} v={c.verified} /></td><td className={cn(td, 'text-right', c.overdue >= 3 && 'font-semibold text-bad')}>{c.overdue}</td></tr>
        ))}
      </tbody>
    </table>
  )
}

function PackageTable() {
  const tAc = PACKAGES_COST.reduce((s, p) => s + p.ac, 0)
  const tCo = PACKAGES_COST.reduce((s, p) => s + p.commit, 0)
  const tBu = PACKAGES_COST.reduce((s, p) => s + p.budget, 0)
  return (
    <table className="w-full">
      <thead className="border-b border-line"><tr><th className={th}>Work package</th><th className={cn(th, 'text-right')}>Budget (Rp bn)</th><th className={cn(th, 'text-right')}>Actual cost (Rp bn)</th><th className={cn(th, 'text-right')}>Open commitments (Rp bn)</th><th className={cn(th, 'text-right')}>Incurred and committed</th></tr></thead>
      <tbody className="tnum divide-y divide-line-soft">
        {PACKAGES_COST.map((p) => (
          <tr key={p.name}><td className={td}>{p.name}</td><td className={cn(td, 'text-right')}>{p.budget.toLocaleString('en-US')}</td><td className={cn(td, 'text-right')}>{p.ac.toLocaleString('en-US')}</td><td className={cn(td, 'text-right', p.name === 'Boiler island' && 'font-semibold text-bad')}>{p.commit}</td><td className={cn(td, 'text-right text-ink-2')}>{Math.round(((p.ac + p.commit) / p.budget) * 100)}%</td></tr>
        ))}
        <tr className="border-t border-line font-semibold"><td className={td}>Total</td><td className={cn(td, 'text-right')}>{tBu.toLocaleString('en-US')}</td><td className={cn(td, 'text-right')}>{tAc.toLocaleString('en-US')}</td><td className={cn(td, 'text-right')}>{tCo}</td><td className={cn(td, 'text-right')}>{Math.round(((tAc + tCo) / tBu) * 100)}%</td></tr>
      </tbody>
    </table>
  )
}
