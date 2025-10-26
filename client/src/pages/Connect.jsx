import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FaArrowRight, FaComments } from 'react-icons/fa'
import { getUser, isAuthenticated } from '../services/auth'
import { API_BASE_URL } from '../config/api'
import Header from '../components/Header'

function Connect() {
  const navigate = useNavigate()
  const loggedInUser = getUser()
  const userId = loggedInUser?.username

  const [loading, setLoading] = useState(true)
  const [recommendations, setRecommendations] = useState([])

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated() || !userId) {
      alert('Please log in to see connections')
      navigate('/auth')
      return
    }

    loadRecommendations()
  }, [userId, navigate])

  async function loadRecommendations() {
    try {
      setLoading(true)
      const apiUrl = import.meta.env.MODE === 'production' ? `${API_BASE_URL}/connect/${userId}` : `/api/connect/${userId}`
      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error('Failed to load recommendations')
      }

      const data = await response.json()
      setRecommendations(data.recommendations)
    } catch (error) {
      console.error('Error loading recommendations:', error)
      alert('Failed to load recommendations: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  function getAvatarUrl(avatar, username) {
    if (avatar && avatar.startsWith('data:image/')) {
      return avatar
    }
    return `https://i.pravatar.cc/150?u=${username}`
  }

  if (!isAuthenticated() || !userId) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="max-w-6xl mx-auto px-6 py-24">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black uppercase tracking-tight mb-3"
              style={{ fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif', fontStyle: 'italic' }}>
            Connect
          </h1>
          <p className="text-white/60 text-lg">
            Discover your best roommate matches based on compatibility
          </p>
          <p className="text-white/40 text-sm mt-2">
            Ranked by our secret algorithm combining interests and lifestyle preferences
          </p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-white/10 animate-shimmer"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  minHeight: '200px'
                }}
              />
            ))}
            <div className="text-center text-white/50 animate-pulse-glow mt-8">
              Finding your perfect matches...
            </div>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🤔</div>
            <h2 className="text-2xl font-bold mb-3">No recommendations yet</h2>
            <p className="text-white/60 mb-6">
              Add more interests and set your roommate preferences to find matches!
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/explore"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-semibold transition-colors"
              >
                ✨ Explore Interests
              </Link>
              <Link
                to="/preferences"
                className="px-6 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-full font-semibold transition-colors"
              >
                🏠 Set Roommate Preferences
              </Link>
              <Link
                to={`/user/${userId}`}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full font-semibold transition-colors"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec, index) => (
              <div
                key={rec.username}
                className="relative group p-6 rounded-2xl border border-white/10 transition-all hover:border-white/30 hover:scale-[1.02] stagger-item"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  animationDelay: `${index * 0.05}s`
                }}
              >
                {/* Rank Badge */}
                <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white/80">
                  #{index + 1}
                </div>

                {/* Profile Section */}
                <div className="flex items-start gap-4 mb-4 pl-12">
                  <img
                    src={getAvatarUrl(rec.avatar, rec.username)}
                    alt={rec.name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-white/20"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{rec.name}</h3>
                    <p className="text-sm text-white/50">@{rec.username}</p>
                    <p className="text-xs text-white/40 mt-1">{rec.school}</p>
                  </div>
                </div>

                {/* Compatibility Display */}
                <div className="mb-4 pl-12">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/60">Interest Match</span>
                    {rec.hasInterestScore ? (
                      <span className={`text-lg font-bold ${
                        rec.interestScore >= 50 ? 'text-green-400' : 'text-white/70'
                      }`}>
                        {rec.interestScore}%
                      </span>
                    ) : (
                      <span className="text-lg font-bold text-white/40">
                        ?
                      </span>
                    )}
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    {rec.hasInterestScore ? (
                      <div
                        className={`h-full ${
                          rec.interestScore >= 50 ? 'bg-green-500' : 'bg-white/30'
                        }`}
                        style={{ width: `${rec.interestScore}%` }}
                      />
                    ) : (
                      <div className="h-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse" />
                    )}
                  </div>

                  {/* Break ice hint */}
                  {!rec.hasInterestScore && (
                    <div className="mt-2 text-xs text-white/40 italic">
                      🧊 Break the ice to reveal compatibility
                    </div>
                  )}

                  {/* Roommate Preview */}
                  {rec.preview.hasPreferences && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-white/50">
                      {rec.preview.sleepSchedule && (
                        <span className="px-2 py-1 bg-white/5 rounded-full">
                          {rec.preview.sleepSchedule === 'early-riser' ? '🌅 Early Riser' :
                           rec.preview.sleepSchedule === 'night-owl' ? '🌙 Night Owl' :
                           '🔄 Flexible'}
                        </span>
                      )}
                      <span className="px-2 py-1 bg-white/5 rounded-full">
                        ✅ Has roommate preferences
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pl-12">
                  <Link
                    to={`/user/${rec.username}`}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-center font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {rec.hasInterestScore ? 'View Profile' : '🧊 Shatter the Ice'}
                    <FaArrowRight className="text-sm" />
                  </Link>
                  {rec.canMessage ? (
                    <Link
                      to="/messages"
                      state={{ pendingRecipient: rec.username }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <FaComments className="text-sm" />
                      Message
                    </Link>
                  ) : (
                    <div className="px-4 py-2 bg-white/5 text-white/30 rounded-lg font-medium flex items-center justify-center gap-2 cursor-not-allowed" title={!rec.hasInterestScore ? "Break the ice first to unlock messaging" : "Need 50%+ match to message"}>
                      <span className="text-xs">
                        {!rec.hasInterestScore ? '🔒' : 'Need 50%+'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Footer */}
        {recommendations.length > 0 && (
          <div className="mt-12 text-center">
            <div className="inline-block px-6 py-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-sm text-white/60">
                <span className="text-white/80 font-semibold">💡 How it works:</span> Rankings use a secret algorithm
                combining interests (60%) + roommate preferences (40%). Gender and pet allergies are hard filters.
              </p>
              <p className="text-xs text-white/40 mt-2">
                "Interest Match" shows pure interest compatibility (no roommate factors). Break the ice to reveal scores. Need 50%+ to message.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Connect
