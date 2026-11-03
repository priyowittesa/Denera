import {
  ArrowLeft, Check, CheckCircle2, ChevronDown, ChevronRight, Copy, Hourglass, Loader2, Maximize, PanelLeft, Pencil, Play, Plus, ScrollText, Settings2, Square, Trash2, X, XCircle, ZoomIn, ZoomOut,
} from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { CATEGORIES, DEFS, NODE_DEFS, nodeSummary, type NodeType, type Tone, type WfNode, type Workflow } from '../../data/workflows'
import { DATA_DATE_ISO, isOverdue } from '../../data/registers'
import { cn } from '../../lib/cn'
import { fmtDate } from '../../lib/date'
import { runWorkflow, type NodeRun } from '../../lib/workflowRun'
import { useDemo } from '../../state/store'
import { useWorkflows } from '../../state/workflows'
import { Button } from '../ui/button'
import { Field, SelectInput, TextArea, TextInput } from '../ui/form'
import { Modal } from '../ui/sheet'
import { Switch } from '../ui/switch'
import { SearchBox } from '../ui/toolbar'
import { Pill } from './chips'

const NODE_W = 224
const NODE_H = 92
const PORT_AREA = 64
const portY = (count: number, i: number) => (PORT_AREA * (i + 1)) / (count + 1)

const TONE: Record<Tone, string> = {
  warn: 'bg-warn-bg text-warn',
  info: 'bg-info-bg text-info',
  brand: 'bg-atlas-100 text-atlas-700',
  muted: 'bg-sunken text-ink-2',
  ok: 'bg-ok-bg text-ok',
  live: 'bg-[#ffedd5] text-[#c2410c]',
}

const outPos = (n: WfNode, port: string) => {
  const outs = DEFS[n.type].outputs
  const i = Math.max(0, outs.findIndex((o) => o.id === port))
  return { x: n.x + NODE_W, y: n.y + portY(outs.length, i) }
}
const inPos = (n: WfNode) => ({ x: n.x, y: n.y + PORT_AREA / 2 })
const curve = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const dx = Math.max(60, Math.abs(b.x - a.x) / 2)
  return `M${a.x},${a.y} C${a.x + dx},${a.y} ${b.x - dx},${b.y} ${b.x},${b.y}`
}

type Sel = { kind: 'node' | 'edge'; id: string } | null
type Drag =
  | { kind: 'pan'; sx: number; sy: number; px: number; py: number }
  | { kind: 'node'; id: string; sx: number; sy: number; nx: number; ny: number }
  | { kind: 'conn'; from: string; port: string }

/* ---------- Palette ---------- */

function Palette({ onAdd, className }: { onAdd: (t: NodeType) => void; className?: string }) {
  const [q, setQ] = useState('')
  const [closed, setClosed] = useState<Record<string, boolean>>({})
  const list = NODE_DEFS.filter((d) => !q.trim() || `${d.label} ${d.blurb} ${d.category}`.toLowerCase().includes(q.trim().toLowerCase()))
  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      <div className="p-3"><SearchBox value={q} onChange={setQ} label="Search nodes" placeholder="Search nodes" /></div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {CATEGORIES.map((c) => {
          const items = list.filter((d) => d.category === c)
          if (!items.length) return null
          const open = q.trim() ? true : !closed[c]
          return (
            <section key={c} className="mb-1">
              <button onClick={() => setClosed((m) => ({ ...m, [c]: !m[c] }))} className="press flex w-full items-center justify-between rounded-md px-1 py-2 text-[13px] font-semibold text-ink-2 hover:text-ink" aria-expanded={open}>
                {c}{open ? <ChevronDown className="size-4 text-ink-3" /> : <ChevronRight className="size-4 text-ink-3" />}
              </button>
              {open && (
                <ul className="space-y-1.5">
                  {items.map((d) => (
                    <li key={d.type}>
                      <button
                        draggable
                        onDragStart={(e) => { e.dataTransfer.setData('text/wf-node', d.type); e.dataTransfer.effectAllowed = 'copy' }}
                        onClick={() => onAdd(d.type)}
                        className="press flex w-full cursor-grab items-center gap-2.5 rounded-lg border border-line bg-surface px-2.5 py-2 text-left hover:border-atlas-300 hover:bg-atlas-50/40 active:cursor-grabbing"
                      >
                        <span className={cn('grid size-8 shrink-0 place-items-center rounded-md', TONE[d.tone])}><d.icon className="size-4" /></span>
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-medium text-ink">{d.label}</span>
                          <span className="block truncate text-[12px] text-ink-3">{d.blurb}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        })}
        {list.length === 0 && <p className="px-1 py-6 text-center text-[13px] text-ink-3">No node matches.</p>}
      </div>
    </div>
  )
}

/* ---------- Editor ---------- */

export function WorkflowEditor({ wf, onBack }: { wf: Workflow; onBack: () => void }) {
  const S = useWorkflows()
  const box = useRef<HTMLDivElement>(null)
  const drag = useRef<Drag | null>(null)
  const cancel = useRef(false)
  const approvals = useRef<Record<string, (ok: boolean) => void>>({})

  const [pan, setPan] = useState({ x: 40, y: 40 })
  const [zoom, setZoom] = useState(1)
  const [sel, setSel] = useState<Sel>(null)
  /** Settings open on double-click or the gear, so a plain click never covers the canvas */
  const [panelFor, setPanelFor] = useState<string | null>(null)
  const [conn, setConn] = useState<{ from: string; port: string; x: number; y: number } | null>(null)
  const [runMap, setRunMap] = useState<Record<string, NodeRun>>({})
  const [lines, setLines] = useState<{ t: string; node: string; text: string }[]>([])
  const [running, setRunning] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const [picker, setPicker] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(true)
  const [renaming, setRenaming] = useState(false)

  const nodes = wf.nodes
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes])
  const selNode = sel?.kind === 'node' ? byId.get(sel.id) : undefined
  const panelNode = panelFor ? byId.get(panelFor) : undefined

  /* --- view --- */
  const toCanvas = useCallback((cx: number, cy: number) => {
    const r = box.current!.getBoundingClientRect()
    return { x: (cx - r.left - pan.x) / zoom, y: (cy - r.top - pan.y) / zoom }
  }, [pan, zoom])

  const fit = useCallback(() => {
    const el = box.current
    if (!el) return
    const r = el.getBoundingClientRect()
    if (!nodes.length) { setPan({ x: 40, y: 40 }); setZoom(1); return }
    const minX = Math.min(...nodes.map((n) => n.x)), maxX = Math.max(...nodes.map((n) => n.x + NODE_W))
    const minY = Math.min(...nodes.map((n) => n.y)), maxY = Math.max(...nodes.map((n) => n.y + NODE_H))
    const z = Math.min(1.1, Math.max(0.5, Math.min((r.width - 100) / (maxX - minX), (r.height - 100) / (maxY - minY))))
    setZoom(z)
    const cw = (maxX - minX) * z, ch = (maxY - minY) * z
    setPan({
      x: cw <= r.width - 48 ? (r.width - cw) / 2 - minX * z : 24 - minX * z,
      y: ch <= r.height - 48 ? (r.height - ch) / 2 - minY * z : 24 - minY * z,
    })
  }, [nodes])

  useLayoutEffect(() => { fit() }, [wf.id]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const id = requestAnimationFrame(() => fit()); return () => cancelAnimationFrame(id) }, [paletteOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const zoomBy = useCallback((f: number, cx?: number, cy?: number) => {
    const el = box.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = cx ?? r.left + r.width / 2, py = cy ?? r.top + r.height / 2
    const nz = Math.min(1.6, Math.max(0.35, zoom * f))
    const k = nz / zoom
    setPan((p) => ({ x: px - r.left - (px - r.left - p.x) * k, y: py - r.top - (py - r.top - p.y) * k }))
    setZoom(nz)
  }, [zoom])

  useEffect(() => {
    const el = box.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) zoomBy(e.deltaY < 0 ? 1.08 : 1 / 1.08, e.clientX, e.clientY)
      else setPan((p) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomBy])

  /* --- adding nodes --- */
  /** Pan just enough that a node placed at (x, y) is fully visible, clear of the settings panel. */
  const reveal = (x: number, y: number) => {
    const el = box.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const right = r.width - 24 - (r.width >= 640 ? 340 : 0)
    setPan((p) => {
      const sx = x * zoom + p.x, sy = y * zoom + p.y
      const w = NODE_W * zoom, h = NODE_H * zoom
      let nx = p.x, ny = p.y
      if (sx < 24) nx += 24 - sx
      else if (sx + w > right) nx -= sx + w - right
      if (sy < 24) ny += 24 - sy
      else if (sy + h > r.height - 24) ny -= sy + h - (r.height - 24)
      return { x: nx, y: ny }
    })
  }
  const addAt = (type: NodeType, x: number, y: number) => {
    const id = S.addNode(wf.id, type, x, y)
    setSel({ kind: 'node', id })
    reveal(x, y)
    return id
  }
  const addFromPalette = (type: NodeType) => {
    const el = box.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const trigger = DEFS[type].trigger
    // Follow the selected node, like n8n: place to its right and connect its first free output.
    if (selNode && !trigger) {
      const outs = DEFS[selNode.type].outputs
      const free = outs.find((o) => !wf.edges.some((e) => e.from === selNode.id && e.port === o.id)) ?? outs[0]
      const i = outs.findIndex((o) => o.id === free.id)
      const id = addAt(type, selNode.x + NODE_W + 80, selNode.y + i * 110)
      S.connect(wf.id, selNode.id, free.id, id)
      return
    }
    if (nodes.length) {
      // Next free spot: to the right of the right-most node, never on top of one.
      const last = nodes.reduce((a, n) => (n.x > a.x ? n : a))
      addAt(type, last.x + NODE_W + 80, last.y)
      return
    }
    const c = toCanvas(r.left + r.width / 2, r.top + r.height / 2)
    addAt(type, c.x - NODE_W / 2, c.y - NODE_H / 2)
  }

  const onDrop = (e: React.DragEvent) => {
    const t = e.dataTransfer.getData('text/wf-node') as NodeType
    if (!t || !DEFS[t]) return
    e.preventDefault()
    const c = toCanvas(e.clientX, e.clientY)
    addAt(t, c.x - NODE_W / 2, c.y - 30)
  }

  /* --- pointer interaction --- */
  const startDrag = (d: Drag, e: React.PointerEvent) => {
    drag.current = d
    box.current?.setPointerCapture(e.pointerId)
  }
  const onBoxDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-node],[data-edge],[data-panel],[data-ctl]')) return
    setSel(null)
    setPanelFor(null)
    startDrag({ kind: 'pan', sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y }, e)
  }
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    if (d.kind === 'pan') setPan({ x: d.px + e.clientX - d.sx, y: d.py + e.clientY - d.sy })
    else if (d.kind === 'node') S.moveNode(wf.id, d.id, d.nx + (e.clientX - d.sx) / zoom, d.ny + (e.clientY - d.sy) / zoom)
    else { const c = toCanvas(e.clientX, e.clientY); setConn({ from: d.from, port: d.port, x: c.x, y: c.y }) }
  }
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current
    drag.current = null
    if (d?.kind === 'conn') {
      const hit = document.elementsFromPoint(e.clientX, e.clientY).map((el) => (el as HTMLElement).closest?.('[data-node]') as HTMLElement | null).find(Boolean)
      const to = hit?.dataset.node
      if (to && to !== d.from) {
        const r = S.connect(wf.id, d.from, d.port, to)
        if (r === 'loop') toast.error('That would make a loop', { description: 'A flow runs forward only.' })
        else if (r === 'trigger') toast.error('A trigger has no input', { description: 'Connect into a later step.' })
        else if (r === 'duplicate') toast('Already connected')
      }
      setConn(null)
    }
  }

  const onKey = (e: React.KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return
    if ((e.key === 'Delete' || e.key === 'Backspace') && sel) { e.preventDefault(); removeSel() }
    if (e.key === 'Escape') { setSel(null); setPanelFor(null) }
    if (e.key === 'Enter' && selNode) setPanelFor(selNode.id)
  }
  const removeSel = () => {
    if (!sel) return
    if (sel.kind === 'node') S.removeNode(wf.id, sel.id)
    else S.removeEdge(wf.id, sel.id)
    setSel(null)
    setPanelFor(null)
  }

  /* --- run --- */
  const log = (node: string, text: string) => setLines((l) => [...l, { t: new Date().toTimeString().slice(0, 8), node, text }])
  const decide = (nodeId: string, ok: boolean) => { approvals.current[nodeId]?.(ok); delete approvals.current[nodeId] }

  const run = async () => {
    if (running) return
    if (!nodes.some((n) => DEFS[n.type].trigger)) { toast.error('Add a trigger first', { description: 'Every flow starts from a trigger.' }); return }
    cancel.current = false
    setRunMap({}); setLines([]); setRunning(true); setLogOpen(true); setSel(null)
    const demo = useDemo.getState()
    const snap = wf
    const { result, ms } = await runWorkflow(snap, {
      setNode: (id, r) => setRunMap((m) => ({ ...m, [id]: r })),
      log,
      cancelled: () => cancel.current,
      approve: (n) => new Promise<boolean>((res) => { approvals.current[n.id] = res }),
      sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
      metrics: { 'Overdue actions': demo.actions.filter(isOverdue).length },
      effects: {
        createAction: (title, owner, days) => {
          if (useDemo.getState().actions.some((a) => a.title === title)) return `Already in the register: ${title}`
          const d = new Date(`${DATA_DATE_ISO}T00:00:00Z`)
          d.setUTCDate(d.getUTCDate() + days)
          const iso = d.toISOString().slice(0, 10)
          useDemo.getState().addAction({ title, owner, authority: 'Shareholder (Denera)', due: fmtDate(iso), dueIso: iso, status: 'Not started', linked: 'Workflow automation', source: snap.name }, 'Action created by a workflow')
          return `Created action: ${title}, due ${fmtDate(iso)}`
        },
        notify: (to, message) => { useDemo.getState().log('Workflow notification', `${to}: ${message}`); toast('Notification sent', { description: `${to}: ${message}` }) },
        addToPack: (note) => { useDemo.getState().log('Added to weekly pack draft', note || snap.name) },
      },
    })
    S.recordRun(wf.id, { at: `30 Jun 2027 ${new Date().toTimeString().slice(0, 5)}`, status: result, ms })
    useDemo.getState().log('Ran workflow', `${snap.name}: ${result}`)
    setRunning(false)
    if (result === 'Completed') toast.success('Run completed', { description: `${snap.name} · ${(ms / 1000).toFixed(1)}s` })
    else toast(result === 'Rejected' ? 'Run stopped at a rejection' : 'Run stopped', { description: snap.name })
  }
  const stop = () => { cancel.current = true; Object.keys(approvals.current).forEach((id) => decide(id, true)) }
  useEffect(() => () => { cancel.current = true; Object.keys(approvals.current).forEach((id) => approvals.current[id](true)) }, [])

  const waitingCount = Object.values(runMap).filter((r) => r.status === 'waiting').length

  /* --- render --- */
  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      {/* Toolbar */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-surface px-3 py-2.5 sm:px-5">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft />Back</Button>
        <button onClick={() => setRenaming(true)} className="press group inline-flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1 text-left hover:bg-sunken" aria-label="Rename workflow">
          <span className="truncate text-[14px] font-semibold text-ink">{wf.name}</span>
          <Pencil className="size-3.5 shrink-0 text-ink-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
        </button>
        <span className="hidden items-center gap-1 text-[13px] text-ink-3 md:inline-flex"><CheckCircle2 className="size-3.5 text-ok" />Saved</span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Switch id="wf-active" checked={wf.active} onCheckedChange={(v) => S.setActive(wf.id, v)} label={wf.active ? 'Active' : 'Paused'} />
          <span className="mx-1 hidden h-6 w-px bg-line sm:block" />
          <div className="hidden items-center md:flex" data-ctl>
            <Button variant="ghost" size="iconSm" aria-label="Zoom out" onClick={() => zoomBy(1 / 1.2)}><ZoomOut /></Button>
            <Button variant="ghost" size="iconSm" aria-label="Zoom in" onClick={() => zoomBy(1.2)}><ZoomIn /></Button>
            <Button variant="ghost" size="iconSm" aria-label="Fit to screen" onClick={fit}><Maximize /></Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setLogOpen((v) => !v)} aria-pressed={logOpen}><ScrollText />Log{lines.length > 0 && <span className="tnum text-ink-3">{lines.length}</span>}</Button>
          <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setPicker(true)}><Plus />Add node</Button>
          <Button variant="ghost" size="iconSm" className="hidden lg:inline-flex" aria-label={paletteOpen ? 'Hide node list' : 'Show node list'} aria-pressed={paletteOpen} onClick={() => setPaletteOpen((v) => !v)}><PanelLeft /></Button>
          {running ? <Button size="md" variant="outline" onClick={stop}><Square />Stop</Button> : <Button size="md" onClick={run}><Play />Run</Button>}
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {paletteOpen && (
          <aside className="hidden w-[264px] shrink-0 border-r border-line bg-surface lg:flex lg:flex-col" aria-label="Nodes">
            <Palette onAdd={addFromPalette} className="flex-1" />
          </aside>
        )}

        {/* Canvas */}
        <div className="relative min-w-0 flex-1">
          <div
            ref={box}
            tabIndex={0}
            role="application"
            aria-label="Workflow canvas"
            onKeyDown={onKey}
            onPointerDown={onBoxDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onDragOver={(e) => { if (e.dataTransfer.types.includes('text/wf-node')) e.preventDefault() }}
            onDrop={onDrop}
            style={{ backgroundImage: 'radial-gradient(circle, #d4d4d8 1.2px, transparent 1.3px)', backgroundSize: `${22 * zoom}px ${22 * zoom}px`, backgroundPosition: `${pan.x}px ${pan.y}px`, touchAction: 'none' }}
            className="absolute inset-0 cursor-grab overflow-hidden bg-[#fafafa] outline-none active:cursor-grabbing"
          >
            <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }} className="absolute left-0 top-0">
              {/* Edges */}
              <svg className="pointer-events-none absolute left-0 top-0 overflow-visible" width="1" height="1" aria-hidden>
                <defs>
                  <marker id="wf-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#a78bfa" /></marker>
                  <marker id="wf-arrow-on" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#7c3aed" /></marker>
                </defs>
                {wf.edges.map((e) => {
                  const a = byId.get(e.from), b = byId.get(e.to)
                  if (!a || !b) return null
                  const d = curve(outPos(a, e.port), inPos(b))
                  const on = runMap[e.from]?.status === 'done'
                  const selected = sel?.kind === 'edge' && sel.id === e.id
                  return (
                    <g key={e.id} data-edge={e.id}>
                      <path d={d} fill="none" stroke="transparent" strokeWidth={18} style={{ pointerEvents: 'stroke', cursor: 'pointer' }} onPointerDown={(ev) => { ev.stopPropagation(); setSel({ kind: 'edge', id: e.id }) }} />
                      <path d={d} fill="none" stroke={selected ? '#5b21b6' : on ? '#7c3aed' : '#a78bfa'} strokeWidth={selected ? 3 : 2} strokeDasharray={on || selected ? undefined : '6 6'} markerEnd={`url(#${on ? 'wf-arrow-on' : 'wf-arrow'})`} />
                    </g>
                  )
                })}
                {conn && byId.get(conn.from) && <path d={curve(outPos(byId.get(conn.from)!, conn.port), { x: conn.x, y: conn.y })} fill="none" stroke="#7c3aed" strokeWidth={2} strokeDasharray="4 4" />}
              </svg>

              {/* Edge delete */}
              {sel?.kind === 'edge' && (() => {
                const e = wf.edges.find((x) => x.id === sel.id)
                const a = e && byId.get(e.from), b = e && byId.get(e.to)
                if (!e || !a || !b) return null
                const p1 = outPos(a, e.port), p2 = inPos(b)
                return (
                  <button data-edge onPointerDown={(ev) => ev.stopPropagation()} onClick={removeSel} aria-label="Delete connection" style={{ left: (p1.x + p2.x) / 2 - 14, top: (p1.y + p2.y) / 2 - 14 }} className="press absolute grid size-7 place-items-center rounded-full border border-line bg-surface text-bad shadow-sm hover:bg-bad-bg">
                    <Trash2 className="size-3.5" />
                  </button>
                )
              })()}

              {/* Nodes */}
              {nodes.map((n) => {
                const def = DEFS[n.type]
                const run = runMap[n.id]
                const selected = sel?.kind === 'node' && sel.id === n.id
                return (
                  <div
                    key={n.id}
                    data-node={n.id}
                    onPointerDown={(e) => { e.stopPropagation(); setSel({ kind: 'node', id: n.id }); if (panelFor && panelFor !== n.id) setPanelFor(null); startDrag({ kind: 'node', id: n.id, sx: e.clientX, sy: e.clientY, nx: n.x, ny: n.y }, e) }}
                    onDoubleClick={() => setPanelFor(n.id)}
                    style={{ left: n.x, top: n.y, width: NODE_W, height: NODE_H }}
                    className={cn(
                      'group/node absolute cursor-grab select-none rounded-xl border bg-surface transition-[border-color,box-shadow] duration-150 active:cursor-grabbing',
                      selected ? 'border-atlas-500 shadow-[0_0_0_3px_var(--color-atlas-200)]' : run?.status === 'running' ? 'border-atlas-400 shadow-[0_0_0_3px_var(--color-atlas-100)]' : run?.status === 'skipped' ? 'border-line opacity-60' : 'border-line hover:border-atlas-300',
                    )}
                  >
                    <div className={cn('flex items-center gap-2.5 pl-3', def.outputs.length > 1 ? 'pr-11' : 'pr-3')} style={{ height: PORT_AREA }}>
                      <span className={cn('grid size-9 shrink-0 place-items-center rounded-lg', TONE[def.tone])}><def.icon className="size-[18px]" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold leading-tight text-ink">{n.name}</span>
                        <span className="block truncate text-[12px] leading-tight text-ink-3">{nodeSummary(n)}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 border-t border-line-soft px-3 text-[12px]" style={{ height: NODE_H - PORT_AREA }}>
                      <NodeStatus run={run} onDecide={(ok) => decide(n.id, ok)} who={n.params.who} />
                      {run?.status !== 'waiting' && (
                        <button
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={() => { setSel({ kind: 'node', id: n.id }); setPanelFor(n.id) }}
                          aria-label={`Open settings of ${n.name}`}
                          className={cn('press ml-auto grid size-6 shrink-0 place-items-center rounded-md text-ink-3 hover:bg-sunken hover:text-ink', selected ? 'opacity-100' : 'opacity-0 focus-visible:opacity-100 group-hover/node:opacity-100')}
                        ><Settings2 className="size-3.5" /></button>
                      )}
                    </div>

                    {!def.trigger && (
                      <span data-in-handle className="absolute grid size-[22px] -translate-x-1/2 -translate-y-1/2 place-items-center" style={{ left: 0, top: PORT_AREA / 2 }}>
                        <span className="size-3.5 rounded-full border-2 border-atlas-500 bg-surface" />
                      </span>
                    )}
                    {def.outputs.map((o, i) => (
                      <span key={o.id} className="absolute -translate-y-1/2" style={{ right: 0, top: portY(def.outputs.length, i) }}>
                        {o.label && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-medium text-ink-3">{o.label}</span>}
                        <button
                          aria-label={`Connect from ${n.name}${o.label ? `, ${o.label}` : ''}`}
                          onPointerDown={(e) => { e.stopPropagation(); setSel({ kind: 'node', id: n.id }); startDrag({ kind: 'conn', from: n.id, port: o.id }, e) }}
                          className="grid size-[22px] translate-x-1/2 cursor-crosshair place-items-center"
                        >
                          <span className="size-3.5 rounded-full border-2 border-atlas-500 bg-atlas-500 transition-transform duration-150 hover:scale-125" />
                        </button>
                      </span>
                    ))}
                  </div>
                )
              })}
            </div>

            {nodes.length === 0 && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center p-6 text-center">
                <div>
                  <p className="text-[16px] font-semibold text-ink">Start with a trigger</p>
                  <p className="mt-1 max-w-[340px] text-[14px] text-ink-3">Pick a node on the left. Drag from the dot on its right edge to the next node to connect them.</p>
                </div>
              </div>
            )}

            {/* Zoom readout */}
            <div data-ctl className="absolute bottom-3 left-3 flex items-center gap-1 rounded-lg border border-line bg-surface p-0.5">
              <Button variant="ghost" size="iconSm" aria-label="Zoom out" onClick={() => zoomBy(1 / 1.2)}><ZoomOut /></Button>
              <span className="tnum w-11 text-center text-[12px] text-ink-3">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" size="iconSm" aria-label="Zoom in" onClick={() => zoomBy(1.2)}><ZoomIn /></Button>
              <Button variant="ghost" size="iconSm" aria-label="Fit to screen" onClick={fit}><Maximize /></Button>
            </div>
            {waitingCount > 0 && (
              <div data-ctl className="absolute left-1/2 top-3 -translate-x-1/2"><Pill tone="brand" icon={Hourglass}>Waiting for a decision</Pill></div>
            )}

            {/* Node settings */}
            {panelNode && (
              <NodeSettings
                key={panelNode.id}
                node={panelNode}
                run={runMap[panelNode.id]}
                onClose={() => setPanelFor(null)}
                onName={(name) => S.updateNode(wf.id, panelNode.id, { name })}
                onParam={(k, v) => S.updateNode(wf.id, panelNode.id, { params: { [k]: v } })}
                onDuplicate={() => { const id = S.duplicateNode(wf.id, panelNode.id); if (id) { setSel({ kind: 'node', id }); setPanelFor(id) } }}
                onDelete={() => { S.removeNode(wf.id, panelNode.id); setSel(null); setPanelFor(null) }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Run log */}
      {logOpen && (
        <section className="h-[200px] shrink-0 overflow-y-auto border-t border-line bg-surface" aria-label="Run log">
          <div className="sticky top-0 flex items-center justify-between border-b border-line-soft bg-surface px-4 py-2">
            <h3 className="text-[14px] font-semibold text-ink">Run log</h3>
            <Button variant="ghost" size="iconSm" aria-label="Close log" onClick={() => setLogOpen(false)}><X /></Button>
          </div>
          {lines.length === 0 ? (
            <p className="px-4 py-6 text-[13px] text-ink-3">Press Run to see each step here.</p>
          ) : (
            <ul className="divide-y divide-line-soft">
              {lines.map((l, i) => (
                <li key={i} className="flex gap-3 px-4 py-2 text-[13px]">
                  <span className="tnum w-[60px] shrink-0 text-ink-3">{l.t}</span>
                  <span className="w-[170px] shrink-0 truncate font-medium text-ink">{l.node}</span>
                  <span className="min-w-0 text-ink-2">{l.text}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <Modal open={picker} onOpenChange={setPicker} title="Add a node" description="Added next to the selected node, or in the middle of the canvas.">
        <Palette onAdd={(t) => { addFromPalette(t); setPicker(false) }} className="-mx-[22px] -my-[18px] h-[60vh]" />
      </Modal>
      <RenameModal open={renaming} wf={wf} onClose={() => setRenaming(false)} />
    </div>
  )
}

/* ---------- Pieces ---------- */

function NodeStatus({ run, onDecide, who }: { run?: NodeRun; onDecide: (ok: boolean) => void; who: string }) {
  const stop = (e: React.PointerEvent) => e.stopPropagation()
  if (!run || run.status === 'idle') return <span className="text-ink-3">Ready</span>
  if (run.status === 'running') return <span className="inline-flex items-center gap-1.5 text-atlas-700"><Loader2 className="size-3.5 animate-spin" />Running</span>
  if (run.status === 'done') return <span className="inline-flex min-w-0 items-center gap-1.5 text-ok"><CheckCircle2 className="size-3.5 shrink-0" /><span className="tnum shrink-0">{((run.ms ?? 0) / 1000).toFixed(1)}s</span></span>
  if (run.status === 'skipped') return <span className="text-ink-3">Not reached</span>
  if (run.status === 'error') return <span className="inline-flex items-center gap-1.5 text-bad"><XCircle className="size-3.5" />Rejected</span>
  return (
    <span className="flex w-full items-center justify-between gap-1" title={`Waiting for ${who}`}>
      <span className="inline-flex items-center gap-1 text-atlas-700"><Hourglass className="size-3.5" />Waiting</span>
      <span className="flex gap-1">
        <button onPointerDown={stop} onClick={() => onDecide(false)} className="press grid h-6 place-items-center rounded-md border border-line px-1.5 text-[12px] font-medium text-ink-2 hover:bg-sunken" aria-label="Reject">Reject</button>
        <button onPointerDown={stop} onClick={() => onDecide(true)} className="press inline-flex h-6 items-center gap-0.5 rounded-md bg-atlas-600 px-1.5 text-[12px] font-medium text-white hover:bg-atlas-700" aria-label="Approve"><Check className="size-3" />Approve</button>
      </span>
    </span>
  )
}

function NodeSettings({ node, run, onClose, onName, onParam, onDuplicate, onDelete }: {
  node: WfNode
  run?: NodeRun
  onClose: () => void
  onName: (v: string) => void
  onParam: (k: string, v: string) => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const def = DEFS[node.type]
  return (
    <aside data-panel onPointerDown={(e) => e.stopPropagation()} className="float absolute inset-x-3 bottom-3 z-20 flex max-h-[62%] flex-col overflow-hidden rounded-xl bg-surface sm:inset-x-auto sm:bottom-3 sm:right-3 sm:top-3 sm:max-h-none sm:w-[320px]" aria-label={`${def.label} settings`}>
      <header className="flex items-center gap-2.5 border-b border-line px-4 py-3">
        <span className={cn('grid size-8 place-items-center rounded-md', TONE[def.tone])}><def.icon className="size-4" /></span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold text-ink">{def.label}</div>
          <div className="truncate text-[12px] text-ink-3">{def.category}</div>
        </div>
        <Button variant="ghost" size="iconSm" aria-label="Close settings" onClick={onClose}><X /></Button>
      </header>
      <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-4 py-4">
        <Field label="Name">{(id) => <TextInput id={id} value={node.name} onChange={(e) => onName(e.target.value)} />}</Field>
        {def.params.map((p) => (
          <Field key={p.key} label={p.label} hint={p.hint}>
            {(id) =>
              p.kind === 'select' ? (
                <SelectInput id={id} value={node.params[p.key] ?? p.default} onChange={(e) => onParam(p.key, e.target.value)}>{p.options!.map((o) => <option key={o}>{o}</option>)}</SelectInput>
              ) : p.kind === 'textarea' ? (
                <TextArea id={id} rows={3} value={node.params[p.key] ?? p.default} onChange={(e) => onParam(p.key, e.target.value)} />
              ) : (
                <TextInput id={id} type={p.kind === 'number' ? 'number' : 'text'} value={node.params[p.key] ?? p.default} onChange={(e) => onParam(p.key, e.target.value)} />
              )
            }
          </Field>
        ))}
        {def.params.length === 0 && <p className="text-[13px] text-ink-3">This node needs no settings.</p>}
        {run?.out && (
          <div className="rounded-[10px] bg-sunken px-3 py-2.5">
            <div className="text-[12px] font-medium text-ink-3">Last output</div>
            <p className="mt-0.5 text-[13px] text-ink">{run.out}</p>
          </div>
        )}
      </div>
      <footer className="flex gap-2 border-t border-line px-4 py-3">
        <Button variant="outline" size="sm" onClick={onDuplicate}><Copy />Duplicate</Button>
        <Button variant="outline" size="sm" className="text-bad [&_svg]:text-bad" onClick={onDelete}><Trash2 />Delete</Button>
      </footer>
    </aside>
  )
}

export function RenameModal({ open, wf, onClose }: { open: boolean; wf: Workflow; onClose: () => void }) {
  const update = useWorkflows((s) => s.updateMeta)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [tried, setTried] = useState(false)
  useEffect(() => { if (open) { setName(wf.name); setDesc(wf.description); setTried(false) } }, [open, wf])
  const err = tried && !name.trim() && 'Give the workflow a name.'
  return (
    <Modal
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title="Workflow details"
      description={wf.name}
      onSubmit={() => { setTried(true); if (name.trim()) { update(wf.id, name.trim(), desc.trim()); onClose() } }}
      footer={<><Button variant="outline" type="button" onClick={onClose}>Cancel</Button><Button type="submit"><Check />Save changes</Button></>}
    >
      <Field label="Name" required error={err}>{(id, d) => <TextInput id={id} aria-describedby={d} value={name} onChange={(e) => setName(e.target.value)} invalid={!!err} autoFocus />}</Field>
      <Field label="Description">{(id) => <TextArea id={id} rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} />}</Field>
    </Modal>
  )
}

