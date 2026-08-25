import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { PlusCircle, Sparkles } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { CONTEXT_META, CONTEXT_TYPES } from '../lib/contextTypes'
import { ACCENTS } from '../lib/accents'

const inputClass =
  'rounded-lg px-3 py-2 border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:border-violet-500 dark:focus:border-violet-500 outline-none transition-colors duration-150'

export default function NewProject() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [contextType, setContextType] = useState('hackathon')
  const [requiredSkills, setRequiredSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')
  const [commitmentLevel, setCommitmentLevel] = useState('')
  const [timeline, setTimeline] = useState('')
  const [saving, setSaving] = useState(false)

  function addSkill() {
    if (!skillInput.trim()) return
    setRequiredSkills([...requiredSkills, skillInput.trim()])
    setSkillInput('')
  }

  function removeSkill(idx) {
    setRequiredSkills(requiredSkills.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const ref = await addDoc(collection(db, 'projects'), {
      ownerId: user.uid,
      title,
      description,
      contextType,
      requiredSkills,
      commitmentLevel,
      timeline,
      status: 'open',
      createdAt: serverTimestamp(),
    })
    setSaving(false)
    navigate(`/projects/${ref.id}`)
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-6 text-violet-600 dark:text-violet-400">
        <span className="sticker-sm w-8 h-8 flex items-center justify-center rounded-lg border-2 border-slate-900 dark:border-slate-950 bg-violet-400 dark:bg-violet-600 rotate-3">
          <PlusCircle className="w-4.5 h-4.5 text-slate-900 dark:text-slate-950" />
        </span>
        <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-slate-100">Post a project</h1>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
          rows={4}
          required
        />

        <div>
          <label className="block text-sm font-medium mb-2">Context type</label>
          <div className="flex flex-wrap gap-2">
            {CONTEXT_TYPES.map((t) => {
              const meta = CONTEXT_META[t]
              const Icon = meta.icon
              const active = contextType === t
              return (
                <button
                  type="button"
                  key={t}
                  onClick={() => setContextType(t)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg border-2 border-slate-900 dark:border-slate-950 transition-all duration-150 ${
                    active
                      ? `sticker-sm ${ACCENTS[meta.accent].chipActive}`
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:-translate-y-0.5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {meta.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium mb-2">
            <Sparkles className="w-4 h-4 text-violet-500" />
            Required skills
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="e.g. React"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              onClick={addSkill}
              className="rounded-lg px-3 py-1 border-2 border-slate-900 dark:border-slate-950 text-sm font-medium hover:-translate-y-0.5 transition-transform duration-150"
            >
              Add
            </button>
          </div>
          <ul className="flex flex-wrap gap-2">
            {requiredSkills.map((s, i) => (
              <li
                key={i}
                className="sticker-sm text-xs font-medium rounded-lg px-2.5 py-1 border-2 border-slate-900 dark:border-slate-950 bg-violet-200 text-violet-900 dark:bg-violet-500/30 dark:text-violet-200"
              >
                {s}{' '}
                <button type="button" onClick={() => removeSkill(i)} className="ml-1">
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>

        <input
          type="text"
          placeholder="Commitment level (e.g. 5 hrs/week)"
          value={commitmentLevel}
          onChange={(e) => setCommitmentLevel(e.target.value)}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="Timeline (e.g. 48 hours, or Sept-Dec)"
          value={timeline}
          onChange={(e) => setTimeline(e.target.value)}
          className={inputClass}
        />

        <button
          type="submit"
          disabled={saving}
          className="sticker-sm rounded-lg px-4 py-2 font-semibold border-2 border-slate-900 dark:border-slate-950 bg-violet-400 dark:bg-violet-600 text-slate-900 dark:text-slate-950 hover:-translate-y-0.5 transition-transform duration-150 self-start disabled:opacity-60"
        >
          {saving ? 'Posting...' : 'Post project'}
        </button>
      </form>
    </div>
  )
}
