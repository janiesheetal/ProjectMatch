import { ACCENTS } from '../lib/accents'

// Luggage-tag styled skill chip — the shared "skill" motif across Profile
// and Post-a-project, distinct from plain pills used elsewhere.
export default function SkillTag({ label, accent = 'violet', onRemove, rotate = 0 }) {
  return (
    <span
      className={`sticker-sm relative inline-flex items-center gap-1.5 pl-5 pr-2.5 py-1 text-xs font-semibold rounded-r-md rounded-l-sm border-2 border-slate-900 dark:border-slate-950 ${ACCENTS[accent].chipActive}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/80 border border-slate-900/50" />
      {label}
      {onRemove && (
        <button type="button" onClick={onRemove} className="ml-0.5 leading-none">
          ×
        </button>
      )}
    </span>
  )
}
