import * as P from '@radix-ui/react-popover'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function Pop({ trigger, children, className, side = 'bottom', align = 'start' }: { trigger: ReactNode; children: ReactNode; className?: string; side?: 'top' | 'bottom' | 'left' | 'right'; align?: 'start' | 'center' | 'end' }) {
  return (
    <P.Root>
      <P.Trigger asChild>{trigger}</P.Trigger>
      <P.Portal>
        <P.Content
          side={side}
          align={align}
          sideOffset={6}
          collisionPadding={12}
          className={cn(
            'float z-[70] w-[340px] origin-[var(--radix-popover-content-transform-origin)] animate-pop rounded-lg bg-surface p-4 text-[13px] text-ink-2 outline-none',
            className,
          )}
        >
          {children}
        </P.Content>
      </P.Portal>
    </P.Root>
  )
}
