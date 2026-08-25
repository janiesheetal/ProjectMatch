import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { MessageCircle, Kanban } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

export default function Chat() {
  const { matchId } = useParams()
  const { user } = useAuth()
  const [allowed, setAllowed] = useState(false)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    checkAccess()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, user])

  useEffect(() => {
    if (!allowed) return
    const q = query(collection(db, 'messages', matchId, 'thread'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [allowed, matchId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function checkAccess() {
    if (!user) return
    const matchSnap = await getDoc(doc(db, 'matches', matchId))
    if (!matchSnap.exists()) return
    const m = { id: matchSnap.id, ...matchSnap.data() }
    if (m.status !== 'accepted') return

    const projSnap = await getDoc(doc(db, 'projects', m.projectId))
    const isOwner = projSnap.exists() && projSnap.data().ownerId === user.uid
    const isCandidate = m.candidateId === user.uid
    if (!isOwner && !isCandidate) return

    setAllowed(true)
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!text.trim()) return
    await addDoc(collection(db, 'messages', matchId, 'thread'), {
      senderId: user.uid,
      text: text.trim(),
      createdAt: serverTimestamp(),
    })
    setText('')
  }

  if (!allowed)
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Chat unavailable.</div>

  return (
    <div className="max-w-xl mx-auto p-6 flex flex-col h-[80vh]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="flex items-center gap-2 font-display font-bold text-xl text-pink-600 dark:text-pink-400">
          <MessageCircle className="w-5 h-5" />
          Chat
        </h1>
        <Link
          to={`/workspace/${matchId}`}
          className="sticker-sm inline-flex items-center gap-1.5 text-sm font-semibold rounded-lg px-3 py-1.5 border-2 border-slate-900 dark:border-slate-950 bg-pink-300 dark:bg-pink-600 text-slate-900 dark:text-slate-950 hover:-translate-y-0.5 transition-transform duration-150"
        >
          <Kanban className="w-4 h-4" />
          Go to workspace
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto rounded-2xl border-2 border-slate-900 dark:border-slate-950 p-3 mb-3 flex flex-col gap-2 bg-white dark:bg-slate-800">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`text-sm px-3 py-2 rounded-2xl max-w-[75%] ${
              m.senderId === user.uid
                ? 'self-end bg-pink-600 text-white'
                : 'self-start bg-slate-100 dark:bg-slate-700 dark:text-slate-100'
            }`}
          >
            {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <label htmlFor="chat-message" className="sr-only">Type a message</label>
        <input
          id="chat-message"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="rounded-lg px-3 py-2 border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:border-pink-500 dark:focus:border-pink-500 outline-none transition-colors duration-150 flex-1"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="sticker-sm rounded-lg px-4 py-2 font-semibold border-2 border-slate-900 dark:border-slate-950 bg-pink-400 dark:bg-pink-600 text-slate-900 dark:text-slate-950 hover:-translate-y-0.5 transition-transform duration-150"
        >
          Send
        </button>
      </form>
    </div>
  )
}
