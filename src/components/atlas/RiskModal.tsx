import { Plus, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Level, Risk, RiskStatus } from '../../data/types'
import { useDemo } from '../../state/store'
import { Button } from '../ui/button'
import { Field, RadioCards, SelectInput, TextArea } from '../ui/form'
import { Modal } from '../ui/sheet'

const OWNERS = ['Procurement Lead', 'Technical Director', 'Project Director', 'Finance Lead', 'PMO Director', 'Permits lead', 'Grid interface lead', 'Regional government liaison']
const PACKAGES = ['All', 'Boiler island', 'Waste receiving system', 'Turbine-generator', 'Flue-gas treatment', 'Grid switchgear', 'Balance of plant', 'Utilities', 'Waste supply']
const STATUSES: RiskStatus[] = ['Not started', 'In progress', 'Mitigated', 'Closed']
const LEVELS: { value: Level; label: string }[] = [{ value: 'High', label: 'High' }, { value: 'Medium', label: 'Medium' }, { value: 'Low', label: 'Low' }]

/** Add a risk, or edit one in the register. `risk === 'new'` opens an empty form. */
export function RiskModal({ risk, onClose }: { risk: Risk | 'new' | null; onClose: () => void }) {
  const addRisk = useDemo((s) => s.addRisk)
  const updateRisk = useDemo((s) => s.updateRisk)
  const isNew = risk === 'new'
  const [text, setText] = useState('')
  const [p, setP] = useState<Level>('Medium')
  const [i, setI] = useState<Level>('Medium')
  const [owner, setOwner] = useState('')
  const [status, setStatus] = useState<RiskStatus>('Not started')
  const [pkg, setPkg] = useState('All')
  const [tried, setTried] = useState(false)

  useEffect(() => {
    if (!risk) return
    setTried(false)
    if (risk === 'new') { setText(''); setP('Medium'); setI('Medium'); setOwner(''); setStatus('Not started'); setPkg('All'); return }
    setText(risk.risk); setP(risk.p); setI(risk.i); setOwner(risk.owner ?? ''); setStatus(risk.status); setPkg(risk.pkg)
  }, [risk])

  const textErr = tried && !text.trim() && 'Describe the risk in one line.'
  const ownerErr = tried && !owner && status !== 'Closed' && 'Name an owner. Risks without an effective owner are flagged.'

  const save = () => {
    setTried(true)
    if (!risk || !text.trim() || (!owner && status !== 'Closed')) return
    const data = { risk: text.trim(), p, i, owner: owner || null, status, pkg }
    if (risk === 'new') addRisk(data)
    else updateRisk(risk.id, data)
    onClose()
  }

  return (
    <Modal
      open={!!risk}
      onOpenChange={(v) => !v && onClose()}
      title={isNew ? 'Add risk' : `Edit risk ${typeof risk === 'object' && risk ? risk.id : ''}`}
      description={isNew ? 'Added to the PSEL Cakrawala Raya risk register.' : typeof risk === 'object' && risk ? risk.risk : undefined}
      onSubmit={save}
      footer={<><Button variant="outline" type="button" onClick={onClose}>Cancel</Button><Button type="submit">{isNew ? <><Plus />Add risk</> : <><Save />Save changes</>}</Button></>}
    >
      <Field label="Risk" required error={textErr}>
        {(id, d) => <TextArea id={id} aria-describedby={d} rows={2} value={text} onChange={(e) => setText(e.target.value)} invalid={!!textErr} placeholder="For example: Crane barge not available for the July window" autoFocus={isNew} />}
      </Field>
      <div>
        <div className="mb-1.5 text-[13px] font-medium text-ink">Probability<span className="text-bad"> *</span></div>
        <RadioCards<Level> label="Probability" value={p} onChange={setP} options={LEVELS} />
      </div>
      <div>
        <div className="mb-1.5 text-[13px] font-medium text-ink">Impact<span className="text-bad"> *</span></div>
        <RadioCards<Level> label="Impact" value={i} onChange={setI} options={LEVELS} />
      </div>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Owner" required={status !== 'Closed'} error={ownerErr}>
          {(id, d) => (
            <SelectInput id={id} aria-describedby={d} value={owner} onChange={(e) => setOwner(e.target.value)} invalid={!!ownerErr}>
              <option value="">Choose an owner</option>
              {OWNERS.map((o) => <option key={o}>{o}</option>)}
            </SelectInput>
          )}
        </Field>
        <Field label="Linked package">
          {(id) => <SelectInput id={id} value={pkg} onChange={(e) => setPkg(e.target.value)}>{PACKAGES.map((o) => <option key={o}>{o}</option>)}</SelectInput>}
        </Field>
      </div>
      <Field label="Mitigation status" required hint={status === 'Closed' ? 'Closed risks stay in the register for the record.' : undefined}>
        {(id) => <SelectInput id={id} value={status} onChange={(e) => setStatus(e.target.value as RiskStatus)}>{STATUSES.map((o) => <option key={o}>{o}</option>)}</SelectInput>}
      </Field>
    </Modal>
  )
}
