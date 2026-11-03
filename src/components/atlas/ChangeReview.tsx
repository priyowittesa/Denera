import { CheckCircle2, CircleHelp, Gavel, ThumbsDown, ThumbsUp, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { CHANGE_ORDERS } from '../../data/registers'
import { usePersona, useDemo } from '../../state/store'
import { Button } from '../ui/button'
import { Field, RadioCards, ReadOnly, TextArea } from '../ui/form'
import { Modal } from '../ui/sheet'
import { AuthorityLabel } from './chips'

type CO = (typeof CHANGE_ORDERS)[number]
type Decision = 'approve' | 'reject' | 'support' | 'object' | 'info'

const STATUS: Record<Decision, string> = {
  approve: 'Approved',
  reject: 'Rejected',
  support: 'Supported by Denera',
  object: 'Denera objection',
  info: 'Information requested',
}

/**
 * Review a change order. The project company approves or rejects its own change orders;
 * Denera supports or objects (Joint items go to the board), and either can ask for more information.
 */
export function ChangeReviewModal({ co, onClose }: { co: CO | null; onClose: () => void }) {
  const { isPcu } = usePersona()
  const review = useDemo((s) => s.reviewChange)
  const [d, setD] = useState<Decision>('info')
  const [note, setNote] = useState('')
  const [tried, setTried] = useState(false)
  useEffect(() => { if (co) { setD(isPcu ? 'approve' : 'support'); setNote(''); setTried(false) } }, [co, isPcu])

  const needsNote = d !== 'approve' && d !== 'support'
  const err = tried && needsNote && !note.trim() && (d === 'info' ? 'Say what information is missing.' : 'Give the reason. It is recorded with your role and the time.')

  const options = isPcu
    ? [
        { value: 'approve' as const, label: 'Approve', icon: <CheckCircle2 className="size-4 text-ok" />, note: 'Instruct the contractor' },
        { value: 'reject' as const, label: 'Reject', icon: <XCircle className="size-4 text-bad" />, note: 'Reason required' },
        { value: 'info' as const, label: 'Ask for more', icon: <CircleHelp className="size-4 text-info" />, note: 'Return to the contractor' },
      ]
    : [
        { value: 'support' as const, label: 'Support', icon: <ThumbsUp className="size-4 text-ok" />, note: co?.route === 'Joint' ? 'Vote for it at the board' : 'Tell the project company' },
        { value: 'object' as const, label: 'Object', icon: <ThumbsDown className="size-4 text-bad" />, note: 'Reason required' },
        { value: 'info' as const, label: 'Ask for more', icon: <CircleHelp className="size-4 text-info" />, note: 'Under shareholder rights' },
      ]

  return (
    <Modal
      open={!!co}
      onOpenChange={(v) => !v && onClose()}
      title={`Review ${co?.id ?? ''}`}
      description={co?.event}
      onSubmit={() => {
        setTried(true)
        if (!co || (needsNote && !note.trim())) return
        review(co.id, options.find((o) => o.value === d)!.label, STATUS[d], note.trim())
        onClose()
      }}
      footer={<><Button variant="outline" type="button" onClick={onClose}>Cancel</Button><Button type="submit" variant={d === 'reject' || d === 'object' ? 'danger' : 'primary'}><Gavel />Record review</Button></>}
    >
      {co && <ReadOnly items={[['Cost effect', co.cost], ['Schedule effect', co.schedule], ['Raised', co.raised], ['Approval route', <AuthorityLabel key="r" a={co.route} />]]} />}
      {!isPcu && co?.route !== 'Shareholder (Denera)' && (
        <p className="rounded-[10px] bg-sunken px-3.5 py-2.5 text-[13px] text-ink-2">
          {co?.route === 'Joint' ? 'The project company board decides. Your review is tabled with the item.' : 'The project company decides. Your review is sent to it through the board nominee.'}
        </p>
      )}
      <div>
        <div className="mb-1.5 text-[13px] font-medium text-ink">Your review<span className="text-bad"> *</span></div>
        <RadioCards<Decision> label="Review" value={d} onChange={setD} options={options} />
      </div>
      <Field label={needsNote ? 'Reason' : 'Note'} required={needsNote} error={err}>
        {(id, dsc) => <TextArea id={id} aria-describedby={dsc} rows={3} value={note} onChange={(e) => setNote(e.target.value)} invalid={!!err} placeholder={needsNote ? undefined : 'Optional'} />}
      </Field>
    </Modal>
  )
}
