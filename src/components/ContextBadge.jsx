import { CONTEXT_META } from '../lib/contextTypes'
import { ACCENTS } from '../lib/accents'

export default function ContextBadge({ type }) {
  const meta = CONTEXT_META[type]
  if (!meta) return null
  const Icon = meta.icon
  return (
    <span
      className={`sticker-sm inline-flex items-center gap-1 text-xs font-semibold rounded-lg px-2.5 py-1 border-2 border-slate-900 dark:border-slate-950 ${ACCENTS[meta.accent].badge}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {meta.label}
    </span>
  )
}
