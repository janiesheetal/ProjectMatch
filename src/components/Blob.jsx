// Decorative organic shape — solid color, thick outline, no blur/gradient.
// Sticker-cutout aesthetic, deliberately not the soft blurred-gradient-blob look.
const SHAPES = [
  '63% 37% 54% 46% / 55% 48% 52% 45%',
  '38% 62% 63% 37% / 41% 44% 56% 59%',
  '50% 50% 33% 67% / 59% 41% 59% 41%',
]

const FILLS = {
  violet: 'bg-violet-400 dark:bg-violet-600',
  teal: 'bg-teal-400 dark:bg-teal-600',
  amber: 'bg-amber-400 dark:bg-amber-500',
  pink: 'bg-pink-400 dark:bg-pink-600',
  blue: 'bg-blue-400 dark:bg-blue-600',
  indigo: 'bg-indigo-400 dark:bg-indigo-600',
}

export default function Blob({ accent = 'violet', variant = 1, className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute border-[3px] border-slate-900 dark:border-slate-950 ${FILLS[accent]} ${className}`}
      style={{ borderRadius: SHAPES[(variant - 1) % SHAPES.length] }}
    />
  )
}
