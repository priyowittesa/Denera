import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

const buttonVariants = cva(
  // Long labels may wrap on phones instead of pushing past the card edge.
  'press inline-flex max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium disabled:opacity-45 disabled:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-atlas-600 text-white hover:bg-atlas-700',
        outline: 'border border-line bg-surface text-ink hover:bg-sunken [&_svg]:text-ink-2',
        secondary: 'bg-sunken text-ink-2 hover:bg-[#e9e9ec]',
        /** violet outline (.btn-po): the main action on a card */
        accent: 'border border-atlas-300 bg-surface text-atlas-700 hover:bg-atlas-50 [&_svg]:text-atlas-600',
        ghost: 'text-ink-2 hover:bg-sunken hover:text-ink',
        danger: 'bg-bad text-white hover:bg-bad/90',
        link: 'text-atlas-700 underline-offset-4 hover:underline px-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-[13px] max-sm:h-auto max-sm:min-h-8 max-sm:whitespace-normal max-sm:py-1.5 max-sm:text-left',
        md: 'h-[38px] px-3.5 text-sm max-sm:h-auto max-sm:min-h-[38px] max-sm:whitespace-normal max-sm:py-2 max-sm:text-left',
        lg: 'h-10 px-4 text-sm max-sm:h-auto max-sm:min-h-10 max-sm:whitespace-normal max-sm:py-2 max-sm:text-left',
        icon: 'size-[34px]',
        iconSm: 'size-8',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({ className, variant, size, asChild, type, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size }), className)} type={asChild ? undefined : (type ?? 'button')} {...props} />
}
