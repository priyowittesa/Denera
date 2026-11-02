import { Database, FileSearch, Lock, Plus, Sparkles } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { ANSWERS } from '../../data/answers'
import { BUNDLE } from '../../data/registers'
import { EVIDENCE } from '../../data/evidence'
import { cn } from '../../lib/cn'
import { useDemo } from '../../state/store'
import { useUi } from '../../state/ui'
import { Button } from '../ui/button'
import { AuthorityLabel, ClassChip } from './chips'

/**
 * One ATLAS answer, written as prose like an AI chat reply.
 * `words` limits the lead paragraph while it streams; the rest appears once it is done.
 */
export function AnswerView({ id, compact = false, words, stopped = false, onFollow }: {
  id: string
  compact?: boolean
  words?: number
  stopped?: boolean
  onFollow?: (id: string) => void
}) {
  const a = ANSWERS[id]
  const propose = useDemo((s) => s.propose)
  const proposals = useDemo((s) => s.proposals)
  const addRequest = useDemo((s) => s.addRequest)
  const requests = useDemo((s) => s.requests)
  const actions = useDemo((s) => s.actions)
  const openEvidence = useUi((s) => s.openEvidence)
  const [showAssumption, setShowAssumption] = useState(false)

  if (!a) return null
  const streaming = words !== undefined
  const all = a.direct.split(/\s+/)
  const text = streaming ? all.slice(0, Math.max(1, words)).join(' ') : a.direct
  const cited = (a.sources ?? []).map((s, i) => ({ ...s, n: i + 1 }))
  const lead = (
    <p className={cn('leading-[1.65] text-ink', compact ? 'text-[14px]' : 'text-[15px]')}>
      {text}
      {streaming && !stopped && <span className="ml-0.5 inline-block h-[1.05em] w-[7px] translate-y-[3px] animate-pulse rounded-[1px] bg-atlas-500" aria-hidden />}
      {!streaming && cited.filter((s) => s.doc).slice(0, 3).map((s) => <Cite key={s.n} n={s.n} label={s.label} onOpen={() => openEvidence(s.doc!)} />)}
    </p>
  )

  if (streaming) {
    return (
      <div className="space-y-3">
        {lead}
        {stopped && <p className="text-[13px] text-ink-3">You stopped this answer. Regenerate to see the full answer with figures, actions and sources.</p>}
      </div>
    )
  }

  if (a.kind === 'refusal')
    return (
      <div className="space-y-3">
        <Flag tone="warn" icon={<FileSearch className="size-3.5" />}>No measured evidence, so ATLAS will not estimate</Flag>
        {lead}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={requests.includes('calorific')}
            onClick={() => addRequest('calorific', 'Waste characterisation data', { title: 'Provide waste characterisation and laboratory data', owner: 'Project company', authority: 'Project company', due: '14 Jul 2027', dueIso: '2027-07-14', status: 'Not started', linked: 'Waste supply', source: 'ATLAS data request' })}
          >
            <Database />{requests.includes('calorific') ? 'Data request raised' : 'Raise data request'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowAssumption((v) => !v)}>Show design assumption</Button>
        </div>
        {showAssumption && (
          <div className="animate-rise rounded-lg border border-dashed border-ink-4/60 bg-sunken p-3 text-[13px]">
            <div className="font-medium text-ink">Design lower heating value 6.5 MJ/kg</div>
            <div className="mt-1 text-ink-3">Design assumption, not measured. Confidence Low.</div>
            <button className="mt-2 text-[12px] font-medium text-atlas-700 hover:underline" onClick={() => openEvidence('feasibility')}>Feasibility study, section 4.2</button>
          </div>
        )}
      </div>
    )

  if (a.kind === 'permission')
    return (
      <div className="space-y-3">
        <Flag tone="muted" icon={<Lock className="size-3.5" />}>Outside your permission</Flag>
        {lead}
      </div>
    )

  if (a.kind === 'oos' || a.kind === 'text')
    return (
      <div className="space-y-3">
        {a.label && <Flag tone="info" icon={<Sparkles className="size-3.5" />}>{a.label}</Flag>}
        {lead}
      </div>
    )

  return (
    <div className="space-y-5">
      {(a.wave !== 'W1' || a.label) && (
        <div className="flex flex-wrap gap-1.5">
          {a.wave !== 'W1' && <Flag tone="dashed">Target state ({a.wave}): needs agreed partner data</Flag>}
          {a.label && <Flag tone="info" icon={<Sparkles className="size-3.5" />}>{a.label}</Flag>}
        </div>
      )}
      {lead}

      {a.figures && (
        <Section title="Key figures" aside={a.confidence && <span className="text-[12px] text-ink-3">Confidence <b className="font-semibold text-ink-2">{a.confidence}</b></span>}>
          <p className="tnum">{a.figures}</p>
        </Section>
      )}
      {a.rootCause && <Section title="Why"><p>{a.rootCause}</p></Section>}
      {a.impact && (
        <Section title="Impact">
          <dl className={cn('grid gap-px overflow-hidden rounded-lg border border-line bg-line', !compact && 'sm:grid-cols-3')}>
            {(['delivery', 'capex', 'commercial'] as const).map((k) => (
              <div key={k} className="bg-surface px-3 py-2.5">
                <dt className="text-[12px] font-medium text-ink-3">{k === 'capex' ? 'CAPEX' : k === 'delivery' ? 'Delivery' : 'Commercial'}</dt>
                <dd className="mt-0.5 text-[13px] leading-snug text-ink">{a.impact![k]}</dd>
              </div>
            ))}
          </dl>
        </Section>
      )}
      {a.table && (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[520px] text-[13px]">
            <thead className="bg-sunken/60 text-left text-ink-3"><tr><th className="px-3 py-2 font-medium">Action</th><th className="px-3 py-2 font-medium">Owner</th><th className="px-3 py-2 font-medium">Due</th><th className="px-3 py-2 font-medium">Authority</th></tr></thead>
            <tbody className="divide-y divide-line-soft">
              {BUNDLE.map((b) => <tr key={b.n}><td className="px-3 py-2 text-ink">{b.text}</td><td className="px-3 py-2">{b.owner}</td><td className="tnum px-3 py-2">{b.due}</td><td className="px-3 py-2"><AuthorityLabel a={b.authority} /></td></tr>)}
              {actions.filter((x) => !BUNDLE.some((b) => b.links === x.id)).slice(0, 4).map((x) => <tr key={x.id}><td className="px-3 py-2 text-ink">{x.title}</td><td className="px-3 py-2">{x.owner}</td><td className="tnum px-3 py-2">{x.due}</td><td className="px-3 py-2"><AuthorityLabel a={x.authority} /></td></tr>)}
            </tbody>
          </table>
        </div>
      )}
      {a.actions && (
        <Section title="Recommended actions" aside={<span className="text-[12px] text-ink-3">ATLAS recommends, people decide</span>}>
          <ol className="space-y-2.5">
            {a.actions.map((x, i) => {
              const done = proposals.includes(x.text)
              return (
                <li key={x.text} className="flex gap-3 rounded-lg border border-line bg-surface p-3">
                  <span className="tnum mt-px grid size-5 shrink-0 place-items-center rounded-full bg-sunken text-[12px] font-semibold text-ink-2">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] leading-snug text-ink">{x.text}</p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <AuthorityLabel a={x.authority} />
                      <Button size="sm" variant={done ? 'ghost' : 'outline'} disabled={done} onClick={() => propose(x.text)}>
                        <Plus />{done ? 'Proposed, awaiting confirmation' : 'Propose as action'}
                      </Button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </Section>
      )}
      {cited.length > 0 && (
        <Section title="Sources" aside={typeof a.classification === 'string' && <ClassChip c={a.classification} />}>
          <ul className={cn('grid gap-1.5', !compact && 'sm:grid-cols-2')}>
            {cited.map((s) => {
              const doc = s.doc ? EVIDENCE[s.doc] : undefined
              return (
                <li key={s.n}>
                  <button
                    disabled={!s.doc}
                    onClick={() => s.doc && openEvidence(s.doc)}
                    className="press flex w-full items-start gap-2.5 rounded-lg border border-line bg-surface px-3 py-2 text-left enabled:hover:border-atlas-300 enabled:hover:bg-atlas-50/50 disabled:cursor-default"
                  >
                    <span className="tnum mt-px grid size-[18px] shrink-0 place-items-center rounded bg-atlas-100 text-[12px] font-semibold text-atlas-800">{s.n}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium text-ink">{s.label}</span>
                      <span className="block truncate text-[12px] text-ink-3">{doc ? `${doc.system} · ${doc.location}` : 'ATLAS register'}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          <p className="mt-2 text-[12px] text-ink-3">Data date 30 Jun 2027, refreshed 08:30 WIB{a.confidence ? ` · Confidence ${a.confidence}` : ''}</p>
        </Section>
      )}
      {a.followups && a.followups.length > 0 && onFollow && (
        <div>
          <div className="mb-2 text-[12px] font-medium text-ink-3">Ask next</div>
          <div className="flex flex-col items-start gap-1.5">
            {a.followups.map((f) => (
              <button key={f} onClick={() => onFollow(f)} className="press inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-left text-[13px] text-ink-2 hover:border-atlas-300 hover:text-ink">
                <Sparkles className="size-3.5 shrink-0 text-atlas-600" />{ANSWERS[f].q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Cite({ n, label, onOpen }: { n: number; label: string; onOpen: () => void }) {
  return (
    <button onClick={onOpen} title={label} aria-label={`Source ${n}: ${label}`} className="press ml-1 inline-grid h-[18px] min-w-[18px] translate-y-[-2px] place-items-center rounded bg-atlas-100 px-1 align-middle text-[12px] font-semibold text-atlas-800 hover:bg-atlas-200">
      {n}
    </button>
  )
}

function Flag({ tone, icon, children }: { tone: 'warn' | 'info' | 'muted' | 'dashed'; icon?: ReactNode; children: ReactNode }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[12px] font-medium',
      tone === 'warn' && 'bg-warn-bg text-warn',
      tone === 'info' && 'bg-info-bg text-info',
      tone === 'muted' && 'bg-sunken text-ink-2',
      tone === 'dashed' && 'border border-dashed border-ink-4/50 text-ink-2',
    )}>{icon}{children}</span>
  )
}

function Section({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section>
      <div className="mb-1.5 flex items-center justify-between gap-2"><h4 className="text-[13px] font-semibold text-ink">{title}</h4>{aside}</div>
      <div className="text-[14px] leading-relaxed text-ink-2">{children}</div>
    </section>
  )
}

export function ClassLegend() {
  return <div className="flex gap-1.5">{['Reported', 'Verified', 'Forecast', 'Advisory'].map((c) => <ClassChip key={c} c={c} />)}</div>
}
