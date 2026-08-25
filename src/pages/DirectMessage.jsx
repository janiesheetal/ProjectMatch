import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { MessageCircle } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { dmIdFor } from '../lib/dm'

export default function DirectMessage() {
  const { otherUid } = useParams()
  const { user } = useAuth()
  const [otherName, setOtherName] = useState('')
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  const dmId = user ? dmIdFor(user.uid, otherUid) : null

  useEffect(() => {
    if (!user || !dmId) return

    setDoc(
      doc(db, 'dms', dmId),
      { participants: [user.uid, otherUid], updatedAt: serverTimestamp() },
      { merge: true }
    )

    getDoc(doc(db, 'users', otherUid)).then((snap) => {
      setOtherName(snap.exists() ? snap.data().displayName : 'Unknown user')
    })

    const q = query(collection(db, 'dms', dmId, 'thread'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, otherUid])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e) {
    e.preventDefault()
    if (!text.trim()) return
    await addDoc(collection(db, 'dms', dmId, 'thread'), {
      senderId: user.uid,
      text: text.trim(),
      createdAt: serverTimestamp(),
    })
    await setDoc(doc(db, 'dms', dmId), { updatedAt: serverTimestamp() }, { merge: true })
    setText('')
  }

  if (!user) return null

  return (
    <div className="max-w-xl mx-auto p-6 flex flex-col h-[80vh]">
      <h1 className="flex items-center gap-2 font-display font-bold text-xl text-pink-600 dark:text-pink-400 mb-4">
        <MessageCircle className="w-5 h-5" />
        {otherName || '...'}
      </h1>
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
        <input
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
