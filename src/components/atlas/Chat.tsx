import {
  ArrowDown, ArrowUp, Check, ChevronDown, ChevronRight, Copy, FileStack, FileText, FolderClosed, Lock, Pencil, RotateCcw, SearchCheck, Sparkles, Square, ThumbsDown, ThumbsUp, Trash2,
} from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { ANSWERS, matchQuestion } from '../../data/answers'
import { cn } from '../../lib/cn'
import { THINK_MS, WORD_MS, useBusy, useChat, useDemo, usePersona, type ChatMsg } from '../../state/store'
import { Pop } from '../ui/popover'
import { Tip } from '../ui/tooltip'
import { AnswerView } from './AnswerView'

/* ------------------------------------------------------------------ identity */

export function AtlasAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={cn('grid shrink-0 place-items-center rounded-full bg-atlas-700 text-white', size === 'sm' ? 'size-6' : size === 'lg' ? 'size-11' : 'size-7')}>
      <Sparkles className={size === 'lg' ? 'size-5' : 'size-3.5'} />
    </span>
  )
}

/** Denera personas get answers on Phase II and briefs; the project company is refused those (A-18). */
export function useAskById() {
  const ask = useDemo((s) => s.ask)
  const { isPcu } = usePersona()
  return (id: string) => ask(isPcu && (id === 'A-03' || id === 'A-04') ? 'A-18' : id, ANSWERS[id].q)
}

/* ------------------------------------------------------------- thinking steps */

function stepsFor(id?: string): string[] {
  const a = id ? ANSWERS[id] : undefined
  if (!a) return ['Checking scope']
  if (a.kind === 'permission') return ['Checking your access rights', 'Matching the question to permitted data']
  if (a.kind === 'refusal') return ['Searching laboratory and waste-supply records', 'Searching feasibility study', 'No measured value found']
  if (a.kind === 'oos') return ['Checking which questions NEXA covers']
  if (a.kind === 'text') return ['Reading the current pack narrative', 'Drafting a simpler version']
  return ['Reading the question', ...(a.sources ?? []).map((s) => `Reading ${s.label}`), 'Cross-checking figures across sources']
}

function useTicker(active: boolean) {
  const [, force] = useState(0)
  useEffect(() => {
    if (!active) return
    let raf = 0
    const tick = () => { force((n) => n + 1); raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])
}

function ThinkingSteps({ msg }: { msg: ChatMsg }) {
  const steps = useMemo(() => stepsFor(msg.answerId), [msg.answerId])
  const thinking = msg.phase === 'thinking'
  const [start] = useState(() => Date.now())
  const [open, setOpen] = useState(false)
  useTicker(thinking)
  const at = thinking ? Math.min(steps.length - 1, Math.floor(((Date.now() - start) / THINK_MS) * steps.length)) : steps.length
  const sources = ANSWERS[msg.answerId ?? '']?.sources?.length ?? 0

  if (thinking)
    return (
      <div className="flex items-center gap-2 text-[13px] text-ink-3" role="status" aria-live="polite">
        <span className="size-3.5 animate-spin rounded-full border-[1.5px] border-atlas-200 border-t-atlas-600" aria-hidden />
        <span key={at} className="shimmer animate-fade">{steps[at]}</span>
      </div>
    )

  return (
    <div>
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="press -ml-1 inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-[13px] text-ink-3 hover:bg-sunken hover:text-ink-2">
        <SearchCheck className="size-3.5" />
        {sources ? `Checked ${sources} source${sources > 1 ? 's' : ''}` : 'Checked scope'}
        {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
      </button>
      {open && (
        <ol className="mt-1.5 animate-rise space-y-1 border-l border-line pl-3.5 text-[13px] text-ink-3">
          {steps.map((s) => <li key={s} className="flex items-center gap-1.5"><Check className="size-3 text-ok" />{s}</li>)}
        </ol>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ messages */

function IconAction({ label, onClick, active, children }: { label: string; onClick: () => void; active?: boolean; children: ReactNode }) {
  return (
    <Tip content={label}>
      <button onClick={onClick} aria-label={label} aria-pressed={active} className={cn('press grid size-8 place-items-center rounded-md text-ink-3 hover:bg-sunken hover:text-ink [&_svg]:size-4', active && 'text-atlas-700')}>
        {children}
      </button>
    </Tip>
  )
}

function useCopy() {
  const [copied, setCopied] = useState(false)
  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }
  return { copied, copy }
}

function UserMessage({ msg, compact }: { msg: ChatMsg; compact?: boolean }) {
  const setDraft = useDemo((s) => s.setDraft)
  const { copied, copy } = useCopy()
  return (
    <div className="group flex animate-rise flex-col items-end">
      <div className={cn('max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-atlas-100/70 px-4 py-2.5 leading-relaxed text-ink', compact ? 'text-[14px]' : 'text-[14px]')}>{msg.text}</div>
      <div className="mt-1 flex opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        <IconAction label={copied ? 'Copied' : 'Copy'} onClick={() => copy(msg.text ?? '')}>{copied ? <Check /> : <Copy />}</IconAction>
        <IconAction label="Edit and ask again" onClick={() => { setDraft(msg.text ?? ''); document.getElementById('atlas-input')?.focus() }}><Pencil /></IconAction>
      </div>
    </div>
  )
}

function AtlasMessage({ msg, compact, last }: { msg: ChatMsg; compact?: boolean; last: boolean }) {
  const regenerate = useDemo((s) => s.regenerate)
  const rate = useDemo((s) => s.rate)
  const log = useDemo((s) => s.log)
  const askById = useAskById()
  const { copied, copy } = useCopy()
  const a = ANSWERS[msg.answerId ?? '']
  const streaming = msg.phase === 'streaming'
  useTicker(streaming)
  const words = streaming && msg.startedAt ? Math.floor((Date.now() - msg.startedAt) / WORD_MS) : msg.phase === 'stopped' ? msg.shown ?? 0 : undefined
  const settled = msg.phase === 'done' || msg.phase === 'stopped'

  return (
    <div className="group animate-rise">
      <div className="mb-2.5 flex items-center gap-2">
        <AtlasAvatar size="sm" />
        <span className="text-[13px] font-semibold text-ink">NEXA</span>
      </div>
      <div className={compact ? '' : 'sm:pl-8'}>
        <ThinkingSteps msg={msg} />
        {msg.phase !== 'thinking' && msg.answerId && (
          <div className="mt-3">
            <AnswerView id={msg.answerId} compact={compact} words={words} stopped={msg.phase === 'stopped'} onFollow={askById} />
          </div>
        )}
        {settled && (
          <div className={cn('mt-3 flex items-center gap-0.5 transition-opacity', !last && 'opacity-0 group-focus-within:opacity-100 group-hover:opacity-100')}>
            <IconAction label={copied ? 'Copied' : 'Copy answer'} onClick={() => copy([a?.direct, a?.figures].filter(Boolean).join('\n\n'))}>{copied ? <Check /> : <Copy />}</IconAction>
            <IconAction label="Regenerate" onClick={() => regenerate(msg.id)}><RotateCcw /></IconAction>
            <IconAction label="Helpful" active={msg.feedback === 'up'} onClick={() => rate(msg.id, 'up')}><ThumbsUp className={msg.feedback === 'up' ? 'fill-current' : ''} /></IconAction>
            <IconAction label="Not helpful" active={msg.feedback === 'down'} onClick={() => rate(msg.id, 'down')}><ThumbsDown className={msg.feedback === 'down' ? 'fill-current' : ''} /></IconAction>
            {a?.kind !== 'permission' && a?.kind !== 'oos' && (
              <IconAction label="Add to governance pack draft" onClick={() => { log('Added answer to pack draft', a?.q || 'NEXA answer'); toast.success('Added to the pack draft', { description: 'Marked AI draft. A reviewer approves it in Governance packs.' }) }}><FileStack /></IconAction>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function Conversation({ compact }: { compact?: boolean }) {
  const chat = useChat()
  const lastAtlas = [...chat].reverse().find((m) => m.role === 'atlas')?.id
  return (
    <div className={cn(compact ? 'space-y-6' : 'space-y-8')}>
      {chat.map((m) => (m.role === 'user' ? <UserMessage key={m.id} msg={m} compact={compact} /> : <AtlasMessage key={m.id} msg={m} compact={compact} last={m.id === lastAtlas} />))}
    </div>
  )
}

/** Scroll area that follows new output unless the reader has scrolled up, with a jump-to-latest button. */
export function ChatScroller({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const pinned = useRef(true)
  const [away, setAway] = useState(false)
  const chat = useChat()
  const busy = useBusy()
  useTicker(busy)
  useLayoutEffect(() => {
    const el = ref.current
    if (el && pinned.current) el.scrollTop = el.scrollHeight
  })
  useEffect(() => { pinned.current = true }, [chat.length])
  const onScroll = () => {
    const el = ref.current
    if (!el) return
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    pinned.current = near
    setAway(!near)
  }
  return (
    <div className={cn('relative min-h-0', className)}>
      <div ref={ref} onScroll={onScroll} className="h-full overflow-y-auto">{children}</div>
      {away && (
        <button
          onClick={() => { const el = ref.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }); pinned.current = true }}
          className="press float absolute bottom-3 left-1/2 grid size-9 -translate-x-1/2 animate-pop place-items-center rounded-full bg-surface text-ink-2 hover:text-ink"
          aria-label="Jump to latest"
        >
          <ArrowDown className="size-4" />
        </button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ composer */

type Scope = 'cakrawala' | 'portfolio'

export function Composer({ autoFocus, compact, defaultScope = 'cakrawala' }: { autoFocus?: boolean; compact?: boolean; defaultScope?: Scope }) {
  const draft = useDemo((s) => s.draft)
  const setDraft = useDemo((s) => s.setDraft)
  const ask = useDemo((s) => s.ask)
  const stop = useDemo((s) => s.stop)
  const busy = useBusy()
  const { isPcu } = usePersona()
  const [scope, setScope] = useState<Scope>(isPcu ? 'cakrawala' : defaultScope)
  const [focus, setFocus] = useState(false)
  const [hi, setHi] = useState(-1)
  const ta = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const el = ta.current
    if (!el) return
    el.style.height = '0px'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [draft])

  const matches = useMemo(() => {
    const q = draft.trim().toLowerCase()
    if (q.length < 2) return []
    const terms = q.split(/\s+/).filter((w) => w.length > 2)
    return Object.values(ANSWERS)
      .filter((a) => a.q && !(isPcu && (a.id === 'A-03' || a.id === 'A-04')))
      .filter((a) => a.q.toLowerCase() !== q && (a.q.toLowerCase().includes(q) || (terms.length > 0 && terms.every((w) => a.q.toLowerCase().includes(w)))))
      .slice(0, 4)
  }, [draft, isPcu])
  const showMatches = focus && !busy && matches.length > 0

  const send = (text = draft) => {
    const t = text.trim()
    if (!t || busy) return
    ask(matchQuestion(t, isPcu), t)
    setHi(-1)
  }

  return (
    <div className="relative">
      {showMatches && (
        <ul role="listbox" aria-label="Matching questions" className="float absolute inset-x-0 bottom-full z-10 mb-2 animate-pop overflow-hidden rounded-xl bg-surface p-1">
          {matches.map((m, i) => (
            <li key={m.id} role="option" aria-selected={hi === i}>
              <button
                onMouseDown={(e) => { e.preventDefault(); send(m.q) }}
                onMouseEnter={() => setHi(i)}
                className={cn('flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-ink-2', hi === i && 'bg-sunken text-ink')}
              >
                <Sparkles className="size-3.5 shrink-0 text-atlas-600" />
                <span className="min-w-0 flex-1 truncate">{m.q}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <form
        onSubmit={(e) => { e.preventDefault(); send() }}
        className="rounded-2xl border border-line bg-surface p-2 shadow-[0_1px_2px_rgb(20_16_42/0.04),0_4px_16px_-8px_rgb(42_23_100/0.12)] transition-[border-color,box-shadow] focus-within:border-atlas-300 focus-within:shadow-[0_0_0_4px_var(--color-atlas-100)]"
      >
        <label htmlFor="atlas-input" className="sr-only">Ask NEXA</label>
        <textarea
          id="atlas-input"
          ref={ta}
          rows={1}
          autoFocus={autoFocus}
          value={draft}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onChange={(e) => { setDraft(e.target.value); setHi(-1) }}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && busy) { e.preventDefault(); stop(); return }
            if (showMatches && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
              e.preventDefault()
              setHi((h) => (e.key === 'ArrowDown' ? (h + 1) % matches.length : (h <= 0 ? matches.length - 1 : h - 1)))
              return
            }
            if (e.key === 'Tab' && showMatches) { e.preventDefault(); setDraft(matches[Math.max(0, hi)].q); return }
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              send(showMatches && hi >= 0 ? matches[hi].q : draft)
            }
          }}
          placeholder={compact ? 'Ask about this screen...' : 'Ask about notices, progress, packages, cost or the critical path...'}
          className={cn('block max-h-[200px] w-full resize-none bg-transparent px-2.5 pt-1.5 leading-relaxed text-ink outline-none placeholder:text-ink-4', compact ? 'min-h-[44px] text-[14px]' : 'min-h-[52px] text-[16px]')}
        />
        <div className="mt-1 flex items-center gap-2">
          <ScopePicker scope={scope} setScope={setScope} isPcu={isPcu} />
          <span className="ml-auto" />
          <span className={cn('hidden whitespace-nowrap text-[12px] text-ink-4', !compact && 'sm:inline')}>{busy ? 'Esc to stop' : 'Enter to send, Shift + Enter for a new line'}</span>
          {busy ? (
            <button type="button" onClick={stop} className="press grid size-9 place-items-center rounded-full bg-ink text-white hover:bg-ink-2" aria-label="Stop answering">
              <Square className="size-3.5 fill-current" />
            </button>
          ) : (
            <button type="submit" disabled={!draft.trim()} className="press grid size-9 place-items-center rounded-full bg-atlas-700 text-white hover:bg-atlas-800 disabled:bg-line disabled:text-ink-4" aria-label="Send">
              <ArrowUp className="size-[18px]" strokeWidth={2.4} />
            </button>
          )}
        </div>
      </form>
      <p className="mt-2 text-center text-[12px] text-ink-3">NEXA recommends; people decide. Every answer cites its sources.</p>
    </div>
  )
}

function ScopePicker({ scope, setScope, isPcu }: { scope: Scope; setScope: (s: Scope) => void; isPcu: boolean }) {
  const label = scope === 'portfolio' ? 'Denera portfolio' : 'PSEL Cakrawala Raya'
  return (
    <Pop
      side="top"
      className="w-[280px] p-1.5"
      trigger={
        <button type="button" className="press inline-flex h-8 min-w-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-3 text-[13px] font-medium text-ink-2 hover:bg-sunken">
          <FolderClosed className="size-3.5 text-atlas-600" />{label}<ChevronDown className="size-3.5 text-ink-3" />
        </button>
      }
    >
      <div className="px-2 pb-1 pt-1 text-[12px] font-medium text-ink-3">Answer from</div>
      {([['cakrawala', 'PSEL Cakrawala Raya', 'One project, all modules'], ['portfolio', 'Denera portfolio', 'Eleven projects, both lanes']] as const).map(([v, l, d]) => {
        const locked = isPcu && v === 'portfolio'
        return (
          <button key={v} type="button" disabled={locked} onClick={() => setScope(v)} className="flex w-full items-start gap-2.5 rounded-md px-2 py-2 text-left hover:bg-sunken disabled:opacity-60 disabled:hover:bg-transparent">
            {locked ? <Lock className="mt-0.5 size-4 text-ink-4" /> : <Check className={cn('mt-0.5 size-4', scope === v ? 'text-atlas-700' : 'text-transparent')} />}
            <span><span className="block text-[13px] font-medium text-ink">{l}</span><span className="block text-[12px] text-ink-3">{locked ? 'Denera only' : d}</span></span>
          </button>
        )
      })}
    </Pop>
  )
}

/* ------------------------------------------------------------------- history */

export function ThreadList({ onPick }: { onPick?: () => void }) {
  const threads = useDemo((s) => s.threads)
  const active = useDemo((s) => s.activeThread)
  const openThread = useDemo((s) => s.openThread)
  const del = useDemo((s) => s.deleteThread)
  const groups = [
    ['Today', threads.filter((t) => t.when === 'Today')],
    ['Previous 7 days', threads.filter((t) => t.when !== 'Today')],
  ] as const
  if (!threads.length) return <p className="px-3 py-2 text-[13px] text-ink-3">No conversations yet.</p>
  return (
    <div className="space-y-4">
      {groups.map(([label, list]) => list.length > 0 && (
        <div key={label}>
          <div className="px-3 pb-1 text-[12px] font-medium text-ink-3">{label}</div>
          <ul className="space-y-px">
            {list.map((t) => (
              <li key={t.id} className="group relative">
                <button
                  onClick={() => { openThread(t.id); onPick?.() }}
                  className={cn('press flex w-full items-center gap-2 rounded-lg py-2 pl-3 pr-9 text-left text-[13px] text-ink-2 hover:bg-sunken hover:text-ink', active === t.id && 'bg-sunken font-medium text-ink')}
                >
                  <span className="truncate">{t.title}</span>
                </button>
                <button onClick={() => del(t.id)} className="press absolute right-1 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-ink-4 opacity-0 hover:bg-surface hover:text-bad group-focus-within:opacity-100 group-hover:opacity-100" aria-label={`Delete ${t.title}`}>
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------- empty state */

export function Greeting({ compact, title }: { compact?: boolean; title?: string }) {
  const { persona } = usePersona()
  return (
    <div className={cn('animate-rise', compact ? '' : 'text-center')}>
      <div className={cn('flex items-center gap-3', !compact && 'justify-center')}>
        <AtlasAvatar size={compact ? 'md' : 'lg'} />
        {compact && <span className="text-[13px] font-medium text-ink-3">Good morning, {persona.name}</span>}
      </div>
      {!compact && <p className="mt-4 text-[14px] text-ink-3">Good morning, {persona.name}</p>}
      <h2 className={cn('display text-ink', compact ? 'mt-3 text-[24px] leading-tight' : 'mt-1.5 text-[clamp(26px,3vw,36px)] leading-[1.1]')}>{title ?? 'What do you need to know today?'}</h2>
    </div>
  )
}

export function SuggestionCard({ id, onPick, dashed }: { id: string; onPick: (id: string) => void; dashed?: boolean }) {
  const a = ANSWERS[id]
  return (
    <button
      onClick={() => onPick(id)}
      className={cn('press group flex w-full items-start gap-3 rounded-xl border bg-surface px-3.5 py-3 text-left transition-colors hover:border-atlas-300 hover:bg-atlas-50/40', dashed ? 'border-dashed border-ink-4/50' : 'border-line')}
    >
      {dashed ? <FileText className="mt-0.5 size-4 shrink-0 text-ink-4" /> : <Sparkles className="mt-0.5 size-4 shrink-0 text-atlas-600" />}
      <span className="min-w-0 flex-1 text-[14px] leading-snug text-ink-2 group-hover:text-ink">{a.q}</span>
    </button>
  )
}
