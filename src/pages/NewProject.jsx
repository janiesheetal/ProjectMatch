import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { Pin, Sparkles } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { CONTEXT_META, CONTEXT_TYPES } from '../lib/contextTypes'
import { ACCENTS } from '../lib/accents'
import SkillTag from '../components/SkillTag'
import WashiTape from '../components/WashiTape'

const inputClass =
  'rounded-lg px-3 py-2 border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:border-violet-500 dark:focus:border-violet-500 outline-none transition-colors duration-150'

const TAG_ROTATE = [-2, 1.5, -1, 2, -1.5, 1]

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
    <div className="checked-board min-h-[calc(100vh-64px)] flex items-start justify-center py-10 px-6">
      <div className="relative max-w-xl w-full">
        <Pin className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 w-7 h-7 text-red-600 fill-red-600 drop-shadow-lg" />
        <WashiTape accent="violet" rotate={-8} className="-top-3 -left-4" />
        <WashiTape accent="amber" rotate={10} className="-top-3 -right-4" />

        <div className="torn-bottom border-2 border-slate-900 dark:border-slate-950 bg-[#fdfaf1] dark:bg-slate-800 p-6 pt-8 sticker">
          <div className="text-center mb-6">
            <p className="text-xs tracking-[0.3em] uppercase text-slate-500 dark:text-slate-400 mb-1">
              Wanted — team members
            </p>
            <h1 className="font-display font-bold text-3xl text-slate-900 dark:text-slate-100">
              Post a project
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label htmlFor="project-title" className="sr-only">Project title</label>
            <input
              id="project-title"
              type="text"
              placeholder="Give it a headline"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`${inputClass} font-display font-semibold text-lg`}
              required
            />
            <label htmlFor="project-description" className="sr-only">Description</label>
            <textarea
              id="project-description"
              placeholder="What are you building? Who do you need?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
              rows={4}
              required
            />

            <div>
              <label id="context-type-label" className="block text-sm font-medium mb-2">Context type</label>
              <div role="radiogroup" aria-labelledby="context-type-label" className="flex flex-wrap gap-2">
                {CONTEXT_TYPES.map((t) => {
                  const meta = CONTEXT_META[t]
                  const Icon = meta.icon
                  const active = contextType === t
                  return (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setContextType(t)}
                      role="radio"
                      aria-checked={active}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg border-2 border-slate-900 dark:border-slate-950 transition-all duration-150 ${
                        active
                          ? `sticker-sm ${ACCENTS[meta.accent].chipActive}`
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:-translate-y-0.5'
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
              <div className="flex gap-2 mb-3">
                <label htmlFor="project-skill-input" className="sr-only">Add a required skill</label>
                <input
                  id="project-skill-input"
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
              <div className="flex flex-wrap gap-3 min-h-[2rem]">
                {requiredSkills.map((s, i) => (
                  <SkillTag
                    key={i}
                    label={s}
                    accent="violet"
                    rotate={TAG_ROTATE[i % TAG_ROTATE.length]}
                    onRemove={() => removeSkill(i)}
                  />
                ))}
              </div>
            </div>

            <label htmlFor="project-commitment" className="sr-only">Commitment level</label>
            <input
              id="project-commitment"
              type="text"
              placeholder="Commitment level (e.g. 5 hrs/week)"
              value={commitmentLevel}
              onChange={(e) => setCommitmentLevel(e.target.value)}
              className={inputClass}
            />
            <label htmlFor="project-timeline" className="sr-only">Timeline</label>
            <input
              id="project-timeline"
              type="text"
              placeholder="Timeline (e.g. 48 hours, or Sept-Dec)"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              className={inputClass}
            />

            <button
              type="submit"
              disabled={saving}
              className="sticker-sm rounded-lg px-4 py-2 font-semibold border-2 border-slate-900 dark:border-slate-950 bg-violet-400 dark:bg-violet-600 text-slate-900 dark:text-slate-950 hover:-translate-y-0.5 transition-transform duration-150 self-center disabled:opacity-60"
            >
              {saving ? 'Pinning to board...' : 'Post project'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
