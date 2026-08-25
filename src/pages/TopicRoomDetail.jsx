import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { Hash, MessageSquareText } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { TOPICS } from '../lib/topics'

export default function TopicRoomDetail() {
  const { topicId } = useParams()
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [text, setText] = useState('')

  const topic = TOPICS.find((t) => t.id === topicId)

  useEffect(() => {
    const q = query(collection(db, 'topicRooms', topicId, 'posts'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [topicId])

  async function handlePost(e) {
    e.preventDefault()
    if (!text.trim()) return
    await addDoc(collection(db, 'topicRooms', topicId, 'posts'), {
      authorId: user.uid,
      authorName: user.displayName || user.email?.split('@')[0] || 'Someone',
      text: text.trim(),
      createdAt: serverTimestamp(),
    })
    setText('')
  }

  if (!topic) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Room not found.</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link to="/topic-rooms" className="text-sm text-amber-600 dark:text-amber-400 underline">
        ← All topic rooms
      </Link>
      <div className="flex items-center gap-2 mt-2 mb-6">
        <Hash className="w-5 h-5 text-amber-500" />
        <h1 className="font-display font-bold text-2xl">{topic.label}</h1>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        {posts.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No posts yet — start the conversation.
          </p>
        )}
        {posts.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border-2 border-slate-900 dark:border-slate-950 bg-white dark:bg-slate-800 p-3"
          >
            <p className="text-sm mb-2">{p.text}</p>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold">{p.authorName}</span>
              {p.authorId !== user?.uid && (
                <Link
                  to={`/messages/${p.authorId}`}
                  className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 underline"
                >
                  <MessageSquareText className="w-3.5 h-3.5" />
                  Message
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handlePost} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Post in #${topic.label}...`}
          className="rounded-lg px-3 py-2 border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:border-amber-500 dark:focus:border-amber-500 outline-none transition-colors duration-150 flex-1"
        />
        <button
          type="submit"
          className="sticker-sm rounded-lg px-4 py-2 font-semibold border-2 border-slate-900 dark:border-slate-950 bg-amber-400 dark:bg-amber-500 text-slate-900 hover:-translate-y-0.5 transition-transform duration-150"
        >
          Post
        </button>
      </form>
    </div>
  )
}
