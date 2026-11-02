import {
  BookOpen, Building2, CalendarClock, ChartSpline, ChevronsLeft, ChevronsRight, ClipboardCheck, FileStack, Gauge, KeyRound, LayoutGrid, ListChecks, MessageSquareText, Package, RotateCcw, Route, Scale, Wallet, Workflow,
} from 'lucide-react'
import { useSyncExternalStore, type ComponentType } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { GROUPS, SCREENS } from '../../data/screens'
import { useDemo, usePersona } from '../../state/store'
import { useUi } from '../../state/ui'
import { Tip } from '../ui/tooltip'
import { AtlasMark } from './AtlasMark'

const ICONS: Record<number, ComponentType<{ className?: string }>> = {
  1: LayoutGrid, 8: Gauge, 9: ChartSpline, 10: Route, 11: Package, 12: Wallet,
  2: ListChecks, 3: CalendarClock, 4: KeyRound, 5: ClipboardCheck, 6: MessageSquareText, 7: FileStack,
  13: Scale, 14: Workflow,
}

const NARROW = '(max-width: 1279px)'
const subscribe = (cb: () => void) => { const m = window.matchMedia(NARROW); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb) }
/** Laptop widths get the icon rail so the content keeps its room. */
const useNarrow = () => useSyncExternalStore(subscribe, () => window.matchMedia(NARROW).matches)

export function Sidebar({ drawer = false }: { drawer?: boolean }) {
  const railCollapsed = useDemo((s) => s.railCollapsed)
  const narrow = useNarrow()
  const collapsed = drawer ? false : railCollapsed || narrow
  const setNavOpen = useUi((s) => s.setNavOpen)
  const setCollapsed = useDemo((s) => s.setRailCollapsed)
  const reset = useDemo((s) => s.reset)
  const setDefs = useUi((s) => s.setDefinitionsOpen)
  const { isPcu } = usePersona()

  return (
    <aside
      className={cn(
        'relative flex h-dvh shrink-0 flex-col bg-atlas-900 text-white transition-[width] duration-300 ease-[cubic-bezier(0.77,0,0.175,1)]',
        drawer ? 'w-[284px] max-w-[85vw]' : collapsed ? 'w-[72px]' : 'w-[264px]',
      )}
    >
      <div className={cn('flex h-16 items-center gap-2.5', collapsed ? 'justify-center px-0' : 'px-5')}>
        <AtlasMark className="size-7 shrink-0" />
        {!collapsed && <span className="text-[18px] font-semibold tracking-[-0.01em]">ATLAS <span className="font-normal text-atlas-200">Altimeda</span></span>}
      </div>
      {!drawer && !narrow && <button
        onClick={() => setCollapsed(!collapsed)}
        className="press absolute -right-3 top-5 z-10 grid size-6 place-items-center rounded-full bg-atlas-600 text-white ring-2 ring-canvas hover:bg-atlas-500"
        aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
      >
        {collapsed ? <ChevronsRight className="size-3.5" /> : <ChevronsLeft className="size-3.5" />}
      </button>}

      <div className={cn('px-3', collapsed && 'px-2.5')}>
        <div className={cn('flex items-center gap-3 rounded-xl border border-white/12 bg-white/[0.06] p-2.5', collapsed && 'justify-center p-2')}>
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-white text-atlas-900"><Building2 className="size-5" /></span>
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <div className="text-[12px] text-atlas-200">Your tenant</div>
              <div className="truncate text-[14px] font-semibold">Denera</div>
              <div className="truncate text-[12px] text-atlas-300/80">PT Daya Energi Bersih Nusantara</div>
            </div>
          )}
        </div>
      </div>

      <nav className="mt-4 min-h-0 flex-1 overflow-y-auto px-3 pb-3 [scrollbar-color:rgb(255_255_255/0.15)_transparent]" aria-label="Screens">
        {GROUPS.map((g) => (
          <div key={g.id} className="mb-3">
            {!collapsed ? (
              <div className="px-2.5 pb-1.5 text-[12px] font-medium text-atlas-300/90">{g.label}</div>
            ) : (
              <div className="mx-auto mb-2 h-px w-6 bg-white/15" />
            )}
            <ul className="space-y-0.5">
              {SCREENS.filter((s) => s.group === g.id).map((s) => {
                const Icon = ICONS[s.n]
                const hidden = isPcu && s.hiddenForPcu
                if (hidden) return null
                const link = (
                  <NavLink
                    to={s.path}
                    onClick={() => drawer && setNavOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'press flex items-center gap-3 rounded-md py-[7px] text-[13px] text-atlas-100/85 hover:bg-white/[0.07] hover:text-white',
                        collapsed ? 'justify-center px-0' : 'px-2.5',
                        isActive && 'bg-atlas-600 font-medium text-white hover:bg-atlas-600',
                      )
                    }
                  >
                    <Icon className="size-[18px] shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="min-w-0 flex-1 truncate">{s.short}</span>
                        <span className="tnum text-[12px] text-atlas-300/70">{s.n}</span>
                      </>
                    )}
                  </NavLink>
                )
                return <li key={s.path}>{collapsed ? <Tip side="right" content={`${s.n} · ${s.short}`}>{link}</Tip> : link}</li>
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className={cn('space-y-2 p-3', collapsed && 'px-2.5')}>
        {!collapsed ? (
          <div className="rounded-xl border border-white/12 bg-white/[0.06] p-3.5">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] font-semibold">Synthetic demo data</span>
              <span className="tnum text-[12px] text-atlas-200">30 Jun 2027</span>
            </div>
            <p className="mt-0.5 text-[12px] leading-snug text-atlas-200/90">All figures are illustrative.</p>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <button onClick={() => setDefs(true)} className="press inline-flex items-center justify-center gap-1.5 rounded-md bg-white/10 py-1.5 text-[12px] font-medium hover:bg-white/15">
                <BookOpen className="size-3.5" />Definitions
              </button>
              <button onClick={reset} className="press inline-flex items-center justify-center gap-1.5 rounded-md bg-atlas-600 py-1.5 text-[12px] font-medium hover:bg-atlas-500">
                <RotateCcw className="size-3.5" />Reset demo
              </button>
            </div>
          </div>
        ) : (
          <>
            <Tip side="right" content="Definitions"><button onClick={() => setDefs(true)} className="press mx-auto grid size-10 place-items-center rounded-md hover:bg-white/10" aria-label="Definitions"><BookOpen className="size-[18px]" /></button></Tip>
            <Tip side="right" content="Reset demo state"><button onClick={reset} className="press mx-auto grid size-10 place-items-center rounded-md hover:bg-white/10" aria-label="Reset demo state"><RotateCcw className="size-[18px]" /></button></Tip>
          </>
        )}
      </div>
    </aside>
  )
}
