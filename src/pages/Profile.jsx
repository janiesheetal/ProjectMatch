import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
} from 'firebase/firestore'
import { UserCircle, Sparkles, Calendar, Kanban, Handshake, ShieldCheck } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import SegmentedToggle from '../components/SegmentedToggle'
import ToggleChips from '../components/ToggleChips'
import ReputationStars from '../components/ReputationStars'
import EmptyState from '../components/EmptyState'
import SkillTag from '../components/SkillTag'
import WashiTape from '../components/WashiTape'

const TAG_ROTATE = [-2, 1.5, -1, 2, -1.5, 1]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const LEVELS = ['beginner', 'intermediate', 'advanced']

const inputClass =
  'rounded-lg px-3 py-2 border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:border-violet-500 dark:focus:border-violet-500 outline-none transition-colors duration-150'

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [saving, setSaving] = useState(false)

  const [skills, setSkills] = useState([])
  const [skillName, setSkillName] = useState('')
  const [skillLevel, setSkillLevel] = useState('beginner')

  const [interests, setInterests] = useState([])
  const [interestInput, setInterestInput] = useState('')

  const [days, setDays] = useState([])
  const [startHour, setStartHour] = useState(9)
  const [endHour, setEndHour] = useState(17)

  const [experienceNote, setExperienceNote] = useState('')
  const [portfolioLink, setPortfolioLink] = useState('')
  const [isDayScholar, setIsDayScholar] = useState(false)

  const [invitesToMe, setInvitesToMe] = useState([])
  const [requestsToMyProjects, setRequestsToMyProjects] = useState([])
  const [myMatches, setMyMatches] = useState([])

  useEffect(() => {
    if (!user) return
    loadProfile()
    loadRequests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function loadProfile() {
    const snap = await getDoc(doc(db, 'users', user.uid))
    if (snap.exists()) {
      const data = snap.data()
      setProfile(data)
      setSkills(data.skills || [])
      setInterests(data.interests || [])
      setDays(data.availability?.days || [])
      setStartHour(data.availability?.startHour ?? 9)
      setEndHour(data.availability?.endHour ?? 17)
      setExperienceNote(data.experienceNote || '')
      setPortfolioLink(data.portfolioLink || '')
      setIsDayScholar(data.isDayScholar || false)
    }
  }

  async function loadRequests() {
    const myProjectsSnap = await getDocs(
      query(collection(db, 'projects'), where('ownerId', '==', user.uid))
    )
    const myProjects = myProjectsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
    const myProjectIds = new Set(myProjects.map((p) => p.id))
    const projectTitleById = new Map(myProjects.map((p) => [p.id, p.title]))

    const requestedSnap = await getDocs(
      query(collection(db, 'matches'), where('status', '==', 'requested'))
    )
    const acceptedSnap = await getDocs(
      query(collection(db, 'matches'), where('status', '==', 'accepted'))
    )

    const invites = []
    const requestsToMine = []
    for (const d of requestedSnap.docs) {
      const m = { id: d.id, ...d.data() }
      if (m.candidateId === user.uid) {
        const projSnap = await getDoc(doc(db, 'projects', m.projectId))
        invites.push({ ...m, projectTitle: projSnap.exists() ? projSnap.data().title : '(deleted project)' })
      } else if (myProjectIds.has(m.projectId)) {
        const candSnap = await getDoc(doc(db, 'users', m.candidateId))
        requestsToMine.push({
          ...m,
          projectTitle: projectTitleById.get(m.projectId),
          candidateName: candSnap.exists() ? candSnap.data().displayName : 'Unknown user',
        })
      }
    }

    const matches = []
    for (const d of acceptedSnap.docs) {
      const m = { id: d.id, ...d.data() }
      if (m.candidateId === user.uid || myProjectIds.has(m.projectId)) {
        matches.push(m)
      }
    }

    setInvitesToMe(invites)
    setRequestsToMyProjects(requestsToMine)
    setMyMatches(matches)
  }

  function addSkill() {
    if (!skillName.trim()) return
    setSkills([...skills, { name: skillName.trim(), level: skillLevel }])
    setSkillName('')
    setSkillLevel('beginner')
  }

  function removeSkill(idx) {
    setSkills(skills.filter((_, i) => i !== idx))
  }

  function addInterest() {
    if (!interestInput.trim()) return
    setInterests([...interests, interestInput.trim()])
    setInterestInput('')
  }

  function removeInterest(idx) {
    setInterests(interests.filter((_, i) => i !== idx))
  }

  function toggleDay(day) {
    setDays(days.includes(day) ? days.filter((d) => d !== day) : [...days, day])
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    await setDoc(
      doc(db, 'users', user.uid),
      {
        skills,
        interests,
        availability: { days, startHour: Number(startHour), endHour: Number(endHour) },
        experienceNote,
        portfolioLink,
        isDayScholar,
      },
      { merge: true }
    )
    await loadProfile()
    setSaving(false)
  }

  async function respondToMatch(matchId, status) {
    await updateDoc(doc(db, 'matches', matchId), { status })
    await loadRequests()
  }

  if (!user) return null

  return (
    <div className="dot-grid min-h-[calc(100vh-64px)]">
      <div className="max-w-2xl mx-auto p-6">
        <div className="sticker relative flex items-center gap-4 mb-8 rounded-2xl border-2 border-slate-900 dark:border-slate-950 bg-white dark:bg-slate-800 p-5 overflow-hidden">
          <WashiTape accent="teal" rotate={-6} className="-top-3 left-8" />
          <span className="sticker-sm w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-full border-2 border-slate-900 dark:border-slate-950 bg-violet-300 dark:bg-violet-600">
            <UserCircle className="w-9 h-9 text-slate-900 dark:text-slate-950" />
          </span>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-slate-400 dark:text-slate-500">
              Student ID
            </p>
            <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-slate-100">My profile</h1>
          </div>
        </div>

        <form
        onSubmit={handleSave}
        className="flex flex-col gap-6 mb-10 rounded-2xl border-2 border-slate-900 dark:border-slate-950 bg-white dark:bg-slate-800 p-5"
      >
        <section>
          <h2 className="flex items-center gap-1.5 font-semibold mb-2 text-violet-600 dark:text-violet-400">
            <Sparkles className="w-4 h-4" />
            Skills
          </h2>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <input
              type="text"
              placeholder="Skill name"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              className={`${inputClass} flex-1 min-w-[140px]`}
            />
            <SegmentedToggle options={LEVELS} value={skillLevel} onChange={setSkillLevel} accent="violet" />
            <button
              type="button"
              onClick={addSkill}
              className="rounded-lg px-3 py-1 border-2 border-slate-900 dark:border-slate-950 text-sm font-medium hover:-translate-y-0.5 transition-transform duration-150"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-3 min-h-[2rem]">
            {skills.map((s, i) => (
              <SkillTag
                key={i}
                label={`${s.name} · ${s.level}`}
                accent="violet"
                rotate={TAG_ROTATE[i % TAG_ROTATE.length]}
                onRemove={() => removeSkill(i)}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-semibold mb-2 text-violet-600 dark:text-violet-400">Interests</h2>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Add an interest"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              onClick={addInterest}
              className="rounded-lg px-3 py-1 border-2 border-slate-900 dark:border-slate-950 text-sm font-medium hover:-translate-y-0.5 transition-transform duration-150"
            >
              Add
            </button>
          </div>
          <ul className="flex flex-wrap gap-2">
            {interests.map((s, i) => (
              <li
                key={i}
                className="sticker-sm text-xs font-medium rounded-lg px-2.5 py-1 border-2 border-slate-900 dark:border-slate-950 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              >
                {s}{' '}
                <button type="button" onClick={() => removeInterest(i)} className="ml-1">
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="flex items-center gap-1.5 font-semibold mb-2 text-violet-600 dark:text-violet-400">
            <Calendar className="w-4 h-4" />
            Availability
          </h2>
          <div className="sticker-sm flex rounded-xl overflow-hidden border-2 border-slate-900 dark:border-slate-950">
            <div className="relative w-9 flex-shrink-0 bg-violet-400 dark:bg-violet-600 flex items-center justify-center">
              <span
                className="text-[9px] font-bold tracking-[0.2em] text-slate-900 dark:text-slate-950 whitespace-nowrap"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                DAY PASS
              </span>
              <span className="absolute -right-2 top-1/3 -translate-y-1/2 w-4 h-4 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-950" />
              <span className="absolute -right-2 bottom-1/3 translate-y-1/2 w-4 h-4 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-950" />
            </div>
            <div className="flex-1 bg-white dark:bg-slate-800 p-4 border-l-2 border-dashed border-slate-300 dark:border-slate-600">
              <div className="mb-3">
                <ToggleChips options={DAYS} selected={days} onToggle={toggleDay} accent="violet" />
              </div>
              <div className="flex items-center gap-3 text-sm">
                <label className="flex items-center gap-1.5">
                  From
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    className={`${inputClass} w-16 py-1`}
                  />
                </label>
                <label className="flex items-center gap-1.5">
                  To
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    className={`${inputClass} w-16 py-1`}
                  />
                </label>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-semibold mb-2 text-violet-600 dark:text-violet-400">Experience note</h2>
          <textarea
            value={experienceNote}
            onChange={(e) => setExperienceNote(e.target.value)}
            className={`${inputClass} w-full`}
            rows={3}
          />
        </section>

        <section>
          <h2 className="font-semibold mb-2 text-violet-600 dark:text-violet-400">Portfolio link (optional)</h2>
          <input
            type="url"
            value={portfolioLink}
            onChange={(e) => setPortfolioLink(e.target.value)}
            className={`${inputClass} w-full`}
            placeholder="https://..."
          />
        </section>

        <section>
          <button
            type="button"
            onClick={() => setIsDayScholar((v) => !v)}
            className="w-full flex items-center justify-between gap-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 p-3 text-left"
          >
            <span>
              <span className="block text-sm font-semibold">I'm a day scholar</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">
                Private — never shown on your profile. Just quietly nudges matching to surface relevant
                projects to you a bit more, since you get less passive on-campus exposure.
              </span>
            </span>
            <span
              className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors duration-200 ${
                isDayScholar ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  isDayScholar ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </span>
          </button>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="sticker-sm rounded-lg px-4 py-2 font-semibold border-2 border-slate-900 dark:border-slate-950 bg-violet-400 dark:bg-violet-600 text-slate-900 dark:text-slate-950 hover:-translate-y-0.5 transition-transform duration-150 self-start disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </form>

      {profile && (
        <div className="sticker relative rounded-2xl border-2 border-slate-900 dark:border-slate-950 bg-white dark:bg-slate-800 p-5 mb-10 overflow-hidden">
          <WashiTape accent="amber" rotate={-5} className="-top-3 right-10" />
          {profile.verifiedBadge && (
            <div className="absolute top-2 right-2 w-16 h-16 rounded-full border-[3px] border-dashed border-teal-600 dark:border-teal-400 flex items-center justify-center -rotate-12 bg-teal-50/60 dark:bg-teal-500/10">
              <div className="text-center leading-none">
                <ShieldCheck className="w-4 h-4 text-teal-700 dark:text-teal-300 mx-auto mb-0.5" />
                <span className="block text-[7px] font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider">
                  Verified
                </span>
              </div>
            </div>
          )}
          <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-slate-400 dark:text-slate-500 mb-1">
            Saved profile
          </p>
          <div className="flex items-center gap-3 mb-3">
            <strong className="font-display text-lg">{profile.displayName}</strong>
            <ReputationStars score={profile.reputationScore} verified={false} />
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map((s, i) => (
              <SkillTag key={i} label={`${s.name} · ${s.level}`} accent="violet" rotate={TAG_ROTATE[i % TAG_ROTATE.length]} />
            ))}
            {skills.length === 0 && <span className="text-sm text-slate-400">No skills added yet</span>}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Interests: {interests.join(', ') || '—'}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">
            <Calendar className="w-3.5 h-3.5 inline mr-1 text-violet-500" />
            {days.join(', ') || '—'} {days.length ? `· ${startHour}:00–${endHour}:00` : ''}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">Experience: {experienceNote || '—'}</p>
        </div>
      )}

      <section className="mb-10">
        <h2 className="flex items-center gap-1.5 font-display font-bold text-lg mb-2 text-violet-600 dark:text-violet-400">
          <Handshake className="w-5 h-5" />
          Invites to you
        </h2>
        {invitesToMe.length === 0 && (
          <EmptyState icon={Handshake} title="No pending invites." />
        )}
        <ul className="flex flex-col gap-2">
          {invitesToMe.map((m) => (
            <li
              key={m.id}
              className="sticker-sm rounded-xl border-2 border-slate-900 dark:border-slate-950 bg-white dark:bg-slate-800 p-3 flex items-center justify-between text-sm"
            >
              <span>
                Invited to join <strong>{m.projectTitle}</strong> ({m.score}% match)
              </span>
              <span className="flex gap-2">
                <button
                  onClick={() => respondToMatch(m.id, 'accepted')}
                  className="rounded-lg px-3 py-1 font-semibold border-2 border-slate-900 dark:border-slate-950 bg-violet-400 dark:bg-violet-600 text-slate-900 dark:text-slate-950 hover:-translate-y-0.5 transition-transform duration-150"
                >
                  Accept
                </button>
                <button
                  onClick={() => respondToMatch(m.id, 'declined')}
                  className="rounded-lg px-3 py-1 font-medium border-2 border-slate-300 dark:border-slate-600 hover:-translate-y-0.5 transition-transform duration-150"
                >
                  Decline
                </button>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="font-display font-bold text-lg mb-2 text-violet-600 dark:text-violet-400">Requests to your projects</h2>
        {requestsToMyProjects.length === 0 && (
          <EmptyState icon={Handshake} title="No pending requests." />
        )}
        <ul className="flex flex-col gap-2">
          {requestsToMyProjects.map((m) => (
            <li
              key={m.id}
              className="sticker-sm rounded-xl border-2 border-slate-900 dark:border-slate-950 bg-white dark:bg-slate-800 p-3 flex items-center justify-between text-sm"
            >
              <span>
                <strong>{m.candidateName}</strong> wants to join <strong>{m.projectTitle}</strong> ({m.score}% match)
              </span>
              <span className="flex gap-2">
                <button
                  onClick={() => respondToMatch(m.id, 'accepted')}
                  className="rounded-lg px-3 py-1 font-semibold border-2 border-slate-900 dark:border-slate-950 bg-violet-400 dark:bg-violet-600 text-slate-900 dark:text-slate-950 hover:-translate-y-0.5 transition-transform duration-150"
                >
                  Accept
                </button>
                <button
                  onClick={() => respondToMatch(m.id, 'declined')}
                  className="rounded-lg px-3 py-1 font-medium border-2 border-slate-300 dark:border-slate-600 hover:-translate-y-0.5 transition-transform duration-150"
                >
                  Decline
                </button>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display font-bold text-lg mb-2 text-pink-600 dark:text-pink-400">Your matches</h2>
        {myMatches.length === 0 && <EmptyState icon={Kanban} title="No accepted matches yet." />}
        <ul className="flex flex-col gap-2">
          {myMatches.map((m) => (
            <li
              key={m.id}
              className="sticker-sm rounded-xl border-2 border-slate-900 dark:border-slate-950 bg-white dark:bg-slate-800 p-3 flex items-center justify-between text-sm"
            >
              <span>Match {m.id}</span>
              <span className="flex gap-3">
                <Link to={`/chat/${m.id}`} className="text-pink-600 dark:text-pink-400 underline">
                  Open chat
                </Link>
                <Link to={`/workspace/${m.id}`} className="text-pink-600 dark:text-pink-400 underline">
                  Workspace
                </Link>
              </span>
            </li>
          ))}
        </ul>
      </section>
      </div>
    </div>
  )
}
