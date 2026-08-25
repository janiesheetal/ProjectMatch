// Decorative network graphic — nodes + connections standing in for "matching
// people together." Hand-placed shapes, not a stock illustration.
export default function ConstellationArt({ className = '' }) {
  return (
    <svg
      viewBox="0 0 400 260"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-slate-600">
        <line x1="60" y1="70" x2="150" y2="40" />
        <line x1="150" y1="40" x2="230" y2="90" />
        <line x1="150" y1="40" x2="120" y2="150" />
        <line x1="230" y1="90" x2="330" y2="60" />
        <line x1="230" y1="90" x2="290" y2="180" />
        <line x1="120" y1="150" x2="60" y2="210" />
        <line x1="120" y1="150" x2="210" y2="210" />
        <line x1="290" y1="180" x2="210" y2="210" />
      </g>

      <circle cx="60" cy="70" r="10" className="fill-violet-400 dark:fill-violet-500" stroke="currentColor" strokeWidth="3" />
      <circle cx="150" cy="40" r="14" className="fill-amber-400 dark:fill-amber-500" stroke="currentColor" strokeWidth="3" />
      <circle cx="230" cy="90" r="9" className="fill-teal-400 dark:fill-teal-500" stroke="currentColor" strokeWidth="3" />
      <circle cx="330" cy="60" r="12" className="fill-pink-400 dark:fill-pink-500" stroke="currentColor" strokeWidth="3" />
      <circle cx="120" cy="150" r="16" className="fill-blue-400 dark:fill-blue-500" stroke="currentColor" strokeWidth="3" />
      <circle cx="60" cy="210" r="9" className="fill-indigo-400 dark:fill-indigo-500" stroke="currentColor" strokeWidth="3" />
      <circle cx="290" cy="180" r="11" className="fill-violet-400 dark:fill-violet-500" stroke="currentColor" strokeWidth="3" />
      <circle cx="210" cy="210" r="13" className="fill-amber-400 dark:fill-amber-500" stroke="currentColor" strokeWidth="3" />

      <rect
        x="330"
        y="140"
        width="18"
        height="18"
        rx="3"
        transform="rotate(20 339 149)"
        className="fill-teal-400 dark:fill-teal-500"
        stroke="currentColor"
        strokeWidth="3"
      />
      <polygon
        points="20,120 32,142 8,142"
        className="fill-pink-400 dark:fill-pink-500"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  )
}
