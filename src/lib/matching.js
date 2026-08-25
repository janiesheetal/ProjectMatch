const LEVEL_WEIGHT = {
  beginner: 1,
  intermediate: 1.5,
  advanced: 2,
}

function skillScore(requiredSkills, candidateSkills) {
  if (!requiredSkills?.length) return 0
  const byName = new Map(
    (candidateSkills || []).map((s) => [s.name.trim().toLowerCase(), s.level])
  )
  let score = 0
  for (const req of requiredSkills) {
    const level = byName.get(req.trim().toLowerCase())
    if (level) score += LEVEL_WEIGHT[level] || 1
  }
  return score
}

function availabilityScore(candidateAvailability) {
  const days = candidateAvailability?.days?.length || 0
  return days / 7
}

// Fairness-aware nudge: day scholars get less passive on-campus exposure to
// "who's building what," so give their score a small internal boost. This is
// never shown to anyone — it only shifts where they land in the owner's
// ranked list and how projects are ordered on their own Browse page.
const DAY_SCHOLAR_BOOST = 1.08

// Returns candidates ranked by fit for a project. Skill overlap dominates;
// availability breadth acts as a small tiebreaker.
export function rankCandidates(project, candidates) {
  const maxSkillScore = (project.requiredSkills?.length || 0) * LEVEL_WEIGHT.advanced

  const scored = candidates
    .filter((c) => c.id !== project.ownerId)
    .map((c) => {
      const sSkill = skillScore(project.requiredSkills, c.skills)
      const sAvail = availabilityScore(c.availability)
      const raw = sSkill * 10 + sAvail
      const maxRaw = maxSkillScore * 10 + 1
      let percent = maxRaw > 0 ? (raw / maxRaw) * 100 : 0
      if (c.isDayScholar) percent *= DAY_SCHOLAR_BOOST
      percent = Math.min(100, Math.round(percent))
      return {
        candidate: c,
        skillScore: sSkill,
        availabilityScore: sAvail,
        score: percent,
      }
    })
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, 8)
}

export function scoreForCandidate(project, candidate) {
  const [top] = rankCandidates(project, [candidate])
  return top ? top.score : 0
}

// How relevant a project is to a viewer's own skills — used to proactively
// surface projects to day scholars on Browse instead of requiring them to
// dig through the full list as often.
export function projectRelevanceScore(project, viewerSkills) {
  return skillScore(project.requiredSkills, viewerSkills)
}
