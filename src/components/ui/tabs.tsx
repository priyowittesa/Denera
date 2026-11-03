import * as T from '@radix-ui/react-tabs'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export const Tabs = T.Root
export const TabsContent = ({ className, ...p }: T.TabsContentProps) => <T.Content className={cn('outline-none', className)} {...p} />

export function TabsList({ items, className }: { items: { value: string; label: ReactNode }[]; className?: string }) {
  return (
    <T.List className={cn('no-scrollbar flex min-w-0 max-w-full gap-1.5 overflow-x-auto', className)}>
      {items.map((i) => (
        <T.Trigger
          key={i.value}
          value={i.value}
          className="press inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-surface px-3 text-[13px] font-medium text-ink-2 hover:bg-sunken data-[state=active]:border-atlas-300 data-[state=active]:bg-atlas-50 data-[state=active]:text-atlas-700"
        >
          {i.label}
        </T.Trigger>
      ))}
    </T.List>
  )
}

/**
 * View switches and filters as pill chips (ATLAS module .chip pattern).
 * One row that never wraps; on narrow screens it scrolls sideways.
 */
export function Segmented<V extends string>({ value, onChange, items, className, label }: { value: V; onChange: (v: V) => void; items: { value: V; label: ReactNode }[]; className?: string; size?: 'sm' | 'md'; label?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('no-scrollbar flex min-w-0 max-w-full gap-1.5 overflow-x-auto', className)}>
      {items.map((i) => (
        <button
          key={i.value}
          role="radio"
          aria-checked={value === i.value}
          onClick={() => onChange(i.value)}
          className={cn(
            'press inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-[13px] font-medium [&_svg]:size-3.5',
            value === i.value ? 'border-atlas-300 bg-atlas-50 text-atlas-700' : 'border-line bg-surface text-ink-2 hover:bg-sunken',
          )}
        >
          {i.label}
        </button>
      ))}
    </div>
  )
}
