import * as S from '@radix-ui/react-switch'

export function Switch({ checked, onCheckedChange, label, id }: { checked: boolean; onCheckedChange: (v: boolean) => void; label: string; id: string }) {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2 text-[13px] font-medium text-ink-2">
      <S.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="relative h-5 w-9 shrink-0 rounded-full bg-line transition-colors duration-200 data-[state=checked]:bg-atlas-600"
      >
        <S.Thumb className="block size-4 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] data-[state=checked]:translate-x-[18px]" />
      </S.Root>
      {label}
    </label>
  )
}
