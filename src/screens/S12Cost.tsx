import { Banknote, Calculator as CalcIcon, CalendarClock, CalendarRange, CheckCircle2, ClipboardList, Landmark, PiggyBank, Receipt, ShieldCheck, TrendingUp, TriangleAlert, Wallet, type LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AuthorityLabel, StatusChip } from '../components/atlas/chips'
import { AtlasCard, ScreenFrame, SectionTitle, StatTile } from '../components/atlas/frame'
import { Card, CardBody, CardHeader } from '../components/ui/card'
import { ALERT_LINE_USED, CONTINGENCY_PATH, COST_INSIGHT, COST_RISKS, DRIVERS, MONTHLY_CASHFLOW, VARIANCE_BY_PACKAGE, WHAT_IFS } from '../data/cost'
import { revenuePerDay } from '../data/valueBasis'
import { cn } from '../lib/cn'
import { AXIS, LegendItem } from '../lib/chart'
import { useDemo, usePersona } from '../state/store'

export function S12Cost() {
  const { isPcu } = usePersona()
  const { hash } = useLocation()
  const scenario = useDemo((s) => s.scenario)
  const setScenario = useDemo((s) => s.setScenario)
  const [days, setDays] = useState(42)

  useEffect(() => {
    if (hash === '#scenarios') window.setTimeout(() => document.getElementById('scenarios')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120)
  }, [hash])

  const selected = WHAT_IFS.find((w) => w.scenario === scenario)
  const remaining = selected?.remainingV ?? (scenario === 'current' ? 111 : null)

  return (
    <ScreenFrame
      headline={isPcu ? 'The project stays within total contingency, but forecast cost runs Rp110 billion above approved CAPEX.' : 'The project stays within total contingency, but Rp45 billion of forecast cost needs shareholder funding approval.'}
      status="Red"
      statusLabel="Cost dimension Red"
      sub="Management EAC Rp2,910 bn against approved CAPEX Rp2,800 bn."
      answer={isPcu ? { label: 'Forecast above CAPEX', value: 'Rp110 bn', tone: 'bad', foot: 'Rp65 bn is covered from contingency.', stake: ['UC09'] } : { label: 'Needs shareholder approval', value: 'Rp45 bn', tone: 'bad', foot: <>Of a <b className="font-semibold text-ink">Rp110 bn</b> forecast overrun. Contingency covers Rp65 bn.</>, stake: ['UC09'] }}
    >
      <div className="space-y-5">
        <Group title="Forecast" items={[
          [Landmark, 'Approved CAPEX', 'Rp2,800 bn'],
          [CalcIcon, 'Management EAC', 'Rp2,910 bn', 'Range Rp2,846 to 2,918 bn'],
          [TrendingUp, 'Forecast variance', '+Rp110 bn', isPcu ? 'Rp65 bn from contingency' : 'Rp65 bn contingency, Rp45 bn shareholder funding', 'bad'],
          [CalendarClock, 'Delay-linked revenue deferred', `USD ${(revenuePerDay() * 42 / 1e6).toFixed(1)} m`, '42 days, from the calculator below'],
        ]} />
        <Group title="Contingency" items={[
          [ShieldCheck, 'Contingency available', 'Rp176 bn', '6.3% of CAPEX, outside approved CAPEX'],
          [PiggyBank, 'Forecast use', 'Rp65 bn', '37% of the reserve'],
          [Wallet, 'Remaining', 'Rp111 bn', '63% of reserve'],
          [TriangleAlert, 'Alert threshold', 'Rp17.6 bn', '10% of reserve'],
        ]} />
        <Group title="Cash" items={[
          [Receipt, 'Actual cost', 'Rp1,138 bn'],
          [ClipboardList, 'Open commitments', 'Rp318 bn'],
          [Banknote, 'Cash paid', 'Rp1,190 bn', 'Includes Rp52 bn vendor advances'],
          ...(!isPcu ? [[CalendarRange, 'Next-quarter funding', 'Rp312 bn', 'Assumed input, from the cashflow forecast'] as GroupItem] : []),
        ]} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Approved to forecast CAPEX" sub="Rp bn" />
          <CardBody><Waterfall pcu={isPcu} /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Where the Rp110 bn comes from" sub="Cost drivers, Rp bn" />
          <CardBody><HBars rows={DRIVERS} total={110} /></CardBody>
        </Card>
      </div>

      <Calculator days={days} setDays={setDays} pcu={isPcu} />

      <section id="scenarios" className="mt-8 scroll-mt-20">
        <SectionTitle aside={<span className="text-[12px] text-ink-3">Selecting a scenario updates the S-curve forecast</span>}>What-if scenarios against remaining contingency</SectionTitle>
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px] [&>*:last-child]:xl:sticky [&>*:last-child]:xl:top-4">
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-[13px]">
              <thead className="border-b border-line text-left text-[12px] text-ink-3">
                <tr><th className="font-medium">Scenario</th><th className="font-medium">COD delay</th><th className="text-right font-medium">Incremental cost</th><th className="text-right font-medium">Contingency remaining</th><th className="font-medium">Rating</th><th className="font-medium">Approval route</th></tr>
              </thead>
              <tbody className="tnum divide-y divide-line-soft">
                <Row active={scenario === 'current'} onClick={() => setScenario('current', 'Cost')} cells={['Current plan', 'plus 42 days', 'n/a', 'Rp111 bn (63%)']} rating="Yellow, escalation" route="n/a" />
                {WHAT_IFS.map((w) => (
                  <Row
                    key={w.id}
                    active={scenario === w.scenario}
                    onClick={() => w.scenario && setScenario(w.scenario, 'Cost')}
                    cells={[w.name, w.delay, w.cost, w.remaining]}
                    rating={w.rating}
                    route={w.route}
                  />
                ))}
              </tbody>
            </table>
            <p className="border-t border-line-soft px-5 py-3 text-[12px] text-ink-3">Remaining contingency before scenario cost: Rp111 bn. Acceleration and freight rates from vendor quotes; FX at Rp16,500 per USD.</p>
          </Card>
          <ContingencyGauge remaining={remaining} rating={selected?.rating ?? 'Yellow, escalation'} />
        </div>
      </section>

      <div className="mt-8 grid items-start gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Cost variance by package" sub="Forecast overrun, Rp bn" />
          <CardBody><HBars rows={VARIANCE_BY_PACKAGE} total={110} /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Planned against actual monthly spend" sub="Rp bn per month" />
          <CardBody>
            <div className="h-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MONTHLY_CASHFLOW} margin={{ top: 4, right: 4, bottom: 0, left: -12 }} barGap={2}>
                  <CartesianGrid vertical={false} stroke="var(--color-line-soft)" />
                  <XAxis dataKey="month" tick={AXIS} axisLine={{ stroke: 'var(--color-line)' }} tickLine={false} interval={1} />
                  <YAxis tick={AXIS} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'var(--color-sunken)' }} contentStyle={{ borderRadius: 8, border: '1px solid var(--color-line)', fontSize: 12 }} />
                  <Bar dataKey="planned" name="Planned" fill="var(--color-series-reported)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="actual" name="Actual" fill="var(--color-series-verified)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex gap-4"><LegendItem color="var(--color-series-reported)" weight={6} label="Planned" /><LegendItem color="var(--color-series-verified)" weight={6} label="Actual" /></div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Contingency drawdown" sub="Cumulative use, Rp bn, against the alert line" />
          <CardBody>
            <div className="h-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={CONTINGENCY_PATH} margin={{ top: 16, right: 12, bottom: 0, left: -12 }}>
                  <CartesianGrid vertical={false} stroke="var(--color-line-soft)" />
                  <XAxis dataKey="date" tick={AXIS} axisLine={{ stroke: 'var(--color-line)' }} tickLine={false} />
                  <YAxis domain={[0, 180]} ticks={[0, 60, 120, 176]} tick={AXIS} axisLine={false} tickLine={false} />
                  <ReferenceLine y={ALERT_LINE_USED} stroke="var(--color-bad)" strokeDasharray="4 3" label={{ value: 'Alert: Rp17.6 bn left', position: 'insideTopLeft', fontSize: 11, fill: 'var(--color-bad)', fontWeight: 600 }} />
                  <ReferenceLine y={176} stroke="var(--color-ink)" label={{ value: 'Reserve Rp176 bn', position: 'insideTopRight', fontSize: 11, fill: 'var(--color-ink-2)' }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--color-line)', fontSize: 12 }} />
                  <Line dataKey="current" name="Current plan" stroke="var(--color-series-forecast)" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
                  <Line dataKey="none" name="No intervention" stroke="var(--color-series-nointervention)" strokeDasharray="6 4" strokeWidth={2} dot={{ r: 3 }} connectNulls isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex gap-4"><LegendItem color="var(--color-series-forecast)" weight={2.5} label="Current plan" /><LegendItem color="var(--color-series-nointervention)" dash="6 4" label="No intervention" /></div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Top five cost risks" sub="Rp bn" />
          <CardBody><HBars rows={COST_RISKS} tone="warn" /></CardBody>
        </Card>
      </div>

      {!isPcu && (
        <Card className="mt-5">
          <CardHeader title="Funding drawdown forecast" sub="Next quarter" />
          <CardBody className="grid gap-5 md:grid-cols-[220px_1fr]">
            <div><div className="text-[12px] text-ink-3">Requirement</div><div className="tnum text-[24px] font-semibold text-ink">Rp312 bn</div><div className="text-[12px] text-ink-3">Assumed input, from the cashflow forecast</div></div>
            <ul className="space-y-2 text-[13px]">
              {[['CP-1', 'Updated insurance certificates, to the Facility Agent'], ['CP-2', "Independent Engineer's progress certificate"]].map(([k, v]) => (
                <li key={k} className="flex items-center justify-between rounded-md bg-sunken px-3 py-2"><span><b className="font-semibold text-ink">{k}</b> {v}</span><StatusChip h="Yellow" label="Open" /></li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      <AtlasCard className="mt-5" title="Contingency and funding" sources={[{ label: 'Cost report June 2027', doc: 'cost-report' }, { label: 'Scenario run R8' }]} classification="Advisory" confidence="Medium">
        <p>{isPcu ? COST_INSIGHT.replace("but the Rp45 billion of foreign-exchange and owner's cost needs shareholder funding approval", "but Rp45 billion of foreign-exchange and owner's cost sits outside eligible contingency") : COST_INSIGHT}</p>
      </AtlasCard>
    </ScreenFrame>
  )
}

type GroupItem = [LucideIcon, string, string, string?, ('bad' | 'warn')?]

/** A labelled row of KPI stat tiles. */
function Group({ title, items }: { title: string; items: GroupItem[] }) {
  return (
    <section>
      <h3 className="mb-2.5 text-[13px] font-medium text-ink-3">{title}</h3>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(([I, l, v, n, tone]) => <StatTile key={l} icon={I} label={l} value={v} cap={n} tone={tone} />)}
      </div>
    </section>
  )
}

function Waterfall({ pcu }: { pcu: boolean }) {
  const lo = 2700, hi = 2950
  const x = (v: number) => ((v - lo) / (hi - lo)) * 100
  const steps = [
    { l: 'Approved CAPEX', from: lo, to: 2800, c: 'bg-ink-2', v: 'Rp2,800 bn' },
    { l: 'Funded from contingency', from: 2800, to: 2865, c: 'bg-warn', v: '+Rp65 bn' },
    { l: pcu ? 'Outside eligible contingency' : 'Shareholder funding (FX Rp30 bn, owner’s cost Rp15 bn)', from: 2865, to: 2910, c: 'bg-bad', v: '+Rp45 bn' },
    { l: 'Management EAC', from: lo, to: 2910, c: 'bg-series-verified', v: 'Rp2,910 bn' },
  ]
  return (
    <div className="space-y-3">
      {steps.map((s) => (
        <div key={s.l}>
          <div className="flex justify-between text-[13px]"><span className="text-ink-2">{s.l}</span><span className="tnum font-semibold text-ink">{s.v}</span></div>
          <div className="relative mt-1 h-5 rounded-sm bg-sunken">
            <div className={cn('absolute inset-y-0 rounded-sm', s.c)} style={{ left: `${x(s.from)}%`, width: `${x(s.to) - x(s.from)}%` }} />
            <div className="absolute inset-y-[-3px] w-px bg-ink" style={{ left: `${x(2800)}%` }} />
          </div>
        </div>
      ))}
      <div className="tnum flex justify-between text-[12px] text-ink-4"><span>2,700</span><span>2,800</span><span>2,950</span></div>
    </div>
  )
}

function HBars({ rows, total, tone }: { rows: { name: string; v: number }[]; total?: number; tone?: 'warn' }) {
  const max = Math.max(...rows.map((r) => r.v))
  const sum = rows.reduce((s, r) => s + r.v, 0)
  return (
    <div>
      <ul className="space-y-2">
        {rows.map((r, i) => (
          <li key={r.name} className="grid grid-cols-[minmax(0,190px)_1fr_44px] items-center gap-3 text-[13px]">
            <span className="truncate text-ink-2" title={r.name}>{r.name}</span>
            <span className="h-3.5 rounded-sm bg-sunken"><span className={cn('block h-full rounded-sm', tone === 'warn' ? 'bg-warn/80' : i < 2 ? 'bg-series-verified' : 'bg-atlas-300')} style={{ width: `${(r.v / max) * 100}%` }} /></span>
            <span className="tnum text-right font-medium text-ink">{r.v}</span>
          </li>
        ))}
      </ul>
      {total && <div className="tnum mt-3 flex justify-between border-t border-line-soft pt-2 text-[13px] font-semibold text-ink"><span>Total</span><span>Rp{sum} bn {sum === total && <CheckCircle2 className="inline size-3.5 text-ok" />}</span></div>}
    </div>
  )
}

function Row({ cells, rating, route, active, onClick }: { cells: string[]; rating: string; route: string; active: boolean; onClick: () => void }) {
  const h = rating.startsWith('Red') ? 'Red' : 'Yellow'
  return (
    <tr className={cn('cursor-pointer transition-colors hover:bg-atlas-50/60', active && 'bg-atlas-50')} onClick={onClick}>
      <td>
        <button className="press flex items-center gap-2 text-left font-medium text-ink" aria-pressed={active}>
          <span className={cn('grid size-4 place-items-center rounded-full border', active ? 'border-atlas-600' : 'border-ink-4')}>{active && <span className="size-2 rounded-full bg-atlas-600" />}</span>
          {cells[0]}
        </button>
      </td>
      <td className="whitespace-nowrap">{cells[1]}</td>
      <td className="whitespace-nowrap text-right">{cells[2]}</td>
      <td className={cn('whitespace-nowrap text-right', cells[3].startsWith('Rp19') && 'font-semibold text-bad')}>{cells[3]}</td>
      <td><StatusChip h={h} label={rating} /></td>
      <td>{route === 'Joint' || route === 'Project company' || route === 'Shareholder (Denera)' ? <AuthorityLabel a={route} /> : <span className="text-[13px] text-ink-3">{route}</span>}</td>
    </tr>
  )
}

function ContingencyGauge({ remaining, rating }: { remaining: number | null; rating: string }) {
  const pct = remaining === null ? null : (remaining / 176) * 100
  const near = remaining !== null && remaining < 20
  return (
    <Card className="px-[18px] py-4">
      <h3 className="text-[14px] font-semibold text-ink">Contingency after scenario</h3>
      <div className="tnum mt-3 text-[28px] font-semibold leading-none text-ink">{remaining === null ? 'To be confirmed' : `Rp${remaining} bn`}</div>
      <div className="mt-1 text-[13px] text-ink-3">{pct === null ? 'Range crosses the 60-day line' : `${Math.round(pct)}% of the Rp176 bn reserve`}</div>
      <div className="relative mt-4 h-3 rounded-full bg-sunken">
        {pct !== null && <div className={cn('h-full rounded-full transition-[width] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]', near ? 'bg-bad' : 'bg-series-verified')} style={{ width: `${pct}%` }} />}
        <div className="absolute -top-1 h-5 w-0.5 bg-bad" style={{ left: '10%' }} />
      </div>
      <div className="mt-1.5 text-[12px] text-bad">Alert threshold Rp17.6 bn (10%)</div>
      <div className="mt-4 flex items-center gap-2 text-[13px] text-ink-2">Overall rating <StatusChip h={rating.startsWith('Red') ? 'Red' : 'Yellow'} label={rating} /></div>
      {near && <p className="mt-3 flex gap-1.5 text-[13px] text-bad"><TriangleAlert className="mt-0.5 size-3.5 shrink-0" />Within Rp1.4 bn of the alert threshold. Any further cost risk would breach it.</p>}
    </Card>
  )
}

function Calculator({ days, setDays, pcu }: { days: number; setDays: (n: number) => void; pcu: boolean }) {
  const [mw, setMw] = useState(33.5)
  const [avail, setAvail] = useState(85)
  const [tariff, setTariff] = useState(0.2)
  const [fx, setFx] = useState(16500)
  const perDay = useMemo(() => revenuePerDay(mw, avail / 100, tariff), [mw, avail, tariff])
  const res = (d: number) => {
    const usd = perDay * d
    const rp = (usd * fx) / 1e9
    return { usd: (usd / 1e6).toFixed(1), rp: Math.round(rp), share: Math.round(rp * 0.3) }
  }
  const field = (label: string, value: number, set: (n: number) => void, step: number, unit: string) => (
    <label className="block">
      <span className="text-[12px] font-medium text-ink-3">{label}</span>
      <span className="mt-1 flex items-center rounded-md border border-line bg-sunken focus-within:border-atlas-500 focus-within:ring-2 focus-within:ring-atlas-100">
        <input type="number" step={step} value={value} onChange={(e) => set(Number(e.target.value) || 0)} className="tnum min-w-0 flex-1 bg-transparent px-3 py-2 text-[14px] font-medium text-ink outline-none" />
        <span className="pr-3 text-[12px] text-ink-3">{unit}</span>
      </span>
    </label>
  )
  return (
    <Card className="mt-5">
      <CardHeader title="Delay-linked revenue calculator" sub="Revenue deferred, not necessarily lost. Depends on PPA delay terms and EPC liquidated damages." />
      <CardBody className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {field('Net capacity', mw, setMw, 0.5, 'MW')}
            {field('Availability', avail, setAvail, 1, '%')}
            {field('Tariff (fixed 30 years)', tariff, setTariff, 0.01, 'USD/kWh')}
            {field('Exchange rate', fx, setFx, 100, 'Rp/USD')}
            {field('Days of delay', days, setDays, 1, 'days')}
          </div>
          <p className="mt-3 rounded-md bg-sunken px-3 py-2 font-mono text-[12px] text-ink-2">capacity × 8,760 × availability × 1,000 × tariff ÷ 365 = USD {Math.round(perDay).toLocaleString('en-US')} per day</p>
        </div>
        <table className="tnum w-full self-start text-[13px]">
          <thead className="text-left text-[12px] text-ink-3"><tr><th className="font-medium">Delay</th><th className="text-right font-medium">Revenue deferred</th>{!pcu && <th className="text-right font-medium">Denera 30% share</th>}</tr></thead>
          <tbody className="divide-y divide-line-soft">
            {[days, 42, 64].filter((v, i, a) => a.indexOf(v) === i).map((d) => {
              const r = res(d)
              return (
                <tr key={d} className={cn(d === days && 'font-semibold')}>
                  <td>{d} days{d === days && <span className="ml-1.5 rounded-full border border-atlas-200 bg-atlas-50 px-2 py-0.5 text-[12px] font-medium text-atlas-700">input</span>}</td>
                  <td className="text-right text-ink">USD {r.usd} m <span className="text-ink-3">(Rp{r.rp} bn)</span></td>
                  {!pcu && <td className="text-right text-ink">Rp{r.share} bn</td>}
                </tr>
              )
            })}
          </tbody>
        </table>
      </CardBody>
    </Card>
  )
}
