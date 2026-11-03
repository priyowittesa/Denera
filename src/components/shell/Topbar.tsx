import * as DM from '@radix-ui/react-dropdown-menu'
import { BookOpen, Check, ChevronDown, ChevronRight, Menu, RotateCcw, Sparkles } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { PERSONA_ORDER, PERSONAS } from '../../data/personas'
import { GROUPS, screenByPath } from '../../data/screens'
import { useDemo, usePersona } from '../../state/store'
import { useUi } from '../../state/ui'
import { Button } from '../ui/button'
import { Notifications } from './Notifications'

export function Topbar() {
  const { pathname } = useLocation()
  const meta = screenByPath(pathname)
  const group = GROUPS.find((g) => g.id === meta?.group)
  const { persona } = usePersona()
  const setPersona = useDemo((s) => s.setPersona)
  const assistantOpen = useDemo((s) => s.assistantOpen)
  const setAssistantOpen = useDemo((s) => s.setAssistantOpen)
  const setNavOpen = useUi((s) => s.setNavOpen)
  const nav = useNavigate()
  const setDefs = useUi((s) => s.setDefinitionsOpen)
  const reset = useDemo((s) => s.reset)

  return (
    <header className="sticky top-0 z-30 flex h-[60px] shrink-0 items-center gap-2 border-b border-line bg-surface px-3 sm:gap-4 sm:px-7">
      <button onClick={() => setNavOpen(true)} className="press grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-surface text-ink-2 hover:bg-sunken lg:hidden" aria-label="Open navigation"><Menu className="size-[18px]" /></button>
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[14px] text-ink-3">
        <span className="hidden truncate sm:inline">{group?.label ?? 'ATLAS'}</span>
        <ChevronRight className="hidden size-4 text-ink-3 sm:block" />
        <span className="truncate font-medium text-ink">{meta?.short ?? 'Screen'}</span>
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <Button variant="accent" size="md" onClick={() => setAssistantOpen(!assistantOpen)} aria-pressed={assistantOpen} aria-label="Ask NEXA" className={cn('h-9', assistantOpen && 'bg-atlas-50')}>
          <Sparkles /><span className="hidden sm:inline">Ask NEXA</span>
        </Button>
        <Notifications />
        <DM.Root>
          <DM.Trigger asChild>
            <button className="press flex items-center gap-2.5 rounded-[10px] px-1.5 py-1 text-left text-[13px] hover:bg-sunken" aria-label="Switch role">
              <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-atlas-100 text-[13px] font-bold text-atlas-700">{persona.initials}</span>
              <span className="hidden leading-tight lg:block">
                <span className="block whitespace-nowrap text-ink">{persona.name}</span>
                <span className="block whitespace-nowrap text-[12px] text-ink-3">{persona.role}</span>
              </span>
              <ChevronDown className="hidden size-4 text-ink-2 sm:block" />
            </button>
          </DM.Trigger>
          <DM.Portal>
            <DM.Content align="end" sideOffset={6} className="float z-[70] w-[340px] origin-[var(--radix-dropdown-menu-content-transform-origin)] animate-pop rounded-[10px] bg-surface p-1">
              <DM.Label className="px-2.5 pb-1.5 pt-1 text-[12px] font-medium text-ink-3">Switch role</DM.Label>
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
                    <span className={cn('mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-semibold', active ? 'bg-atlas-700 text-white' : 'bg-atlas-100 text-atlas-800')}>{p.initials}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between text-[13px] font-medium text-ink">{p.name}{active && <Check className="size-4 text-atlas-700" />}</span>
                      <span className="block text-[12px] leading-snug text-ink-3">{p.actsAs}</span>
                    </span>
                  </DM.Item>
                )
              })}
              <DM.Separator className="my-1 h-px bg-line" />
              <DM.Item onSelect={() => setDefs(true)} className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-ink-2 outline-none data-[highlighted]:bg-sunken"><BookOpen className="size-4 text-ink-3" />Definitions</DM.Item>
              <DM.Item onSelect={reset} className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-ink-2 outline-none data-[highlighted]:bg-sunken"><RotateCcw className="size-4 text-ink-3" />Reset session</DM.Item>
            </DM.Content>
          </DM.Portal>
        </DM.Root>
      </div>
    </header>
  )
}
