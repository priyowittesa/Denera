import * as DM from '@radix-ui/react-dropdown-menu'
import { Bell, Check, ChevronDown, ChevronRight, Menu, Sparkles } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { PERSONA_ORDER, PERSONAS } from '../../data/personas'
import { GROUPS, screenByPath } from '../../data/screens'
import { useDemo, usePersona } from '../../state/store'
import { useUi } from '../../state/ui'
import { Button } from '../ui/button'

export function Topbar() {
  const { pathname } = useLocation()
  const meta = screenByPath(pathname)
  const group = GROUPS.find((g) => g.id === meta?.group)
  const { persona } = usePersona()
  const setPersona = useDemo((s) => s.setPersona)
  const assistantOpen = useDemo((s) => s.assistantOpen)
  const setAssistantOpen = useDemo((s) => s.setAssistantOpen)
  const setAudit = useUi((s) => s.setAuditOpen)
  const setNavOpen = useUi((s) => s.setNavOpen)
  const nav = useNavigate()

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-line bg-surface/95 px-3 backdrop-blur-[2px] sm:gap-4 sm:px-6">
      <button onClick={() => setNavOpen(true)} className="press grid size-10 shrink-0 place-items-center rounded-md text-ink-2 hover:bg-sunken lg:hidden" aria-label="Open navigation"><Menu className="size-5" /></button>
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[13.5px] text-ink-3">
        <span className="hidden md:inline">Denera</span>
        <ChevronRight className="hidden size-3.5 text-ink-4 md:block" />
        <span className="hidden truncate xl:inline">{group?.label ?? 'Workspace'}</span>
        <ChevronRight className="hidden size-3.5 text-ink-4 xl:block" />
        <span className="truncate font-medium text-ink">{meta?.title ?? 'Screen'}</span>
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
        <span className="hidden items-center gap-1.5 whitespace-nowrap rounded-md bg-sunken px-2.5 py-1.5 text-[12px] text-ink-2 xl:inline-flex">
          <span className="size-1.5 rounded-full bg-ok" />
          Data date <span className="tnum font-medium text-ink">30 Jun 2027</span><span className="text-ink-3">· 08:30 WIB</span>
        </span>
        <Button variant="outline" size="md" onClick={() => setAssistantOpen(!assistantOpen)} aria-pressed={assistantOpen} aria-label="Ask ATLAS" className={cn('text-atlas-700 [&_svg]:text-atlas-600', assistantOpen && 'border-atlas-300 bg-atlas-50')}>
          <Sparkles /><span className="hidden sm:inline">Ask ATLAS</span>
        </Button>
        <button onClick={() => setAudit(true)} className="press relative grid size-9 place-items-center rounded-md text-ink-2 hover:bg-sunken" aria-label="Audit log">
          <Bell className="size-[18px]" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-bad ring-2 ring-surface" />
        </button>
        <div className="mx-1 hidden h-7 w-px bg-line sm:block" />
        <DM.Root>
          <DM.Trigger asChild>
            <button className="press flex items-center gap-2.5 rounded-md py-1 pl-1 pr-2 hover:bg-sunken" aria-label="Switch role">
              <span className="grid size-8 place-items-center rounded-full bg-atlas-100 text-[12px] font-semibold text-atlas-800">{persona.initials}</span>
              <span className="hidden text-left leading-tight lg:block">
                <span className="block whitespace-nowrap text-[13px] font-medium text-ink">{persona.name}</span>
                <span className="block whitespace-nowrap text-[11.5px] text-ink-3">{persona.role}</span>
              </span>
              <ChevronDown className="hidden size-4 text-ink-3 sm:block" />
            </button>
          </DM.Trigger>
          <DM.Portal>
            <DM.Content align="end" sideOffset={6} className="float z-[70] w-[340px] origin-[var(--radix-dropdown-menu-content-transform-origin)] animate-pop rounded-lg bg-surface p-1.5">
              <DM.Label className="px-2.5 pb-1.5 pt-1 text-[12px] font-medium text-ink-3">View the prototype as</DM.Label>
              {PERSONA_ORDER.map((id) => {
                const p = PERSONAS[id]
                const active = persona.id === id
                return (
                  <DM.Item
                    key={id}
                    onSelect={() => {
                      setPersona(id)
                      nav(p.landing)
                    }}
                    className="flex cursor-pointer gap-3 rounded-md px-2.5 py-2 outline-none data-[highlighted]:bg-sunken"
                  >
                    <span className={cn('mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold', active ? 'bg-atlas-700 text-white' : 'bg-atlas-100 text-atlas-800')}>{p.initials}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between text-[13px] font-medium text-ink">{p.name}{active && <Check className="size-4 text-atlas-700" />}</span>
                      <span className="block text-[12px] leading-snug text-ink-3">{p.actsAs}</span>
                    </span>
                  </DM.Item>
                )
              })}
            </DM.Content>
          </DM.Portal>
        </DM.Root>
      </div>
    </header>
  )
}
