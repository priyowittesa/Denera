import * as D from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'
import { cn } from '../../lib/cn'

/** Square muted close button, as in the ATLAS module (.xbtn). */
function CloseButton() {
  return (
    <D.Close className="press grid size-[34px] shrink-0 place-items-center rounded-lg bg-sunken text-ink-2 hover:bg-line hover:text-ink" aria-label="Close">
      <X className="size-4" />
    </D.Close>
  )
}

/** Right-hand drawer for details (ATLAS module .drawer: 640px, header, scroll body, footer). */
export function Sheet({ open, onOpenChange, title, description, children, width = 'w-[640px]', footer }: {
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
        <D.Overlay className="fixed inset-0 z-[60] animate-fade bg-[#0f0a1e66]" />
        <D.Content className={cn('fixed inset-y-0 right-0 z-[61] flex max-w-full animate-drawer-in flex-col bg-surface shadow-[-20px_0_50px_#0f0a1e33] outline-none', width)}>
          <div className="flex items-start justify-between gap-3 border-b border-line px-[22px] py-[18px]">
            <div className="min-w-0">
              <D.Title className="text-[16px] font-semibold text-ink">{title}</D.Title>
              {description ? <D.Description className="mt-[3px] text-[13px] text-ink-3">{description}</D.Description> : <D.Description className="sr-only">Details</D.Description>}
            </div>
            <CloseButton />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-[22px] py-5">{children}</div>
          {footer && <div className="flex items-center justify-between gap-2.5 border-t border-line bg-surface px-[22px] py-3.5">{footer}</div>}
        </D.Content>
      </D.Portal>
    </D.Root>
  )
}

/**
 * Centred modal for every create, edit and reject step (ATLAS module .mbox: 520px, radius 14).
 * Pass onSubmit to make the body a form, so Enter submits and the primary button can be type="submit".
 */
export function Modal({ open, onOpenChange, title, description, children, footer, onSubmit, width = 'max-w-[520px]' }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  onSubmit?: () => void
  width?: string
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3 px-[22px] pt-5">
        <div className="min-w-0">
          <D.Title className="text-[16px] font-semibold text-ink">{title}</D.Title>
          {description ? <D.Description className="mt-[3px] text-[13px] text-ink-3">{description}</D.Description> : <D.Description className="sr-only">Dialog</D.Description>}
        </div>
        <CloseButton />
      </div>
      <div className="flex max-h-[62vh] flex-col gap-3.5 overflow-y-auto px-[22px] py-[18px]">{children}</div>
      {footer && <div className="flex flex-wrap justify-end gap-2.5 px-[22px] pb-5 pt-3.5">{footer}</div>}
    </>
  )
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-[70] grid animate-fade place-items-center overflow-y-auto bg-[#0f0a1e77] p-5">
          <D.Content className={cn('max-h-[90vh] w-full animate-pop overflow-y-auto rounded-[14px] bg-surface shadow-[0_30px_80px_#0f0a1e55] outline-none', width)}>
            {onSubmit ? (
              <form noValidate onSubmit={(e: FormEvent) => { e.preventDefault(); onSubmit() }}>{body}</form>
            ) : body}
          </D.Content>
        </D.Overlay>
      </D.Portal>
    </D.Root>
  )
}
