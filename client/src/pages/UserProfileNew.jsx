import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { FaInstagram, FaDiscord, FaTwitter, FaLinkedin, FaComments } from 'react-icons/fa'
import { getUser, calculateMatch } from '../services/api'
import IceCube from '../components/IceCube'
import ScoreReveal from '../components/ScoreReveal'
import MatchRevealNew from '../components/MatchRevealNew'

function UserProfileNew() {
  const { shareableId } = useParams()
  const [searchParams] = useSearchParams()
  const viewerId = searchParams.get('viewer')

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [matchData, setMatchData] = useState(null)
  const [calculating, setCalculating] = useState(false)
  const [error, setError] = useState(null)

  // Animation states
  const [cubeShattered, setCubeShattered] = useState(false)
  const [hideIceCube, setHideIceCube] = useState(false)
  const [showScore, setShowScore] = useState(false)
  const [showChips, setShowChips] = useState(false)

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
      alert('Please add ?viewer=YOUR_ID to the URL to see compatibility!')
      return
    }

    if (calculating) return

    try {
      setCalculating(true)
      setCubeShattered(true)

      // Fetch match data
      const response = await calculateMatch(viewerId, shareableId)
      setMatchData(response.match)

      // Hide ice cube after particles finish (1.5s for full animation)
      setTimeout(() => {
        setHideIceCube(true)
      }, 1500)

      // Show score after ice cube is hidden
      setTimeout(() => {
        setShowScore(true)
      }, 1600)
    } catch (err) {
      alert('Failed to calculate match: ' + err.message)
      setCubeShattered(false)
      setCalculating(false)
    }
  }

  function handleScoreComplete() {
    // Called when score animation finishes
    setShowChips(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-2xl text-white/50">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/50 text-xl">User not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden" style={{ overflowY: 'auto' }}>
      {/* Global Messages Button */}
      {viewerId && (
        <Link
          to={`/messages?userId=${viewerId}`}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
          title="Messages"
        >
          <FaComments className="text-white text-xl" />
        </Link>
      )}
      
      {/* Subtle background particles */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        {[...Array(20)].map((_, i) => (
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

      {/* Header Region (Top) */}
      <header className="pt-8 pb-4 px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Avatar */}
          <img
            src={`https://i.pravatar.cc/150?u=${user.shareableId}`}
            alt={user.name}
            className="w-24 h-24 rounded-full mx-auto mb-4 ring-4 ring-white/20"
          />

          {/* Name */}
          <h1
            className="text-5xl font-black uppercase tracking-tight mb-2"
            style={{
              fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif',
              fontStyle: 'italic'
            }}
          >
            {user.name}
          </h1>

          {/* School */}
          <p className="text-white/50 text-sm uppercase tracking-widest mb-4">
            {user.schoolId?.name}
          </p>

          {/* Social Links */}
          {user.socials && (
            <div className="flex items-center justify-center gap-3">
              {user.socials.instagram && (
                <a
                  href={`https://instagram.com/${user.socials.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all text-sm text-white/80 hover:text-white"
                >
                  <FaInstagram className="text-pink-400" />
                  <span>{user.socials.instagram}</span>
                </a>
              )}
              {user.socials.discord && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm text-white/80">
                  <FaDiscord className="text-indigo-400" />
                  <span>{user.socials.discord}</span>
                </div>
              )}
              {user.socials.twitter && (
                <a
                  href={`https://twitter.com/${user.socials.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all text-sm text-white/80 hover:text-white"
                >
                  <FaTwitter className="text-blue-400" />
                  <span>{user.socials.twitter}</span>
                </a>
              )}
              {user.socials.linkedin && (
                <a
                  href={`https://linkedin.com/in/${user.socials.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all text-sm text-white/80 hover:text-white"
                >
                  <FaLinkedin className="text-blue-500" />
                  <span>{user.socials.linkedin}</span>
                </a>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Stage Region (Below Header) */}
      <div className="px-4 mt-4" style={{ overflow: 'visible' }}>
        <div className="max-w-2xl mx-auto relative" style={{ overflow: 'visible' }}>
          {/* Ice Cube Container */}
          <div className="text-center" style={{ position: 'relative', overflow: 'visible' }}>
            {/* Ice Cube (before and during shatter) */}
            {!hideIceCube && (
              <div style={{
                position: cubeShattered ? 'absolute' : 'relative',
                top: cubeShattered ? 0 : 'auto',
                left: cubeShattered ? 0 : 'auto',
                right: cubeShattered ? 0 : 'auto',
                zIndex: 20,
                overflow: 'visible',
                height: cubeShattered ? 0 : 'auto'
              }}>
                <IceCube onShatter={handleShatterIce} disabled={calculating} />
                {!cubeShattered && (
                  <p className="mt-2 text-white/40 text-sm uppercase tracking-widest">
                    {viewerId ? 'TAP TO SHATTER THE ICE' : 'Add ?viewer=YOUR_ID to URL'}
                  </p>
                )}
              </div>
            )}

            {/* Loading dots while calculating - appears immediately, behind ice cube */}
            {cubeShattered && !showScore && (
              <div className="text-center py-8" style={{ position: 'relative', zIndex: 5 }}>
                <div className="text-6xl font-bold text-white/50">
                  <span className="inline-block animate-fade-in-out" style={{ animationDelay: '0ms' }}>.</span>
                  <span className="inline-block animate-fade-in-out" style={{ animationDelay: '200ms' }}>.</span>
                  <span className="inline-block animate-fade-in-out" style={{ animationDelay: '400ms' }}>.</span>
                </div>
              </div>
            )}

            {/* Score (after shatter) - only shows when ice cube is hidden */}
            {showScore && matchData && hideIceCube && (
              <div className="animate-fade-in py-8" style={{ position: 'relative', zIndex: 10 }}>
                {matchData.revealDetails ? (
                  <ScoreReveal
                    score={matchData.score}
                    onComplete={handleScoreComplete}
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-6xl font-bold text-white/70 mb-4">
                      {matchData.score}%
                    </div>
                    <p className="text-white/50 max-w-md mx-auto">
                      {matchData.privacyMessage}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interests Section (Scrollable Cards) */}
      {matchData?.revealDetails && showChips && (
        <div className="mt-8">
          <MatchRevealNew
            matchData={matchData}
            show={showChips}
          />
          
          {/* Conversation Starters */}
          {matchData?.score >= 70 && matchData?.sharedInterests?.length > 0 && (
            <div className="w-full pb-6 px-6 mt-8">
              <div className="max-w-2xl mx-auto">
                <h3
                  className="text-white/40 text-xs uppercase tracking-[0.2em] font-semibold text-center mb-4"
                  style={{
                    fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif'
                  }}
                >
                  Start a Conversation
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {generateConversationStarters(matchData.sharedInterests).map((starter, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleConversationStarterClick(starter)}
                      className="relative overflow-hidden rounded-2xl p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(40px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: `
                          0 8px 32px 0 rgba(0, 0, 0, 0.37),
                          inset 0 1px 0 0 rgba(255, 255, 255, 0.05)
                        `
                      }}
                    >
                      <p className="text-white/80 text-sm leading-relaxed">
                        {starter}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Helper function to generate conversation starters
function generateConversationStarters(sharedInterests) {
  if (!sharedInterests || sharedInterests.length === 0) return [];
  
  const interest1 = sharedInterests[0];
  const interest2 = sharedInterests[1] || interest1;
  
  return [
    `Hey! I saw we have ${interest1} in common on Shatter the Ice! How long have you been into ${interest1}?`,
    `What got you interested in ${interest2}? I'd love to hear your story!`,
    `I'm always looking to connect with people who are into ${interest1}. Want to chat about it?`
  ];
}

function handleConversationStarterClick(message) {
  // Store the message in localStorage and navigate to messages page
  localStorage.setItem('pendingMessage', message);
  
  // Get current user ID and target user ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const viewerId = urlParams.get('viewer');
  const targetId = window.location.pathname.split('/').pop();
  
  if (viewerId && targetId) {
    localStorage.setItem('messageRecipient', targetId);
    window.location.href = `/messages?userId=${viewerId}`;
  } else {
    alert('Please add ?viewer=YOUR_ID to the URL to send messages');
  }
}

export default UserProfileNew
