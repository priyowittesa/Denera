import * as D from '@radix-ui/react-dialog'
import { EyeOff } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { HashRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AssistantPanel } from './components/shell/AssistantPanel'
import { ActionBar, AuditSheet, DefinitionsSheet, EvidenceDrawer, RegisterSheet } from './components/shell/Overlays'
import { Sidebar } from './components/shell/Sidebar'
import { Topbar } from './components/shell/Topbar'
import { TooltipProvider } from './components/ui/tooltip'
import { PERSONAS } from './data/personas'
import { screenByPath } from './data/screens'
import { useDemo, usePersona } from './state/store'
import { useUi } from './state/ui'
import { cn } from './lib/cn'
import { S01Portfolio } from './screens/S01Portfolio'
import { S02Gates } from './screens/S02Gates'
import { S03Notices } from './screens/S03Notices'
import { S04PartnerData } from './screens/S04PartnerData'
import { S05Meetings } from './screens/S05Meetings'
import { S06Ask } from './screens/S06Ask'
import { S07Packs } from './screens/S07Packs'
import { S08Cockpit } from './screens/S08Cockpit'
import { S09Progress } from './screens/S09Progress'
import { S10CriticalPath } from './screens/S10CriticalPath'
import { S11Procurement } from './screens/S11Procurement'
import { S12Cost } from './screens/S12Cost'
import { S13Decisions } from './screens/S13Decisions'
import { S14Orchestration } from './screens/S14Orchestration'

function Layout() {
  const { pathname } = useLocation()
  const { isPcu } = usePersona()
  const main = useRef<HTMLDivElement>(null)
  useEffect(() => {
    main.current?.scrollTo({ top: 0 })
    const m = screenByPath(pathname)
    document.title = m ? `${m.short} · ATLAS Denera` : 'ATLAS Denera'
  }, [pathname])
  const navOpen = useUi((s) => s.navOpen)
  const setNavOpen = useUi((s) => s.setNavOpen)
  const isAsk = pathname === '/ask'
  const meta = screenByPath(pathname)
  if (isPcu && meta?.hiddenForPcu) return <Navigate to="/cockpit" replace />

  return (
    <div className="flex h-dvh overflow-hidden">
      <div className="hidden lg:flex"><Sidebar /></div>
      <D.Root open={navOpen} onOpenChange={setNavOpen}>
        <D.Portal>
          <D.Overlay className="fixed inset-0 z-[60] animate-fade bg-atlas-950/40 lg:hidden" />
          <D.Content className="fixed inset-y-0 left-0 z-[61] animate-[drawer-left_280ms_var(--ease-drawer)] outline-none lg:hidden" aria-describedby={undefined}>
            <D.Title className="sr-only">Navigation</D.Title>
            <Sidebar drawer />
          </D.Content>
        </D.Portal>
      </D.Root>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main ref={main} className={cn('relative min-h-0 flex-1', isAsk ? 'flex flex-col overflow-hidden' : 'overflow-y-auto scroll-pb-24 scroll-pt-4')}>
          {isPcu && (
            <div className="flex items-center gap-2 border-b border-line bg-sunken px-4 py-2 sm:px-6 text-[13px] text-ink-2">
              <EyeOff className="size-3.5" />Project company view. Denera-only content is hidden.
            </div>
          )}
          <div key={pathname} className={cn('animate-fade', isAsk && 'min-h-0 flex-1')}>
            <Outlet />
          </div>
          {!isAsk && <ActionBar />}
        </main>
      </div>
      <AssistantPanel />
      <EvidenceDrawer />
      <RegisterSheet />
      <DefinitionsSheet />
      <AuditSheet />
    </div>
  )
}

function Landing() {
  const id = useDemo((s) => s.persona)
  return <Navigate to={PERSONAS[id].landing} replace />
}

export default function App() {
  return (
    <TooltipProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="portfolio" element={<S01Portfolio />} />
            <Route path="gates" element={<S02Gates />} />
            <Route path="notices" element={<S03Notices />} />
            <Route path="partner-data" element={<S04PartnerData />} />
            <Route path="meetings" element={<S05Meetings />} />
            <Route path="ask" element={<S06Ask />} />
            <Route path="packs" element={<S07Packs />} />
            <Route path="cockpit" element={<S08Cockpit />} />
            <Route path="progress" element={<S09Progress />} />
            <Route path="critical-path" element={<S10CriticalPath />} />
            <Route path="procurement" element={<S11Procurement />} />
            <Route path="cost" element={<S12Cost />} />
            <Route path="decisions" element={<S13Decisions />} />
            <Route path="orchestration" element={<S14Orchestration />} />
            <Route path="*" element={<Landing />} />
          </Route>
        </Routes>
      </HashRouter>
      <Toaster position="bottom-right" offset={72} toastOptions={{ style: { fontFamily: 'Geist, sans-serif', fontSize: 13 } }} />
    </TooltipProvider>
  )
}
