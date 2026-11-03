import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-xl border border-line bg-surface', className)} {...props} />
}

export function CardHeader({ title, aside, sub, className }: { title: ReactNode; aside?: ReactNode; sub?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start justify-between gap-3 px-[18px] pt-4', className)}>
      <div className="min-w-0">
        <h3 className="text-[16px] font-semibold leading-6 text-ink">{title}</h3>
        {sub && <p className="mt-0.5 text-[12px] text-ink-3">{sub}</p>}
      </div>
      {aside && <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{aside}</div>}
    </div>
  )
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-[18px] pb-4 pt-4', className)} {...props} />
}
