import { Check, Download, FileText, Presentation, ShieldCheck, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Stamp, StatusChip } from '../components/atlas/chips'
import { ScreenFrame } from '../components/atlas/frame'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Segmented } from '../components/ui/tabs'
import { Tip } from '../components/ui/tooltip'
import { ANSWERS } from '../data/answers'
import { NARRATIVE } from '../data/cakrawala'
import { HISTORY } from '../data/scurve'
import { cn } from '../lib/cn'
import { useDemo, usePersona } from '../state/store'
import { ConfirmModal } from '../components/atlas/ConfirmModal'

type Version = 'pmo' | 'ic' | 'sponsor' | 'lender'

interface Section { id: string; title: string; line: string; figure?: string; chart?: boolean }

const BASE: Section[] = [
  { id: '1', title: 'Executive summary', line: NARRATIVE },
  { id: '2', title: 'Change since last week', line: 'Verified progress improved by 1.8% this week to 39%, 7.0 points behind plan.', figure: '+1.8%' },
  { id: '3', title: 'Overall project health and the rule applied', line: 'Yellow with escalation: four Red dimensions; exposure 42 days, at or below the 60-day line.', figure: 'Yellow, escalation' },
  { id: '4', title: 'S-curve and earned value movement', line: 'Planned 46%, reported 42%, verified 39%. SPI 0.85, CPI 0.96.', chart: true },
  { id: '5', title: 'Critical-path movement', line: 'COD exposure 42 days; 64 without intervention.', figure: '42 days' },
  { id: '6', title: 'CAPEX and cashflow outlook', line: 'Management EAC Rp2,910 bn; range Rp2,846 to 2,918 bn. Rp45 bn needs shareholder funding approval.', figure: 'Rp2,910 bn' },
  { id: '7', title: 'Long-lead procurement status', line: 'Boiler island six weeks late; flue-gas treatment 17 days.', figure: '−42 days float' },
  { id: '8', title: 'Engineering and design-approval status', line: 'Eleven overdue technical submittals.', figure: '11 overdue' },
  { id: '9', title: 'Waste supply status', line: '1,000 tonnes a day confirmed; collection fleet plan not evidenced.', figure: '1,000 t/day' },
  { id: '10', title: 'Financing conditions and drawdown readiness', line: 'Two conditions precedent open for the next drawdown: CP-1 insurance certificates, CP-2 independent engineer certificate.', figure: '2 CPs open' },
  { id: '11', title: 'HSE and quality status', line: 'No lost-time incident; 94% of actions closed.', figure: '94%' },
  { id: '12', title: 'Commercial notices and claims exposure', line: 'EPC notice due Tuesday 6 July 2027, confirmed.', figure: '6 days' },
  { id: '13', title: 'Top risks and mitigations', line: 'Two major risks without an effective owner: recovery programme credibility and grid connection date.', figure: '2 unowned' },
  { id: '14', title: 'Decisions required, with authority labels', line: 'Boiler Island Recovery Strategy: six actions, two Joint for the project company board.', figure: '1 decision' },
  { id: '15', title: 'Action-owner tracker', line: 'Four steering actions in hand; two earlier actions overdue.', figure: '6 open' },
]

const LENDER_EXTRA: Section[] = [
  { id: 'es', title: 'Environmental and social compliance', line: 'Evidence pack in progress.', figure: 'In progress' },
  { id: 'cov', title: 'Covenant headroom', line: 'Not yet loaded; lender reporting template to be agreed.', figure: 'Not loaded' },
]

const ORDER: Record<Version, string[]> = {
  pmo: BASE.map((s) => s.id),
  ic: ['14', '6', '3', '1', '2', '4', '5', '7', '8', '9', '10', '11', '12', '13', '15'],
  sponsor: ['1', '3', '5', '14', '2', '4', '6', '7', '8', '9', '10', '11', '12', '13', '15'],
  lender: ['10', 'es', 'cov', '6', '1', '3', '4', '5', '7', '9', '11', '12', '13', '14', '15'],
}

export function S07Packs() {
  const [params] = useSearchParams()
  const { isPcu } = usePersona()
  const [version, setVersion] = useState<Version>(isPcu ? 'pmo' : ((params.get('version') as Version) ?? 'pmo'))
  const [simple, setSimple] = useState(false)
  const stage = useDemo((s) => s.packStage)
  const setStage = useDemo((s) => s.setPackStage)
  const log = useDemo((s) => s.log)
  const approved = stage === 'Approved'
  const [approving, setApproving] = useState(false)

  const sections = useMemo(() => {
    const all = [...BASE, ...LENDER_EXTRA]
    return ORDER[version].map((id) => all.find((s) => s.id === id)!)
  }, [version])

  const exp = (kind: string) => {
    log('Exported pack', `${version.toUpperCase()} ${kind}`)
    toast.success('Pack exported', { description: `${kind}, ${version === 'ic' ? 'Investment Committee' : version} version` })
  }

  return (
    <ScreenFrame
      headline="The weekly pack for PSEL Cakrawala Raya is assembled and waiting for reviewer approval."
      status={approved ? 'Green' : 'Yellow'}
      statusLabel={approved ? 'Approved' : stage}
      aside={
        <>
          <Tip content={approved ? 'Export the approved pack' : 'Export is enabled after reviewer approval'}><span><Button variant="outline" disabled={!approved} onClick={() => exp('PDF')}><Download />Export PDF</Button></span></Tip>
          <Tip content={approved ? 'Export the approved pack' : 'Export is enabled after reviewer approval'}><span><Button variant="outline" disabled={!approved} onClick={() => exp('PowerPoint')}><Presentation />Export PowerPoint</Button></span></Tip>
        </>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {isPcu ? <span className="text-[13px] font-medium text-ink-2">PMO version (project company view)</span> : (
              <Segmented<Version> label="Pack version" value={version} onChange={setVersion} items={[{ value: 'pmo', label: 'PMO' }, { value: 'ic', label: 'Investment Committee' }, { value: 'sponsor', label: 'Danantara sponsor' }, { value: 'lender', label: 'Lender' }]} />
            )}
            <Button variant="ghost" size="sm" onClick={() => setSimple((v) => !v)} aria-pressed={simple}><Sparkles />{simple ? 'Show full narrative' : 'Ask NEXA to simplify the narrative'}</Button>
          </div>
          <article className="mt-4 rounded-xl border border-line bg-surface px-8 py-7">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line-soft pb-5">
              <div>
                <div className="text-[12px] font-medium text-ink-3">Weekly pack · week ending 30 Jun 2027 · Confidential</div>
                <h2 className="mt-1 text-[16px] font-semibold text-ink">PSEL Cakrawala Raya</h2>
              </div>
              {approved ? <Stamp kind="approved" who="PMO lead" when="30 Jun 2027" /> : <Stamp kind="draft" />}
            </header>
            <ol className="divide-y divide-line-soft">
              {sections.map((s, i) => (
                <li key={`${version}-${s.id}`} className="grid animate-rise gap-4 py-4 sm:grid-cols-[1fr_auto]" style={{ animationDelay: `${Math.min(i, 8) * 25}ms` }}>
                  <div className="min-w-0">
                    <h3 className="text-[16px] font-semibold text-ink">{s.title}</h3>
                    {s.id === '1' && simple ? (
                      <div className="mt-1.5 rounded-md bg-info-bg/60 p-3"><Stamp kind="draft" /><p className="mt-1.5 text-[14px] leading-relaxed text-ink">{ANSWERS['A-14'].direct}</p></div>
                    ) : <p className="mt-1 text-[14px] leading-relaxed text-ink-2">{s.line}</p>}
                    {s.chart && <MiniCurve />}
                  </div>
                  {s.figure && (
                    <Tip content="Governed layer, refreshed 30 Jun 2027 08:30">
                      <span tabIndex={0} className={cn('tnum self-start whitespace-nowrap rounded-md bg-sunken px-2.5 py-1 text-[13px] font-semibold text-ink', s.id === 'cov' && 'text-ink-3')}>{s.figure}</span>
                    </Tip>
                  )}
                </li>
              ))}
            </ol>
          </article>
        </div>

        <aside className="space-y-4">
          <Card className="px-[18px] py-4">
            <h3 className="text-[14px] font-semibold text-ink">Release</h3>
            <ol className="mt-3 space-y-3">
              {(['Draft', 'In review', 'Approved'] as const).map((st, i) => {
                const idx = ['Draft', 'In review', 'Approved'].indexOf(stage)
                const done = i < idx || approved
                const cur = i === idx && !approved
                return (
                  <li key={st} className="flex items-center gap-3 text-[13px]">
                    <span className={cn('grid size-6 place-items-center rounded-full border text-[12px] font-semibold', done ? 'border-ok bg-ok text-white' : cur ? 'border-atlas-600 text-atlas-700' : 'border-line text-ink-4')}>{done ? <Check className="size-3.5" /> : i + 1}</span>
                    <span className={cn(cur ? 'font-medium text-ink' : 'text-ink-2')}>{st === 'Approved' ? 'Approved by named reviewer' : st}</span>
                  </li>
                )
              })}
            </ol>
            <div className="mt-4 space-y-2">
              {stage === 'Draft' && <Button className="w-full" variant="outline" onClick={() => setStage('In review')}><FileText />Send to reviewer (PMO lead)</Button>}
              {stage === 'In review' && <Button className="w-full" onClick={() => setApproving(true)}><ShieldCheck />Approve as PMO lead</Button>}
              {approved && <p className="text-[13px] text-ok">Approved. Export is enabled.</p>}
            </div>
            <p className="mt-3 text-[12px] text-ink-3">Numbers come only from the governed layer. A named reviewer approves release.</p>
          </Card>
          <Card className="px-[18px] py-4">
            <h3 className="text-[14px] font-semibold text-ink">Headline status</h3>
            <div className="mt-2"><StatusChip h="Yellow" label="Yellow, escalation required" /></div>
          </Card>
        </aside>
      </div>
      <ConfirmModal
        open={approving}
        onClose={() => setApproving(false)}
        title="Approve the weekly pack"
        description="PSEL Cakrawala Raya, week ending 30 Jun 2027"
        confirmLabel="Approve pack"
        confirmIcon={<ShieldCheck />}
        onConfirm={() => { setStage('Approved'); toast.success('Approved by PMO lead', { description: 'Export is now enabled.' }) }}
        effects={['Stamp the pack as approved by you, with the time.', 'Enable PDF and PowerPoint export for every version.', 'Lock the numbers: figures come only from the governed layer.']}
        note="Check the lead sections first: health, S-curve movement and the decisions required."
      />
    </ScreenFrame>
  )
}

function MiniCurve() {
  const data = HISTORY.map((h) => ({ d: h.date, p: h.planned, v: h.verified, r: h.reported }))
  return (
    <div className="mt-3 h-[110px] max-w-[460px]" aria-label="Mini S-curve: planned 46%, reported 42%, verified 39%">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -28 }}>
          <XAxis dataKey="d" hide />
          <YAxis domain={[0, 50]} tick={{ fontSize: 12, fill: 'var(--color-ink-3)' }} axisLine={false} tickLine={false} />
          <Line dataKey="p" stroke="var(--color-series-planned)" strokeDasharray="5 4" strokeWidth={1.5} dot={false} isAnimationActive={false} />
          <Line dataKey="r" stroke="var(--color-series-reported)" strokeWidth={1.25} dot={false} isAnimationActive={false} />
          <Line dataKey="v" stroke="var(--color-series-verified)" strokeWidth={2.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
