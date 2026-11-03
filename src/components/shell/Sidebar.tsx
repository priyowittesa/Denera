import {
  CalendarClock, ChartSpline, ChevronDown, ChevronRight, ClipboardCheck, FileStack, Gauge, KeyRound, Landmark, LayoutGrid, ListChecks, Package, Route, Scale, ShieldCheck, Sparkles, Wallet, Workflow,
} from 'lucide-react'
import { useState, useSyncExternalStore, type ComponentType, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { cn } from '../../lib/cn'
import { GROUPS, SCREENS, type ScreenMeta } from '../../data/screens'
import { isOverdue } from '../../data/registers'
import { RUNS } from '../../data/runs'
import { useDemo, usePersona } from '../../state/store'
import { useUi } from '../../state/ui'
import { Tip } from '../ui/tooltip'
import { AtlasMark } from './AtlasMark'

type Icon = ComponentType<{ className?: string; strokeWidth?: number }>

const ICONS: Record<number, Icon> = {
  1: LayoutGrid, 8: Gauge, 9: ChartSpline, 10: Route, 11: Package, 12: Wallet,
  2: ListChecks, 3: CalendarClock, 4: KeyRound, 5: ClipboardCheck, 6: Sparkles, 7: FileStack,
  13: Scale, 14: Workflow,
}
const GROUP_ICONS: Record<Exclude<ScreenMeta['group'], 'ai'>, Icon> = { leading: Gauge, enabling: ShieldCheck, platform: Landmark }

const NARROW = '(max-width: 1279px)'
const subscribe = (cb: () => void) => { const m = window.matchMedia(NARROW); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb) }
/** Laptop widths get the icon rail so the content keeps its room. */
const useNarrow = () => useSyncExternalStore(subscribe, () => window.matchMedia(NARROW).matches)

/** Red count badge, as in the ATLAS module sidebar. */
function Count({ n }: { n: number }) {
  if (!n) return null
  return <span className="tnum grid h-[18px] min-w-[18px] place-items-center rounded-full bg-bad px-[5px] text-[10.5px] font-bold text-white">{n}</span>
}

const item = 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14.5px] text-white select-none hover:bg-white/[0.07] transition-colors duration-150'

export function Sidebar({ drawer = false }: { drawer?: boolean }) {
  const narrow = useNarrow()
  const collapsed = !drawer && narrow
  const setNavOpen = useUi((s) => s.setNavOpen)
  const actions = useDemo((s) => s.actions)
  const { isPcu } = usePersona()
  const { pathname } = useLocation()
  const [open, setOpen] = useState<Record<string, boolean>>({ leading: true, enabling: true, platform: true })

  const overdue = actions.filter((a) => (!isPcu || a.authority !== 'Shareholder (Denera)') && isOverdue(a)).length
  const waiting = RUNS.filter((r) => r.state === 'Waiting for human' && (!isPcu || !r.denaraOnly)).length
  const counts: Partial<Record<number, number>> = { 5: overdue, 14: waiting }

  const screens = (g: ScreenMeta['group']) => SCREENS.filter((s) => s.group === g && !(isPcu && s.hiddenForPcu))

  const leaf = (s: ScreenMeta, nested: boolean): ReactNode => {
    const I = ICONS[s.n]
    const link = (
      <NavLink
        to={s.path}
        onClick={() => drawer && setNavOpen(false)}
        aria-current={pathname === s.path ? 'page' : undefined}
        className={cn(
          item,
          'mb-0.5',
          nested && !collapsed && 'py-[9px] pl-10 text-[13.5px] text-[#ece6fd]',
          collapsed && 'justify-center px-0',
          pathname === s.path && 'bg-side-active text-white hover:bg-side-active',
        )}
      >
        <I className={nested ? 'size-[17px] shrink-0' : 'size-[19px] shrink-0'} strokeWidth={1.75} />
        {!collapsed && <span className="min-w-0 flex-1 truncate">{s.short}</span>}
        {!collapsed && <Count n={counts[s.n] ?? 0} />}
      </NavLink>
    )
    return <div key={s.path}>{collapsed ? <Tip side="right" content={s.short}>{link}</Tip> : link}</div>
  }

  return (
    <aside
      className={cn(
        'flex h-dvh shrink-0 flex-col bg-gradient-to-b from-side-top to-side-bottom pb-3.5 pt-[18px] text-white',
        drawer ? 'w-[256px] max-w-[85vw] px-2.5' : collapsed ? 'w-[72px] px-2' : 'w-[256px] px-2.5',
      )}
    >
      <div className={cn('flex items-center pb-[18px]', collapsed ? 'justify-center' : 'px-2 pt-0.5')}>
        <div className="flex items-center gap-2.5 text-[20px] font-bold tracking-[0.04em] text-white">
          <AtlasMark size={collapsed ? 30 : 34} />
          {!collapsed && <span>ATLAS</span>}
        </div>
      </div>

      <nav className="no-scrollbar min-h-0 flex-1 overflow-y-auto" aria-label="Modules">
        {!collapsed && <div className="px-3 pb-1.5 pt-3 text-[12.5px] font-medium text-side-label">Modules</div>}
        {/* NEXA Intelligence stands on its own at the top, like AI Insights in the ATLAS module sidebar */}
        {screens('ai').map((s) => leaf(s, false))}
        {GROUPS.map((g) => {
          const list = screens(g.id)
          if (!list.length) return null
          if (collapsed) {
            return (
              <div key={g.id} className="mb-1">
                <div className="mx-auto my-2 h-px w-6 bg-white/15" />
                {list.map((s) => leaf(s, false))}
              </div>
            )
          }
          const GI = GROUP_ICONS[g.id]
          const isOpen = open[g.id] ?? true
          return (
            <div key={g.id}>
              <button
                onClick={() => setOpen((o) => ({ ...o, [g.id]: !isOpen }))}
                aria-expanded={isOpen}
                className={cn(item, 'mb-0.5 w-full text-left')}
              >
                <GI className="size-[19px] shrink-0" strokeWidth={1.75} />
                <span className="min-w-0 flex-1 truncate">{g.label}</span>
                {isOpen ? <ChevronDown className="size-4 opacity-80" /> : <ChevronRight className="size-4 opacity-80" />}
              </button>
              {isOpen && <div>{list.map((s) => leaf(s, true))}</div>}
            </div>
          )
        })}
      </nav>

      {collapsed ? null : (
        <div className="mt-2.5 rounded-xl border border-side-card-line bg-side-card px-3.5 pb-3.5 pt-4 text-center text-[12.5px] leading-[1.4] text-[#e2d9fb]">
          <b className="mb-1 block text-[15px] font-semibold text-white">Expand Your Platform</b>
          Discover and add new modules to unlock more capabilities.
          <button onClick={() => toast('Opening the ATLAS module catalogue')} className="press mt-3 w-full rounded-lg bg-side-button py-2.5 text-[14px] font-medium text-white hover:bg-side-button-hover">
            Explore Modules
          </button>
        </div>
      )}
    </aside>
  )
}
