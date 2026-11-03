import { Sparkles } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useDemo } from '../../state/store'

/**
 * Floating button that opens the NEXA chat drawer from any screen.
 * It hides while the drawer is open and on the full-page chat, where the chat is already in view.
 */
export function AssistantFab() {
  const open = useDemo((s) => s.assistantOpen)
  const setOpen = useDemo((s) => s.setAssistantOpen)
  const { pathname, search } = useLocation()
  if (open || pathname === '/ask' || (pathname === '/workflows' && search.includes('flow='))) return null
  return (
    <button
      onClick={() => setOpen(true)}
      aria-label="Ask NEXA"
      className="press fixed bottom-[76px] right-4 z-40 inline-flex h-12 animate-pop items-center gap-2 rounded-full bg-gradient-to-br from-atlas-500 to-atlas-700 pl-3.5 pr-4 text-[14px] font-semibold text-white shadow-[0_8px_24px_-4px_rgb(109_40_217/0.5),0_0_0_1px_rgb(255_255_255/0.12)_inset] transition-[box-shadow,filter] duration-150 hover:brightness-110 sm:bottom-6 sm:right-6"
    >
      <span className="grid size-6 place-items-center rounded-full bg-white/15"><Sparkles className="size-4" /></span>
      Ask NEXA
    </button>
  )
}
