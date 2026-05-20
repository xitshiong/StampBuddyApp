export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ height: '100dvh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  )
}
