import { ArrowRight, Clock, FileText, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { screenByPath } from '../../data/screens'
import type { Health } from '../../data/types'
import { useUi } from '../../state/ui'
import { usePersona } from '../../state/store'
import { projectValue, valueRowsFor } from './ValuePanel'
import { HEALTH_STATEMENT } from './HealthRule'
import { ClassChip, ConfidenceBadge, DataNeeded, StatusChip } from './chips'

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
    <div className="mx-auto w-full max-w-[1320px] px-4 pb-28 pt-6 sm:px-6 sm:pt-8 xl:px-10">
      {meta && (
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5">
          <div className="eyebrow min-w-0">{project}</div>
          <div className="flex flex-wrap items-center gap-1">
            <DataNeeded sources={meta.dataNeeded.sources} owner={meta.dataNeeded.owner} note={meta.path === '/portfolio' || meta.path === '/cockpit' ? HEALTH_STATEMENT : undefined} />
            {confidence && <ConfidenceBadge />}
          </div>
        </div>
      )}
      <div className={cn('mt-5 grid gap-x-12 gap-y-6', answer && 'xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start')}>
        <div className="min-w-0">
          <h1 className="display max-w-[46em] text-[clamp(20px,1.7vw,24px)] leading-[1.3] text-ink">{headline}</h1>
          {(status || sub) && (
            <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-2">
              {status && <StatusChip h={status} label={statusLabel} size="md" />}
              {sub && <p className="text-[14px] text-ink-2">{sub}</p>}
            </div>
          )}
          {aside && <div className="mt-5 flex flex-wrap items-center gap-2">{aside}</div>}
        </div>
        {answer && <AnswerFigure {...answer} />}
      </div>
      <div className="mt-8 sm:mt-10">{children}</div>
    </div>
  )
}

function AnswerFigure({ label, value, foot, tone = 'ink', action, stake }: Answer) {
  const { isPcu } = usePersona()
  const rows = stake ? valueRowsFor(stake, isPcu) : []
  return (
    <div className="animate-rise border-t border-line pt-4 xl:border-l xl:border-t-0 xl:pl-7 xl:pt-0">
      <div className="eyebrow">{label}</div>
      <div className={cn('tnum mt-1 text-[28px] font-semibold leading-none tracking-[-0.025em]', tone === 'bad' ? 'text-bad' : tone === 'warn' ? 'text-warn' : tone === 'ok' ? 'text-ok' : 'text-ink')}>{value}</div>
      {foot && <div className="mt-2 text-[13px] leading-snug text-ink-3">{foot}</div>}
      {action && (
        <button onClick={action.onClick} className="press mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-atlas-700 hover:underline">{action.label}<ArrowRight className="size-3.5" /></button>
      )}
      {rows.length > 0 && (
        <dl className="mt-3 space-y-0.5 rounded-lg bg-sunken px-3 py-2 text-[12px] leading-snug">
          {rows.map((r) => <div key={r.uc}><div className="flex flex-wrap gap-x-1"><dt className="text-ink-3">{r.metric}</dt><dd className="tnum font-medium text-ink-2">{projectValue(r, isPcu)}</dd></div>{r.caption && <p className="mt-0.5 text-[12px] text-ink-3">{r.caption}</p>}</div>)}
        </dl>
      )}
    </div>
  )
}

export function Provenance({ sources, classification, confidence, className }: { sources: { label: string; doc?: string }[]; classification?: string; confidence?: string; className?: string }) {
  const open = useUi((s) => s.openEvidence)
  const first = sources.find((s) => s.doc)
  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-line-soft pt-3 text-[12px] text-ink-3', className)}>
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

export function AtlasCard({ title = 'ATLAS insight', children, sources, classification = 'Advisory', confidence = 'Medium', className, tone = 'plain' }: {
  title?: ReactNode
  children: ReactNode
  sources: { label: string; doc?: string }[]
  classification?: string
  confidence?: string
  className?: string
  tone?: 'plain' | 'violet'
}) {
  return (
    <section className={cn('rounded-xl border p-5', tone === 'violet' ? 'border-atlas-100 bg-atlas-50/70' : 'border-line bg-surface', className)}>
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-atlas-600" />
        <h3 className="text-[14px] font-semibold text-ink">{title}</h3>
      </div>
      <div className="mt-3 text-[14px] leading-[1.6] text-ink-2">{children}</div>
      <Provenance className="mt-4" sources={sources} classification={classification} confidence={confidence} />
    </section>
  )
}

export function Metric({ label, value, note, tone, tip, className }: { label: ReactNode; value: ReactNode; note?: ReactNode; tone?: 'bad' | 'warn' | 'ok'; tip?: ReactNode; className?: string }) {
  return (
    <div className={cn('min-w-0', className)}>
      <div className="flex items-center gap-1 text-[13px] font-medium text-ink-3">{label}{tip}</div>
      <div className={cn('tnum mt-1 text-[22px] font-semibold leading-7 tracking-[-0.01em] text-ink', tone === 'bad' && 'text-bad', tone === 'warn' && 'text-warn', tone === 'ok' && 'text-ok')}>{value}</div>
      {note && <div className="mt-0.5 text-[13px] leading-snug text-ink-3">{note}</div>}
    </div>
  )
}

export function MetricGroup({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-xl border border-line bg-surface px-5 py-4', className)}>
      <h3 className="eyebrow">{title}</h3>
      <div className="mt-3 grid gap-x-6 gap-y-4 [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">{children}</div>
    </section>
  )
}

export function ImpactStrip({ delivery, capex, commercial }: { delivery: [string, string]; capex: [string, string]; commercial: [string, string] }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
      {[['Delivery', delivery], ['CAPEX', capex], ['Commercial', commercial]].map(([l, [n, p]]) => (
        <div key={l as string} className="bg-surface px-5 py-3.5">
          <div className="text-[12px] font-medium text-ink-3">{l as string} impact</div>
          <div className="tnum mt-0.5 text-[18px] font-semibold text-ink">{n}</div>
          <div className="text-[13px] text-ink-3">{p}</div>
        </div>
      ))}
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
      <h2 className="text-[18px] font-semibold tracking-[-0.012em] text-ink">{children}</h2>
      {aside}
    </div>
  )
}
