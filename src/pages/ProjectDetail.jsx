import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { Handshake, Sparkles } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { rankCandidates, scoreForCandidate } from '../lib/matching'
import { CONTEXT_META } from '../lib/contextTypes'
import { ACCENTS } from '../lib/accents'
import ContextBadge from '../components/ContextBadge'
import ReputationStars from '../components/ReputationStars'

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [ranked, setRanked] = useState([])
  const [myMatch, setMyMatch] = useState(null)
  const [invitedIds, setInvitedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user])

  async function load() {
    if (!user) return
    setLoading(true)
    const projSnap = await getDoc(doc(db, 'projects', id))
    if (!projSnap.exists()) {
      setProject(null)
      setLoading(false)
      return
    }
    const proj = { id: projSnap.id, ...projSnap.data() }
    setProject(proj)

    const matchesSnap = await getDocs(query(collection(db, 'matches'), where('projectId', '==', id)))
    const matches = matchesSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
    setInvitedIds(new Set(matches.map((m) => m.candidateId)))
    setMyMatch(matches.find((m) => m.candidateId === user.uid) || null)

    if (proj.ownerId === user.uid) {
      const usersSnap = await getDocs(collection(db, 'users'))
      const candidates = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setRanked(rankCandidates(proj, candidates))
    }

    setLoading(false)
  }

  async function inviteCandidate(candidateId, score) {
    await addDoc(collection(db, 'matches'), {
      projectId: id,
      candidateId,
      status: 'requested',
      score,
      createdAt: serverTimestamp(),
    })
    await load()
  }

  async function requestToJoin() {
    const snap = await getDoc(doc(db, 'users', user.uid))
    const me = { id: user.uid, ...snap.data() }
    const score = scoreForCandidate(project, me)
    await addDoc(collection(db, 'matches'), {
      projectId: id,
      candidateId: user.uid,
      status: 'requested',
      score,
      createdAt: serverTimestamp(),
    })
    await load()
  }

  if (loading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading...</div>
  if (!project)
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Project not found.</div>

  const isOwner = project.ownerId === user.uid
  const accent = ACCENTS[CONTEXT_META[project.contextType]?.accent || 'slate']

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h1 className="font-display font-bold text-2xl">{project.title}</h1>
        <ContextBadge type={project.contextType} />
      </div>
      <p className="text-slate-600 dark:text-slate-300 mb-3">{project.description}</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {(project.requiredSkills || []).map((s, i) => (
          <span
            key={i}
            className="text-xs rounded-full px-2.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
          >
            {s}
          </span>
        ))}
      </div>
      <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
        {project.commitmentLevel} {project.timeline ? `· ${project.timeline}` : ''}
      </p>

      {!isOwner && (
        <div className="mb-8">
          {myMatch ? (
            <p className="text-sm">
              Your request status: <strong className="capitalize">{myMatch.status}</strong>
            </p>
          ) : (
            <button
              onClick={requestToJoin}
              className="sticker-sm inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold border-2 border-slate-900 dark:border-slate-950 bg-violet-400 dark:bg-violet-600 text-slate-900 dark:text-slate-950 hover:-translate-y-0.5 transition-transform duration-150"
            >
              <Handshake className="w-4 h-4" />
              Request to join
            </button>
          )}
        </div>
      )}

      {isOwner && (
        <section>
          <h2 className="flex items-center gap-2 font-display font-bold text-lg mb-3 text-violet-600 dark:text-violet-400">
            <Sparkles className="w-5 h-5" />
            Ranked candidates
          </h2>
          {ranked.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">No candidates found yet.</p>
          )}
          <ul className="flex flex-col gap-3">
            {ranked.map(({ candidate, score }, i) => (
              <li
                key={candidate.id}
                className={`sticker rounded-2xl border-2 border-slate-900 dark:border-slate-950 bg-white dark:bg-slate-800 p-4 hover:-translate-y-0.5 ${i % 2 === 0 ? 'hover:-rotate-1' : 'hover:rotate-1'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <strong>{candidate.displayName}</strong>
                  <span className="text-sm font-medium text-violet-600 dark:text-violet-400">{score}% match</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full ${accent.bar || ACCENTS.violet.bar}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <div className="mb-2">
                  <ReputationStars score={candidate.reputationScore} verified={candidate.verifiedBadge} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Skills: {(candidate.skills || []).map((s) => `${s.name} (${s.level})`).join(', ') || '—'}
                </p>
                {invitedIds.has(candidate.id) ? (
                  <span className="text-xs text-slate-400 dark:text-slate-500">Already invited</span>
                ) : (
                  <button
                    onClick={() => inviteCandidate(candidate.id, score)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold border-2 border-slate-900 dark:border-slate-950 bg-violet-200 dark:bg-violet-500/30 text-violet-900 dark:text-violet-200 hover:-translate-y-0.5 transition-transform duration-150"
                  >
                    <Handshake className="w-3.5 h-3.5" />
                    Invite
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
