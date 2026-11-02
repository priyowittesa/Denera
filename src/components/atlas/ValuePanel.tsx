import { CheckCircle2, ChevronDown, Flag } from 'lucide-react'
import { VALUE_ROWS, inRange, type ValueRow } from '../../data/valueBasis'
import { usePersona } from '../../state/store'
import { Tip } from '../ui/tooltip'
import { InfoDot } from './chips'

const CAVEAT = 'Public figures, tagged (A). PPA delay and deemed-commissioning terms are not public, so exposure may be lower or deferred. Revenue is project company revenue, not Denera profit. UC07 and UC10 overlap and are never added together. Each row stays a sensitivity until the Phase 0 baseline is captured. No payback is shown.'

/** Value at stake (FR-G-21, FR-G-22). Sensitivities only; never an investment case. */
/** The value rows a persona may see: the project company never sees UC01 or Denera-share figures. */
export function valueRowsFor(ucs: string[], isPcu: boolean) {
  return ucs
    .map((k) => (isPcu && k === 'UC07' ? 'UC07pc' : k))
    .filter((k) => !(isPcu && k === 'UC01'))
    .map((k) => VALUE_ROWS[k])
}
export const projectValue = (r: ValueRow, isPcu: boolean) => (isPcu && r.uc === 'UC09' ? r.valueLabel.split(';')[0] : r.valueLabel)

export function ValuePanel({ ucs }: { ucs: string[] }) {
  const { isPcu } = usePersona()
  const rows = valueRowsFor(ucs, isPcu)
  if (!rows.length) return null
  return (
    <section id="value-at-stake" aria-labelledby="value-at-stake-title" className="mt-10 scroll-mt-6">
      <div className="mb-3 flex items-center gap-1.5">
        <h2 id="value-at-stake-title" className="text-[15px] font-semibold text-ink">Value at stake</h2>
        <InfoDot>{CAVEAT}</InfoDot>
        <span className="ml-auto text-[12px] text-ink-3">Sensitivity, not an investment case</span>
      </div>
      <div className="divide-y divide-line-soft rounded-xl border border-line bg-surface">
        {rows.map((r) => <Row key={r.uc + r.range} r={r} pcu={isPcu} />)}
      </div>
    </section>
  )
}

function Row({ r, pcu }: { r: ValueRow; pcu: boolean }) {
  const ok = inRange(r)
  const label = projectValue(r, pcu)
  const range = pcu && r.uc === 'UC09' ? r.range.split(';')[0] : r.range
  return (
    <details className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
      <summary className="grid cursor-pointer list-none items-center gap-x-6 gap-y-2 outline-none sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <div className="text-[14px] font-medium text-ink"><span className="text-ink-3">{r.uc} · </span>{r.name}</div>
          <div className="mt-0.5 text-[13px] text-ink-3">Range {range} (A)</div>
        </div>
        <div className="flex items-center gap-3 sm:justify-end">
          <Tip content={`Derived: ${r.derivation}`}>
            <span tabIndex={0} className="tnum text-[15px] font-semibold text-ink">{label}</span>
          </Tip>
          {ok && <span className="inline-flex items-center gap-1 text-[12px] font-medium text-ok"><CheckCircle2 className="size-3.5" />Inside the range</span>}
          <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[12px] font-medium text-ink-3 group-hover:text-ink">
            Baseline<ChevronDown className="size-3.5 transition-transform duration-200 group-open:rotate-180" />
          </span>
        </div>
        <p className="flex gap-2 text-[13px] leading-relaxed text-ink-2 sm:col-span-2"><Flag className="mt-[3px] size-3.5 shrink-0 text-ink-3" /><span><span className="font-medium text-ink">Gate to proceed. </span>{r.gate}</span></p>
      </summary>
      <p className="mt-3 border-t border-line-soft pt-3 text-[13px] leading-relaxed text-ink-2"><span className="font-medium text-ink">Measure and baseline (Phase 0). </span>{r.measure}</p>
    </details>
  )
}
