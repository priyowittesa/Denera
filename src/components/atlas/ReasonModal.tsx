import { useEffect, useState, type ReactNode } from 'react'
import { Button } from '../ui/button'
import { ReasonField } from '../ui/form'
import { Modal } from '../ui/sheet'

/** Every reject, defer or decline step: a required reason, checked on submit, then written to the audit log. */
export function ReasonModal({ open, onClose, title, description, confirmLabel = 'Reject with reason', confirmIcon, onConfirm, children, danger = false, initial = '' }: {
  open: boolean
  onClose: () => void
  title: string
  description?: ReactNode
  confirmLabel?: string
  confirmIcon?: ReactNode
  onConfirm: (reason: string) => void
  children?: ReactNode
  danger?: boolean
  /** Suggested reason, editable */
  initial?: string
}) {
  const [reason, setReason] = useState('')
  const [tried, setTried] = useState(false)
  useEffect(() => { if (open) { setReason(initial); setTried(false) } }, [open, initial])
  const error = tried && !reason.trim() && 'Give a reason. It is recorded with your role and the time.'
  return (
    <Modal
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title={title}
      description={description}
      onSubmit={() => { setTried(true); if (reason.trim()) { onConfirm(reason.trim()); onClose() } }}
      footer={<><Button variant="outline" type="button" onClick={onClose}>Cancel</Button><Button type="submit" variant={danger ? 'danger' : 'primary'}>{confirmIcon}{confirmLabel}</Button></>}
    >
      {children}
      <ReasonField value={reason} onChange={setReason} error={error} />
    </Modal>
  )
}
