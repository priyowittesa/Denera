import { Send } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import type { Authority } from '../../data/types'
import { DATA_DATE_ISO } from '../../data/registers'
import { fmtDate, weekdayOf } from '../../lib/date'
import { useDemo } from '../../state/store'
import { Button } from '../ui/button'
import { Field, ReadOnly, SelectInput, TextArea, TextInput } from '../ui/form'
import { Modal } from '../ui/sheet'
import { AuthorityLabel } from './chips'

export interface RequestSpec {
  /** de-duplication key: the same request cannot be raised twice */
  key: string
  /** modal title, e.g. "Escalate slipping gate" */
  title: string
  /** who receives it */
  to: string
  /** how it travels, e.g. "Shareholder (Denera) request to the project company board" */
  route?: string
  authority: Authority
  /** register entry title */
  subject: string
  message: string
  /** suggested due date, ISO */
  due: string
  /** who tracks it on the Denera side */
  owner: string
  linked: string
  source: string
  confirmLabel?: string
}

const TRACKERS = ['PMO Director', 'Commercial and Legal Lead', 'Investment and legal lead', 'Finance Lead', 'Procurement Lead', 'Board nominee (Denera)', 'Project Director']

/** Every request, escalation and information demand: recipient, message, due date and tracker, then an action in the register. */
export function RequestModal({ spec, onClose, children }: { spec: RequestSpec | null; onClose: () => void; children?: ReactNode }) {
  const addRequest = useDemo((s) => s.addRequest)
  const log = useDemo((s) => s.log)
  const [message, setMessage] = useState('')
  const [due, setDue] = useState('')
  const [owner, setOwner] = useState('')
  const [tried, setTried] = useState(false)
  useEffect(() => {
    if (!spec) return
    setMessage(spec.message); setDue(spec.due); setOwner(spec.owner); setTried(false)
  }, [spec])

  const msgErr = tried && !message.trim() && 'Write what you are asking for.'
  const dueErr = tried && (!due ? 'Enter a reply-by date.' : due < DATA_DATE_ISO ? 'The date cannot be before 30 Jun 2027.' : false)
  const weekend = due && [0, 6].includes(weekdayOf(due))
  const trackers = spec && !TRACKERS.includes(spec.owner) ? [spec.owner, ...TRACKERS] : TRACKERS

  const send = () => {
    setTried(true)
    if (!spec || !message.trim() || !due || due < DATA_DATE_ISO) return
    addRequest(spec.key, spec.subject, { title: spec.subject, owner, authority: spec.authority, due: fmtDate(due), dueIso: due, status: 'Not started', linked: spec.linked, source: spec.source })
    log('Request message', `${spec.subject} to ${spec.to}: ${message.trim()}`)
    onClose()
  }

  return (
    <Modal
      open={!!spec}
      onOpenChange={(v) => !v && onClose()}
      title={spec?.title ?? ''}
      description={spec ? `To ${spec.to}` : undefined}
      onSubmit={send}
      footer={<><Button variant="outline" type="button" onClick={onClose}>Cancel</Button><Button type="submit"><Send />{spec?.confirmLabel ?? 'Send request'}</Button></>}
    >
      {spec && <ReadOnly items={[['Authority', <AuthorityLabel key="a" a={spec.authority} />], ['Route', spec.route ?? spec.to], ['Linked to', spec.linked], ['Tracked in', 'Action register']]} />}
      {children}
      <Field label="Message" required error={msgErr}>
        {(id, d) => <TextArea id={id} aria-describedby={d} rows={4} value={message} onChange={(e) => setMessage(e.target.value)} invalid={!!msgErr} />}
      </Field>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Reply by" required error={dueErr} hint={weekend ? `${fmtDate(due, true)} falls on a weekend.` : undefined}>
          {(id, d) => <TextInput id={id} aria-describedby={d} type="date" value={due} onChange={(e) => setDue(e.target.value)} invalid={!!dueErr} />}
        </Field>
        <Field label="Tracked by" required>
          {(id) => <SelectInput id={id} value={owner} onChange={(e) => setOwner(e.target.value)}>{trackers.map((o) => <option key={o}>{o}</option>)}</SelectInput>}
        </Field>
      </div>
    </Modal>
  )
}
