import { Clock } from 'lucide-react'
import ComingSoonBadge from '../components/ComingSoonBadge'
import { ACCENTS } from '../lib/accents'

// Mocked: static example slots, no posting or real scheduling.
const SLOTS = [
  { day: 'Tuesday', time: '2:00 PM – 4:00 PM', place: 'Library, 2nd floor' },
  { day: 'Thursday', time: '10:00 AM – 12:00 PM', place: 'Student Union café' },
  { day: 'Saturday', time: '1:00 PM – 5:00 PM', place: 'Engineering commons' },
]

export default function OpenHours() {
  const accent = ACCENTS.amber

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-1">
        <span className="sticker-sm w-9 h-9 flex items-center justify-center rounded-xl border-2 border-slate-900 dark:border-slate-950 bg-amber-400 dark:bg-amber-500 -rotate-3">
          <Clock className="w-5 h-5 text-slate-900" />
        </span>
        <h1 className="font-display font-bold text-2xl">Open hours</h1>
        <ComingSoonBadge />
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Example blocks where students have signaled they're around and open to working alongside others.
      </p>

      <div className="flex flex-col gap-3">
        {SLOTS.map((s, i) => (
          <div
            key={s.day}
            className={`sticker-sm rounded-xl border-2 p-4 bg-white dark:bg-slate-800 transition-transform duration-150 ${accent.outline} ${i % 2 === 0 ? 'hover:-rotate-1' : 'hover:rotate-1'}`}
          >
            <p className="font-medium text-sm">{s.day}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{s.time} · {s.place}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
