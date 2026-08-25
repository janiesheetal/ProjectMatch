import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore'
import { Inbox } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import EmptyState from '../components/EmptyState'

export default function Messages() {
  const { user } = useAuth()
  const [threads, setThreads] = useState([])

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'dms'), where('participants', 'array-contains', user.uid))
    const unsub = onSnapshot(q, async (snap) => {
      const rows = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data()
          const otherUid = data.participants.find((p) => p !== user.uid)
          const otherSnap = await getDoc(doc(db, 'users', otherUid))
          return {
            id: d.id,
            otherUid,
            otherName: otherSnap.exists() ? otherSnap.data().displayName : 'Unknown user',
          }
        })
      )
      setThreads(rows)
    })
    return unsub
  }, [user])

  if (!user) return null

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="flex items-center gap-2.5 mb-6">
        <span className="sticker-sm w-9 h-9 flex items-center justify-center rounded-xl border-2 border-slate-900 dark:border-slate-950 bg-pink-400 dark:bg-pink-600 -rotate-3">
          <Inbox className="w-5 h-5 text-slate-900 dark:text-slate-950" />
        </span>
        <h1 className="font-display font-bold text-2xl">Messages</h1>
      </div>

      {threads.length === 0 && (
        <EmptyState
          icon={Inbox}
          title="No conversations yet — message someone from the corridor board or a topic room."
        />
      )}

      <ul className="flex flex-col gap-2">
        {threads.map((t) => (
          <li key={t.id}>
            <Link
              to={`/messages/${t.otherUid}`}
              className="sticker-sm flex items-center justify-between rounded-xl border-2 border-slate-900 dark:border-slate-950 bg-white dark:bg-slate-800 p-3 text-sm font-medium hover:-translate-y-0.5 transition-transform duration-150"
            >
              {t.otherName}
              <span className="text-pink-600 dark:text-pink-400">Open →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
