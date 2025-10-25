import { useState, useEffect, useRef } from 'react'

export default function ScoreReveal({ score, onComplete }) {
  const [currentScore, setCurrentScore] = useState(0)
  const [countComplete, setCountComplete] = useState(false)
  const hasCalledComplete = useRef(false)

  useEffect(() => {
    // Reset state when score changes
    setCurrentScore(0)
    setCountComplete(false)
    hasCalledComplete.current = false

    // Count up animation with easing
    const duration = 1500 // 1.5 seconds
    const startTime = Date.now()

    // Easing function: starts fast, ends slow (ease-out cubic)
    const easeOutCubic = (x) => {
      return 1 - Math.pow(1 - x, 3)
    }

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Apply easing to progress
      const easedProgress = easeOutCubic(progress)
      const current = Math.floor(easedProgress * score)

      setCurrentScore(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCurrentScore(score)

        // After count completes, show message and trigger onComplete ONCE
        setTimeout(() => {
          setCountComplete(true)
          if (onComplete && !hasCalledComplete.current) {
            hasCalledComplete.current = true
            onComplete()
          }
        }, 300)
      }
    }

    const animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [score]) // Removed onComplete from dependencies

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-green-400 to-emerald-500'
    if (score >= 60) return 'from-blue-400 to-cyan-500'
    if (score >= 40) return 'from-yellow-400 to-orange-500'
    return 'from-gray-400 to-gray-500'
  }

  const getScoreMessage = (score) => {
    if (score >= 80) return 'AMAZING MATCH'
    if (score >= 60) return 'GREAT COMPATIBILITY'
    if (score >= 40) return 'SOME COMMON GROUND'
    return 'DIFFERENT PATHS'
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Score Number */}
      <div className="relative">
        {/* Glow effect */}
        <div
          className={`
            absolute inset-0 blur-2xl opacity-50
            bg-gradient-to-r ${getScoreColor(score)}
          `}
        />

        {/* Score value */}
        <div
          className={`
            relative text-9xl font-black
            bg-gradient-to-r ${getScoreColor(score)}
            text-transparent bg-clip-text
            drop-shadow-2xl
          `}
          style={{
            fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif',
            fontStyle: 'italic'
          }}
        >
          {currentScore}
        </div>
      </div>

      {/* Score message */}
      <div
        className={`
          mt-4 text-white/70 text-sm uppercase tracking-[0.3em]
          transition-opacity duration-500
          ${countComplete ? 'opacity-100' : 'opacity-0'}
        `}
      >
        {getScoreMessage(score)}
      </div>
    </div>
  )
}
