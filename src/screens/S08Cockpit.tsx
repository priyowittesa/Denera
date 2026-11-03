import { ArrowUpRight, Calculator, CalendarClock, FileText, Gavel, HardHat, HeartPulse, Info, KeyRound, Landmark, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HEALTH_ICON, StatusChip } from '../components/atlas/chips'
import { AtlasCard, ScreenFrame, StatTile } from '../components/atlas/frame'
import { HealthRulePop } from '../components/atlas/HealthRule'
import { Button } from '../components/ui/button'
import { Sheet } from '../components/ui/sheet'
import { NARRATIVE, PROJECT, SCORECARDS, WEEKLY_MOVEMENT, type Scorecard } from '../data/cakrawala'
import { ANSWERS } from '../data/answers'
import { cn } from '../lib/cn'
import { CommentButton, CommentsModal } from '../components/atlas/Comments'
import { useDemo } from '../state/store'
import { useUi } from '../state/ui'

const RED_SIGNALS = ['Schedule Red: forecast COD slip of 42 days', 'Cost Red: Rp45 bn needs shareholder funding approval', 'Procurement Red: two critical packages late', 'Commercial Red: formal notice due in six days', 'Exposure 42 days, at or below 60, so overall Yellow; four Red dimensions raise the escalation flag. Without intervention exposure reaches 64 days and the rating turns Red.']

export function S08Cockpit() {
  const [commenting, setCommenting] = useState<Scorecard | null>(null)
  const nav = useNavigate()
  const ask = useDemo((s) => s.ask)
  const openEvidence = useUi((s) => s.openEvidence)
  const [panel, setPanel] = useState<Scorecard | null>(null)

  return (
    <ScreenFrame
      headline="Cakrawala Raya is Yellow with escalation required. Without action this week it turns Red."
      answer={{ label: 'COD exposure', value: '42 days', tone: 'bad', foot: <>Rises to <b className="font-semibold text-bad">64 days</b> if nothing is decided this week.</>, stake: ['UC01'] }}
      aside={
        <>
          <Button variant="outline" onClick={() => ask('A-05', ANSWERS['A-05'].q)}><Sparkles />Why is it behind plan?</Button>
          <Button variant="outline" onClick={() => openEvidence('epc-schedule')}><FileText />See evidence</Button>
          <Button onClick={() => nav('/decisions')}><Gavel />View urgent decisions</Button>
        </>
      }
    >
      <HeaderStrip />

      {/* Health dimensions use the full width: 2 columns on tablets, 3 on laptops, 4 on wide screens */}
      <section aria-labelledby="dims" className="mt-[18px]">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="dims" className="text-[16px] font-semibold text-ink">Twelve health dimensions</h2>
          <span className="text-[13px] text-ink-3">Computed by ATLAS. Ratings can be commented on, not edited. <span className="font-medium text-bad">4 of 12 Red</span></span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {SCORECARDS.map((c, i) => (
            <ScoreTile key={c.id} c={c} i={i} onOpen={() => (c.panel ? setPanel(c) : nav(c.to!))} onComment={() => setCommenting(c)} />
          ))}
        </div>
      </section>

      {/* ATLAS read-out: two cards side by side, same height */}
      <div className="mt-[18px] grid grid-cols-1 gap-[18px] lg:grid-cols-2 lg:items-stretch">
        <AtlasCard className="h-full" title="What changed this week" tone="violet" sources={[{ label: 'Schedule update 28 Jun', doc: 'epc-schedule' }, { label: 'Transmittal log', doc: 'transmittal-boiler' }, { label: 'Cost report', doc: 'cost-report' }]} classification="Advisory" confidence="Medium">
          <p>{WEEKLY_MOVEMENT}</p>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-sunken px-3 py-2 text-[13px] text-ink-2">
            <Gavel className="size-4 shrink-0 text-[#8a3b12]" />2 of 6 recommended actions are Joint and need a project company board decision.
          </div>
        </AtlasCard>
        <AtlasCard className="h-full" title="Why this matters" kind="insight" sources={[{ label: 'Critical path', doc: 'review-comment' }, { label: 'Procurement tower', doc: 'vendor-email' }]} classification="Advisory" confidence="Medium">
          <p>{NARRATIVE}</p>
        </AtlasCard>
      </div>

      <Sheet open={!!panel} onOpenChange={(v) => !v && setPanel(null)} title={panel?.name ?? ''} description="Detail panel">
        {panel && (
          <div className="space-y-4">
            <div className="flex gap-2"><StatusChip h={panel.status} size="md" /></div>
            <p className="text-[14px] text-ink">{panel.text}</p>
            <div className="grid gap-3">
              {(panel.id === 'hse'
                ? [['HSE monthly report, June 2027', 'No lost-time incident; 47 of 50 actions closed (94%).'], ['Site inspection log', 'Two open observations on scaffolding, both within close-out period.']]
                : panel.id === 'quality'
                  ? [['Inspection and test plan tracker', 'ITP completion 38% against verified work 39%.'], ['Hold-point register', 'No hold point released without signature.']]
                  : [['Permit register', 'Utilities tie-in permit amendment awaiting regional approval; 9 days float.'], ['Stakeholder log', 'Community consultation minutes filed for June.']]
              ).map(([t, x]) => (
                <div key={t} className="rounded-md border border-line p-3"><div className="text-[12px] font-medium text-atlas-700">Evidence</div><div className="text-[13px] font-medium text-ink">{t}</div><div className="text-[13px] text-ink-3">{x}</div></div>
              ))}
            </div>
            <p className="text-[13px] text-ink-3">Source: {panel.wave === 'W3' ? 'HSE and quality records from the project company.' : 'Permit register and stakeholder log.'}</p>
          </div>
        )}
      </Sheet>
      <CommentsModal k={commenting ? `health-${commenting.id}` : null} label={commenting?.name ?? ''} onClose={() => setCommenting(null)} context={commenting && <div className="flex items-start gap-2 rounded-[10px] bg-sunken px-3.5 py-3 text-[13px]"><StatusChip h={commenting.status} /><span className="text-ink-2">{commenting.text}</span></div>} />
    </ScreenFrame>
  )
}

function HeaderStrip() {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      <StatTile icon={HeartPulse} tone="warn" label="Overall health" value={<span className="text-[16px]">Yellow, escalation</span>} cap={<>Without action: <span className="font-semibold text-bad">Red, 64 days</span></>}>
        <HealthRulePop signals={RED_SIGNALS} trigger={<button className="press mt-1 inline-flex items-center gap-1 text-[13px] font-medium text-atlas-700 hover:underline"><Info className="size-3.5" />How is this rated?</button>} />
      </StatTile>
      <StatTile icon={HardHat} label="Stage" value={PROJECT.stage} cap={PROJECT.epcContractor} />
      <StatTile icon={CalendarClock} label="Target COD" value={PROJECT.targetCod} cap="Forecast 11 Aug 2028" />
      <StatTile icon={Landmark} label="Approved CAPEX" value="Rp2,800 bn" cap="Contingency Rp176 bn" />
      <StatTile icon={Calculator} label="Management EAC" value="Rp2,910 bn" cap="Range Rp2,846 to 2,918 bn" />
      <StatTile icon={KeyRound} label="Information rights" value="3 of 4" cap="Data confidence 91%" onClick={() => { window.location.hash = '#/partner-data' }} />
    </div>
  )
}

function ScoreTile({ c, i, onOpen, onComment }: { c: Scorecard; i: number; onOpen: () => void; onComment: () => void }) {
  const Icon = HEALTH_ICON[c.status]
  return (
    <div style={{ animationDelay: `${i * 30}ms` }} className="group flex animate-rise flex-col rounded-xl border border-line bg-surface transition-colors hover:border-atlas-300">
      <button onClick={onOpen} className="press flex flex-1 flex-col rounded-t-xl px-4 pt-3.5 text-left" aria-label={`${c.name}, ${c.status}. Open`}>
        <div className="flex w-full items-center justify-between gap-2">
          <span className="text-[14px] font-semibold text-ink">{c.name}</span>
          <span className={cn('inline-flex items-center gap-1 text-[12px] font-semibold', c.status === 'Red' ? 'text-bad' : c.status === 'Yellow' ? 'text-warn' : 'text-ok')}>
            <Icon className="size-3.5" strokeWidth={2.4} />{c.status}
          </span>
        </div>
        <p className="mt-1 flex-1 text-[13px] leading-snug text-ink-3">{c.text}</p>
      </button>
      <div className="flex items-center justify-between px-2.5 pb-2 pt-1.5">
        <CommentButton k={`health-${c.id}`} label={c.name} onOpen={onComment} />
        <button onClick={onOpen} className="press inline-flex items-center gap-0.5 rounded-md px-1.5 py-1 text-[12px] font-medium text-atlas-700 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100" tabIndex={-1} aria-hidden>Open<ArrowUpRight className="size-3.5" /></button>
      </div>
    </div>
  )
}
