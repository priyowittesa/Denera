import { CheckCircle2, CircleDashed, Clock3, Database, Hourglass, Info, Minus, OctagonAlert, ShieldCheck, Sparkles, TriangleAlert, UserCheck, Ban, XCircle, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import type { Authority, Health, Wave } from '../../data/types'
import { Tip } from '../ui/tooltip'
import { Pop } from '../ui/popover'

/** Rounded status pill with a border, as in the ATLAS module badges. */
const chip = 'inline-flex items-center gap-[5px] whitespace-nowrap rounded-full border px-[9px] py-0.5 text-[12px] font-medium leading-4 [&_svg]:size-3'

const WAVE_TIP: Record<Wave, string> = {
  W1: 'Runs on documents and checklists available today.',
  W2: 'Needs agreed partner data feeds.',
  W3: 'Needs partner data feeds and linked forecasts.',
}

export function WaveTag({ wave }: { wave: Wave }) {
  return (
    <Tip content={WAVE_TIP[wave]}>
      <span tabIndex={0} className={cn(chip, wave === 'W1' ? 'border-atlas-200 bg-atlas-50 text-atlas-700' : 'border-dashed border-ink-4/50 bg-surface text-ink-2')}>
        {wave === 'W1' ? 'Now' : wave === 'W2' ? 'Next' : 'Later'}
      </span>
    </Tip>
  )
}

export function DataNeeded({ sources, owner, note }: { sources: string[]; owner: string; note?: string }) {
  return (
    <Pop
      trigger={
        <button className="press inline-flex h-[38px] items-center gap-2 whitespace-nowrap rounded-lg border border-line bg-surface px-3.5 text-[14px] font-medium text-ink hover:bg-sunken">
          <Database className="size-4 text-ink-2" />
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
  'Shareholder (Denera)': 'border-atlas-200 bg-atlas-50 text-atlas-700',
  'Project company': 'border-line bg-sunken text-ink-2',
  Joint: 'border-[#fed7aa] bg-[#fff7ed] text-[#9a3412]',
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
  Reported: 'border-line bg-sunken text-ink-2',
  Verified: 'border-atlas-200 bg-atlas-50 text-atlas-700',
  Forecast: 'border-warn-line bg-warn-bg text-warn',
  Advisory: 'border-info-line bg-info-bg text-info',
}

export function ClassChip({ c }: { c: string }) {
  const key = Object.keys(CLASS_STYLE).find((k) => c.startsWith(k)) ?? 'Reported'
  return <span className={cn(chip, CLASS_STYLE[key])}>{c}</span>
}

export const HEALTH_ICON = { Green: CheckCircle2, Yellow: TriangleAlert, Red: OctagonAlert } as const
const HEALTH_STYLE: Record<Health, string> = {
  Green: 'border-ok-line bg-ok-bg text-ok',
  Yellow: 'border-warn-line bg-warn-bg text-warn',
  Red: 'border-bad-line bg-bad-bg text-bad',
}

export function StatusChip({ h, label, size = 'sm', className }: { h: Health; label?: ReactNode; size?: 'sm' | 'md'; className?: string }) {
  const Icon = HEALTH_ICON[h]
  return (
    <span className={cn('inline-flex items-center gap-[5px] whitespace-nowrap rounded-full border font-medium', size === 'sm' ? 'px-[9px] py-0.5 text-[12px]' : 'px-3 py-1 text-[13px]', HEALTH_STYLE[h], className)}>
      <Icon className={size === 'sm' ? 'size-3' : 'size-3.5'} strokeWidth={2.4} />
      {label ?? h}
    </span>
  )
}

export function PlainStatus({ s }: { s: string }) {
  if (s === 'Green' || s === 'Yellow' || s === 'Red') return <StatusChip h={s} />
  return (
    <span className={cn(chip, 'border-line bg-sunken text-ink-3')}>
      <Minus className="size-3" />
      {s}
    </span>
  )
}

export function Stamp({ kind, who, when }: { kind: 'draft' | 'extracted' | 'confirmed' | 'approved'; who?: string; when?: string }) {
  // Named stamps can be long; on narrow cards they wrap instead of running past the edge.
  const named = 'max-w-full whitespace-normal rounded-[10px] text-left'
  if (kind === 'draft')
    return <span className={cn(chip, 'border-info-line bg-info-bg text-info')}><Sparkles className="size-3" />AI draft</span>
  if (kind === 'extracted')
    return <span className={cn(chip, 'border-dashed border-ink-4 bg-surface text-ink-3')}><CircleDashed className="size-3" />Extracted by ATLAS</span>
  if (kind === 'approved')
    return <span className={cn(chip, named, 'border-ok-line bg-ok-bg text-ok')}><ShieldCheck className="size-3" />Approved by {who}{when ? `, ${when}` : ''}</span>
  return <span className={cn(chip, named, 'border-ok-line bg-ok-bg text-ok')}><UserCheck className="size-3" />Confirmed by {who}{when ? `, ${when}` : ''}</span>
}

/** Sync pill with a live dot (ATLAS module .sync): data date, refresh time and, when relevant, data confidence. */
export function SyncPill({ withConfidence = true, value = 91 }: { withConfidence?: boolean; value?: number }) {
  const pill = (
    <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-surface px-3 py-[7px] text-[13px] text-ink-2">
      <span className="pulse-dot size-2 shrink-0 rounded-full bg-[#22c55e]" />
      Data 30 Jun 2027 08:30{withConfidence && <> · confidence <span className="tnum font-semibold text-ink">{value}%</span></>}
    </span>
  )
  if (!withConfidence) return pill
  return <ConfidenceBadge value={value} trigger={<button className="press rounded-full hover:bg-sunken">{pill}</button>} />
}

export function ConfidenceBadge({ value = 91, trigger }: { value?: number; trigger?: ReactNode }) {
  return (
    <Pop
      trigger={trigger ?? (
        <button className={cn(chip, 'press border-line bg-surface text-ink-2 hover:bg-sunken')}>
          Data confidence <span className="tnum font-semibold text-ink">{value}%</span>
        </button>
      )}
      className="w-[300px]"
    >
      <p className="text-[12px] font-semibold text-ink">How confidence is built</p>
      {[['Freshness', 95, 40], ['Source quality', 90, 40], ['Agreement between sources', 85, 20]].map(([l, v, w]) => (
        <div key={l as string} className="mt-3">
          <div className="flex justify-between text-[12px]"><span>{l} <span className="text-ink-4">· weight {w}%</span></span><span className="tnum font-medium text-ink">{v}%</span></div>
          <div className="mt-1 h-1.5 rounded-full bg-sunken"><div className="h-full rounded-full bg-atlas-600" style={{ width: `${v}%` }} /></div>
        </div>
      ))}
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

type Tone = 'ok' | 'warn' | 'bad' | 'info' | 'brand' | 'muted'
const TONE: Record<Tone, string> = {
  ok: 'border-ok-line bg-ok-bg text-ok',
  warn: 'border-warn-line bg-warn-bg text-warn',
  bad: 'border-bad-line bg-bad-bg text-bad',
  info: 'border-info-line bg-info-bg text-info',
  brand: 'border-atlas-200 bg-atlas-50 text-atlas-700',
  muted: 'border-line bg-sunken text-ink-2',
}

/** Generic bordered pill: one shape for every state, mode and tag. */
export function Pill({ tone = 'muted', icon: I, children, className }: { tone?: Tone; icon?: LucideIcon; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-[5px] whitespace-nowrap rounded-full border px-[9px] py-0.5 text-[12px] font-medium leading-4 [&_svg]:size-3', TONE[tone], className)}>
      {I && <I strokeWidth={2.4} />}{children}
    </span>
  )
}

/** A workflow state in words: tone and icon come from the wording, so the same state looks the same on every screen. */
export function StatePill({ s, label }: { s: string; label?: ReactNode }) {
  const t = s.toLowerCase()
  let tone: Tone = 'muted'
  let icon: LucideIcon = CircleDashed
  if (/^(accepted|agreed|completed$|done|approved|met|confirmed|mitigated|closed|supported|active)/.test(t)) { tone = 'ok'; icon = CheckCircle2 }
  else if (/exception|at risk/.test(t)) { tone = 'warn'; icon = TriangleAlert }
  else if (/waiting|awaiting/.test(t)) { tone = 'brand'; icon = Hourglass }
  else if (/in progress|submitted|in review|under assessment|requested/.test(t)) { tone = 'info'; icon = Clock3 }
  else if (/rejected|objection/.test(t)) { tone = 'bad'; icon = XCircle }
  else if (/blocked|overdue/.test(t)) { tone = 'bad'; icon = Ban }
  else if (/not (started|yet)|draft|raised|n\/a|none/.test(t)) { tone = 'muted'; icon = CircleDashed }
  return <Pill tone={tone} icon={icon}>{label ?? s}</Pill>
}
