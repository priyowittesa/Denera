export function AtlasMark({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M16 3.5 29 27H3Z" fill="none" stroke="#b79cf6" strokeWidth="3" strokeLinejoin="round" />
      <path d="M16 12.5 22.2 24H9.8Z" fill="#7650e0" />
    </svg>
  )
}
