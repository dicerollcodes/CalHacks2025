import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { getUser, calculateMatch } from '../services/api'
import MatchResults from '../components/MatchResults'

function UserProfile() {
  const { shareableId } = useParams()
  const [searchParams] = useSearchParams()
  const viewerId = searchParams.get('viewer') // The person visiting the link

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [matchData, setMatchData] = useState(null)
  const [calculating, setCalculating] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadUser()
  }, [shareableId])

  async function loadUser() {
    try {
      setLoading(true)
      const response = await getUser(shareableId)
      setUser(response.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleShatterIce() {
    if (!viewerId) {
      alert('Please provide your viewer ID in the URL: ?viewer=YOUR_ID')
      return
    }

    try {
      setCalculating(true)
      const response = await calculateMatch(viewerId, shareableId)
      setMatchData(response.match)
    } catch (err) {
      alert('Failed to calculate match: ' + err.message)
    } finally {
      setCalculating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-ice-600">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-xl">Error: {error}</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">User not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-ice-800 mb-2">
            Shatter the Ice
          </h1>
          <p className="text-ice-600 italic">
            "Don't just break the ice — shatter it."
          </p>
        </div>

        {/* User Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col items-center">
            <div className="text-6xl mb-4">{user.avatar || '👤'}</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{user.name}</h2>
            <p className="text-gray-600 mb-4">{user.schoolId?.name}</p>

            {/* Social Links */}
            {user.socials && (
              <div className="flex gap-4 mb-6">
                {user.socials.instagram && (
                  <a
                    href={`https://instagram.com/${user.socials.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-700"
                  >
                    📷 Instagram
                  </a>
                )}
                {user.socials.discord && (
                  <span className="text-indigo-600">💬 {user.socials.discord}</span>
                )}
              </div>
            )}

            {/* Shatter Button */}
            {!matchData && (
              <button
                onClick={handleShatterIce}
                disabled={calculating}
                className="px-8 py-4 bg-gradient-to-r from-ice-500 to-ice-600 text-white text-xl font-bold rounded-full shadow-lg hover:from-ice-600 hover:to-ice-700 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {calculating ? '🧊 Shattering...' : '🧊 Shatter the Ice'}
              </button>
            )}

            {!viewerId && !matchData && (
              <p className="text-sm text-gray-500 mt-4">
                Add ?viewer=YOUR_ID to the URL to see your compatibility!
              </p>
            )}
          </div>
        </div>

        {/* Match Results */}
        {matchData && <MatchResults matchData={matchData} />}
      </div>
    </div>
  )
}

export default UserProfile
