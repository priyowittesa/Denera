import { TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '../ui/button'
import { Modal } from '../ui/sheet'

/** Confirmation before a consequential step: says exactly what will happen, then asks once. */
export function ConfirmModal({ open, onClose, title, description, effects, confirmLabel, confirmIcon, onConfirm, danger = false, note }: {
  open: boolean
  onClose: () => void
  title: string
  description?: ReactNode
  /** what this step will do, one line each */
  effects: ReactNode[]
  confirmLabel: string
  confirmIcon?: ReactNode
  onConfirm: () => void
  danger?: boolean
  note?: ReactNode
}) {
  return (
    <Modal
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title={title}
      description={description}
      onSubmit={() => { onConfirm(); onClose() }}
      footer={<><Button variant="outline" type="button" onClick={onClose}>Cancel</Button><Button type="submit" variant={danger ? 'danger' : 'primary'} autoFocus>{confirmIcon}{confirmLabel}</Button></>}
    >
      <div>
        <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.05em] text-ink-2">This will</div>
        <ol className="space-y-2">
          {effects.map((e, i) => (
            <li key={i} className="flex gap-2.5 text-[14px] text-ink">
              <span className="tnum grid size-[22px] shrink-0 place-items-center rounded-full bg-atlas-100 text-[12px] font-bold text-atlas-700">{i + 1}</span>
              <span className="pt-0.5">{e}</span>
            </li>
          ))}
        </ol>
      </div>
      {note && (
        <div className="flex gap-2.5 rounded-[10px] border border-warn-line bg-warn-bg px-3.5 py-3 text-[13px] text-[#92400e]">
          <TriangleAlert className="mt-px size-4 shrink-0" />
          <div>{note}</div>
        </div>
      )}
    </Modal>
  )
}
