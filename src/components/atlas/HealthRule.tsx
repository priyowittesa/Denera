import type { ReactNode } from 'react'
import { Pop } from '../ui/popover'

export const HEALTH_RULES: [string, string][] = [
  ['Dimension Red', 'A contractual or approved limit is forecast to be breached with the current plan'],
  ['Dimension Yellow', 'A limit is at risk, or a leading indicator has moved against plan, but no breach is forecast'],
  ['Dimension Green', 'No adverse indicator'],
  ['Overall Red', 'A limit has already been breached, or forecast COD exposure exceeds 60 days'],
  ['Overall Yellow', 'No limit breached and exposure at or below 60 days, but one or more dimensions are Red or two or more are Yellow'],
  ['Overall Green', 'No dimension Red and at most one Yellow'],
  ['Escalation flag', 'Shown when three or more dimensions are Red'],
]

export function HealthRuleBody({ signals }: { signals?: string[] }) {
  return (
    <div className="text-[12.5px]">
      {signals && (
        <>
          <p className="font-semibold text-ink">Signals that drove this rating</p>
          <ul className="mt-1.5 space-y-1">
            {signals.map((s) => <li key={s} className="flex gap-2 text-ink-2"><span className="mt-[7px] size-1 shrink-0 rounded-full bg-ink-4" />{s}</li>)}
          </ul>
          <div className="my-3 h-px bg-line-soft" />
        </>
      )}
      <p className="font-semibold text-ink">How health is rated</p>
      <dl className="mt-1.5 space-y-1.5">
        {HEALTH_RULES.map(([k, v]) => (
          <div key={k}><dt className="inline font-medium text-ink">{k}. </dt><dd className="inline text-ink-2">{v}</dd></div>
        ))}
      </dl>
      <p className="mt-3 text-ink-3">Computed from named signals. Ratings cannot be changed, only commented on. Wave 1 shows a light status from the weekly template; computed health (Wave 2) starts when the three Phase I partners have submitted the weekly template for four consecutive weeks (A) and health rules are agreed with the PMO.</p>
    </div>
  )
}

export function HealthRulePop({ trigger, signals }: { trigger: ReactNode; signals?: string[] }) {
  return (
    <Pop trigger={trigger} className="w-[400px]">
      <HealthRuleBody signals={signals} />
    </Pop>
  )
}
