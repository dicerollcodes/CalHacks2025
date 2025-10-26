import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import { completeSignup, saveAuthToken, saveUser, isAuthenticated, getUser } from '../services/auth'
import { API_BASE_URL } from '../config/api'

export default function AddInterests() {
  const navigate = useNavigate()
  const location = useLocation()
  const profileData = location.state?.profileData

  const [interests, setInterests] = useState([])
  const [currentInput, setCurrentInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState([
    { text: "Binge-watching Korean dramas", emoji: "📺" },
    { text: "Building mechanical keyboards", emoji: "⌨️" },
    { text: "Making pour-over coffee", emoji: "☕" },
    { text: "3AM study sessions with lofi", emoji: "🎧" },
    { text: "Thrifting vintage band tees", emoji: "👕" },
    { text: "Indoor plant parent", emoji: "🪴" }
  ])
  const [regenerating, setRegenerating] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      const user = getUser()
      navigate(`/user/${user.username}`, { replace: true })
    }
  }, [])

  // Redirect if no profile data
  if (!profileData) {
    navigate('/auth')
    return null
  }

  function handleInputChange(e) {
    const value = e.target.value

    // Check if user typed comma or semicolon
    if (value.endsWith(', ') || value.endsWith('; ')) {
      const newInterest = value.slice(0, -2).trim()
      if (newInterest && !interests.includes(newInterest)) {
        setInterests([...interests, newInterest])
      }
      setCurrentInput('')
    } else {
      setCurrentInput(value)
    }
  }

  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  function handleInputKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = currentInput.trim()
      if (trimmed && !interests.includes(trimmed)) {
        setInterests([...interests, trimmed])
        setCurrentInput('')
        setHighlightedIndex(-1)
      }
    } else if (e.key === 'Backspace' && !currentInput) {
      if (highlightedIndex >= 0) {
        // Delete the highlighted interest
        setInterests(interests.filter((_, i) => i !== highlightedIndex))
        setHighlightedIndex(-1)
      } else if (interests.length > 0) {
        // Highlight the last interest
        setHighlightedIndex(interests.length - 1)
      }
    }
  }

  function removeInterest(index) {
    setInterests(interests.filter((_, i) => i !== index))
  }

  function addExampleInterest(example) {
    if (!interests.includes(example)) {
      setInterests([...interests, example])
    }
  }

  async function regenerateSuggestions() {
    setRegenerating(true)
    try {
      const apiUrl = import.meta.env.MODE === 'production' ? `${API_BASE_URL}/users/generate-interest-suggestions` : '/api/users/generate-interest-suggestions'
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions)
      }
    } catch (err) {
      console.error('Failed to regenerate suggestions:', err)
    } finally {
      setRegenerating(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // Handle unconfirmed interest in input box
    let finalInterests = [...interests]
    const trimmedInput = currentInput.trim()
    if (trimmedInput && !finalInterests.includes(trimmedInput)) {
      // Auto-add the unconfirmed interest
      finalInterests.push(trimmedInput)
    }

    const validInterests = finalInterests.filter(i => i.trim())
    if (validInterests.length === 0) {
      setError('Please add at least one interest')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await completeSignup({
        ...profileData,
        privateInterests: validInterests
      })

      // Save auth token and user data
      saveAuthToken(response.token)
      saveUser(response.user)

      // Navigate to preferences setup (required before accessing profile)
      navigate('/set-preferences', { state: { username: response.user.username } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      {/* Subtle background particles */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative pt-32 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <div className="text-6xl mb-4 animate-bounce-in">🎯</div>
            <h1 className="text-4xl font-bold mb-2 animate-slide-up">
              Share Your Interests
            </h1>
            <p className="text-white/60 mb-2 animate-slide-up delay-100">
              These stay completely private until you find overlap with a potential roommate
            </p>
            <p className="text-sm text-cyan-400/80 bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-4 py-3 mt-4 inline-block animate-slide-up delay-200">
              💡 Tip: Be super specific! "Late-night gaming sessions" is better than "gaming".
              "Indie folk music" is better than "music". Specific interests create stronger matches!
            </p>
          </div>

          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate('/create', { state: { email: profileData.email } })}
            className="mb-4 text-white/60 hover:text-white transition-colors flex items-center gap-2 animate-slide-right"
          >
            ← Back to Profile
          </button>

          {/* Interests Form */}
          <form
            onSubmit={handleSubmit}
            className="p-8 rounded-3xl animate-scale-in"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            {/* Interest input with chips inside */}
            <div className="mb-6">
              <div
                className="min-h-[120px] px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus-within:border-white/30 transition-colors cursor-text"
                onClick={() => document.getElementById('interest-input').focus()}
              >
                <div className="flex flex-wrap gap-2 items-center">
                  {/* Interest chips */}
                  {interests.map((interest, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                        highlightedIndex === index
                          ? 'bg-red-500/30 border-2 border-red-500'
                          : 'bg-white/10 border border-white/20'
                      }`}
                    >
                      <span className="text-sm text-white">{interest}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeInterest(index)
                        }}
                        className="text-white/60 hover:text-red-400 transition-colors text-lg leading-none"
                        disabled={loading}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {/* Input field */}
                  <input
                    id="interest-input"
                    type="text"
                    value={currentInput}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    placeholder={interests.length === 0 ? "Type interests and press Enter or comma+space..." : ""}
                    className="flex-1 min-w-[200px] bg-transparent text-white placeholder-white/30 focus:outline-none"
                    disabled={loading}
                  />
                </div>
              </div>
              <p className="text-xs text-white/40 mt-2">
                💡 Press Enter or comma+space to add | Press Backspace twice to remove last
              </p>
            </div>

            {/* Example interests */}
            <div className="mb-6 p-4 bg-white/5 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-white/60">Need inspiration? Here are some examples:</p>
                <button
                  type="button"
                  onClick={regenerateSuggestions}
                  disabled={regenerating || loading}
                  className="px-3 py-1 text-xs bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 hover:bg-cyan-500/20 transition-all disabled:opacity-50"
                >
                  {regenerating ? '⏳ Generating...' : '🔄 Regenerate'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.text}
                    type="button"
                    onClick={() => addExampleInterest(suggestion.text)}
                    className="px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-full text-white/60 hover:text-white hover:border-white/30 transition-all flex items-center gap-2"
                    disabled={loading}
                  >
                    <span className="text-base">{suggestion.emoji}</span>
                    <span>{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="mb-4 text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? 'Creating Profile...' : 'Complete Profile'}
            </button>

            <p className="text-xs text-white/40 text-center mt-4">
              Remember: Your interests are encrypted and only revealed when there's meaningful overlap
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
