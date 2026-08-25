import { Kanban } from 'lucide-react'
import { useParams } from 'react-router-dom'
import ComingSoonBadge from '../components/ComingSoonBadge'
import { ACCENTS } from '../lib/accents'

// Mocked: static placeholder board, no drag-and-drop or persisted task state.
const COLUMNS = [
  { title: 'To do', tasks: ['Set up repo', 'Draft wireframes'] },
  { title: 'In progress', tasks: ['Build matching engine'] },
  { title: 'Done', tasks: ['Kickoff call'] },
]

export default function Workspace() {
  const { matchId } = useParams()
  const accent = ACCENTS.pink

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-1">
        <span className="sticker-sm w-9 h-9 flex items-center justify-center rounded-xl border-2 border-slate-900 dark:border-slate-950 bg-pink-400 dark:bg-pink-600 rotate-3">
          <Kanban className="w-5 h-5 text-slate-900 dark:text-slate-950" />
        </span>
        <h1 className="font-display font-bold text-2xl">Workspace</h1>
        <ComingSoonBadge />
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Task board preview for match {matchId}. Not yet wired to real data.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {COLUMNS.map((col, ci) => (
          <div key={col.title} className={`sticker-sm rounded-xl border-2 border-slate-900 dark:border-slate-950 bg-white dark:bg-slate-800 p-3 transition-transform duration-150 ${ci % 2 === 0 ? 'hover:-rotate-1' : 'hover:rotate-1'}`}>
            <h2 className="font-display text-sm font-bold mb-3">{col.title}</h2>
            <div className="flex flex-col gap-2">
              {col.tasks.map((t) => (
                <div
                  key={t}
                  className={`rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 border-2 ${accent.outline}`}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
