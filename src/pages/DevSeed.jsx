import { useState } from 'react'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { Database } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { seedUsers, seedProjects, seedBoardPosts, seedTopicPosts } from '../lib/seedData'

// Dev-only seed page. Remove this route before the real demo.
export default function DevSeed() {
  const { user } = useAuth()
  const [status, setStatus] = useState('')

  async function runSeed() {
    if (!user) return
    setStatus('Seeding...')

    for (const u of seedUsers) {
      const { id, ...data } = u
      await setDoc(doc(db, 'users', id), { ...data, createdAt: serverTimestamp() })
    }

    for (const p of seedProjects) {
      const { id, ...data } = p
      await setDoc(doc(db, 'projects', id), {
        ...data,
        ownerId: user.uid,
        status: 'open',
        createdAt: serverTimestamp(),
      })
    }

    for (const [i, post] of seedBoardPosts.entries()) {
      await setDoc(doc(db, 'boardPosts', `seed-board-${i}`), { ...post, createdAt: serverTimestamp() })
    }

    for (const [topicId, posts] of Object.entries(seedTopicPosts)) {
      for (const [i, post] of posts.entries()) {
        await setDoc(doc(db, 'topicRooms', topicId, 'posts', `seed-${i}`), {
          ...post,
          createdAt: serverTimestamp(),
        })
      }
    }

    setStatus(`Seeded ${seedUsers.length} users, ${seedProjects.length} projects, ${seedBoardPosts.length} board posts, and topic room posts.`)
  }

  if (!user) return null

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="flex items-center gap-2 mb-4 text-slate-500 dark:text-slate-400">
        <Database className="w-5 h-5" />
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Dev: seed demo data</h1>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Creates fake candidate profiles, 3 sample projects owned by your current account, corridor
        board posts, and topic room posts. Safe to re-run (overwrites the same fixed IDs). Remove this
        route before demoing.
      </p>
      <button
        onClick={runSeed}
        className="rounded-lg px-4 py-2 font-medium bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white transition-colors duration-150"
      >
        Run seed
      </button>
      {status && <p className="text-sm mt-3 text-slate-600 dark:text-slate-300">{status}</p>}
    </div>
  )
}
