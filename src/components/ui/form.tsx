import { AlertCircle } from 'lucide-react'
import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

/*
  Form parts shared by every modal, matching the ATLAS module form (.field, .inp, .ferr, .rc):
  13px label with a red asterisk when required, 8px-radius input that glows violet on focus,
  inline red error with an icon, radio cards for a small set of choices.
*/

const control =
  'w-full rounded-lg border border-line bg-surface px-[11px] py-[9px] text-[14px] text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-4 focus:border-atlas-400 focus:shadow-[0_0_0_3px_var(--color-atlas-100)]'
const invalid = 'border-bad shadow-[0_0_0_3px_#fee2e2] focus:border-bad focus:shadow-[0_0_0_3px_#fee2e2]'

export function Field({ label, required, error, hint, children, id }: { label: ReactNode; required?: boolean; error?: string | false; hint?: ReactNode; children: (id: string, describedBy?: string) => ReactNode; id?: string }) {
  const auto = useId()
  const fid = id ?? auto
  const errId = `${fid}-err`
  return (
    <div>
      <label htmlFor={fid} className="mb-1.5 block text-[13px] font-medium text-ink">
        {label}{required && <span className="text-bad"> *</span>}
      </label>
      {children(fid, error ? errId : undefined)}
      {error ? (
        <p id={errId} className="mt-[5px] flex items-center gap-[5px] text-[12.5px] text-bad"><AlertCircle className="size-[13px] shrink-0" />{error}</p>
      ) : hint ? <p className="mt-[5px] text-[12.5px] text-ink-3">{hint}</p> : null}
    </div>
  )
}

export function TextInput({ invalid: bad, className, ...p }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input aria-invalid={bad || undefined} className={cn(control, 'tnum', bad && invalid, className)} {...p} />
}

export function TextArea({ invalid: bad, className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return <textarea aria-invalid={bad || undefined} className={cn(control, 'min-h-[80px] resize-y', bad && invalid, className)} {...p} />
}

export function SelectInput({ invalid: bad, className, children, ...p }: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      aria-invalid={bad || undefined}
      className={cn(control, 'appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2712%27%20height=%2712%27%20viewBox=%270%200%2024%2024%27%20fill=%27none%27%20stroke=%27%2371717a%27%20stroke-width=%272%27%3E%3Cpath%20d=%27m6%209%206%206%206-6%27/%3E%3C/svg%3E")] bg-[length:12px] bg-[right_11px_center] bg-no-repeat pr-8', bad && invalid, className)}
      {...p}
    >
      {children}
    </select>
  )
}

/** Small set of options as selectable cards (.radio-cards). */
export function RadioCards<V extends string>({ value, onChange, options, label, columns = 3 }: { value: V; onChange: (v: V) => void; options: { value: V; label: ReactNode; note?: ReactNode; icon?: ReactNode; disabled?: boolean }[]; label: string; columns?: 2 | 3 }) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('grid gap-2', columns === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2')}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          disabled={o.disabled}
          onClick={() => onChange(o.value)}
          className={cn(
            'press flex flex-col items-start gap-1.5 rounded-[10px] border-[1.5px] p-3 text-left text-[12.5px] text-ink-3 disabled:cursor-not-allowed disabled:opacity-45',
            value === o.value ? 'border-atlas-600 bg-atlas-50' : 'border-line hover:border-atlas-300',
          )}
        >
          <span className="flex items-center gap-1.5 text-[13.5px] font-semibold text-ink">{o.icon}{o.label}</span>
          {o.note && <span className="leading-snug">{o.note}</span>}
        </button>
      ))}
    </div>
  )
}

/** Read-only summary block at the top of a modal (.ro). */
export function ReadOnly({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-2 gap-2.5 rounded-[10px] bg-sunken p-3 text-[13px]">
      {items.map(([k, v]) => (
        <div key={k} className="min-w-0"><dt className="text-[12px] text-ink-3">{k}</dt><dd className="mt-0.5 font-medium text-ink">{v}</dd></div>
      ))}
    </dl>
  )
}

/** Reason-for-the-record field used by every reject and defer step. */
export function ReasonField({ value, onChange, error, label = 'Reason', placeholder = 'Written to the audit log with your role and the time.' }: { value: string; onChange: (v: string) => void; error?: string | false; label?: string; placeholder?: string }) {
  return (
    <Field label={label} required error={error}>
      {(id, d) => <TextArea id={id} aria-describedby={d} rows={3} value={value} onChange={(e) => onChange(e.target.value)} invalid={!!error} placeholder={placeholder} autoFocus />}
    </Field>
  )
}
