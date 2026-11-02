import * as T from '@radix-ui/react-tabs'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export const Tabs = T.Root
export const TabsContent = ({ className, ...p }: T.TabsContentProps) => <T.Content className={cn('outline-none', className)} {...p} />

export function TabsList({ items, className }: { items: { value: string; label: ReactNode }[]; className?: string }) {
  return (
    <T.List className={cn('flex gap-1 overflow-x-auto border-b border-line', className)}>
      {items.map((i) => (
        <T.Trigger
          key={i.value}
          value={i.value}
          className="press -mb-px shrink-0 border-b-2 border-transparent px-3 py-2 text-[13px] font-medium text-ink-3 hover:text-ink data-[state=active]:border-atlas-600 data-[state=active]:text-ink"
        >
          {i.label}
        </T.Trigger>
      ))}
    </T.List>
  )
}

/** Segmented control for compact view switches. */
export function Segmented<V extends string>({ value, onChange, items, className, size = 'md', label }: { value: V; onChange: (v: V) => void; items: { value: V; label: ReactNode }[]; className?: string; size?: 'sm' | 'md'; label?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex flex-wrap rounded-md bg-sunken p-0.5', className)}>
      {items.map((i) => (
        <button
          key={i.value}
          role="radio"
          aria-checked={value === i.value}
          onClick={() => onChange(i.value)}
          className={cn(
            'press rounded-[6px] font-medium text-ink-3 hover:text-ink',
            size === 'sm' ? 'px-2.5 py-1 text-[12.5px]' : 'px-3 py-1.5 text-[13px]',
            value === i.value && 'lift bg-surface text-ink',
          )}
        >
          {i.label}
        </button>
      ))}
    </div>
  )
}
