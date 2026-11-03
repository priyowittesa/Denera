import { History, Maximize2, SquarePen, X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SUGGESTIONS } from '../../data/answers'
import { screenByPath } from '../../data/screens'
import { useChat, useDemo, usePersona } from '../../state/store'
import { ChatScroller, Composer, Conversation, Greeting, SuggestionCard, ThreadList, useAskById } from '../atlas/Chat'
import { Pop } from '../ui/popover'
import { Tip } from '../ui/tooltip'

/** Side panel: the same chat as NEXA Intelligence, scoped to the screen the user is on. */
export function AssistantPanel() {
  const open = useDemo((s) => s.assistantOpen)
  const setOpen = useDemo((s) => s.setAssistantOpen)
  const newChat = useDemo((s) => s.newChat)
  const threads = useDemo((s) => s.threads)
  const chat = useChat()
  const askById = useAskById()
  const { pathname } = useLocation()
  const nav = useNavigate()
  const { isPcu } = usePersona()
  const meta = screenByPath(pathname)
  if (!open || pathname === '/ask') return null
  const sugg = (SUGGESTIONS[pathname] ?? []).filter((id) => !(isPcu && (id === 'A-03' || id === 'A-04')))
  const scope = !isPcu && pathname === '/portfolio' ? 'portfolio' : 'cakrawala'

  return (
    <>
      <button tabIndex={-1} aria-label="Close assistant" onClick={() => setOpen(false)} className="fixed inset-0 z-40 animate-fade cursor-default bg-atlas-950/25 2xl:hidden" />
      <aside className="float fixed inset-y-0 right-0 z-50 flex h-dvh w-full animate-[drawer-in_280ms_var(--ease-drawer)] flex-col border-l border-line bg-canvas sm:w-[420px] 2xl:static 2xl:shrink-0 2xl:shadow-none" aria-label="NEXA assistant">
        <header className="flex h-16 shrink-0 items-center gap-1 border-b border-line bg-surface pl-4 pr-2">
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-[14px] font-semibold text-ink">Ask NEXA</div>
            <div className="truncate text-[12px] text-ink-3">On {meta?.short ?? 'this screen'}</div>
          </div>
          <Tip content="New chat"><button onClick={newChat} className="press grid size-9 place-items-center rounded-md text-ink-3 hover:bg-sunken hover:text-ink" aria-label="New chat"><SquarePen className="size-4" /></button></Tip>
          <Pop
            align="end"
            className="max-h-[60vh] w-[300px] overflow-y-auto p-2"
            trigger={<button className="press grid size-9 place-items-center rounded-md text-ink-3 hover:bg-sunken hover:text-ink" aria-label={`Chat history, ${threads.length} conversations`}><History className="size-4" /></button>}
          >
            <ThreadList />
          </Pop>
          <Tip content="Open full view"><button onClick={() => nav('/ask')} className="press grid size-9 place-items-center rounded-md text-ink-3 hover:bg-sunken hover:text-ink" aria-label="Open full view"><Maximize2 className="size-4" /></button></Tip>
          <button onClick={() => setOpen(false)} className="press grid size-9 place-items-center rounded-md text-ink-3 hover:bg-sunken hover:text-ink" aria-label="Close assistant"><X className="size-4" /></button>
        </header>

        <ChatScroller className="flex-1">
          <div className="px-4 py-5">
            {chat.length === 0 ? (
              <div>
                <Greeting compact title={`Ask about ${meta?.short?.toLowerCase() ?? 'this screen'}`} />
                <p className="mt-2 text-[13px] leading-relaxed text-ink-3">Answers come from governed data with sources. When evidence is missing, NEXA says so.</p>
                {sugg.length > 0 && (
                  <div className="mt-5 space-y-2">
                    {sugg.map((id) => <SuggestionCard key={id} id={id} onPick={askById} dashed={id === 'A-17'} />)}
                  </div>
                )}
              </div>
            ) : (
              <Conversation compact />
            )}
          </div>
        </ChatScroller>

        <div className="shrink-0 px-3 pb-3 pt-1">
          <Composer compact defaultScope={scope} />
        </div>
      </aside>
    </>
  )
}
