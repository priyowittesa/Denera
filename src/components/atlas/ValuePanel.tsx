import { CheckCircle2, Flag, Ruler } from 'lucide-react'
import { VALUE_ROWS, inRange, type ValueRow } from '../../data/valueBasis'
import { usePersona } from '../../state/store'
import { Tip } from '../ui/tooltip'

/** Value at stake (FR-G-21, FR-G-22). Sensitivities only; never an investment case. */
export function ValuePanel({ ucs }: { ucs: string[] }) {
  const { isPcu } = usePersona()
  const rows = ucs
    .map((k) => (isPcu && k === 'UC07' ? 'UC07pc' : k))
    .filter((k) => !(isPcu && k === 'UC01'))
    .map((k) => VALUE_ROWS[k])
  if (!rows.length) return null
  return (
    <section aria-labelledby="value-at-stake" className="mt-10 rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 pt-4">
        <h2 id="value-at-stake" className="text-[15px] font-semibold text-ink">Value at stake</h2>
        <span className="text-[12px] text-ink-3">Sensitivities from public figures, tagged (A). Not an investment case. No payback shown.</span>
      </div>
      <div className="mt-3 divide-y divide-line-soft">
        {rows.map((r) => <Row key={r.uc + r.range} r={r} pcu={isPcu} />)}
      </div>
      <p className="border-t border-line-soft px-5 py-3 text-[12px] leading-relaxed text-ink-3">
        Public figures. PPA delay and deemed-commissioning terms are not public, so exposure may be lower or deferred. Revenue is project company revenue, not Denera profit. UC07 and UC10 overlap and are never added together. Each row stays a sensitivity until the Phase 0 baseline is captured.
      </p>
    </section>
  )
}

function Row({ r, pcu }: { r: ValueRow; pcu: boolean }) {
  const ok = inRange(r)
  const label = pcu && r.uc === 'UC09' ? r.valueLabel.split(';')[0] : r.valueLabel
  const range = pcu && r.uc === 'UC09' ? r.range.split(';')[0] : r.range
  return (
    <div className="grid gap-x-6 gap-y-3 px-5 py-4 lg:grid-cols-[1.1fr_1.2fr_1fr]">
      <div>
        <div className="text-[12px] font-semibold text-atlas-700">{r.uc}</div>
        <div className="text-[14px] font-medium text-ink">{r.name}</div>
        <div className="mt-0.5 text-[12.5px] text-ink-3">{r.lever}</div>
      </div>
      <div>
        <div className="text-[12px] font-medium text-ink-3">Master range <span className="text-ink-4">(A)</span></div>
        <div className="mt-0.5 text-[13.5px] text-ink-2">{range}</div>
      </div>
      <div>
        <div className="text-[12px] font-medium text-ink-3">This project</div>
        <Tip content={`Derived: ${r.derivation}`}>
          <div tabIndex={0} className="tnum mt-0.5 text-[16px] font-semibold text-ink">{label}</div>
        </Tip>
        {ok && (
          <span className="mt-1 inline-flex items-center gap-1 rounded-sm bg-ok-bg px-1.5 py-0.5 text-[11.5px] font-medium text-ok">
            <CheckCircle2 className="size-3" />Inside the range
          </span>
        )}
      </div>
      <div className="grid gap-3 rounded-md bg-sunken px-4 py-3 text-[12.5px] leading-snug text-ink-2 lg:col-span-3 lg:grid-cols-2">
        <div className="flex gap-2"><Flag className="mt-0.5 size-3.5 shrink-0 text-ink-3" /><div><span className="font-medium text-ink">Gate to proceed. </span>{r.gate}</div></div>
        <div className="flex gap-2"><Ruler className="mt-0.5 size-3.5 shrink-0 text-ink-3" /><div><span className="font-medium text-ink">Measure and baseline (captured in Phase 0). </span>{r.measure}</div></div>
      </div>
    </div>
  )
}
