import { Search, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/** Search box with icon and clear button (ATLAS module .search). */
export function SearchBox({ value, onChange, placeholder = 'Search', label = 'Search', className }: { value: string; onChange: (v: string) => void; placeholder?: string; label?: string; className?: string }) {
  return (
    <label className={cn('flex h-9 min-w-0 items-center gap-2 rounded-lg border border-line bg-surface px-2.5 text-ink-3 transition-[border-color,box-shadow] duration-150 focus-within:border-atlas-400 focus-within:shadow-[0_0_0_3px_var(--color-atlas-100)]', className)}>
      <Search className="size-4 shrink-0" />
      <span className="sr-only">{label}</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-full min-w-0 flex-1 border-0 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-4 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button type="button" onClick={() => onChange('')} className="press grid size-5 shrink-0 place-items-center rounded text-ink-3 hover:bg-sunken hover:text-ink" aria-label="Clear search"><X className="size-3.5" /></button>
      )}
    </label>
  )
}

/** Table footer: "Showing X of Y" with a reset link when something is filtered (ATLAS module .pager). */
export function ResultFooter({ shown, total, noun = 'items', filtered, onReset, aside, className }: { shown: number; total: number; noun?: string; filtered: boolean; onReset: () => void; aside?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3 text-[13px] text-ink-3', className)}>
      <span>
        Showing <span className="tnum font-medium text-ink-2">{shown}</span> of <span className="tnum">{total}</span> {noun}
        {filtered && <> · <button type="button" onClick={onReset} className="press font-medium text-atlas-700 hover:underline">Reset filters</button></>}
      </span>
      {aside}
    </div>
  )
}

/** Empty result inside a table card. */
export function NoResults({ onReset, noun = 'items' }: { onReset: () => void; noun?: string }) {
  return (
    <div className="px-5 py-12 text-center">
      <span className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-atlas-50 text-atlas-600"><Search className="size-6" /></span>
      <p className="text-[16px] font-semibold text-ink">No {noun} match</p>
      <p className="mx-auto mt-1 max-w-[360px] text-[13px] text-ink-3">Try a different word, or clear the filters.</p>
      <button type="button" onClick={onReset} className="press mt-3 inline-flex h-8 items-center rounded-lg border border-line bg-surface px-3 text-[13px] font-medium text-ink hover:bg-sunken">Reset filters</button>
    </div>
  )
}
