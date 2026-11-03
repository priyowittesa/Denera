import { Calculator, Filter, Truck, X } from 'lucide-react'
import { useState } from 'react'
import { ActionRoute } from '../components/atlas/ActionRoute'
import { AuthorityLabel, StatusChip } from '../components/atlas/chips'
import { ImpactStrip, ScreenFrame } from '../components/atlas/frame'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Sheet } from '../components/ui/sheet'
import { Tip } from '../components/ui/tooltip'
import { ANSWERS } from '../data/answers'
import { BOILER_DETAIL, PACKAGES, type DateBasis, type Package } from '../data/procurement'
import { cn } from '../lib/cn'
import { useDemo } from '../state/store'
import { RequestModal, type RequestSpec } from '../components/atlas/RequestModal'

const BASIS: Record<DateBasis, { I: typeof Truck; c: string; tip: string }> = {
  'ATLAS-estimated': { I: Calculator, c: 'text-atlas-700 bg-atlas-50 !border-atlas-200', tip: 'ATLAS estimated this date from manufacturing progress, inspections and transit time. It is a forecast, not a vendor commitment.' },
  'Vendor-reported': { I: Truck, c: 'text-ink-2 bg-sunken !border-line', tip: 'The vendor reported this date. ATLAS has not verified it.' },
  'Not available': { I: X, c: 'text-ink-3 bg-surface border-dashed !border-ink-4', tip: 'No date has been provided. Vendor milestone reporting is not yet in the contract.' },
}

export function S11Procurement() {
  const [filter, setFilter] = useState(false)
  const [detail, setDetail] = useState<Package | null>(null)
  const ask = useDemo((s) => s.ask)
  const rows = filter ? PACKAGES.filter((p) => (p.effectDays ?? 0) > 14) : PACKAGES

  const applyFilter = () => {
    setFilter(true)
    ask('A-09', ANSWERS['A-09'].q)
  }

  const [req, setReq] = useState<RequestSpec | null>(null)
  const requests = useDemo((s) => s.requests)
  const act = (p: Package) => setReq({
    key: `pkg-${p.name}`,
    title: `${p.action}: ${p.name}`,
    to: p.authority === 'Shareholder (Denera)' ? 'Denera Project Steering Committee' : p.authority === 'Joint' ? 'Project company board' : 'Project company, procurement',
    route: p.authority === 'Shareholder (Denera)' ? 'Shareholder (Denera) escalation' : p.authority === 'Joint' ? 'Joint: through the board nominee' : 'Request through the board nominee',
    authority: p.authority!,
    subject: `${p.action}: ${p.name}`,
    message: `${p.name} (${p.vendor}) is forecast ${p.forecast} against a required-on-site date of ${p.required}. Please ${p.action.toLowerCase()} and confirm the recovered date.`,
    due: '2027-07-06',
    owner: p.authority === 'Shareholder (Denera)' ? 'PMO Director' : 'Procurement Lead',
    linked: p.name,
    source: 'Procurement',
    confirmLabel: p.authority === 'Shareholder (Denera)' ? 'Escalate' : 'Send request',
  })

  return (
    <ScreenFrame
      headline="Two packages can delay COD by more than 14 days; the boiler island is the critical one at minus 42 days of float."
      status="Red"
      statusLabel="Procurement Red"
      sub="Five long-lead packages tracked against required-on-site dates."
      answer={{ label: 'Packages that can move COD', value: '2 of 5', tone: 'bad', foot: 'Boiler island at minus 42 days of float, flue-gas treatment at minus 17.', stake: ['UC07'] }}
    >
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
          <h2 className="text-[16px] font-semibold text-ink">Long-lead packages</h2>
          <div className="flex flex-wrap items-center gap-2">
            {filter ? (
              <button onClick={() => setFilter(false)} className="press inline-flex items-center gap-1.5 rounded-full bg-atlas-700 px-3 py-1.5 text-[13px] font-medium text-white">
                Can delay COD by more than 14 days<X className="size-3.5" />
              </button>
            ) : (
              <Button variant="outline" size="sm" onClick={applyFilter}><Filter />Can delay COD by more than 14 days</Button>
            )}
          </div>
        </div>
        <ul className="mt-3 divide-y divide-line-soft border-t border-line lg:hidden">
          {rows.map((p) => {
            const B = BASIS[p.basis]
            const late = (p.effectDays ?? 0) > 14
            return (
              <li key={p.id} className={cn('animate-fade px-4 py-4 sm:px-5', p.id === 'boiler' && 'bg-bad-bg/30')}>
                <div className="flex items-start justify-between gap-3">
                  <button onClick={() => setDetail(p)} className="press min-w-0 text-left">
                    <span className="block font-semibold text-ink hover:text-atlas-700">{p.name}</span>
                    <span className="text-[12px] text-ink-3">{p.vendor}</span>
                  </button>
                  <StatusChip h={p.risk} />
                </div>
                <dl className="tnum mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-[13px]">
                  <div><dt className="text-[12px] text-ink-3">Schedule effect</dt><dd className={cn('font-semibold', late ? 'text-bad' : 'text-ink')}>{p.effect}</dd></div>
                  <div><dt className="text-[12px] text-ink-3">Float to need date</dt><dd className={cn('font-semibold', p.float.startsWith('Minus') ? 'text-bad' : p.float === 'Unknown' ? 'text-ink-3' : 'text-ink')}>{p.float}</dd></div>
                  <div><dt className="text-[12px] text-ink-3">Required on site</dt><dd className="text-ink">{p.required}</dd></div>
                  <div><dt className="text-[12px] text-ink-3">Forecast</dt><dd className="flex flex-wrap items-center gap-1.5 text-ink">{p.forecast}<span className={cn('inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[12px] font-medium', B.c)}><B.I className="size-3" />{p.basis}</span></dd></div>
                </dl>
                {p.authority ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2"><AuthorityLabel a={p.authority} /><ActionRoute authority={p.authority} verb={p.action} onAct={() => act(p)} disabled={requests.includes(`pkg-${p.name}`)} className="h-auto min-h-9 whitespace-normal py-1.5 text-left" /></div>
                ) : <p className="mt-3 text-[13px] text-ink-3">{p.action}</p>}
              </li>
            )
          })}
        </ul>
        <div className="mt-3 hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[1040px]">
            <thead className="border-y border-line text-left text-[12px] text-ink-3">
              <tr>
                <th className="font-medium">Package</th>
                <th className="font-medium">Required on site</th>
                <th className="font-medium">Current forecast</th>
                <th className="font-medium">Date basis</th>
                <th className="text-right font-medium">Schedule effect</th>
                <th className="text-right font-medium">Float to need date</th>
                <th className="font-medium">Risk</th>
                <th className="font-medium">Recommended action</th>
              </tr>
            </thead>
            <tbody className="tnum divide-y divide-line-soft text-[13px]">
              {rows.map((p) => {
                const B = BASIS[p.basis]
                return (
                  <tr key={p.id} className={cn('animate-fade', p.id === 'boiler' && 'bg-bad-bg/30')}>
                    <td>
                      <button onClick={() => setDetail(p)} className="press whitespace-nowrap text-left font-semibold text-ink hover:text-atlas-700 hover:underline">{p.name}</button>
                      <div className="text-[12px] text-ink-3">{p.vendor}</div>
                    </td>
                    <td className="whitespace-nowrap">{p.required}</td>
                    <td className={cn('whitespace-nowrap px-3 py-3', p.basis === 'Not available' && 'text-ink-3')}>{p.forecast}</td>
                    <td>
                      <Tip content={B.tip}><span tabIndex={0} className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-transparent px-2 py-0.5 text-[12px] font-medium', B.c)}><B.I className="size-3" />{p.basis}</span></Tip>
                    </td>
                    <td className={cn('px-3 py-3 text-right', p.effectDays && p.effectDays > 14 && 'font-semibold text-bad')}>{p.effect}</td>
                    <td className={cn('whitespace-nowrap px-3 py-3 text-right font-medium', p.float.startsWith('Minus') && 'text-bad', p.float === 'Unknown' && 'text-ink-3')}>{p.float}</td>
                    <td><StatusChip h={p.risk} /></td>
                    <td>
                      {p.authority ? (
                        <div className="flex flex-col items-start gap-1.5">
                          <AuthorityLabel a={p.authority} />
                          <ActionRoute authority={p.authority} verb={p.action} onAct={() => act(p)} disabled={requests.includes(`pkg-${p.name}`)} className="h-auto min-h-8 whitespace-normal py-1.5 text-left" />
                        </div>
                      ) : <span className="text-ink-3">{p.action}</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-4 px-5 py-3 text-[12px] text-ink-3">
          {(Object.keys(BASIS) as DateBasis[]).map((b) => { const B = BASIS[b]; return <span key={b} className="inline-flex items-center gap-1.5"><span className={cn('grid size-4 place-items-center rounded-sm', B.c)}><B.I className="size-2.5" /></span>{b}</span> })}
        </div>
      </Card>

      <div className="mt-5">
        <ImpactStrip delivery={['42 days', 'Boiler island drives COD exposure']} capex={['Rp120 bn', 'Open commitment on the boiler island']} commercial={['EPC', 'Contractor responsible for vendor performance']} />
      </div>

      <Sheet open={!!detail} onOpenChange={(v) => !v && setDetail(null)} title={detail?.name ?? ''} description={detail ? `${detail.vendor} · forecast ${detail.forecast} · ${detail.basis}` : ''}>
        {detail?.id === 'boiler' ? (
          <dl className="divide-y divide-line-soft">
            {BOILER_DETAIL.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[180px_1fr] gap-3 py-2.5 text-[13px]">
                <dt className="text-ink-3">{k}</dt>
                <dd className={cn('text-ink', /Overdue|Not yet|not started/i.test(v) && 'font-medium text-bad')}>{v}</dd>
              </div>
            ))}
          </dl>
        ) : detail && (
          <div className="space-y-3 text-[13px] text-ink-2">
            <p>Required on site {detail.required}; forecast {detail.forecast} ({detail.basis}).</p>
            <p>Float to need date: <b className="text-ink">{detail.float}</b>. Detailed vendor milestones are tracked for the boiler island.</p>
          </div>
        )}
      </Sheet>
      <RequestModal spec={req} onClose={() => setReq(null)} />
    </ScreenFrame>
  )
}
