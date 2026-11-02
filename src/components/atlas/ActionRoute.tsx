import { ArrowUpRight, Send } from 'lucide-react'
import type { Authority } from '../../data/types'
import { usePersona } from '../../state/store'
import { Button, type ButtonProps } from '../ui/button'
import { Tip } from '../ui/tooltip'

/**
 * Authority-aware action button (FR-G-05).
 * A Denera persona never gets a direct execute control for a project company action;
 * it gets the request route instead.
 */
export function ActionRoute({ authority, verb, onAct, onRequest, size = 'sm', variant, disabled, className }: {
  authority: Authority
  verb: string
  onAct: () => void
  onRequest?: () => void
  size?: ButtonProps['size']
  variant?: ButtonProps['variant']
  disabled?: boolean
  className?: string
}) {
  const { isPcu } = usePersona()
  const request = onRequest ?? onAct
  if (!isPcu && authority === 'Project company')
    return (
      <Tip content="Only the project company can take this action. Denera sends a request through its board nominee.">
      <Button size={size} variant={variant ?? 'outline'} onClick={request} disabled={disabled} className={className}>
        <Send />Request: {lower(verb)}
      </Button>
      </Tip>
    )
  if (!isPcu && authority === 'Joint')
    return (
      <Tip content="Joint: Denera acts as shareholder; the project company board decides.">
      <Button size={size} variant={variant ?? 'outline'} onClick={request} disabled={disabled} className={className}>
        <Send />Request board: {lower(verb)}
      </Button>
      </Tip>
    )
  if (isPcu && authority === 'Shareholder (Denera)')
    return (
      <Button size={size} variant="ghost" disabled>
        Denera action
      </Button>
    )
  if (isPcu && authority === 'Joint')
    return (
      <Button size={size} variant={variant ?? 'outline'} onClick={onAct} disabled={disabled}>
        <ArrowUpRight />Table at board: {lower(verb)}
      </Button>
    )
  return (
    <Button size={size} variant={variant ?? 'primary'} onClick={onAct} disabled={disabled}>
      {verb}
    </Button>
  )
}

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)
