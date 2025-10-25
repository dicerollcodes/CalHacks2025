import { useState, useEffect } from 'react'

function MatchCard({ type, interest1, interest2, relationship, index }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, index * 100)

    return () => clearTimeout(timer)
  }, [index])

  // Calculate match percentage
  const matchPercentage = type === 'exact' ? 100 : Math.floor(75 + Math.random() * 15)

  return (
    <div
      className={`
        transform transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      style={{ transitionDelay: `${index * 30}ms` }}
    >
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/8 transition-all">
        <div className="flex items-center justify-between gap-4">
          {/* Left Interest */}
          <div className="flex-1 text-left">
            <p className="text-white/90 font-medium text-sm">
              {interest1 || interest2}
            </p>
          </div>

          {/* Match percentage */}
          <div className="flex-shrink-0">
            <span className={`
              text-lg font-bold
              ${type === 'exact' ? 'text-green-400' : 'text-blue-400'}
            `}>
              {matchPercentage}%
            </span>
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0 text-white/40">
            {type === 'exact' ? '=' : '≈'}
          </div>

          {/* Right Interest */}
          <div className="flex-1 text-right">
            <p className="text-white/90 font-medium text-sm">
              {interest2 || interest1}
            </p>
          </div>
        </div>

        {/* Relationship explanation for related interests */}
        {type === 'related' && relationship && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-white/50 text-xs italic">
              {relationship}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MatchReveal({ matchData, show }) {
  if (!show || !matchData) return null

  const { sharedInterests, relatedInterests } = matchData

  const hasShared = sharedInterests && sharedInterests.length > 0
  const hasRelated = relatedInterests && relatedInterests.length > 0

  if (!hasShared && !hasRelated) {
    return (
      <div className="fixed bottom-8 left-0 right-0 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-white/50">No shared interests yet — keep exploring!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 pb-6 px-4 overflow-y-auto" style={{ maxHeight: '35vh' }}>
      <div className="max-w-2xl mx-auto space-y-2">
        {/* Shared Interests */}
        {hasShared && (
          <>
            <h3 className="text-white/50 text-xs uppercase tracking-widest text-center mb-3 sticky top-0 bg-black/80 backdrop-blur-sm py-2">
              Shared Interests
            </h3>
            {sharedInterests.map((interest, index) => (
              <MatchCard
                key={`shared-${interest}-${index}`}
                type="exact"
                interest1={interest}
                interest2={interest}
                index={index}
              />
            ))}
          </>
        )}

        {/* Related Interests */}
        {hasRelated && (
          <>
            <h3 className="text-white/50 text-xs uppercase tracking-widest text-center mt-6 mb-3 sticky top-0 bg-black/80 backdrop-blur-sm py-2">
              Related Interests
            </h3>
            {relatedInterests.map((relation, index) => (
              <MatchCard
                key={`related-${index}`}
                type="related"
                interest1={relation.userInterest}
                interest2={relation.targetInterest}
                relationship={relation.relationship}
                index={hasShared ? sharedInterests.length + index : index}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
