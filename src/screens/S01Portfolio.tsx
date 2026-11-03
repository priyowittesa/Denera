import { ArrowRight, CalendarClock, Flag, HardHat, HeartPulse, Info, KeyRound, ListChecks, Package, PiggyBank, Scale, Wallet } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HEALTH_ICON, StatusChip } from '../components/atlas/chips'
import { AtlasCard, ScreenFrame, StatTile } from '../components/atlas/frame'
import { HealthRulePop } from '../components/atlas/HealthRule'
import { Card } from '../components/ui/card'
import { Pop } from '../components/ui/popover'
import { Segmented } from '../components/ui/tabs'
import { CONSTRUCTION, CONTROL_MODEL, PORTFOLIO_KPIS as K, PRE_INVESTMENT, WEEKLY_BRIEF } from '../data/portfolio'
import { INDONESIA_PATH, MAP_H, MAP_W, NEIGHBOUR_PATHS, project } from '../data/indonesiaMap'
import { cn } from '../lib/cn'

type Lane = 'construction' | 'pre'

export function S01Portfolio() {
  const [lane, setLane] = useState<Lane>('construction')
  const nav = useNavigate()

  return (
    <ScreenFrame
      project="Denera portfolio, 11 projects"
      headline="Cakrawala Raya needs escalation this week: three decisions are due and a formal notice deadline falls in six days."
      answer={{ label: 'Needs escalation', value: '1 of 3', tone: 'warn', foot: 'PSEL Cakrawala Raya, 42 days of COD exposure. Nusa Bahari is Yellow, Sinar Lestari Green.', stake: ['UC01'] }}
      status="Yellow"
      statusLabel="Escalation required on one project"
      aside={
        <Pop
          align="end"
          className="w-[380px]"
          trigger={<button className="press inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] font-medium text-ink-2 hover:bg-sunken"><Info className="size-4" />How Denera controls delivery</button>}
        >
          <p className="font-semibold text-ink">Control by contract, not ownership</p>
          <p className="mt-1.5 leading-relaxed">{CONTROL_MODEL}</p>
          <p className="mt-2 leading-relaxed">Three projects are in construction. Eight pre-investment projects move through feasibility, permits, shareholder agreement, FLOA and FID.</p>
        </Pop>
      }
    >
      {/* Stat row, as in the ATLAS module: icon tile, label, value, caption. 4 across, 2 on tablets, 1 on phones. */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={Wallet} label="Approved CAPEX in construction" value="Rp7,250 bn" cap="3 plants in construction" />
        <StatTile icon={CalendarClock} label="Largest COD exposure" value={`${K.largestExposure} days`} cap="PSEL Cakrawala Raya" tone="bad" />
        <StatTile icon={HeartPulse} label="Projects by health" value={<span className="flex flex-wrap gap-x-2.5"><span className="text-ok">1 Green</span><span className="text-warn">2 Yellow</span><span className="text-ink-3">0 Red</span></span>} cap="Construction lane" />
        <StatTile icon={PiggyBank} label="Contingency forecast use" value={<>37% · 18% · <span className="text-ink-4">n/a</span></>} cap="Cakrawala · Nusa Bahari · Sinar Lestari" />
        <StatTile icon={Package} label="Long-lead packages above 14 days" value={String(K.longLeadAbove14)} cap="Boiler island, flue-gas treatment" tone="warn" />
        <StatTile icon={Scale} label="Decisions due this week" value={String(K.decisionsThisWeek)} cap="Two for the project company board" />
        <StatTile icon={KeyRound} label="Information-rights coverage" value="9 of 12" cap="75% of required feeds agreed" />
        <StatTile icon={ListChecks} label="Pre-investment gates at risk" value={String(K.gatesAtRisk)} cap="P2-06, P2-07 permits" tone="warn" />
      </div>

      <div className="mt-[18px] grid grid-cols-1 gap-[18px] xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card className="flex flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-[18px] pt-4">
            <h2 className="text-[16px] font-semibold text-ink">Where the programme stands</h2>
            <Segmented<Lane> label="Lane" value={lane} onChange={setLane} items={[{ value: 'construction', label: 'In construction (3)' }, { value: 'pre', label: 'Pre-investment gates (8)' }]} />
          </div>
          <div className="flex flex-1 flex-col justify-center"><IndonesiaMap lane={lane} onOpen={(to) => nav(to)} /></div>
        </Card>

        <AtlasCard className="h-full" title="ATLAS weekly brief" sources={[{ label: 'Health computation run R5', doc: 'epc-schedule' }, { label: 'Notice register', doc: 'epc-14-2' }, { label: 'Permit register', doc: 'permit-register' }]} classification="Advisory" confidence="High">
          <ul className="space-y-1">
            {WEEKLY_BRIEF.map((b) => (
              <li key={b.text}>
                <button onClick={() => nav(b.to)} className="press group flex w-full items-start justify-between gap-3 rounded-md px-2 py-2.5 text-left text-ink hover:bg-sunken">
                  <span>{b.text}</span>
                  <ArrowRight className="mt-0.5 size-4 shrink-0 text-atlas-700 opacity-60 group-hover:opacity-100" />
                </button>
              </li>
            ))}
          </ul>
        </AtlasCard>
      </div>

      <section className="mt-[18px]">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[16px] font-semibold text-ink">{lane === 'construction' ? 'Projects in construction' : 'Pre-investment projects'}</h2>
          <p className="text-[12px] text-ink-3">Coverage: 11 projects shown. Health is computed only where a status feed exists.</p>
        </div>
        {lane === 'construction' ? (
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
            {CONSTRUCTION.map((p, i) => <ConstructionCard key={p.id} p={p} i={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-8">
            {PRE_INVESTMENT.map((p, i) => (
              <button key={p.id} onClick={() => nav(`/gates?project=${p.id}`)} style={{ animationDelay: `${i * 30}ms` }} className={cn('press flex animate-rise flex-col rounded-xl border bg-surface p-4 text-left hover:border-atlas-300', p.atRisk ? 'border-warn-line' : 'border-line')}>
                <div className="flex h-6 items-center justify-between gap-2">
                  <span className="text-[14px] font-semibold text-ink">{p.id}</span>
                  {p.atRisk ? <StatusChip h="Yellow" label="At risk" /> : p.floa ? <span className="whitespace-nowrap rounded-full border border-ok-line bg-ok-bg px-2 py-0.5 text-[12px] font-medium text-ok">FLOA held</span> : null}
                </div>
                <div className="text-[12px] text-ink-3">{p.island}</div>
                <div className="mt-3 text-[12px] text-ink-3">Next gate</div>
                <div className="text-[13px] font-medium leading-snug text-ink">{p.nextGate}</div>
                <div className="tnum text-[13px] text-ink-2">{p.date}</div>
                <div className={cn('mt-auto whitespace-nowrap pt-3 text-[12px]', p.atRisk ? 'font-medium text-warn' : 'text-ink-3')}>{p.open} open condition{p.open > 1 ? 's' : ''}</div>
              </button>
            ))}
          </div>
        )}
      </section>
    </ScreenFrame>
  )
}


function ConstructionCard({ p, i }: { p: (typeof CONSTRUCTION)[number]; i: number }) {
  const nav = useNavigate()
  return (
    <article style={{ animationDelay: `${i * 40}ms` }} className={cn('flex animate-rise flex-col rounded-xl border bg-surface', p.escalation ? 'border-atlas-300 ring-1 ring-atlas-200' : 'border-line')}>
      <button onClick={() => nav(p.id === 'cakrawala' ? '/cockpit' : `/partner-data?project=${p.id}`)} className="press rounded-t-xl p-4 pb-3 text-left hover:bg-atlas-50/50" aria-label={`${p.name}, ${p.id === 'cakrawala' ? 'open cockpit' : 'open data feeds'}`}>
        <div className="flex items-center gap-1.5 text-[12px] text-ink-3"><HardHat className="size-3.5" />{p.island} · EPC execution</div>
        <div className="mt-1 text-[16px] font-semibold leading-snug text-ink">{p.name}</div>
      </button>
      <div className="px-4">
        <HealthRulePop signals={p.signals} trigger={<button className="press max-w-full text-left" aria-label={`Why ${p.healthLabel}`}><StatusChip h={p.health} label={p.healthLabel} className="whitespace-normal" /></button>} />
        {p.confidence && <div className="mt-1 text-[12px] text-ink-3">Data confidence {p.confidence}%</div>}
      </div>
      <dl className="tnum mt-3 grid grid-cols-2 gap-2 px-4 text-[13px]">
        <div><dt className="text-ink-3">CAPEX</dt><dd className="whitespace-nowrap font-medium text-ink">Rp{p.capex.toLocaleString('en-US')} bn</dd></div>
        <div><dt className="text-ink-3">COD target</dt><dd className="whitespace-nowrap font-medium text-ink">{p.cod}</dd></div>
        <div><dt className="text-ink-3">Contingency</dt><dd className="whitespace-nowrap font-medium text-ink">Rp{p.contingencyBn} bn <span className="font-normal text-ink-3">{p.forecastUseBn === null ? '· use n/a' : `· ${p.contingencyUse} used`}</span></dd></div>
        <div><dt className="text-ink-3">Net capacity</dt><dd className="whitespace-nowrap font-medium text-ink">{p.netMw.toFixed(1)} MW</dd></div>
      </dl>
      <div className="mt-auto space-y-1 border-t border-line-soft p-3 pt-2.5">
        <button onClick={() => nav('/partner-data')} className="press flex w-full items-center gap-1.5 rounded px-1 py-1 text-[13px] text-ink-2 hover:bg-sunken"><KeyRound className="size-3.5 shrink-0 text-ink-3" /><span className="whitespace-nowrap">Information rights <b className="tnum font-semibold text-ink">{p.rights}</b></span></button>
        <button onClick={() => p.alertTo && nav(p.alertTo)} disabled={!p.alertTo} className="press flex w-full items-start gap-1.5 rounded px-1 py-1 text-left text-[13px] text-ink enabled:hover:bg-sunken">
          <Flag className={cn('mt-0.5 size-3.5 shrink-0', p.health === 'Green' ? 'text-ink-3' : 'text-bad')} />{p.alert}
        </button>
      </div>
    </article>
  )
}

/** Island-group names, placed in open water or on large land areas. */
const ISLAND_LABELS: [string, number, number][] = [['Sumatra', 101.2, -0.2], ['Java', 112.6, -8.7], ['Kalimantan', 114, 0.9], ['Sulawesi', 121.3, -2.6], ['Maluku', 128.6, -3.9], ['Papua', 138.5, -4.3], ['Nusa Tenggara', 121.2, -10.3]]

/** Pre-investment labels that would collide with a neighbour get a different side. */
const PRE_LABEL_POS: Record<string, 'below' | 'above' | 'left' | 'right'> = { 'P2-05': 'left', 'P2-03': 'right' }
const PRE_LABEL = {
  below: { y: 24, textAnchor: 'middle' as const },
  above: { y: -15, textAnchor: 'middle' as const },
  left: { x: -14, y: 4, textAnchor: 'end' as const },
  right: { x: 14, y: 4, textAnchor: 'start' as const },
}

/** Map of Indonesia from Natural Earth coastlines; project locations are representative cities. */
function IndonesiaMap({ lane, onOpen }: { lane: Lane; onOpen: (to: string) => void }) {
  const [hover, setHover] = useState<string | null>(null)
  // Cakrawala has the full cockpit; the other plants open on their data feeds and information rights.
  const target = (id: string) => (id === 'cakrawala' ? '/cockpit' : `/partner-data?project=${id}`)
  const markerProps = (id: string, to: string) => ({
    className: 'cursor-pointer outline-none',
    tabIndex: 0,
    role: 'button',
    onMouseEnter: () => setHover(id),
    onMouseLeave: () => setHover(null),
    onFocus: () => setHover(id),
    onBlur: () => setHover(null),
    onClick: () => onOpen(to),
    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(to) } },
  })
  const tip = (() => {
    if (!hover) return null
    const c = lane === 'construction' ? CONSTRUCTION.find((x) => x.id === hover) : undefined
    const p = lane === 'pre' ? PRE_INVESTMENT.find((x) => x.id === hover) : undefined
    const g = c?.geo ?? p?.geo
    if (!g) return null
    const [x, y] = project(g.lon, g.lat)
    return { c, p, left: (x / MAP_W) * 100, top: (y / MAP_H) * 100, flipX: x > MAP_W * 0.6, above: y > MAP_H * 0.5 }
  })()
  return (
    <div className="px-3 pb-3">
      <div className="relative">
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="h-auto w-full" role="img" aria-label="Map of Indonesia with project markers">
        <defs>
          <pattern id="sea" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" fill="#e6e2ef" /></pattern>
        </defs>
        <rect width={MAP_W} height={MAP_H} rx="10" fill="url(#sea)" />
        <g fill="#f3f1f7" stroke="#e2ddeb" strokeWidth="0.6" strokeLinejoin="round">
          {NEIGHBOUR_PATHS.map((d, i) => <path key={i} d={d} />)}
        </g>
        <path d={INDONESIA_PATH} fill="#e6e0f2" stroke="#c9bfe0" strokeWidth="0.7" strokeLinejoin="round" />
        <g aria-hidden fontSize="11" fill="var(--color-ink-4)" letterSpacing="0.02em" className="pointer-events-none select-none">
          {ISLAND_LABELS.map(([name, lon, lat]) => { const [x, y] = project(lon, lat); return <text key={name} x={x} y={y} textAnchor="middle">{name}</text> })}
        </g>
        {lane === 'construction'
          ? CONSTRUCTION.map((p) => {
              const Icon = HEALTH_ICON[p.health]
              const c = p.health === 'Green' ? 'var(--color-ok)' : p.health === 'Yellow' ? 'var(--color-warn)' : 'var(--color-bad)'
              return (
                <g key={p.id} transform={`translate(${project(p.geo.lon, p.geo.lat).join(',')})`} {...markerProps(p.id, target(p.id))} aria-label={`${p.name}, ${p.healthLabel}${p.id === 'cakrawala' ? ', open cockpit' : ', open data feeds'}`}>
                  {p.escalation && <circle r="17" fill="none" stroke={c} strokeWidth="1.5" strokeDasharray="3 3" />}
                  <circle r="11" fill="white" stroke={c} strokeWidth="2.5" />
                  <foreignObject x="-7" y="-7" width="14" height="14"><Icon className="size-3.5" style={{ color: c }} strokeWidth={2.6} /></foreignObject>
                  <text y="30" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--color-ink)" stroke="white" strokeWidth="3" paintOrder="stroke">{p.name.replace('PSEL ', '')}</text>
                  <text y="44" textAnchor="middle" fontSize="11" fill="var(--color-ink-3)" stroke="white" strokeWidth="3" paintOrder="stroke">{p.healthLabel}</text>
                </g>
              )
            })
          : PRE_INVESTMENT.map((p) => (
              <g key={p.id} transform={`translate(${project(p.geo.lon, p.geo.lat).join(',')})`} {...markerProps(p.id, `/gates?project=${p.id}`)} aria-label={`${p.id}, next gate ${p.nextGate}, open gate checklist`}>
                <rect x="-9" y="-9" width="18" height="18" rx="4" fill="white" stroke={p.atRisk ? 'var(--color-warn)' : p.floa ? 'var(--color-ok)' : 'var(--color-atlas-500)'} strokeWidth="2" />
                <text y="4" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--color-ink)">{p.id.slice(-1)}</text>
                <text {...PRE_LABEL[PRE_LABEL_POS[p.id] ?? 'below']} fontSize="11" fontWeight="600" fill="var(--color-ink-2)" stroke="white" strokeWidth="3" paintOrder="stroke">{p.id}</text>
              </g>
            ))}
      </svg>
      {tip && (
        <div
          role="status"
          style={{ left: `${tip.left}%`, top: `${tip.top}%` }}
          className={cn(
            'float pointer-events-none absolute z-10 w-max max-w-[260px] animate-fade rounded-md bg-atlas-950 px-3 py-2 text-[13px] leading-snug text-white',
            tip.flipX ? '-translate-x-[calc(100%+18px)]' : 'translate-x-[18px]',
            tip.above ? '-translate-y-[calc(100%-6px)]' : '-translate-y-[6px]',
          )}
        >
          {tip.c ? (
            <>
              <b>{tip.c.name}</b>
              <div className="text-atlas-200">{tip.c.healthLabel}. {tip.c.alert}. Information rights {tip.c.rights}.</div>
              <div className="mt-1 text-[12px] text-atlas-300">{tip.c.id === 'cakrawala' ? 'Click to open the cockpit.' : 'Click to see its data feeds and information rights.'}</div>
            </>
          ) : tip.p ? (
            <>
              <b>{tip.p.id} · {tip.p.island}</b>
              <div className="text-atlas-200">Next gate {tip.p.nextGate}, {tip.p.date}{tip.p.atRisk ? ', at risk' : ''}</div>
              <div className="mt-1 text-[12px] text-atlas-300">Click to open the gate checklist.</div>
            </>
          ) : null}
        </div>
      )}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 px-2 text-[12px] text-ink-3">
        {lane === 'construction' ? (
          <><span>Circle: project in construction, icon and word show health</span><span>Dashed ring: escalation required</span></>
        ) : (
          <><span className="text-ok">Green outline: FLOA held</span><span className="text-warn">Amber outline: gate at risk</span><span>Violet outline: early gate</span></>
        )}
      </div>
    </div>
  )
}
