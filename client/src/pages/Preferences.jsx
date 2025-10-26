import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser, isAuthenticated } from '../services/auth'
import Header from '../components/Header'
import { API_BASE_URL } from '../config/api'

function Preferences() {
  const navigate = useNavigate()
  const loggedInUser = getUser()
  const userId = loggedInUser?.username

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState({
    sleepSchedule: null,
    bedtime: '',
    wakeTime: '',
    gender: null,
    genderPreference: null,
    cleanliness: null,
    socialLevel: null,
    guests: null,
    smoking: null,
    pets: null
  })

  useEffect(() => {
    if (!isAuthenticated() || !userId) {
      alert('Please log in to access preferences')
      navigate('/auth')
      return
    }

    loadPreferences()
  }, [userId, navigate])

  async function loadPreferences() {
    try {
      setLoading(true)
      const apiUrl = import.meta.env.MODE === 'production' ? `${API_BASE_URL}/users/${userId}` : `/api/users/${userId}`
      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error('Failed to load user data')
      }

      const data = await response.json()
      if (data.user.roommatePreferences) {
        setPreferences({
          sleepSchedule: data.user.roommatePreferences.sleepSchedule || null,
          bedtime: data.user.roommatePreferences.bedtime || '',
          wakeTime: data.user.roommatePreferences.wakeTime || '',
          gender: data.user.roommatePreferences.gender || null,
          genderPreference: data.user.roommatePreferences.genderPreference || null,
          cleanliness: data.user.roommatePreferences.cleanliness || null,
          socialLevel: data.user.roommatePreferences.socialLevel || null,
          guests: data.user.roommatePreferences.guests || null,
          smoking: data.user.roommatePreferences.smoking || null,
          pets: data.user.roommatePreferences.pets || null
        })
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
      alert('Failed to load preferences: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const apiUrl = import.meta.env.MODE === 'production' ? `${API_BASE_URL}/users/${userId}/preferences` : `/api/users/${userId}/preferences`
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roommatePreferences: preferences
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save preferences')
      }

      alert('✅ Preferences saved successfully!')
      navigate(`/user/${userId}`)
    } catch (error) {
      console.error('Error saving preferences:', error)
      alert('Failed to save preferences: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  function updatePreference(key, value) {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  if (!isAuthenticated() || !userId) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl text-white/50 animate-pulse-glow">Loading preferences...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-24">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black uppercase tracking-tight mb-3"
              style={{ fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif', fontStyle: 'italic' }}>
            Roommate Preferences
          </h1>
          <p className="text-white/60 text-lg">
            Help us find your perfect roommate match
          </p>
          <p className="text-white/40 text-sm mt-2">
            These preferences improve your match rankings in Connect
          </p>
        </div>

        <div className="space-y-8">
          {/* Sleep Schedule Section */}
          <section className="p-6 rounded-2xl border border-white/10"
                   style={{
                     background: 'rgba(255, 255, 255, 0.03)',
                     backdropFilter: 'blur(10px)',
                     WebkitBackdropFilter: 'blur(10px)'
                   }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="text-3xl">🌙</span>
              Sleep Schedule
            </h2>

            {/* Sleep Type */}
            <div className="mb-6">
              <label className="block text-sm text-white/60 mb-3">Are you an early riser or night owl?</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'early-riser', label: '🌅 Early Riser', desc: 'Bed before 11pm' },
                  { value: 'night-owl', label: '🌙 Night Owl', desc: 'Bed after 12am' },
                  { value: 'flexible', label: '🔄 Flexible', desc: 'It varies' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updatePreference('sleepSchedule', option.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      preferences.sleepSchedule === option.value
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="font-semibold mb-1">{option.label}</div>
                    <div className="text-xs text-white/50">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bedtime & Wake Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Usual Bedtime</label>
                <input
                  type="time"
                  value={preferences.bedtime}
                  onChange={(e) => updatePreference('bedtime', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Usual Wake Time</label>
                <input
                  type="time"
                  value={preferences.wakeTime}
                  onChange={(e) => updatePreference('wakeTime', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>
          </section>

          {/* Gender & Preferences Section */}
          <section className="p-6 rounded-2xl border border-white/10"
                   style={{
                     background: 'rgba(255, 255, 255, 0.03)',
                     backdropFilter: 'blur(10px)',
                     WebkitBackdropFilter: 'blur(10px)'
                   }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="text-3xl">👤</span>
              Gender & Preferences
            </h2>

            {/* Gender */}
            <div className="mb-6">
              <label className="block text-sm text-white/60 mb-3">Your Gender</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'non-binary', label: 'Non-Binary' },
                  { value: 'prefer-not-to-say', label: 'Prefer Not To Say' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updatePreference('gender', option.value)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      preferences.gender === option.value
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="font-medium text-sm">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Gender Preference */}
            <div>
              <label className="block text-sm text-white/60 mb-3">
                Roommate Gender Preference
                <span className="ml-2 text-xs text-yellow-400">⚠️ Non-negotiable filter</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'non-binary', label: 'Non-Binary' },
                  { value: 'no-preference', label: 'No Preference' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updatePreference('genderPreference', option.value)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      preferences.genderPreference === option.value
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="font-medium text-sm">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Lifestyle Preferences Section */}
          <section className="p-6 rounded-2xl border border-white/10"
                   style={{
                     background: 'rgba(255, 255, 255, 0.03)',
                     backdropFilter: 'blur(10px)',
                     WebkitBackdropFilter: 'blur(10px)'
                   }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="text-3xl">🏠</span>
              Lifestyle Preferences
            </h2>

            {/* Cleanliness */}
            <div className="mb-6">
              <label className="block text-sm text-white/60 mb-3">Cleanliness Level</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'very-clean', label: '✨ Very Clean', desc: 'Spotless daily' },
                  { value: 'moderately-clean', label: '🧹 Moderately Clean', desc: 'Tidy weekly' },
                  { value: 'relaxed', label: '😌 Relaxed', desc: 'Lived-in vibe' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updatePreference('cleanliness', option.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      preferences.cleanliness === option.value
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="font-semibold mb-1">{option.label}</div>
                    <div className="text-xs text-white/50">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Social Level */}
            <div className="mb-6">
              <label className="block text-sm text-white/60 mb-3">Social Level</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'very-social', label: '🎉 Very Social', desc: 'Always hanging' },
                  { value: 'moderately-social', label: '👋 Moderately Social', desc: 'Balanced mix' },
                  { value: 'quiet', label: '🤫 Quiet', desc: 'Mostly private' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updatePreference('socialLevel', option.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      preferences.socialLevel === option.value
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="font-semibold mb-1">{option.label}</div>
                    <div className="text-xs text-white/50">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Guests */}
            <div className="mb-6">
              <label className="block text-sm text-white/60 mb-3">How often do you have guests over?</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'often', label: '👥 Often', desc: 'Weekly+' },
                  { value: 'sometimes', label: '🤝 Sometimes', desc: 'Monthly' },
                  { value: 'rarely', label: '🚪 Rarely', desc: 'Almost never' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updatePreference('guests', option.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      preferences.guests === option.value
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="font-semibold mb-1">{option.label}</div>
                    <div className="text-xs text-white/50">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Smoking */}
            <div className="mb-6">
              <label className="block text-sm text-white/60 mb-3">Smoking Preference</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'smoker', label: '🚬 Smoker', desc: 'I smoke' },
                  { value: 'outside-only', label: '🚪 Outside Only', desc: 'Not indoors' },
                  { value: 'non-smoker', label: '🚭 Non-Smoker', desc: 'Smoke-free' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updatePreference('smoking', option.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      preferences.smoking === option.value
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="font-semibold mb-1">{option.label}</div>
                    <div className="text-xs text-white/50">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pets */}
            <div>
              <label className="block text-sm text-white/60 mb-3">Pet Situation</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'has-pets', label: '🐾 Has Pets', desc: 'I have pets' },
                  { value: 'no-pets', label: '❌ No Pets', desc: 'Pet-free' },
                  { value: 'allergic', label: '🤧 Allergic', desc: 'Can\'t be near pets' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updatePreference('pets', option.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      preferences.pets === option.value
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="font-semibold mb-1">{option.label}</div>
                    <div className="text-xs text-white/50">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate(`/user/${userId}`)}
              disabled={saving}
              className="flex-1 px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  💾 Save Preferences
                </>
              )}
            </button>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-sm text-blue-200">
              <span className="font-semibold">💡 Pro Tip:</span> Setting these preferences improves your match rankings in the Connect page.
              Gender preference is a hard filter - incompatible matches won't appear at all.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Preferences
