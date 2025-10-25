import { useState, useEffect } from 'react'

function InterestCard({ type, interest1, interest2, relationship, score, index }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, index * 80)
    return () => clearTimeout(timer)
  }, [index])

  // Use actual score from the data, or default to 100 for exact matches
  const matchPercentage = type === 'exact' ? 100 : (score || 75)

  return (
    <div
      className={`
        w-full
        transform transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
      `}
      style={{ transitionDelay: `${index * 40}ms` }}
    >
      {/* Liquid Glass Card */}
      <div
        className="relative overflow-hidden rounded-2xl p-4 h-full"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: `
            0 8px 32px 0 rgba(0, 0, 0, 0.37),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.05)
          `
        }}
      >
        {/* Type Badge */}
        <div className="flex items-center justify-between mb-3">
          <div
            className={`
              px-2.5 py-1 rounded-full text-[9px] font-semibold uppercase tracking-wider
              ${type === 'exact'
                ? 'bg-green-500/10 text-green-300 border border-green-500/20'
                : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
              }
            `}
          >
            {type === 'exact' ? 'Perfect Match' : 'Related'}
          </div>
          <div
            className="text-2xl font-black"
            style={{
              fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif',
              fontStyle: 'italic',
              background: type === 'exact'
                ? 'linear-gradient(135deg, #86efac 0%, #22c55e 100%)'
                : 'linear-gradient(135deg, #93c5fd 0%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {matchPercentage}
          </div>
        </div>

        {/* Interests Display */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <p
              className="text-white text-sm font-medium leading-tight"
              style={{
                fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif'
              }}
            >
              {interest1}
            </p>
          </div>

          {type === 'related' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                <p
                  className="text-white text-sm font-medium leading-tight"
                  style={{
                    fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif'
                  }}
                >
                  {interest2}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Relationship explanation */}
        {type === 'related' && relationship && (
          <div
            className="mt-3 pt-3"
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            <p
              className="text-white/60 text-xs leading-relaxed"
              style={{
                fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif'
              }}
            >
              {relationship}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MatchRevealNew({ matchData, show }) {
  if (!show || !matchData) return null

  const { sharedInterests, relatedInterests } = matchData
  const hasShared = sharedInterests && sharedInterests.length > 0
  const hasRelated = relatedInterests && relatedInterests.length > 0

  if (!hasShared && !hasRelated) {
    return (
      <div className="w-full px-6 py-8">
        <div className="text-center">
          <p className="text-white/40 text-sm">
            No shared interests yet — keep exploring!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full pb-6 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Shared Interests - Consolidated */}
        {hasShared && (
          <div className="mb-8">
            <h3
              className="text-white/40 text-xs uppercase tracking-[0.2em] font-semibold text-center mb-4"
              style={{
                fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif'
              }}
            >
              Perfect Matches
            </h3>
            <div
              className="transform transition-all duration-700 ease-out opacity-100 scale-100"
            >
              {/* Consolidated Card */}
              <div
                className="relative overflow-hidden rounded-3xl p-5 h-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(40px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: `
                    0 8px 32px 0 rgba(0, 0, 0, 0.37),
                    inset 0 1px 0 0 rgba(255, 255, 255, 0.05)
                  `
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-green-500/10 text-green-300 border border-green-500/20">
                    Perfect Match
                  </div>
                  <div
                    className="text-3xl font-black"
                    style={{
                      fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif',
                      fontStyle: 'italic',
                      background: 'linear-gradient(135deg, #86efac 0%, #22c55e 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    100
                  </div>
                </div>

                {/* All shared interests */}
                <div className="space-y-2">
                  {sharedInterests.map((interest, index) => (
                    <div key={`shared-${interest}-${index}`} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-400/60" />
                      <p
                        className="text-white text-sm font-medium leading-tight"
                        style={{
                          fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif'
                        }}
                      >
                        {interest}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Related Interests */}
        {hasRelated && (
          <div>
            <h3
              className="text-white/40 text-xs uppercase tracking-[0.2em] font-semibold text-center mb-4"
              style={{
                fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif'
              }}
            >
              Related Interests
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {relatedInterests.map((relation, index) => (
                <InterestCard
                  key={`related-${index}`}
                  type="related"
                  interest1={relation.userInterest}
                  interest2={relation.targetInterest}
                  relationship={relation.relationship}
                  score={relation.score}
                  index={hasShared ? sharedInterests.length + index : index}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
