import { History, SquarePen } from 'lucide-react'
import { useState } from 'react'
import { ChatScroller, Composer, Conversation, Greeting, SuggestionCard, ThreadList, useAskById } from '../components/atlas/Chat'
import { DataNeeded, TierChip, WaveTag } from '../components/atlas/chips'
import { Button } from '../components/ui/button'
import { Pop } from '../components/ui/popover'
import { ASK_CARDS } from '../data/answers'
import { screenByPath } from '../data/screens'
import { cn } from '../lib/cn'
import { useChat, useDemo, usePersona } from '../state/store'

const WAVES = [
  { wave: 'W1' as const, label: 'Available today', note: 'Runs on documents and checklists' },
  { wave: 'W2' as const, label: 'Target state, Wave 2', note: 'Needs agreed partner data' },
  { wave: 'W3' as const, label: 'Target state, Wave 3', note: 'Needs Wave 2 outputs' },
]

export function S06Ask() {
  const chat = useChat()
  const threads = useDemo((s) => s.threads)
  const active = useDemo((s) => s.activeThread)
  const newChat = useDemo((s) => s.newChat)
  const askById = useAskById()
  const { isPcu } = usePersona()
  const meta = screenByPath('/ask')
  const title = threads.find((t) => t.id === active)?.title
  const empty = chat.length === 0

  return (
    <div className="flex h-full min-h-0">
      {/* History rail */}
      <aside className="hidden w-[264px] shrink-0 flex-col border-r border-line bg-surface/60 lg:flex" aria-label="Conversations">
        <div className="p-3">
          <Button variant="outline" className="w-full justify-start" onClick={newChat}><SquarePen />New chat</Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4"><ThreadList /></div>
        <div className="border-t border-line-soft px-4 py-3 text-[12px] leading-snug text-ink-3">Conversations stay in this browser tab. Answers are scripted for the demo.</div>
      </aside>

      {/* Conversation */}
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-line-soft px-3 sm:px-5">
          <Pop
            className="max-h-[60vh] w-[300px] overflow-y-auto p-2"
            trigger={<button className="press grid size-9 place-items-center rounded-md text-ink-3 hover:bg-sunken hover:text-ink lg:hidden" aria-label="Chat history"><History className="size-4" /></button>}
          >
            <ThreadList />
          </Pop>
          <h1 className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink">{empty ? 'New chat' : title}</h1>
          {meta && (
            <div className="hidden items-center gap-1 md:flex">
              {meta.waves.map((w) => <WaveTag key={w} wave={w} />)}
              {meta.tier && <TierChip tier={meta.tier} />}
              <DataNeeded sources={meta.dataNeeded.sources} owner={meta.dataNeeded.owner} />
            </div>
          )}
          {!empty && <button onClick={newChat} className="press grid size-9 place-items-center rounded-md text-ink-3 hover:bg-sunken hover:text-ink lg:hidden" aria-label="New chat"><SquarePen className="size-4" /></button>}
        </header>

        {empty ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto flex min-h-full w-full max-w-[760px] flex-col justify-center px-4 py-10 sm:px-6">
              <Greeting />
              <div className="mt-8"><Composer autoFocus /></div>
              <Starters onPick={askById} isPcu={isPcu} />
            </div>
          </div>
        ) : (
          <>
            <ChatScroller className="flex-1">
              <div className="mx-auto w-full max-w-[760px] px-4 py-8 sm:px-6"><Conversation /></div>
            </ChatScroller>
            <div className="mx-auto w-full max-w-[760px] shrink-0 px-4 pb-4 sm:px-6"><Composer /></div>
          </>
        )}
      </section>
    </div>
  )
}

function Starters({ onPick, isPcu }: { onPick: (id: string) => void; isPcu: boolean }) {
  const [wave, setWave] = useState<'W1' | 'W2' | 'W3'>('W1')
  const ids = (ASK_CARDS.find((g) => g.wave === wave)?.ids ?? []).filter((id) => !(isPcu && (id === 'A-03' || id === 'A-04')))
  const w = WAVES.find((x) => x.wave === wave)!
  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-center gap-1.5" role="tablist" aria-label="Question sets">
        {WAVES.map((x) => (
          <button
            key={x.wave}
            role="tab"
            aria-selected={wave === x.wave}
            onClick={() => setWave(x.wave)}
            className={cn('press rounded-full border px-3 py-1.5 text-[13px] font-medium', wave === x.wave ? 'border-atlas-300 bg-atlas-50 text-atlas-800' : 'border-line bg-surface text-ink-3 hover:text-ink')}
          >
            {x.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-[12px] text-ink-3">{w.note}</p>
      <div key={wave} className="mt-4 grid animate-fade gap-2 sm:grid-cols-2">
        {ids.map((id) => <SuggestionCard key={id} id={id} onPick={onPick} />)}
        {wave === 'W1' && <SuggestionCard id="A-17" onPick={onPick} dashed />}
      </div>
    </div>
  )
}
