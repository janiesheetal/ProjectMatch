import { ACCENTS } from '../lib/accents'

// 3-way (or n-way) segmented control, e.g. skill level.
export default function SegmentedToggle({ options, value, onChange, accent = 'violet' }) {
  return (
    <div role="radiogroup" className="inline-flex rounded-lg border-2 border-slate-900 dark:border-slate-950 p-0.5 bg-slate-100 dark:bg-slate-800">
      {options.map((opt) => {
        const active = opt === value
        return (
          <button
            type="button"
            key={opt}
            onClick={() => onChange(opt)}
            role="radio"
            aria-checked={active}
            className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-colors duration-150 ${
              active
                ? ACCENTS[accent].chipActive
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}
