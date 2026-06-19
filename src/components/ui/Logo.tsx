export default function StampBuddyLogo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ color: 'var(--accent)' }}
    >
      {/* Outer stamp ring — dashed border like a rubber stamp */}
      <circle cx="20" cy="20" r="18.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3.2 2" />
      {/* Inner filled circle */}
      <circle cx="20" cy="20" r="14" fill="currentColor" fillOpacity={0.12} />
      {/* Coffee cup body */}
      <rect x="13" y="16" width="11" height="9" rx="2" fill="currentColor" />
      {/* Cup handle */}
      <path
        d="M24 18.5 C27 18.5 27 22.5 24 22.5"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"
      />
      {/* Steam lines */}
      <path d="M16 14.5 C16 13 17.5 13 17.5 11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M19.5 14.5 C19.5 13 21 13 21 11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      {/* Stamp checkmark on cup */}
      <path d="M15.5 20.5 L17.5 22.5 L21.5 18.5" stroke="var(--accent-text, oklch(0.98 0.01 90))" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
