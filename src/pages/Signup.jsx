import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { Sparkles } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import Blob from '../components/Blob'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const cred = await signup(email, password)
      await setDoc(doc(db, 'users', cred.user.uid), {
        displayName,
        email,
        skills: [],
        interests: [],
        availability: { days: [], startHour: 9, endHour: 17 },
        experienceNote: '',
        portfolioLink: '',
        reputationScore: 4.5,
        verifiedBadge: false,
        createdAt: serverTimestamp(),
      })
      navigate('/profile')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] dot-grid overflow-hidden flex items-center justify-center px-6">
      <Blob accent="teal" variant={2} className="w-52 h-52 -top-14 -right-14 opacity-60" />
      <Blob accent="pink" variant={1} className="w-32 h-32 bottom-8 left-8 opacity-60 hidden sm:block" />

      <div className="sticker relative max-w-sm w-full p-6 rounded-2xl border-2 border-slate-900 dark:border-slate-950 bg-white dark:bg-slate-800">
        <div className="flex items-center gap-2 mb-6">
          <span className="sticker-sm w-9 h-9 flex items-center justify-center rounded-xl border-2 border-slate-900 dark:border-slate-950 bg-violet-400 dark:bg-violet-600 -rotate-3">
            <Sparkles className="w-5 h-5 text-slate-900 dark:text-slate-950" />
          </span>
          <h1 className="font-display font-bold text-2xl">Sign up</h1>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="rounded-lg px-3 py-2 border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:border-violet-500 dark:focus:border-violet-500 outline-none transition-colors duration-150"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg px-3 py-2 border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:border-violet-500 dark:focus:border-violet-500 outline-none transition-colors duration-150"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg px-3 py-2 border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:border-violet-500 dark:focus:border-violet-500 outline-none transition-colors duration-150"
            required
            minLength={6}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="sticker-sm rounded-lg px-3 py-2 font-semibold border-2 border-slate-900 dark:border-slate-950 bg-violet-400 dark:bg-violet-600 text-slate-900 dark:text-slate-950 hover:-translate-y-0.5 transition-transform duration-150"
          >
            Sign up
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-violet-600 dark:text-violet-400 underline font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
