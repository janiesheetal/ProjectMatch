import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { Sparkles } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { CONTEXT_META, CONTEXT_TYPES } from '../lib/contextTypes'
import { ACCENTS } from '../lib/accents'
import { projectRelevanceScore } from '../lib/matching'
import ContextBadge from '../components/ContextBadge'
import EmptyState from '../components/EmptyState'
import Blob from '../components/Blob'
import ConstellationArt from '../components/ConstellationArt'

const ROTATE = ['hover:-rotate-1', 'hover:rotate-1', 'hover:-rotate-1', 'hover:rotate-1']

export default function Browse() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [activeFilters, setActiveFilters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function load() {
    setLoading(true)
    const snap = await getDocs(query(collection(db, 'projects'), where('status', '==', 'open')))
    let list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

    if (user) {
      const meSnap = await getDoc(doc(db, 'users', user.uid))
      const me = meSnap.exists() ? meSnap.data() : null
      // Fairness-aware, invisible-to-others: quietly reorder by relevance to
      // this viewer's own skills for day scholars, instead of default order.
      if (me?.isDayScholar) {
        list = [...list].sort(
          (a, b) => projectRelevanceScore(b, me.skills) - projectRelevanceScore(a, me.skills)
        )
      }
    }

    setProjects(list)
    setLoading(false)
  }

  function toggleFilter(type) {
    setActiveFilters(
      activeFilters.includes(type) ? activeFilters.filter((t) => t !== type) : [...activeFilters, type]
    )
  }

  const visible =
    activeFilters.length === 0 ? projects : projects.filter((p) => activeFilters.includes(p.contextType))

  return (
    <div className="dot-grid">
      <div className="relative overflow-hidden border-b-2 border-slate-900 dark:border-slate-800">
        <Blob accent="violet" variant={1} className="w-40 h-40 -top-10 -left-10 opacity-70" />
        <Blob accent="amber" variant={2} className="w-28 h-28 top-8 right-[8%] opacity-70 hidden sm:block" />
        <div className="relative max-w-5xl mx-auto px-6 pt-14 pb-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-display font-bold text-4xl sm:text-5xl leading-[1.05] tracking-tight text-slate-900 dark:text-slate-100">
              Find your <span className="text-violet-600 dark:text-violet-400">people.</span>
              <br />
              Build the thing.
            </h1>
            <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-md mx-auto md:mx-0">
              Skills, availability, and interests — matched, not guessed. Browse open roles below.
            </p>
          </div>
          <ConstellationArt className="w-52 sm:w-64 flex-shrink-0" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-8 pb-16">
        <div role="group" aria-label="Filter by context type" className="flex flex-wrap gap-2 mb-8">
          {CONTEXT_TYPES.map((t) => {
            const meta = CONTEXT_META[t]
            const Icon = meta.icon
            const active = activeFilters.includes(t)
            return (
              <button
                key={t}
                onClick={() => toggleFilter(t)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg border-2 border-slate-900 dark:border-slate-950 transition-all duration-150 ${
                  active ? `sticker-sm ${ACCENTS[meta.accent].chipActive}` : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:-translate-y-0.5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {meta.label}
              </button>
            )
          })}
        </div>

        {loading && <p className="text-slate-500 dark:text-slate-400">Loading...</p>}
        {!loading && visible.length === 0 && (
          <EmptyState icon={Sparkles} title="No projects yet — be the first to post one." />
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          {visible.map((p, i) => {
            const accent = ACCENTS[CONTEXT_META[p.contextType]?.accent || 'slate']
            return (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                className={`sticker rounded-2xl border-2 border-slate-900 dark:border-slate-950 bg-white dark:bg-slate-800 p-5 hover:-translate-y-1 hover:-translate-x-0.5 ${ROTATE[i % ROTATE.length]}`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h2 className="font-display font-bold text-lg">{p.title}</h2>
                  <ContextBadge type={p.contextType} />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{p.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(p.requiredSkills || []).map((s, si) => (
                    <span
                      key={si}
                      className="text-xs rounded-md px-2 py-0.5 border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {p.commitmentLevel} {p.timeline ? `· ${p.timeline}` : ''}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
