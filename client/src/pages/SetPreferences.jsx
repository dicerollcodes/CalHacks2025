import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import { API_BASE_URL } from '../config/api'

export default function SetPreferences() {
  const navigate = useNavigate()
  const location = useLocation()
  const { username } = location.state || {}

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [preferences, setPreferences] = useState({
    sleepSchedule: '',
    cleanliness: '',
    socialLevel: '',
    guests: '',
    smoking: 'non-smoker',
    pets: '',
    gender: '',
    genderPreference: 'no-preference'
  })

  if (!username) {
    navigate('/auth')
    return null
  }

  async function handleSubmit() {
    // Validate required fields
    if (!preferences.sleepSchedule || !preferences.cleanliness || !preferences.socialLevel ||
        !preferences.guests || !preferences.pets || !preferences.gender) {
      setError('Please answer all questions')
      return
    }

    setLoading(true)
    setError('')

    try {
      const apiUrl = import.meta.env.MODE === 'production'
        ? `${API_BASE_URL}/users/${username}`
        : `/api/users/${username}`

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roommatePreferences: preferences })
      })

      if (!response.ok) {
        throw new Error('Failed to save preferences')
      }

      // Navigate to user profile
      navigate(`/user/${username}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="relative pt-32 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏠</div>
            <h1 className="text-4xl font-bold mb-2">Roommate Preferences</h1>
            <p className="text-white/60">Help us find your perfect roommate match</p>
          </div>

          <div
            className="p-8 rounded-3xl space-y-6"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            {/* Sleep Schedule */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Sleep Schedule
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { value: 'early-riser', label: 'Early Riser', emoji: '🌅' },
                  { value: 'night-owl', label: 'Night Owl', emoji: '🌙' },
                  { value: 'flexible', label: 'Flexible', emoji: '⏰' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setPreferences({ ...preferences, sleepSchedule: option.value })}
                    className={`px-4 py-3 rounded-xl border transition-all ${
                      preferences.sleepSchedule === option.value
                        ? 'bg-white/20 border-white/40'
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="text-sm">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cleanliness */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Cleanliness Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { value: 'very-clean', label: 'Very Clean', emoji: '✨' },
                  { value: 'moderately-clean', label: 'Moderate', emoji: '🧹' },
                  { value: 'relaxed', label: 'Relaxed', emoji: '😊' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setPreferences({ ...preferences, cleanliness: option.value })}
                    className={`px-4 py-3 rounded-xl border transition-all ${
                      preferences.cleanliness === option.value
                        ? 'bg-white/20 border-white/40'
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="text-sm">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Social Level */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Social Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { value: 'very-social', label: 'Very Social', emoji: '🎉' },
                  { value: 'moderately-social', label: 'Moderate', emoji: '👋' },
                  { value: 'quiet', label: 'Quiet', emoji: '🤫' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setPreferences({ ...preferences, socialLevel: option.value })}
                    className={`px-4 py-3 rounded-xl border transition-all ${
                      preferences.socialLevel === option.value
                        ? 'bg-white/20 border-white/40'
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="text-sm">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Guests */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Having Guests Over
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { value: 'often', label: 'Often', emoji: '👥' },
                  { value: 'sometimes', label: 'Sometimes', emoji: '🚪' },
                  { value: 'rarely', label: 'Rarely', emoji: '🏠' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setPreferences({ ...preferences, guests: option.value })}
                    className={`px-4 py-3 rounded-xl border transition-all ${
                      preferences.guests === option.value
                        ? 'bg-white/20 border-white/40'
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="text-sm">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pets */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Pets
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { value: 'has-pets', label: 'Has Pets', emoji: '🐾' },
                  { value: 'no-pets', label: 'No Pets', emoji: '🚫' },
                  { value: 'allergic', label: 'Allergic', emoji: '🤧' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setPreferences({ ...preferences, pets: option.value })}
                    className={`px-4 py-3 rounded-xl border transition-all ${
                      preferences.pets === option.value
                        ? 'bg-white/20 border-white/40'
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="text-sm">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Your Gender
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { value: 'male', label: 'Male', emoji: '👨' },
                  { value: 'female', label: 'Female', emoji: '👩' },
                  { value: 'non-binary', label: 'Non-Binary', emoji: '🧑' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setPreferences({ ...preferences, gender: option.value })}
                    className={`px-4 py-3 rounded-xl border transition-all ${
                      preferences.gender === option.value
                        ? 'bg-white/20 border-white/40'
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="text-sm">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Gender Preference */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Roommate Gender Preference
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: 'no-preference', label: 'No Preference', emoji: '🤷' },
                  { value: 'male', label: 'Male', emoji: '👨' },
                  { value: 'female', label: 'Female', emoji: '👩' },
                  { value: 'non-binary', label: 'Non-Binary', emoji: '🧑' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setPreferences({ ...preferences, genderPreference: option.value })}
                    className={`px-4 py-3 rounded-xl border transition-all ${
                      preferences.genderPreference === option.value
                        ? 'bg-white/20 border-white/40'
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="text-xs">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-6 px-6 py-4 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Complete Setup'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
