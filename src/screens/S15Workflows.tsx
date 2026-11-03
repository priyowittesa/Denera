import { CalendarClock, Copy, Hourglass, Pencil, Play, Plus, Trash2, Waypoints, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ConfirmModal } from '../components/atlas/ConfirmModal'
import { StatePill } from '../components/atlas/chips'
import { ScreenFrame, StatTile } from '../components/atlas/frame'
import { RenameModal, WorkflowEditor } from '../components/atlas/WorkflowEditor'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Field, RadioCards, TextArea, TextInput } from '../components/ui/form'
import { Modal } from '../components/ui/sheet'
import { Switch } from '../components/ui/switch'
import { Segmented } from '../components/ui/tabs'
import { NoResults, ResultFooter, SearchBox } from '../components/ui/toolbar'
import { DEFS, TEMPLATES, nodeSummary, triggerOf, type TemplateKind, type Workflow } from '../data/workflows'
import { useWorkflows } from '../state/workflows'

type Filter = 'all' | 'active' | 'paused'

export function S15Workflows() {
  const [params, setParams] = useSearchParams()
  const workflows = useWorkflows((s) => s.workflows)
  const flow = params.get('flow')
  const wf = flow ? workflows.find((w) => w.id === flow) : undefined
  if (wf) return <WorkflowEditor wf={wf} onBack={() => setParams({})} />
  return <WorkflowList onOpen={(id) => setParams({ flow: id })} />
}

function WorkflowList({ onOpen }: { onOpen: (id: string) => void }) {
  const S = useWorkflows()
  const [q, setQ] = useState('')
  const [f, setF] = useState<Filter>('all')
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Workflow | null>(null)
  const [deleting, setDeleting] = useState<Workflow | null>(null)

  const all = S.workflows
  const shown = all
    .filter((w) => f === 'all' || (f === 'active' ? w.active : !w.active))
    .filter((w) => !q.trim() || `${w.name} ${w.description}`.toLowerCase().includes(q.trim().toLowerCase()))
  const reset = () => { setQ(''); setF('all') }
  const runs = all.reduce((n, w) => n + w.runs, 0)
  const approvals = all.reduce((n, w) => n + w.nodes.filter((x) => x.type === 'approval').length, 0)

  return (
    <ScreenFrame
      project="Platform"
      headline="Connect jobs into flows. A trigger starts a flow, steps analyse and draft, people approve at the gates, and every run is written to the audit log."
      confidence={false}
      aside={<Button onClick={() => setCreating(true)}><Plus />New workflow</Button>}
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={Waypoints} label="Workflows" value={all.length} cap="Saved in this workspace" />
        <StatTile icon={Zap} tone="ok" label="Active" value={all.filter((w) => w.active).length} cap="Start on their own trigger" />
        <StatTile icon={Play} label="Runs" value={runs} cap="Since the workspace opened" />
        <StatTile icon={Hourglass} tone="warn" label="Approval gates" value={approvals} cap="Where a person decides" />
      </div>

      <Card className="mt-[18px] overflow-hidden">
        <div className="flex flex-wrap items-center gap-2.5 px-[18px] py-3.5">
          <SearchBox value={q} onChange={setQ} label="Search workflows" placeholder="Search workflows" className="w-full sm:w-[300px]" />
          <Segmented<Filter> label="Status" value={f} onChange={setF} items={[
            { value: 'all', label: `All ${all.length}` },
            { value: 'active', label: `Active ${all.filter((w) => w.active).length}` },
            { value: 'paused', label: `Paused ${all.filter((w) => !w.active).length}` },
          ]} />
        </div>
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full min-w-[880px] text-[13px]">
            <thead>
              <tr><th>Workflow</th><th>Trigger</th><th className="text-right">Steps</th><th>Status</th><th>Last run</th><th className="hidden 2xl:table-cell">Updated</th><th><span className="sr-only">Actions</span></th></tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {shown.map((w) => {
                const t = triggerOf(w)
                return (
                  <tr key={w.id} className="cursor-pointer hover:bg-[#faf9fe]" onClick={() => onOpen(w.id)}>
                    <td>
                      <button className="press block w-[240px] max-w-full text-left 2xl:w-[340px]" aria-label={`Open ${w.name}`}>
                        <span className="block text-[14px] font-medium text-ink">{w.name}</span>
                        <span className="block truncate text-[12px] text-ink-3">{w.description}</span>
                      </button>
                    </td>
                    <td className="whitespace-nowrap text-ink-2">
                      {t ? <span className="inline-flex items-center gap-1.5"><CalendarClock className="size-3.5 text-ink-3" />{DEFS[t.type].label}<span className="hidden text-ink-3 xl:inline"> · {nodeSummary(t)}</span></span> : <span className="text-ink-4">No trigger</span>}
                    </td>
                    <td className="tnum text-right">{w.nodes.length}</td>
                    <td onClick={(e) => e.stopPropagation()}><Switch id={`act-${w.id}`} checked={w.active} onCheckedChange={(v) => S.setActive(w.id, v)} label={w.active ? 'Active' : 'Paused'} /></td>
                    <td className="whitespace-nowrap">
                      {w.lastRun ? <span className="inline-flex items-center gap-2"><StatePill s={w.lastRun.status} /><span className="tnum text-ink-3">{w.lastRun.at}</span></span> : <span className="text-ink-4">Never run</span>}
                    </td>
                    <td className="tnum hidden whitespace-nowrap text-ink-3 2xl:table-cell">{w.updatedAt}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <span className="flex items-center justify-end gap-0.5">
                        <Button size="iconSm" variant="ghost" aria-label={`Edit details of ${w.name}`} onClick={() => setEditing(w)}><Pencil /></Button>
                        <Button size="iconSm" variant="ghost" aria-label={`Duplicate ${w.name}`} onClick={() => S.duplicateWorkflow(w.id)}><Copy /></Button>
                        <Button size="iconSm" variant="ghost" aria-label={`Delete ${w.name}`} onClick={() => setDeleting(w)}><Trash2 /></Button>
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {shown.length === 0 && <NoResults noun="workflows" onReset={reset} />}
        </div>
        <ResultFooter shown={shown.length} total={all.length} noun="workflows" filtered={!!q.trim() || f !== 'all'} onReset={reset} />
      </Card>

      <CreateModal open={creating} onClose={() => setCreating(false)} onCreate={(id) => { setCreating(false); onOpen(id) }} />
      {editing && <RenameModal open wf={editing} onClose={() => setEditing(null)} />}
      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete workflow"
        description={deleting?.name}
        confirmLabel="Delete workflow"
        confirmIcon={<Trash2 />}
        danger
        onConfirm={() => deleting && S.deleteWorkflow(deleting.id)}
        effects={['Remove the workflow and all of its connections.', 'Stop it from starting on its trigger.', 'Keep the audit log of past runs.']}
        note="This cannot be undone."
      />
    </ScreenFrame>
  )
}

function CreateModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (id: string) => void }) {
  const create = useWorkflows((s) => s.createWorkflow)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [tpl, setTpl] = useState<TemplateKind>('blank')
  const [tried, setTried] = useState(false)
  useEffect(() => { if (open) { setName(''); setDesc(''); setTpl('blank'); setTried(false) } }, [open])
  const err = tried && !name.trim() && 'Give the workflow a name.'
  return (
    <Modal
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title="New workflow"
      description="Start blank or from a template. You can change everything on the canvas."
      onSubmit={() => { setTried(true); if (name.trim()) onCreate(create(name.trim(), desc.trim(), tpl)) }}
      footer={<><Button variant="outline" type="button" onClick={onClose}>Cancel</Button><Button type="submit"><Plus />Create workflow</Button></>}
    >
      <Field label="Name" required error={err}>{(id, d) => <TextInput id={id} aria-describedby={d} value={name} onChange={(e) => setName(e.target.value)} invalid={!!err} placeholder="For example: Friday cost check" autoFocus />}</Field>
      <Field label="Description">{(id) => <TextArea id={id} rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What it does, in one sentence" />}</Field>
      <div>
        <div className="mb-1.5 text-[13px] font-medium text-ink">Start from</div>
        <RadioCards<TemplateKind> label="Template" columns={2} value={tpl} onChange={setTpl} options={TEMPLATES.map((t) => ({ value: t.id, label: t.label, note: t.note }))} />
      </div>
    </Modal>
  )
}
