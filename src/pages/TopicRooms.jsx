import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { Hash } from 'lucide-react'
import { db } from '../firebase'
import { TOPICS } from '../lib/topics'
import { ACCENTS } from '../lib/accents'

export default function TopicRooms() {
  const [counts, setCounts] = useState({})
  const accent = ACCENTS.amber

  useEffect(() => {
    Promise.all(
      TOPICS.map(async (t) => {
        const snap = await getDocs(collection(db, 'topicRooms', t.id, 'posts'))
        return [t.id, snap.size]
      })
    ).then((entries) => setCounts(Object.fromEntries(entries)))
  }, [])

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-1">
        <span className="sticker-sm w-9 h-9 flex items-center justify-center rounded-xl border-2 border-slate-900 dark:border-slate-950 bg-amber-400 dark:bg-amber-500 rotate-3">
          <Hash className="w-5 h-5 text-slate-900" />
        </span>
        <h1 className="font-display font-bold text-2xl">Topic rooms</h1>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Persistent threads by domain — join by interest, not by who happens to live near you.
      </p>

      <div className="flex flex-col gap-3">
        {TOPICS.map((t, i) => (
          <Link
            key={t.id}
            to={`/topic-rooms/${t.id}`}
            className={`sticker-sm rounded-xl border-2 p-4 flex items-center justify-between bg-white dark:bg-slate-800 transition-transform duration-150 ${accent.outline} ${i % 2 === 0 ? 'hover:-rotate-1' : 'hover:rotate-1'}`}
          >
            <span className="text-sm font-semibold">#{t.label}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {counts[t.id] ?? '—'} posts
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
