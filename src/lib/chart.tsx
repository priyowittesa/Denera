import type { ReactNode } from 'react'

export const t = (iso: string) => new Date(`${iso}T00:00:00Z`).getTime()

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const fmtMonth = (ms: number) => {
  const d = new Date(ms)
  return `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}`
}
export const fmtDay = (ms: number) => {
  const d = new Date(ms)
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

export const AXIS = { fontSize: 11.5, fill: 'var(--color-ink-3)', fontFamily: 'Geist, sans-serif' }

/** Quarterly ticks from Aug 2026 to Sep 2028. */
export const TICKS = ['2026-08-01', '2026-11-01', '2027-02-01', '2027-05-01', '2027-08-01', '2027-11-01', '2028-02-01', '2028-05-01', '2028-08-01'].map(t)

export function ChartTooltip({ active, payload, label, rows }: { active?: boolean; payload?: { dataKey: string; value: unknown }[]; label?: number; rows: { key: string; label: string; color: string; fmt?: (v: number) => string }[] }) {
  if (!active || !payload?.length) return null
  const map = new Map(payload.map((p) => [p.dataKey, p.value]))
  const visible = rows.filter((r) => typeof map.get(r.key) === 'number')
  if (!visible.length) return null
  return (
    <div className="float min-w-[200px] rounded-md bg-surface px-3 py-2.5 text-[12.5px]">
      <div className="mb-1.5 font-semibold text-ink">{label ? fmtDay(label) : ''}</div>
      {visible.map((r) => (
        <div key={r.key} className="flex items-center justify-between gap-6 py-0.5">
          <span className="flex items-center gap-2 text-ink-2"><span className="h-0.5 w-3 rounded" style={{ background: r.color }} />{r.label}</span>
          <span className="tnum font-medium text-ink">{r.fmt ? r.fmt(map.get(r.key) as number) : String(map.get(r.key))}</span>
        </div>
      ))}
    </div>
  )
}

export function LegendItem({ color, label, dash, weight = 2 }: { color: string; label: ReactNode; dash?: string; weight?: number }) {
  return (
    <span className="inline-flex items-center gap-2 text-[12.5px] text-ink-2">
      <svg width="22" height="8" aria-hidden>
        <line x1="1" y1="4" x2="21" y2="4" stroke={color} strokeWidth={weight} strokeDasharray={dash} strokeLinecap="round" />
      </svg>
      {label}
    </span>
  )
}
