import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaPlus, FaMinus } from 'react-icons/fa'
import { getUser, isAuthenticated } from '../services/auth'
import Header from '../components/Header'
import { API_BASE_URL } from '../config/api'

function Explore() {
  const navigate = useNavigate()
  const loggedInUser = getUser()
  const userId = loggedInUser?.username

  const [loading, setLoading] = useState(true)
  const [currentInterests, setCurrentInterests] = useState([])
  const [defaultInterests, setDefaultInterests] = useState([])
  const [curatedInterests, setCuratedInterests] = useState([])
  const [savingInterest, setSavingInterest] = useState(null)

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated() || !userId) {
      alert('Please log in to explore interests')
      navigate('/auth')
      return
    }

    loadInterests()
  }, [userId, navigate])

  async function loadInterests() {
    try {
      setLoading(true)
      const apiUrl = import.meta.env.MODE === 'production' ? `${API_BASE_URL}/users/${userId}/curated-interests` : `/api/users/${userId}/curated-interests`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load interests')
      }

      const data = await response.json()
      setCurrentInterests(data.currentInterests)
      setDefaultInterests(data.defaultInterests)
      setCuratedInterests(data.curatedInterests)
    } catch (error) {
      console.error('Error loading interests:', error)
      alert('Failed to load interests: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  function isInterestAdded(interestText) {
    return currentInterests.some(interest =>
      interest.toLowerCase() === interestText.toLowerCase()
    )
  }

  async function handleToggleInterest(interestText) {
    const isAdded = isInterestAdded(interestText)
    setSavingInterest(interestText)

    try {
      const updatedInterests = isAdded
        ? currentInterests.filter(i => i.toLowerCase() !== interestText.toLowerCase())
        : [...currentInterests, interestText]

      // Update on server
      const apiUrl = import.meta.env.MODE === 'production' ? `${API_BASE_URL}/users/${userId}` : `/api/users/${userId}`
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          privateInterests: updatedInterests
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update interests')
      }

      // Update local state
      setCurrentInterests(updatedInterests)
    } catch (error) {
      console.error('Error toggling interest:', error)
      alert('Failed to update interest: ' + error.message)
    } finally {
      setSavingInterest(null)
    }
  }

  if (!isAuthenticated() || !userId) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black uppercase tracking-tight mb-3"
              style={{ fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif', fontStyle: 'italic' }}>
            Explore Interests
          </h1>
          <p className="text-white/60 text-lg">
            Discover new interests to enhance your profile and find better matches
          </p>
          <p className="text-white/40 text-sm mt-2">
            {currentInterests.length} interests added
          </p>
        </div>

        {loading ? (
          <div className="space-y-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl border-2 border-white/10 animate-shimmer"
                  style={{ minHeight: '140px' }}
                />
              ))}
            </div>
            <div className="text-center text-white/50 animate-pulse-glow">
              Loading interests...
            </div>
          </div>
        ) : (
          <>
            {/* Curated For You Section */}
            {curatedInterests.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="text-3xl">✨</span>
                  Curated For You
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {curatedInterests.map((interest, index) => {
                    const added = isInterestAdded(interest.text)
                    const isSaving = savingInterest === interest.text

                    return (
                      <button
                        key={index}
                        onClick={() => handleToggleInterest(interest.text)}
                        disabled={isSaving}
                        className={`
                          relative group p-6 rounded-2xl border-2 transition-all transform hover:scale-105 hover:shadow-lg
                          ${added
                            ? 'bg-blue-600/20 border-blue-500'
                            : 'bg-white/5 border-white/10 hover:border-white/30'
                          }
                          ${isSaving ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
                        `}
                        style={{
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)'
                        }}
                      >
                        {/* Add/Remove Button */}
                        <div className={`
                          absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all
                          ${added
                            ? 'bg-red-500/80 text-white'
                            : 'bg-white/10 text-white/60 group-hover:bg-white/20'
                          }
                        `}>
                          {added ? <FaMinus /> : <FaPlus />}
                        </div>

                        {/* Interest Content */}
                        <div className="text-center">
                          <div className="text-4xl mb-3">{interest.emoji}</div>
                          <div className="text-sm font-medium text-white leading-snug">
                            {interest.text}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Popular Interests Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="text-3xl">🔥</span>
                Popular Interests
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {defaultInterests.map((interest, index) => {
                  const added = isInterestAdded(interest.text)
                  const isSaving = savingInterest === interest.text

                  return (
                    <button
                      key={index}
                      onClick={() => handleToggleInterest(interest.text)}
                      disabled={isSaving}
                      className={`
                        relative group p-5 rounded-2xl border-2 transition-all transform hover:scale-105 hover:shadow-lg
                        ${added
                          ? 'bg-blue-600/20 border-blue-500'
                          : 'bg-white/5 border-white/10 hover:border-white/30'
                        }
                        ${isSaving ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
                      `}
                      style={{
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)'
                      }}
                    >
                      {/* Add/Remove Button */}
                      <div className={`
                        absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all
                        ${added
                          ? 'bg-red-500/80 text-white'
                          : 'bg-white/10 text-white/60 group-hover:bg-white/20'
                        }
                      `}>
                        {added ? <FaMinus /> : <FaPlus />}
                      </div>

                      {/* Interest Content */}
                      <div className="text-center">
                        <div className="text-3xl mb-2">{interest.emoji}</div>
                        <div className="text-sm font-medium text-white">
                          {interest.text}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Custom Interest Input */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="text-3xl">✍️</span>
                Add Your Own
              </h2>
              <div className="max-w-2xl mx-auto">
                <form onSubmit={(e) => {
                  e.preventDefault()
                  const input = e.target.customInterest
                  const value = input.value.trim()
                  if (value) {
                    handleToggleInterest(value)
                    input.value = ''
                  }
                }} className="flex gap-3">
                  <input
                    type="text"
                    name="customInterest"
                    placeholder="Type a custom interest and press Enter..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition-colors"
                  >
                    Add
                  </button>
                </form>
                <p className="text-xs text-white/40 mt-2">
                  Can't find what you're looking for? Add your own custom interest!
                </p>
              </div>
            </div>

            {/* Back to Profile Link */}
            <div className="text-center mt-12">
              <button
                onClick={() => navigate(`/user/${userId}`)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all text-white font-medium"
              >
                Back to Profile
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Explore
