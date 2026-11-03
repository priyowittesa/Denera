import { Check, CheckCircle2, CircleDashed, Clock3, Plus, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Action, Authority, Proposal } from '../../data/types'
import { DATA_DATE_ISO } from '../../data/registers'
import { fmtDate, weekdayOf } from '../../lib/date'
import { useDemo } from '../../state/store'
import { Button } from '../ui/button'
import { Field, RadioCards, ReadOnly, SelectInput, TextInput } from '../ui/form'
import { Modal } from '../ui/sheet'
import { AuthorityLabel } from './chips'

const OWNERS = [
  'Commercial and Legal Lead', 'Technical Director', 'Procurement Lead', 'Finance Lead', 'PMO Director',
  'Project Director', 'Investment and legal lead', 'Permits lead', 'Project company board',
]
const AUTHORITIES: Authority[] = ['Shareholder (Denera)', 'Joint', 'Project company']

export type ActionForm = { kind: 'edit'; action: Action } | { kind: 'new' } | { kind: 'proposal'; proposal: Proposal }

/** One form for the action register: create a new action, accept an ATLAS proposal, or edit an existing action. */
export function ActionFormModal({ form, onClose }: { form: ActionForm | null; onClose: () => void }) {
  const update = useDemo((s) => s.updateAction)
  const addAction = useDemo((s) => s.addAction)
  const accept = useDemo((s) => s.acceptProposal)
  const [title, setTitle] = useState('')
  const [authority, setAuthority] = useState<Authority>('Shareholder (Denera)')
  const [owner, setOwner] = useState('')
  const [due, setDue] = useState('')
  const [linked, setLinked] = useState('')
  const [status, setStatus] = useState<Action['status']>('Not started')
  const [tried, setTried] = useState(false)

  useEffect(() => {
    if (!form) return
    setTried(false)
    if (form.kind === 'edit') {
      const a = form.action
      setTitle(a.title); setAuthority(a.authority); setOwner(a.owner); setDue(a.dueIso ?? ''); setLinked(a.linked); setStatus(a.status)
    } else {
      setTitle(form.kind === 'proposal' ? form.proposal.text.replace(/\.$/, '') : '')
      setAuthority(form.kind === 'proposal' ? form.proposal.authority : 'Shareholder (Denera)')
      setOwner(''); setDue(''); setLinked(form.kind === 'proposal' ? form.proposal.from : ''); setStatus('Not started')
    }
  }, [form])

  const editing = form?.kind === 'edit' ? form.action : null
  const owners = owner && !OWNERS.includes(owner) ? [owner, ...OWNERS] : OWNERS
  const titleErr = tried && !title.trim() && 'Describe the action.'
  const ownerErr = tried && !owner && 'Choose an owner.'
  const dueErr = tried && !due && 'Enter a due date.'
  const weekend = due && [0, 6].includes(weekdayOf(due))
  const past = due && due < DATA_DATE_ISO && status !== 'Done'

  const save = () => {
    setTried(true)
    if (!form || !title.trim() || !owner || !due) return
    if (form.kind === 'edit') {
      update(form.action.id, { owner, due: fmtDate(due), dueIso: due, status, ...(due !== form.action.dueIso ? { dueNote: undefined } : {}) })
    } else {
      const a = { title: title.trim(), owner, authority, due: fmtDate(due), dueIso: due, status: 'Not started' as const, linked: linked.trim() || 'General', source: form.kind === 'proposal' ? 'ATLAS proposal' : 'Added manually' }
      if (form.kind === 'proposal') accept(form.proposal.text, a)
      else addAction(a)
    }
    onClose()
  }

  const heading = form?.kind === 'edit' ? 'Edit action' : form?.kind === 'proposal' ? 'Accept proposed action' : 'New action'
  const sub = form?.kind === 'edit' ? form.action.title : form?.kind === 'proposal' ? 'ATLAS proposed this. Name an owner and a date to add it to the register.' : 'Added to the shared action register.'

  return (
    <Modal
      open={!!form}
      onOpenChange={(v) => !v && onClose()}
      title={heading}
      description={sub}
      onSubmit={save}
      footer={<><Button variant="outline" type="button" onClick={onClose}>Cancel</Button><Button type="submit">{form?.kind === 'edit' ? <><Save />Save changes</> : form?.kind === 'proposal' ? <><Check />Accept and add</> : <><Plus />Add action</>}</Button></>}
    >
      {editing ? (
        <ReadOnly items={[['Authority', <AuthorityLabel key="a" a={editing.authority} />], ['Linked to', editing.linked], ['Source', editing.source], ['Reference', editing.id]]} />
      ) : (
        <>
          <Field label="Action" required error={titleErr}>
            {(id, d) => <TextInput id={id} aria-describedby={d} value={title} onChange={(e) => setTitle(e.target.value)} invalid={!!titleErr} placeholder="For example: Confirm crane barge booking for July" autoFocus={form?.kind === 'new'} />}
          </Field>
          <div>
            <div className="mb-1.5 text-[13px] font-medium text-ink">Authority<span className="text-bad"> *</span></div>
            <RadioCards<Authority>
              label="Authority"
              value={authority}
              onChange={setAuthority}
              options={AUTHORITIES.map((a) => ({ value: a, label: a, note: a === 'Shareholder (Denera)' ? 'Denera acts directly' : a === 'Joint' ? 'Project company board decides' : 'Denera can only request' }))}
            />
          </div>
        </>
      )}
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Owner" required error={ownerErr}>
          {(id, d) => (
            <SelectInput id={id} aria-describedby={d} value={owner} onChange={(e) => setOwner(e.target.value)} invalid={!!ownerErr}>
              <option value="">Choose an owner</option>
              {owners.map((o) => <option key={o}>{o}</option>)}
            </SelectInput>
          )}
        </Field>
        <Field
          label="Due date"
          required
          error={dueErr}
          hint={weekend ? `${fmtDate(due, true)} falls on a weekend.` : past ? 'Before the data date, so it shows as overdue.' : undefined}
        >
          {(id, d) => <TextInput id={id} aria-describedby={d} type="date" value={due} onChange={(e) => setDue(e.target.value)} invalid={!!dueErr} />}
        </Field>
      </div>
      {!editing && (
        <Field label="Linked to" hint="Risk, package or decision this action protects.">
          {(id) => <TextInput id={id} value={linked} onChange={(e) => setLinked(e.target.value)} placeholder="For example: Boiler package" />}
        </Field>
      )}
      {editing && (
        <div>
          <div className="mb-1.5 text-[13px] font-medium text-ink">Status<span className="text-bad"> *</span></div>
          <RadioCards<Action['status']>
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'Not started', label: 'Not started', icon: <CircleDashed className="size-4 text-ink-3" /> },
              { value: 'In progress', label: 'In progress', icon: <Clock3 className="size-4 text-info" /> },
              { value: 'Done', label: 'Done', icon: <CheckCircle2 className="size-4 text-ok" />, note: 'Closes the action' },
            ]}
          />
        </div>
      )}
    </Modal>
  )
}

/** Kept for existing callers: edit one action. */
export function ActionEditModal({ action, onClose }: { action: Action | null; onClose: () => void }) {
  return <ActionFormModal form={action ? { kind: 'edit', action } : null} onClose={onClose} />
}
