const STRIPE = {
  amber: 'rgba(217, 119, 6, 0.55)',
  violet: 'rgba(124, 58, 237, 0.55)',
  pink: 'rgba(219, 39, 119, 0.55)',
  teal: 'rgba(13, 148, 136, 0.55)',
  blue: 'rgba(37, 99, 235, 0.55)',
  indigo: 'rgba(79, 70, 229, 0.55)',
}

// Decorative scrapbook-tape strip. Purely visual (aria-hidden).
export default function WashiTape({ accent = 'amber', rotate = -4, className = '' }) {
  const color = STRIPE[accent] || STRIPE.amber
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute h-6 w-20 opacity-90 ${className}`}
      style={{
        background: `repeating-linear-gradient(45deg, ${color}, ${color} 6px, rgba(255,255,255,0.4) 6px, rgba(255,255,255,0.4) 12px)`,
        transform: `rotate(${rotate}deg)`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
      }}
    />
  )
}
