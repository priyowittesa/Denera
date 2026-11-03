import { MessageSquare, Send, Trash2 } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import type { Comment } from '../../data/types'
import { usePersona, useDemo } from '../../state/store'
import { Button } from '../ui/button'
import { Field, TextArea } from '../ui/form'
import { Modal } from '../ui/sheet'

const NONE: Comment[] = []

/** Comment count button for a record whose value is computed and cannot be edited. */
export function CommentButton({ k, label, onOpen }: { k: string; label: string; onOpen: () => void }) {
  const n = useDemo((s) => (s.comments[k] ?? NONE).length)
  return (
    <button onClick={onOpen} className="press inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[12px] font-medium text-ink-3 hover:bg-sunken hover:text-ink-2" aria-label={`Comments on ${label}, ${n}`}>
      <MessageSquare className="size-3.5" />{n > 0 ? n : 'Comment'}
    </button>
  )
}

/** Thread of comments on one record: read, add, and delete your own. The record itself is not edited. */
export function CommentsModal({ k, label, context, onClose }: { k: string | null; label: string; context?: ReactNode; onClose: () => void }) {
  const list = useDemo((s) => (k ? s.comments[k] ?? NONE : NONE))
  const add = useDemo((s) => s.addComment)
  const del = useDemo((s) => s.deleteComment)
  const { id: me } = usePersona()
  const [text, setText] = useState('')
  const [tried, setTried] = useState(false)
  useEffect(() => { if (k) { setText(''); setTried(false) } }, [k])
  const err = tried && !text.trim() && 'Write a comment first.'
  return (
    <Modal
      open={!!k}
      onOpenChange={(v) => !v && onClose()}
      title={`Comments, ${label}`}
      description="The rating is computed by ATLAS and cannot be changed. Comments are visible to every role and kept in the audit log."
      onSubmit={() => { setTried(true); if (k && text.trim()) { add(k, label, text.trim()); setText(''); setTried(false) } }}
      footer={<><Button variant="outline" type="button" onClick={onClose}>Close</Button><Button type="submit"><Send />Post comment</Button></>}
    >
      {context}
      {list.length > 0 ? (
        <ul className="divide-y divide-line-soft rounded-[10px] border border-line">
          {list.map((c) => (
            <li key={c.id} className="flex items-start gap-3 px-3.5 py-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-atlas-100 text-[11px] font-bold text-atlas-700">{c.by.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 text-[12px] text-ink-3"><span className="text-[13px] font-medium text-ink">{c.by}</span><span className="tnum">{c.at}</span></div>
                <p className="mt-0.5 text-[13.5px] text-ink-2">{c.text}</p>
              </div>
              {c.role === me && (
                <button type="button" onClick={() => del(k!, c.id)} className="press grid size-8 place-items-center rounded-md text-ink-3 hover:bg-bad-bg hover:text-bad" aria-label="Delete comment"><Trash2 className="size-4" /></button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-[10px] bg-sunken px-3.5 py-3 text-[13px] text-ink-3">No comments yet.</p>
      )}
      <Field label="Add a comment" error={err}>
        {(id, d) => <TextArea id={id} aria-describedby={d} rows={3} value={text} onChange={(e) => setText(e.target.value)} invalid={!!err} placeholder="For example: Vendor confirmed a second shift from 5 Jul; check next week." />}
      </Field>
    </Modal>
  )
}
