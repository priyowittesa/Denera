import { CheckCircle2, CircleDashed, Clock3, Database, Hourglass, Info, Minus, OctagonAlert, ShieldCheck, Sparkles, TriangleAlert, UserCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import type { Authority, Health, Wave } from '../../data/types'
import { Tip } from '../ui/tooltip'
import { Pop } from '../ui/popover'

const chip = 'inline-flex items-center gap-1 whitespace-nowrap rounded-sm px-1.5 py-0.5 text-[12px] font-medium leading-4'

const WAVE_TIP: Record<Wave, string> = {
  W1: 'Runs on documents and checklists available today.',
  W2: 'Needs agreed partner data feeds.',
  W3: 'Needs partner data feeds and linked forecasts.',
}

export function WaveTag({ wave }: { wave: Wave }) {
  return (
    <Tip content={WAVE_TIP[wave]}>
      <span tabIndex={0} className={cn(chip, wave === 'W1' ? 'bg-atlas-100/70 text-atlas-800' : 'border border-dashed border-ink-4/45 text-ink-2')}>
        {wave === 'W1' ? 'Now' : wave === 'W2' ? 'Next' : 'Later'}
      </span>
    </Tip>
  )
}

export function DataNeeded({ sources, owner, note }: { sources: string[]; owner: string; note?: string }) {
  return (
    <Pop
      trigger={
        <button className={cn(chip, 'press text-ink-2 ring-1 ring-inset ring-line hover:bg-sunken')}>
          <Database className="size-3 text-info" />
          Data sources
        </button>
      }
    >
      <p className="text-[12px] font-semibold text-ink">Data behind this view</p>
      <ul className="mt-2 space-y-1.5">
        {sources.map((s) => (
          <li key={s} className="flex gap-2"><span className="mt-[7px] size-1 shrink-0 rounded-full bg-ink-4" />{s}</li>
        ))}
      </ul>
      <p className="mt-3 border-t border-line-soft pt-3 text-[12px]"><span className="text-ink-3">Provided by </span><span className="font-medium text-ink">{owner}</span></p>
      {note && <p className="mt-3 border-t border-line-soft pt-3 text-[12px] leading-relaxed text-ink-3">{note}</p>}
    </Pop>
  )
}

const AUTH_STYLE: Record<Authority, string> = {
  'Shareholder (Denera)': 'bg-atlas-100 text-atlas-800',
  'Project company': 'bg-sunken text-ink-2',
  Joint: 'bg-[#fdf1e7] text-[#8a3b12]',
}
const AUTH_TIP: Record<Authority, string> = {
  'Shareholder (Denera)': 'Shareholder (Denera): Denera can act directly through its shareholder rights.',
  'Project company': 'Project company: only the project company can take this action. Denera can request it.',
  Joint: 'Joint: Denera acts as shareholder; the project company board decides.',
}

export function AuthorityLabel({ a, className }: { a: Authority; className?: string }) {
  return (
    <Tip content={AUTH_TIP[a]}>
      <span tabIndex={0} className={cn(chip, AUTH_STYLE[a], className)}>{a}</span>
    </Tip>
  )
}

const CLASS_STYLE: Record<string, string> = {
  Reported: 'bg-sunken text-ink-2',
  Verified: 'bg-atlas-100 text-atlas-800',
  Forecast: 'bg-warn-bg text-warn',
  Advisory: 'bg-info-bg text-info',
}

export function ClassChip({ c }: { c: string }) {
  const key = Object.keys(CLASS_STYLE).find((k) => c.startsWith(k)) ?? 'Reported'
  return <span className={cn(chip, CLASS_STYLE[key])}>{c}</span>
}

export const HEALTH_ICON = { Green: CheckCircle2, Yellow: TriangleAlert, Red: OctagonAlert } as const
const HEALTH_STYLE: Record<Health, string> = {
  Green: 'bg-ok-bg text-ok',
  Yellow: 'bg-warn-bg text-warn',
  Red: 'bg-bad-bg text-bad',
}

export function StatusChip({ h, label, size = 'sm', className }: { h: Health; label?: ReactNode; size?: 'sm' | 'md'; className?: string }) {
  const Icon = HEALTH_ICON[h]
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm font-medium', size === 'sm' ? 'px-1.5 py-0.5 text-[12px]' : 'px-2.5 py-1 text-[13px]', HEALTH_STYLE[h], className)}>
      <Icon className={size === 'sm' ? 'size-3.5' : 'size-4'} strokeWidth={2.2} />
      {label ?? h}
    </span>
  )
}

export function PlainStatus({ s }: { s: string }) {
  if (s === 'Green' || s === 'Yellow' || s === 'Red') return <StatusChip h={s} />
  return (
    <span className={cn(chip, 'bg-sunken text-ink-3')}>
      <Minus className="size-3" />
      {s}
    </span>
  )
}

export function Stamp({ kind, who, when }: { kind: 'draft' | 'extracted' | 'confirmed' | 'approved'; who?: string; when?: string }) {
  if (kind === 'draft')
    return <span className={cn(chip, 'bg-info-bg text-info')}><Sparkles className="size-3" />AI draft</span>
  if (kind === 'extracted')
    return <span className={cn(chip, 'border border-dashed border-ink-4 text-ink-3')}><CircleDashed className="size-3" />Extracted by ATLAS</span>
  if (kind === 'approved')
    return <span className={cn(chip, 'bg-ok-bg text-ok')}><ShieldCheck className="size-3" />Approved by {who}{when ? `, ${when}` : ''}</span>
  return <span className={cn(chip, 'bg-ok-bg text-ok')}><UserCheck className="size-3" />Confirmed by {who}{when ? `, ${when}` : ''}</span>
}

export function ConfidenceBadge({ value = 91 }: { value?: number }) {
  return (
    <Pop
      trigger={
        <button className={cn(chip, 'press text-ink-3 hover:bg-sunken hover:text-ink-2')}>
          Data confidence <span className="tnum font-semibold text-ink">{value}%</span>
        </button>
      }
      className="w-[300px]"
    >
      <p className="text-[12px] font-semibold text-ink">How confidence is built</p>
      {[['Freshness', 95, 40], ['Source quality', 90, 40], ['Agreement between sources', 85, 20]].map(([l, v, w]) => (
        <div key={l as string} className="mt-3">
          <div className="flex justify-between text-[12px]"><span>{l} <span className="text-ink-4">· weight {w}%</span></span><span className="tnum font-medium text-ink">{v}%</span></div>
          <div className="mt-1 h-1.5 rounded-full bg-sunken"><div className="h-full rounded-full bg-atlas-600" style={{ width: `${v}%` }} /></div>
        </div>
      ))}
      <p className="mt-3 text-[12px] text-ink-3">Weights are illustrative.</p>
    </Pop>
  )
}

export function GateIcon({ s }: { s: 'M' | 'P' | 'R' | 'N' | 'C' }) {
  const map = {
    M: { I: CheckCircle2, c: 'text-ok', l: 'Met' },
    P: { I: Clock3, c: 'text-info', l: 'In progress' },
    R: { I: TriangleAlert, c: 'text-warn', l: 'At risk' },
    N: { I: Minus, c: 'text-ink-4', l: 'Not started' },
    C: { I: Hourglass, c: 'text-atlas-600', l: 'Evidence linked, awaiting confirmation' },
  } as const
  const { I, c, l } = map[s]
  return <I className={cn('size-4', c)} aria-label={l} strokeWidth={2.2} />
}

export function InfoDot({ children }: { children: ReactNode }) {
  return (
    <Tip content={children}>
      <button className="press inline-grid size-5 place-items-center rounded-full text-ink-4 hover:text-ink-2" aria-label="More information">
        <Info className="size-3.5" />
      </button>
    </Tip>
  )
}
