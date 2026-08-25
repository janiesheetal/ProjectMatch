import { ACCENTS } from '../lib/accents'

// Multi-select chip row, e.g. availability days or context-type filters.
export default function ToggleChips({ options, selected, onToggle, accent = 'violet', labels }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt)
        return (
          <button
            type="button"
            key={opt}
            onClick={() => onToggle(opt)}
            aria-pressed={active}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-2 border-slate-900 dark:border-slate-950 transition-all duration-150 ${
              active
                ? `sticker-sm ${ACCENTS[accent].chipActive}`
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:-translate-y-0.5'
            }`}
          >
            {labels?.[opt] ?? opt}
          </button>
        )
      })}
    </div>
  )
}
