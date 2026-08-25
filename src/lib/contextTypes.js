import { GraduationCap, Zap, FlaskConical, Rocket } from 'lucide-react'

export const CONTEXT_META = {
  class: { label: 'Class', icon: GraduationCap, accent: 'violet' },
  hackathon: { label: 'Hackathon', icon: Zap, accent: 'amber' },
  research: { label: 'Research', icon: FlaskConical, accent: 'blue' },
  venture: { label: 'Venture', icon: Rocket, accent: 'indigo' },
}

export const CONTEXT_TYPES = Object.keys(CONTEXT_META)
