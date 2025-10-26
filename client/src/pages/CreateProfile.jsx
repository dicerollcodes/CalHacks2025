import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import { isAuthenticated, getUser } from '../services/auth'
import { API_BASE_URL } from '../config/api'

export default function CreateProfile() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [usernameAvailable, setUsernameAvailable] = useState(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [socials, setSocials] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingSocial, setEditingSocial] = useState(null)
  const [socialInput, setSocialInput] = useState('')

  // Redirect if already logged in or no email in state
  useEffect(() => {
    if (isAuthenticated()) {
      const user = getUser()
      navigate(`/user/${user.username}`, { replace: true })
    } else if (!email) {
      navigate('/auth')
    }
  }, [email, navigate])

  // Check username availability
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null)
      return
    }

    const checkUsername = async () => {
      setCheckingUsername(true)
      try {
        const apiUrl = import.meta.env.MODE === 'production' ? `${API_BASE_URL}/users/check-username/${username}` : `/api/users/check-username/${username}`
        const response = await fetch(apiUrl)
        const data = await response.json()
        setUsernameAvailable(data.available)
      } catch (err) {
        console.error('Failed to check username:', err)
      } finally {
        setCheckingUsername(false)
      }
    }

    const timeoutId = setTimeout(checkUsername, 500)
    return () => clearTimeout(timeoutId)
  }, [username])

  const availableSocials = [
    { id: 'instagram', name: 'Instagram', icon: '📷', placeholder: '@username' },
    { id: 'discord', name: 'Discord', icon: '💬', placeholder: 'username#1234' },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦', placeholder: '@username' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', placeholder: '@username' },
    { id: 'snapchat', name: 'Snapchat', icon: '👻', placeholder: 'username' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', placeholder: 'linkedin.com/in/username' },
    { id: 'facebook', name: 'Facebook', icon: '📘', placeholder: 'facebook.com/username' },
    { id: 'reddit', name: 'Reddit', icon: '🤖', placeholder: 'u/username' }
  ]

  function startAddingSocial(platform) {
    setEditingSocial(platform)
    setSocialInput('')
  }

  function saveSocial() {
    if (socialInput.trim() && editingSocial) {
      setSocials([...socials, {
        platform: editingSocial.id,
        value: socialInput.trim(),
        ...editingSocial
      }])
      setEditingSocial(null)
      setSocialInput('')
    }
  }

  function cancelSocial() {
    setEditingSocial(null)
    setSocialInput('')
  }

  function removeSocial(index) {
    setSocials(socials.filter((_, i) => i !== index))
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    if (!username.trim() || username.length < 3) {
      setError('Please enter a username (at least 3 characters)')
      return
    }

    if (usernameAvailable === false) {
      setError('Username is already taken')
      return
    }

    setError('')

    // Navigate to interests page with profile data
    navigate('/interests', {
      state: {
        profileData: {
          email,
          name: name.trim(),
          username: username.toLowerCase().trim(),
          socials: Object.fromEntries(
            socials
              .filter(s => s.value.trim())
              .map(s => [s.platform, s.value.trim()])
          )
        }
      }
    })
  }

  if (!email) {
    return null
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
            <div className="text-6xl mb-4 animate-bounce-in">❄️</div>
            <h1 className="text-4xl font-bold mb-2 animate-slide-up">
              Create Your Profile
            </h1>
            <p className="text-white/60 animate-slide-up delay-100">
              Tell us about yourself to find your perfect roommate match
            </p>
          </div>

          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate('/auth')}
            className="mb-4 text-white/60 hover:text-white transition-colors flex items-center gap-2 animate-slide-right"
          >
            ← Back to Login
          </button>

          {/* Profile Form */}
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
            {/* Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/60 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                disabled={loading}
              />
            </div>

            {/* Username */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/60 mb-2">
                Username * (3-20 characters, letters/numbers/underscores only)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="johndoe123"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                disabled={loading}
                maxLength={20}
              />
              {username && username.length >= 3 && (
                <p className={`text-sm mt-2 ${
                  checkingUsername
                    ? 'text-white/40'
                    : usernameAvailable
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}>
                  {checkingUsername
                    ? '⏳ Checking...'
                    : usernameAvailable
                    ? '✓ Username available'
                    : '✗ Username taken'}
                </p>
              )}
            </div>

            {/* Social Media (Optional) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/60 mb-3">
                Social Media (Optional)
              </label>

              {/* Added socials */}
              {socials.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {socials.map((social, index) => (
                    <div key={index} className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-full">
                      <span className="text-lg">{social.icon}</span>
                      <span className="text-sm text-white">{social.value}</span>
                      <button
                        type="button"
                        onClick={() => removeSocial(index)}
                        className="text-white/40 hover:text-red-400 transition-colors ml-1"
                        disabled={loading}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestion buttons */}
              <div className="flex flex-wrap gap-2">
                {availableSocials
                  .filter(platform => !socials.find(s => s.platform === platform.id))
                  .map((platform) => (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => startAddingSocial(platform)}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/60 hover:text-white hover:border-white/30 transition-all flex items-center gap-2"
                      disabled={loading}
                    >
                      <span className="text-base">{platform.icon}</span>
                      <span>Add {platform.name}</span>
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
              className="w-full px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Add Your Interests →
            </button>
          </form>
        </div>
      </div>

      {/* Social Media Input Modal */}
      {editingSocial && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div
            className="max-w-md w-full p-6 rounded-3xl"
            style={{
              background: 'rgba(0, 0, 0, 0.95)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{editingSocial.icon}</span>
              <h3 className="text-2xl font-bold text-white">Add {editingSocial.name}</h3>
            </div>

            <input
              type="text"
              value={socialInput}
              onChange={(e) => setSocialInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && saveSocial()}
              placeholder={editingSocial.placeholder}
              autoFocus
              className="w-full px-4 py-3 mb-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={cancelSocial}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveSocial}
                disabled={!socialInput.trim()}
                className="flex-1 px-4 py-3 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
