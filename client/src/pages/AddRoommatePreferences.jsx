import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import { completeSignup, saveAuthToken, saveUser, isAuthenticated, getUser } from '../services/auth'

export default function AddRoommatePreferences() {
  const navigate = useNavigate()
  const location = useLocation()
  const profileData = location.state?.profileData

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Roommate preference states
  const [sleepSchedule, setSleepSchedule] = useState('')
  const [bedtime, setBedtime] = useState('')
  const [wakeTime, setWakeTime] = useState('')
  const [cleanliness, setCleanliness] = useState('')
  const [socialLevel, setSocialLevel] = useState('')
  const [guests, setGuests] = useState('')
  const [smoking, setSmoking] = useState('')
  const [pets, setPets] = useState('')

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      const user = getUser()
      navigate(`/user/${user.username}`, { replace: true })
    }
  }, [navigate])

  // Redirect if no profile data
  if (!profileData) {
    navigate('/auth')
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Build roommate preferences object (only include fields that are set)
      const roommatePreferences = {}
      
      if (sleepSchedule) roommatePreferences.sleepSchedule = sleepSchedule
      if (bedtime) roommatePreferences.bedtime = bedtime
      if (wakeTime) roommatePreferences.wakeTime = wakeTime
      if (cleanliness) roommatePreferences.cleanliness = cleanliness
      if (socialLevel) roommatePreferences.socialLevel = socialLevel
      if (guests) roommatePreferences.guests = guests
      if (smoking) roommatePreferences.smoking = smoking
      if (pets) roommatePreferences.pets = pets

      const response = await completeSignup({
        ...profileData,
        roommatePreferences
      })

      // Save auth token and user data
      saveAuthToken(response.token)
      saveUser(response.user)

      // Navigate to their new profile
      navigate(`/user/${response.user.username}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleSkip() {
    // Skip to completion without roommate preferences
    handleSubmit(new Event('submit'))
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
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <div className="text-6xl mb-4 animate-bounce-in">🏠</div>
            <h1 className="text-4xl font-bold mb-2 animate-slide-up">
              Roommate Preferences
            </h1>
            <p className="text-white/60 mb-2 animate-slide-up delay-100">
              Help us find your perfect roommate match by sharing your living preferences
            </p>
            <p className="text-sm text-cyan-400/80 bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-4 py-3 mt-4 inline-block animate-slide-up delay-200">
              💡 Optional but recommended! These preferences significantly improve your match quality
            </p>
          </div>

          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate('/interests', { state: { profileData } })}
            className="mb-4 text-white/60 hover:text-white transition-colors flex items-center gap-2 animate-slide-right"
          >
            ← Back to Interests
          </button>

          {/* Preferences Form */}
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
            {/* Sleep Schedule */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-3">
                🌙 Sleep Schedule
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'early-riser', label: 'Early Riser', desc: 'Asleep by 10pm' },
                  { value: 'night-owl', label: 'Night Owl', desc: 'Asleep after 12am' },
                  { value: 'flexible', label: 'Flexible', desc: 'Varies' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSleepSchedule(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      sleepSchedule === option.value
                        ? 'border-white bg-white/10'
                        : 'border-white/10 hover:border-white/30 bg-white/5'
                    }`}
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-sm text-white/60">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Specific Sleep Times */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  🛌 Typical Bedtime
                </label>
                <input
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  ⏰ Typical Wake Time
                </label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            {/* Cleanliness */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-3">
                🧹 Cleanliness Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'very-clean', label: 'Very Clean', desc: 'Everything organized' },
                  { value: 'moderately-clean', label: 'Moderately Clean', desc: 'Tidy enough' },
                  { value: 'relaxed', label: 'Relaxed', desc: 'Lived-in vibe' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setCleanliness(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      cleanliness === option.value
                        ? 'border-white bg-white/10'
                        : 'border-white/10 hover:border-white/30 bg-white/5'
                    }`}
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-sm text-white/60">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Social Level */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-3">
                👥 Social Energy
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'very-social', label: 'Very Social', desc: 'Love hanging out' },
                  { value: 'moderately-social', label: 'Moderately Social', desc: 'Balanced' },
                  { value: 'quiet', label: 'Quiet', desc: 'Need alone time' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSocialLevel(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      socialLevel === option.value
                        ? 'border-white bg-white/10'
                        : 'border-white/10 hover:border-white/30 bg-white/5'
                    }`}
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-sm text-white/60">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Guests */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-3">
                🚪 Having Guests Over
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'often', label: 'Often', desc: 'Friends over regularly' },
                  { value: 'sometimes', label: 'Sometimes', desc: 'Occasionally' },
                  { value: 'rarely', label: 'Rarely', desc: 'Prefer privacy' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setGuests(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      guests === option.value
                        ? 'border-white bg-white/10'
                        : 'border-white/10 hover:border-white/30 bg-white/5'
                    }`}
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-sm text-white/60">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Smoking */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-3">
                🚬 Smoking Preference
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'non-smoker', label: 'Non-Smoker', desc: 'No smoking' },
                  { value: 'outside-only', label: 'Outside Only', desc: 'Only outdoors' },
                  { value: 'smoker', label: 'Smoker', desc: 'Smoke-friendly' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSmoking(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      smoking === option.value
                        ? 'border-white bg-white/10'
                        : 'border-white/10 hover:border-white/30 bg-white/5'
                    }`}
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-sm text-white/60">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pets */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-3">
                🐾 Pet Situation
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'has-pets', label: 'Has Pets', desc: 'I have pets' },
                  { value: 'no-pets', label: 'No Pets', desc: 'But pet-friendly' },
                  { value: 'allergic', label: 'Allergic', desc: 'No pets please' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPets(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      pets === option.value
                        ? 'border-white bg-white/10'
                        : 'border-white/10 hover:border-white/30 bg-white/5'
                    }`}
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-sm text-white/60">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="mb-4 text-sm text-red-400">{error}</p>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleSkip}
                disabled={loading}
                className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                Skip for Now
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-4 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {loading ? 'Creating Profile...' : 'Complete Profile'}
              </button>
            </div>

            <p className="text-xs text-white/40 text-center mt-4">
              Your preferences help us find compatible roommates and improve your match quality
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}


