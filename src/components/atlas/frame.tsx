import { ArrowRight, Clock, FileText, Gauge, Lightbulb, Scale, Search, Siren, Sparkles, Truck, Wallet, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { screenByPath } from '../../data/screens'
import type { Health } from '../../data/types'
import { useUi } from '../../state/ui'
import { usePersona } from '../../state/store'
import { projectValue, valueRowsFor } from './ValuePanel'
import { HEALTH_STATEMENT } from './HealthRule'
import { Tip } from '../ui/tooltip'
import { ClassChip, DataNeeded, StatusChip, SyncPill } from './chips'

export type Answer = { label: ReactNode; value: ReactNode; foot?: ReactNode; tone?: 'bad' | 'warn' | 'ok' | 'ink'; action?: { label: string; onClick: () => void }; stake?: string[] }

/** Context line, verdict headline and the one figure that answers the screen's question. */
export function ScreenFrame({
  headline,
  status,
  statusLabel,
  sub,
  project = 'PSEL Cakrawala Raya',
  aside,
  answer,
  children,
  confidence = true,
}: {
  headline: ReactNode
  status?: Health
  statusLabel?: ReactNode
  sub?: ReactNode
  project?: string
  aside?: ReactNode
  answer?: Answer
  children: ReactNode
  confidence?: boolean
}) {
  const { pathname } = useLocation()
  const meta = screenByPath(pathname)
  return (
    <div className="w-full px-4 pb-28 pt-[18px] md:px-7 md:pt-[26px]">
      {/* Page header (ATLAS module .ph): title and muted description left, sync pill and actions right; stacks below 860px */}
      <div className="flex flex-col gap-3.5 min-[860px]:flex-row min-[860px]:items-start min-[860px]:justify-between min-[860px]:gap-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[20px] font-semibold leading-7 tracking-[-0.01em] text-ink">{meta?.title ?? 'ATLAS'}</h1>
            <span className="inline-flex items-center whitespace-nowrap rounded-md border border-atlas-200 bg-atlas-50 px-[7px] py-0.5 text-[12px] font-semibold text-atlas-700">{project}</span>
            {status && <StatusChip h={status} label={statusLabel} />}
          </div>
          <p className="mt-1 max-w-[720px] text-[14px] leading-[1.45] text-ink-3">{headline}{sub && <> {sub}</>}</p>
        </div>
        {meta && (
          <div className="flex flex-wrap items-center gap-2.5 min-[860px]:max-w-[60%] min-[860px]:justify-end">
            <SyncPill withConfidence={confidence} />
            <DataNeeded sources={meta.dataNeeded.sources} owner={meta.dataNeeded.owner} note={meta.path === '/portfolio' || meta.path === '/cockpit' ? HEALTH_STATEMENT : undefined} />
            {aside}
          </div>
        )}
      </div>
      {answer && <div className="mt-[18px]"><AnswerFigure {...answer} /></div>}
      <div className="mt-6 sm:mt-7">{children}</div>
    </div>
  )
}

/** Full-width summary tile with a 4px tone edge (ATLAS module .qs tile). Figure left, value at stake right. */
function AnswerFigure({ label, value, foot, tone = 'ink', action, stake }: Answer) {
  const { isPcu } = usePersona()
  const rows = stake ? valueRowsFor(stake, isPcu) : []
  const edge = tone === 'bad' ? 'border-l-bad' : tone === 'warn' ? 'border-l-warn' : tone === 'ok' ? 'border-l-ok' : 'border-l-atlas-600'
  return (
    <div className={cn('animate-rise grid grid-cols-1 gap-4 rounded-xl border border-l-4 border-line bg-surface px-[18px] py-4', edge, rows.length > 0 && 'md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center md:gap-8')}>
      <div className="flex min-w-0 gap-3.5">
        <span className={cn('grid size-[38px] shrink-0 place-items-center rounded-[9px]', tone === 'bad' ? 'bg-bad-bg text-bad' : tone === 'warn' ? 'bg-warn-bg text-warn' : tone === 'ok' ? 'bg-ok-bg text-ok' : 'bg-atlas-100 text-atlas-700')}><Gauge className="size-[19px]" /></span>
        <div className="min-w-0">
          <div className="text-[13px] text-ink-3">{label}</div>
          <div className={cn('tnum mt-0.5 text-[28px] font-bold leading-[1.1] tracking-[-0.02em]', tone === 'bad' ? 'text-bad' : tone === 'warn' ? 'text-warn' : tone === 'ok' ? 'text-ok' : 'text-ink')}>{value}</div>
          {foot && <div className="mt-1.5 text-[13px] leading-snug text-ink-2">{foot}</div>}
          {action && (
            <button onClick={action.onClick} className="press mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-atlas-700 hover:underline">{action.label}<ArrowRight className="size-3.5" /></button>
          )}
        </div>
      </div>
      {rows.length > 0 && (
        <dl className="grid gap-x-6 gap-y-2 rounded-lg bg-sunken px-3.5 py-2.5 text-[13px] leading-snug sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
          {rows.map((r) => <div key={r.uc}><dt className="text-ink-3">{r.metric}</dt><dd className="tnum font-semibold text-ink">{projectValue(r, isPcu)}</dd>{r.caption && <p className="mt-0.5 text-[12px] text-ink-3">{r.caption}</p>}</div>)}
        </dl>
      )}
    </div>
  )
}

export function Provenance({ sources, classification, confidence, className, plain }: { sources: { label: string; doc?: string }[]; classification?: string; confidence?: string; className?: string; plain?: boolean }) {
  const open = useUi((s) => s.openEvidence)
  const first = sources.find((s) => s.doc)
  return (
    <div className={cn('flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[12px] text-ink-3', !plain && 'border-t border-line-soft pt-3', className)}>
      <button
        className="press inline-flex items-center gap-1 font-medium text-atlas-700 hover:underline disabled:text-ink-3 disabled:no-underline"
        disabled={!first}
        onClick={() => first?.doc && open(first.doc)}
      >
        <FileText className="size-3.5" />
        {sources.length} source{sources.length > 1 ? 's' : ''}
      </button>
      <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />30 Jun 2027 08:30</span>
      {confidence && <span>Confidence <span className="font-medium text-ink-2">{confidence}</span></span>}
      {classification && <ClassChip c={classification} />}
    </div>
  )
}

type InsightKind = 'insight' | 'alert' | 'explanation' | 'summary'
const KIND: Record<InsightKind, { label: string; bar: string; badge: string; Icon: typeof Sparkles }> = {
  insight: { label: 'Insight', bar: 'bg-atlas-500', badge: 'border-atlas-200 bg-atlas-50 text-atlas-700', Icon: Lightbulb },
  summary: { label: 'Summary', bar: 'bg-atlas-500', badge: 'border-atlas-200 bg-atlas-50 text-atlas-700', Icon: Sparkles },
  alert: { label: 'Alert', bar: 'bg-bad', badge: 'border-bad-line bg-bad-bg text-[#b91c1c]', Icon: Siren },
  explanation: { label: 'Root cause', bar: 'bg-info', badge: 'border-info-line bg-info-bg text-[#1d4ed8]', Icon: Search },
}
const kindOf = (t: ReactNode): InsightKind => {
  const x = typeof t === 'string' ? t.toLowerCase() : ''
  return x.includes('alert') ? 'alert' : x.includes('explanation') ? 'explanation' : x.includes('summary') || x.includes('brief') ? 'summary' : 'insight'
}

/** ATLAS insight card (ATLAS module .ins): 3px type bar, uppercase type badge, title, body, source meta. */
export function AtlasCard({ title = 'ATLAS insight', children, sources, classification = 'Advisory', confidence = 'Medium', className, tone = 'plain', kind }: {
  title?: ReactNode
  children: ReactNode
  sources: { label: string; doc?: string }[]
  classification?: string
  confidence?: string
  className?: string
  tone?: 'plain' | 'violet'
  kind?: InsightKind
}) {
  const k = KIND[kind ?? kindOf(title)]
  const heading = typeof title === 'string' ? title.replace(/^ATLAS /, '').replace(/^[a-z]/, (c) => c.toUpperCase()) : title
  const card = (
    <section className={cn('relative flex flex-col gap-2.5 overflow-hidden bg-surface px-[18px] pb-4 pt-[18px]', tone === 'violet' ? 'h-full rounded-[12.5px]' : 'rounded-xl border border-line', tone === 'plain' && className)}>
      {tone === 'plain' && <span className={cn('absolute inset-x-0 top-0 h-[3px]', k.bar)} />}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-[3px] text-[11px] font-bold uppercase tracking-[0.06em]', k.badge)}><k.Icon className="size-3" />{k.label}</span>
        <ClassChip c={classification} />
        <span className="tnum ml-auto text-[12px] text-ink-3">30 Jun 08:30</span>
      </div>
      <h3 className="text-[16px] font-semibold leading-[1.35] text-ink">{heading}</h3>
      <div className="text-[14px] leading-[1.55] text-ink-2">{children}</div>
      <Provenance plain className="mt-auto pt-1" sources={sources} confidence={confidence} />
    </section>
  )
  if (tone !== 'violet') return card
  // Highlighted recommendation (.ai-card): 1.5px violet gradient frame
  return <div className={cn('rounded-[14px] bg-gradient-to-r from-atlas-400 via-atlas-600 to-[#c084fc] p-[1.5px]', className)}>{card}</div>
}

export function Metric({ label, value, note, tone, tip, className }: { label: ReactNode; value: ReactNode; note?: ReactNode; tone?: 'bad' | 'warn' | 'ok'; tip?: ReactNode; className?: string }) {
  return (
    <div className={cn('min-w-0', className)}>
      <div className="flex items-center gap-1 text-[13px] font-medium text-ink-3">{label}{tip}</div>
      <div className={cn('tnum mt-0.5 text-[24px] font-bold leading-7 tracking-[-0.02em] text-ink', tone === 'bad' && 'text-bad', tone === 'warn' && 'text-warn', tone === 'ok' && 'text-ok')}>{value}</div>
      {note && <div className="mt-0.5 text-[13px] leading-snug text-ink-3">{note}</div>}
    </div>
  )
}

export function MetricGroup({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-xl border border-line bg-surface px-[18px] py-4', className)}>
      <h3 className="text-[13px] font-medium text-ink-3">{title}</h3>
      <div className="mt-3 grid gap-x-6 gap-y-4 [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">{children}</div>
    </section>
  )
}

export function ImpactStrip({ delivery, capex, commercial }: { delivery: [string, string]; capex: [string, string]; commercial: [string, string] }) {
  return (
    <div className="grid gap-3.5 sm:grid-cols-3">
      <StatTile icon={Truck} label="Delivery impact" value={delivery[0]} cap={delivery[1]} />
      <StatTile icon={Wallet} label="CAPEX impact" value={capex[0]} cap={capex[1]} />
      <StatTile icon={Scale} label="Commercial impact" value={commercial[0]} cap={commercial[1]} />
    </div>
  )
}

export function EvidenceStrip({ items }: { items: { title: string; doc: string; meta?: string }[] }) {
  const open = useUi((s) => s.openEvidence)
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {items.map((e) => (
        <button key={e.title} onClick={() => open(e.doc)} className="press group rounded-xl border border-line bg-surface p-4 text-left hover:border-atlas-300 hover:bg-atlas-50/40">
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-atlas-700"><FileText className="size-3.5" />Evidence</div>
          <div className="mt-1.5 text-[14px] font-medium leading-snug text-ink">{e.title}</div>
          {e.meta && <div className="mt-1 text-[12px] text-ink-3">{e.meta}</div>}
        </button>
      ))}
    </div>
  )
}

export function SectionTitle({ children, aside, className }: { children: ReactNode; aside?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-3 flex flex-wrap items-end justify-between gap-2', className)}>
      <h2 className="text-[16px] font-semibold text-ink">{children}</h2>
      {aside}
    </div>
  )
}

/** Stat card (ATLAS module .stat): tone-coloured icon box, label, value, caption. */
export function StatTile({ icon: I, label, value, cap, tone, onClick, children, tip }: { icon: LucideIcon; label: string; value: ReactNode; cap?: ReactNode; tone?: 'bad' | 'warn' | 'ok'; onClick?: () => void; children?: ReactNode; tip?: ReactNode }) {
  const body = (
    <>
      <span className={cn('grid size-[38px] shrink-0 place-items-center rounded-[9px]', tone === 'bad' ? 'bg-bad-bg text-bad' : tone === 'warn' ? 'bg-warn-bg text-warn' : tone === 'ok' ? 'bg-ok-bg text-ok' : 'bg-atlas-100 text-atlas-600')}><I className="size-[19px]" /></span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-[13px] text-ink-3">{label}</span>
        <span className={cn('tnum mt-0.5 block text-[24px] font-bold leading-tight tracking-[-0.02em]', tone === 'bad' ? 'text-bad' : tone === 'warn' ? 'text-warn' : tone === 'ok' ? 'text-ok' : 'text-ink')}>{value}</span>
        {children}
        {cap && <span className="mt-0.5 block text-[12px] leading-snug text-ink-3">{cap}</span>}
      </span>
    </>
  )
  const cls = 'flex h-full items-start gap-3.5 rounded-xl border border-line bg-surface px-[18px] py-4'
  const tile = onClick ? <button onClick={onClick} className={cn(cls, 'press w-full hover:border-atlas-300')}>{body}</button> : <div className={cls} tabIndex={tip ? 0 : undefined}>{body}</div>
  return tip ? <Tip content={tip}>{tile}</Tip> : tile
}
