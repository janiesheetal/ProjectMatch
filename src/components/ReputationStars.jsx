import { Star, ShieldCheck } from 'lucide-react'
import { ACCENTS } from '../lib/accents'

// Mocked: reputationScore/verifiedBadge are static seed values, not backed
// by a real peer-review pipeline.
export default function ReputationStars({ score, verified }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`inline-flex items-center gap-1 text-xs font-medium ${ACCENTS.teal.icon}`}>
        <Star className="w-3.5 h-3.5 fill-current" />
        {score?.toFixed?.(1) ?? score}
      </span>
      {verified && (
        <span className={`inline-flex items-center gap-1 text-xs font-medium ${ACCENTS.teal.icon}`}>
          <ShieldCheck className="w-3.5 h-3.5" />
          Verified
        </span>
      )}
    </span>
  )
}
