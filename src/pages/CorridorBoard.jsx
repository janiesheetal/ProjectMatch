import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { StickyNote, Pin, MessageSquareText, X } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

// Deliberately the same bright, opaque color in both themes — real sticky
// notes don't dim to match the room lighting.
const NOTE_COLORS = ['bg-amber-300', 'bg-pink-300', 'bg-teal-300', 'bg-violet-300', 'bg-blue-300']

function noteStyle(id) {
  const hash = [...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  const color = NOTE_COLORS[hash % NOTE_COLORS.length]
  const rotate = ((hash % 7) - 3) * 0.8 // roughly -2.4deg to 2.4deg, deterministic
  return { color, rotate }
}

function timeAgo(timestamp) {
  if (!timestamp?.toDate) return ''
  const diffMs = Date.now() - timestamp.toDate().getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function CorridorBoard() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [text, setText] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'boardPosts'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  useEffect(() => {
    setDisplayName(user?.displayName || user?.email?.split('@')[0] || 'Someone')
  }, [user])

  async function handlePost(e) {
    e.preventDefault()
    if (!text.trim()) return
    setPosting(true)
    await addDoc(collection(db, 'boardPosts'), {
      authorId: user.uid,
      authorName: displayName,
      text: text.trim().slice(0, 280),
      createdAt: serverTimestamp(),
    })
    setText('')
    setPosting(false)
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, 'boardPosts', id))
  }

  return (
    <div className="checked-board min-h-[calc(100vh-64px)]">
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-16">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="sticker-sm w-9 h-9 flex items-center justify-center rounded-xl border-2 border-slate-900 dark:border-slate-950 bg-amber-400 dark:bg-amber-500 -rotate-3">
            <StickyNote className="w-5 h-5 text-slate-900" />
          </span>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-slate-100">Corridor board</h1>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-lg">
          A shared wall for quick project thoughts and "thinking out loud" notes — the hallway
          conversation, without needing to be in the hallway.
        </p>

        <form
          onSubmit={handlePost}
          className="sticker rounded-2xl border-2 border-slate-900 dark:border-slate-950 bg-white dark:bg-slate-800 p-4 mb-10"
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What are you thinking about building?"
            maxLength={280}
            rows={2}
            className="w-full rounded-lg px-3 py-2 border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:border-amber-500 dark:focus:border-amber-500 outline-none transition-colors duration-150 resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-slate-400">{text.length}/280</span>
            <button
              type="submit"
              disabled={posting || !text.trim()}
              className="sticker-sm rounded-lg px-4 py-1.5 text-sm font-semibold border-2 border-slate-900 dark:border-slate-950 bg-amber-400 dark:bg-amber-500 text-slate-900 hover:-translate-y-0.5 transition-transform duration-150 disabled:opacity-50"
            >
              Pin it
            </button>
          </div>
        </form>

        {posts.length === 0 && (
          <p className="text-center text-slate-500 dark:text-slate-400 text-sm">
            No notes pinned yet — be the first to think out loud.
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {posts.map((p) => {
            const { color, rotate } = noteStyle(p.id)
            const isMine = p.authorId === user?.uid
            return (
              <div
                key={p.id}
                className={`relative border-2 border-slate-900 dark:border-slate-950 rounded-lg p-4 pt-6 ${color}`}
                style={{ boxShadow: 'var(--hard-shadow-sm)', transform: `rotate(${rotate}deg)` }}
              >
                <Pin className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 text-red-600 fill-red-600 drop-shadow" />
                {isMine && (
                  <button
                    onClick={() => handleDelete(p.id)}
                    aria-label="Delete note"
                    className="absolute top-1.5 right-1.5 text-slate-700 hover:text-slate-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <p className="text-sm text-slate-900 mb-3 break-words">{p.text}</p>
                <div className="flex items-center justify-between text-xs text-slate-700">
                  <span className="font-semibold">{p.authorName}</span>
                  <span>{timeAgo(p.createdAt)}</span>
                </div>
                {!isMine && (
                  <Link
                    to={`/messages/${p.authorId}`}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-900 underline"
                  >
                    <MessageSquareText className="w-3.5 h-3.5" />
                    Message {p.authorName.split(' ')[0]}
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
