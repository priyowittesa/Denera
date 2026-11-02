import { ArrowUpRight, ChevronRight, FileText, Gavel, MessageSquare, Sparkles, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HEALTH_ICON, StatusChip, WaveTag } from '../components/atlas/chips'
import { AtlasCard, ScreenFrame } from '../components/atlas/frame'
import { HealthRulePop } from '../components/atlas/HealthRule'
import { ValuePanel } from '../components/atlas/ValuePanel'
import { Button } from '../components/ui/button'
import { Sheet } from '../components/ui/sheet'
import { Tip } from '../components/ui/tooltip'
import { NARRATIVE, PROJECT, SCORECARDS, WEEKLY_MOVEMENT, type Scorecard } from '../data/cakrawala'
import { ANSWERS } from '../data/answers'
import { cn } from '../lib/cn'
import { useDemo } from '../state/store'
import { useUi } from '../state/ui'

const RED_SIGNALS = ['Schedule Red: forecast COD slip of 42 days', 'Cost Red: Rp45 bn needs shareholder funding approval', 'Procurement Red: two critical packages late', 'Commercial Red: formal notice due in six days', 'Exposure 42 days, at or below 60, so overall Yellow; four Red dimensions raise the escalation flag. Without intervention exposure reaches 64 days and the rating turns Red.']

export function S08Cockpit() {
  const nav = useNavigate()
  const ask = useDemo((s) => s.ask)
  const openEvidence = useUi((s) => s.openEvidence)
  const [panel, setPanel] = useState<Scorecard | null>(null)

  return (
    <ScreenFrame
      headline="Cakrawala Raya is Yellow with escalation required. Without action this week it turns Red."
      answer={{ label: 'COD exposure', value: '42 days', tone: 'bad', foot: <>Rises to <b className="font-semibold text-bad">64 days</b> if nothing is decided this week.</> }}
      aside={
        <>
          <Button variant="outline" onClick={() => ask('A-05', ANSWERS['A-05'].q)}><Sparkles />Ask ATLAS</Button>
          <Button variant="outline" onClick={() => openEvidence('epc-schedule')}><FileText />See evidence</Button>
          <Button onClick={() => nav('/decisions')}><Gavel />View urgent decisions</Button>
        </>
      }
    >
      <HeaderStrip />

      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-labelledby="dims">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="dims" className="text-[17px] font-semibold tracking-[-0.012em] text-ink">Twelve health dimensions</h2>
            <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-bad"><TriangleAlert className="size-3.5" />Escalation flag: 4 of 12 Red</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SCORECARDS.map((c, i) => (
              <ScoreTile key={c.id} c={c} i={i} onOpen={() => (c.panel ? setPanel(c) : nav(c.to!))} />
            ))}
          </div>
        </section>
        <div className="flex flex-col gap-5">
          <AtlasCard title="ATLAS summary this week" tone="violet" sources={[{ label: 'Schedule update 28 Jun', doc: 'epc-schedule' }, { label: 'Transmittal log', doc: 'transmittal-boiler' }, { label: 'Cost report', doc: 'cost-report' }]} classification="Advisory" confidence="Medium">
            <p>{WEEKLY_MOVEMENT}</p>
            <div className="mt-3 flex items-center gap-2 rounded-md bg-surface px-3 py-2 text-[12.5px] text-ink-2">
              <Gavel className="size-4 shrink-0 text-[#8a3b12]" />2 of 6 recommended actions are Joint and need a project company board decision.
            </div>
          </AtlasCard>
          <section className="rounded-xl border border-line bg-surface p-5">
            <h3 className="text-[13px] font-semibold text-ink">Why this matters</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-2">{NARRATIVE}</p>
          </section>
        </div>
      </div>

      <ValuePanel ucs={['UC01']} />

      <Sheet open={!!panel} onOpenChange={(v) => !v && setPanel(null)} title={panel?.name ?? ''} description="Detail panel">
        {panel && (
          <div className="space-y-4">
            <div className="flex gap-2"><StatusChip h={panel.status} size="md" />{panel.wave && <WaveTag wave={panel.wave} />}</div>
            <p className="text-[14px] text-ink">{panel.text}</p>
            <div className="grid gap-3">
              {(panel.id === 'hse'
                ? [['HSE monthly report, June 2027', 'No lost-time incident; 47 of 50 actions closed (94%).'], ['Site inspection log', 'Two open observations on scaffolding, both within close-out period.']]
                : panel.id === 'quality'
                  ? [['Inspection and test plan tracker', 'ITP completion 38% against verified work 39%.'], ['Hold-point register', 'No hold point released without signature.']]
                  : [['Permit register', 'Utilities tie-in permit amendment awaiting regional approval; 9 days float.'], ['Stakeholder log', 'Community consultation minutes filed for June.']]
              ).map(([t, x]) => (
                <div key={t} className="rounded-md border border-line p-3"><div className="text-[12px] font-medium text-atlas-700">Evidence</div><div className="text-[13px] font-medium text-ink">{t}</div><div className="text-[12.5px] text-ink-3">{x}</div></div>
              ))}
            </div>
            <p className="text-[12.5px] text-ink-3">Data needed: {panel.wave === 'W3' ? 'HSE and quality records from the project company (Wave 3).' : 'Permit register and stakeholder log (Wave 1).'}</p>
          </div>
        )}
      </Sheet>
    </ScreenFrame>
  )
}

function HeaderStrip() {
  const items: { label: string; value: React.ReactNode; note?: string }[] = [
    { label: 'Stage', value: PROJECT.stage, note: 'Groundbreaking 3 Aug 2026' },
    { label: 'Target COD', value: PROJECT.targetCod, note: 'Forecast 11 Aug 2028' },
    { label: 'Approved CAPEX', value: 'Rp2,800 bn' },
    { label: 'Management EAC', value: 'Rp2,910 bn', note: 'Range Rp2,846 to 2,918 bn' },
  ]
  return (
    <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-[1.3fr_repeat(4,1fr)_1.1fr]">
      <div className="bg-atlas-50/70 px-5 py-4">
        <div className="text-[12px] font-medium text-ink-3">Overall health</div>
        <HealthRulePop
          signals={RED_SIGNALS}
          trigger={
            <button className="press mt-1.5 flex items-center gap-2 text-left">
              <StatusChip h="Yellow" size="md" label="Yellow, escalation required" />
            </button>
          }
        />
        <div className="mt-2 text-[12px] text-ink-3">Without action: <span className="font-semibold text-bad">Red, 64 days</span></div>
      </div>
      {items.map((i) => (
        <div key={i.label} className="bg-surface px-5 py-4">
          <div className="text-[12px] font-medium text-ink-3">{i.label}</div>
          <div className="tnum mt-1 text-[17px] font-semibold tracking-[-0.01em] text-ink">{i.value}</div>
          {i.note && <div className="text-[12px] text-ink-3">{i.note}</div>}
        </div>
      ))}
      <div className="bg-surface px-5 py-4 text-[12.5px] text-ink-2">
        <div><span className="text-ink-3">Data date </span><span className="tnum font-medium text-ink">30 Jun 2027</span> <span className="text-ink-3">08:30 WIB</span></div>
        <div className="mt-1"><span className="text-ink-3">Confidence </span><span className="tnum font-medium text-ink">91%</span></div>
        <a href="#/partner-data" className="mt-1 inline-flex items-center gap-0.5 font-medium text-atlas-700 hover:underline">Information rights 3 of 4<ChevronRight className="size-3.5" /></a>
      </div>
    </div>
  )
}

function ScoreTile({ c, i, onOpen }: { c: Scorecard; i: number; onOpen: () => void }) {
  const Icon = HEALTH_ICON[c.status]
    return (
    <button
      onClick={onOpen}
      style={{ animationDelay: `${i * 30}ms` }}
      className={'press group flex animate-rise flex-col rounded-xl border border-line bg-surface p-4 text-left transition-colors hover:border-atlas-300'}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13.5px] font-semibold text-ink">{c.name}</span>
        <span className={cn('inline-flex items-center gap-1 text-[12px] font-semibold', c.status === 'Red' ? 'text-bad' : c.status === 'Yellow' ? 'text-warn' : 'text-ok')}>
          <Icon className="size-3.5" strokeWidth={2.4} />{c.status}
        </span>
      </div>
      <p className={cn('mt-1.5 flex-1 text-[13px] leading-snug', c.status === 'Red' ? 'text-ink' : 'text-ink-3')}>{c.text}</p>
      <div className="mt-3 flex items-center justify-between border-t border-line-soft pt-2.5 text-[12px] text-ink-3">
        <span className="inline-flex items-center gap-1"><MessageSquare className="size-3.5" />Comment only</span>
        <Tip content="Open the module behind this signal"><span className="inline-flex items-center gap-0.5 font-medium text-atlas-700 opacity-80 group-hover:opacity-100">Open<ArrowUpRight className="size-3.5" /></span></Tip>
      </div>
    </button>
  )
}
