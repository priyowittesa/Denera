import * as D from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function Sheet({ open, onOpenChange, title, description, children, width = 'w-[520px]', footer }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  width?: string
  footer?: ReactNode
}) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-[60] animate-fade bg-atlas-950/25" />
        <D.Content className={cn('float fixed inset-y-0 right-0 z-[61] flex max-w-[calc(100vw-24px)] animate-drawer-in flex-col bg-surface outline-none', width)}>
          <div className="flex items-start justify-between gap-4 border-b border-line-soft px-6 py-5">
            <div className="min-w-0">
              <D.Title className="text-[18px] font-semibold text-ink">{title}</D.Title>
              {description ? <D.Description className="mt-1 text-[13px] text-ink-3">{description}</D.Description> : <D.Description className="sr-only">Details</D.Description>}
            </div>
            <D.Close className="press -mr-2 -mt-1 grid size-9 place-items-center rounded-md text-ink-3 hover:bg-sunken hover:text-ink" aria-label="Close">
              <X className="size-4" />
            </D.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {footer && <div className="border-t border-line-soft px-6 py-4">{footer}</div>}
        </D.Content>
      </D.Portal>
    </D.Root>
  )
}

export function Modal({ open, onOpenChange, title, description, children, footer }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-[60] animate-fade bg-atlas-950/30" />
        <D.Content className="float fixed left-1/2 top-1/2 z-[61] w-[560px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-surface outline-none">
          <div className="animate-pop">
            <div className="px-6 pt-5">
              <D.Title className="text-[18px] font-semibold text-ink">{title}</D.Title>
              {description ? <D.Description className="mt-1 text-[13px] text-ink-3">{description}</D.Description> : <D.Description className="sr-only">Dialog</D.Description>}
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-6 py-4">{children}</div>
            {footer && <div className="flex justify-end gap-2 border-t border-line-soft px-6 py-4">{footer}</div>}
          </div>
        </D.Content>
      </D.Portal>
    </D.Root>
  )
}
