import { useState, useEffect } from 'react'

function InterestChip({ interest, index, emoji = '✨' }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Stagger the appearance of each chip
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, index * 150) // 150ms delay between each chip

    return () => clearTimeout(timer)
  }, [index])

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-full
        bg-white/10 backdrop-blur-sm border border-white/20
        text-white font-medium
        transform transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <span className="text-xl">{emoji}</span>
      <span className="text-sm uppercase tracking-wide">{interest}</span>
    </div>
  )
}

export default function InterestChips({ interests, show }) {
  if (!show || !interests || interests.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 pb-8 px-4">
      <div className="max-w-2xl mx-auto">
        <p className="text-center text-white/70 text-sm uppercase tracking-widest mb-4">
          You both like
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {interests.map((interest, index) => (
            <InterestChip
              key={interest}
              interest={interest}
              index={index}
              emoji="💎"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
