import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { FaInstagram, FaDiscord, FaTwitter, FaLinkedin } from 'react-icons/fa'
import { getUser, calculateMatch, getPrivateInterests } from '../services/api'
import { getUser as getLoggedInUser, isAuthenticated } from '../services/auth'
import { API_BASE_URL } from '../config/api'
import IceCube from '../components/IceCube'
import MatchRevealNew from '../components/MatchRevealNew'
import Header from '../components/Header'
import { useCountUp } from '../hooks/useCountUp'

function UserProfileNew() {
  const { username } = useParams()
  const loggedInUser = getLoggedInUser()
  const isOwnProfile = loggedInUser?.username === username

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [matchData, setMatchData] = useState(null)
  const [calculating, setCalculating] = useState(false)
  const [error, setError] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)

  // Edit mode states
  const [editedName, setEditedName] = useState('')
  const [editedUsername, setEditedUsername] = useState('')
  const [editedSocials, setEditedSocials] = useState({})
  const [editedInterests, setEditedInterests] = useState([])
  const [currentInterestInput, setCurrentInterestInput] = useState('')
  const [highlightedInterestIndex, setHighlightedInterestIndex] = useState(-1)
  const [usernameAvailable, setUsernameAvailable] = useState(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingSocialPlatform, setEditingSocialPlatform] = useState(null)
  const [socialInput, setSocialInput] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

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

  // Animation states
  const [cubeShattered, setCubeShattered] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)
  const [hideIceCube, setHideIceCube] = useState(false)
  const [showScore, setShowScore] = useState(false)
  const [showChips, setShowChips] = useState(false)
  const [apiComplete, setApiComplete] = useState(false)

  // Developer Mode
  const [devMode, setDevMode] = useState(false)
  const [privateInterests, setPrivateInterests] = useState(null)

  // Use ref to track apiComplete for interval (avoids React closure issue)
  const apiCompleteRef = useRef(false)

  // Count-up animations for scores (rounded to integers for main display)
  const animatedFriendScore = useCountUp(
    showScore && matchData?.friendScore ? Math.round(matchData.friendScore) : 0,
    1500,
    0
  )
  const animatedRoommateScore = useCountUp(
    showScore && matchData?.roommateScore ? Math.round(matchData.roommateScore) : 0,
    1500,
    200 // Slight delay after friend score starts
  )

  useEffect(() => {
    // Reset all state when username changes
    setMatchData(null)
    setCubeShattered(false)
    setAnimationComplete(false)
    setHideIceCube(false)
    setShowScore(false)
    setShowChips(false)
    setApiComplete(false)
    apiCompleteRef.current = false // Reset ref too
    setCalculating(false)
    setError(null)
    setIsEditMode(false)

    // Load new user
    loadUser()
  }, [username])

  async function loadUser() {
    try {
      setLoading(true)
      const response = await getUser(username)
      setUser(response.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCubeClick() {
    // Check if user is logged in
    if (!isAuthenticated() || !loggedInUser) {
      alert('Please log in to see your compatibility!')
      return
    }

    // Prevent double-shattering
    if (calculating || cubeShattered) return

    setCalculating(true)
    setCubeShattered(true)

    try {
      // Start API call immediately
      console.log('🎯 Starting match calculation...', { viewer: loggedInUser.username, target: username })
      const response = await calculateMatch(loggedInUser.username, username)
      console.log('✅ Match calculation complete:', response)
      setMatchData(response.match)
      setApiComplete(true)
      apiCompleteRef.current = true // Update ref for interval
      console.log('✅ apiComplete set to true')
    } catch (err) {
      console.error('❌ Match calculation failed:', err)
      alert('Failed to calculate match: ' + err.message)
      setCubeShattered(false)
      setCalculating(false)
      setApiComplete(false)
      apiCompleteRef.current = false
      setAnimationComplete(false)
    }
  }

  async function handleAnimationComplete() {
    console.log('🎬 Animation complete, waiting for API...')
    setAnimationComplete(true)

    // Wait for API if not done yet (with 10 second timeout)
    let attempts = 0
    const maxAttempts = 200 // 10 seconds (50ms * 200)
    const checkApi = setInterval(() => {
      attempts++
      if (apiCompleteRef.current) { // Check ref instead of state to avoid closure issue
        console.log('✅ API complete! Showing results...')
        clearInterval(checkApi)
        // Hide ice cube and show score
        setTimeout(() => {
          setHideIceCube(true)
        }, 100)
        setTimeout(() => {
          setShowScore(true)
        }, 200)
      } else if (attempts >= maxAttempts) {
        // Timeout - API took too long
        console.error('⏱️ Timeout: API took too long')
        clearInterval(checkApi)
        alert('The match calculation is taking longer than expected. Please try again.')
        setCubeShattered(false)
        setCalculating(false)
        setAnimationComplete(false)
        apiCompleteRef.current = false
      } else if (attempts % 20 === 0) {
        console.log(`⏳ Still waiting for API... (${attempts * 50}ms)`)
      }
    }, 50)
  }

  function handleScoreComplete() {
    // Called when score animation finishes
    setShowChips(true)
  }

  async function toggleDevMode() {
    if (!devMode && !privateInterests) {
      // Fetch private interests when enabling dev mode for the first time
      try {
        const response = await getPrivateInterests(username)
        setPrivateInterests(response.privateInterests || [])
      } catch (err) {
        console.error('Failed to fetch private interests:', err)
        alert('Failed to load private interests')
        return
      }
    }
    setDevMode(!devMode)
  }

  async function startEditMode() {
    setEditedName(user.name)
    setEditedUsername(user.username)
    // Filter out empty string values from socials
    const cleanedSocials = {}
    if (user.socials) {
      Object.entries(user.socials).forEach(([key, value]) => {
        if (value && value.trim()) {
          cleanedSocials[key] = value
        }
      })
    }
    setEditedSocials(cleanedSocials)
    setUsernameAvailable(null)

    // Fetch private interests
    try {
      const apiUrl = import.meta.env.MODE === 'production' ? `${API_BASE_URL}/users/${user.username}/private-interests` : `/api/users/${user.username}/private-interests`
      const response = await fetch(apiUrl)
      const data = await response.json()
      if (data.privateInterests) {
        setEditedInterests(data.privateInterests)
      }
    } catch (err) {
      console.error('Failed to load interests:', err)
      setEditedInterests([])
    }

    setIsEditMode(true)
  }

  function cancelEditMode() {
    setIsEditMode(false)
    setEditedName('')
    setEditedUsername('')
    setEditedSocials({})
    setUsernameAvailable(null)
  }

  // Check username availability when editing
  useEffect(() => {
    if (!isEditMode || !editedUsername || editedUsername === user?.username) {
      setUsernameAvailable(null)
      return
    }

    if (editedUsername.length < 3) {
      setUsernameAvailable(null)
      return
    }

    const checkUsername = async () => {
      setCheckingUsername(true)
      try {
        const response = await fetch(`http://localhost:3000/api/users/check-username/${editedUsername}`)
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
  }, [editedUsername, isEditMode, user])

  async function handleSaveProfile() {
    if (!editedName.trim()) {
      alert('Please enter your name')
      return
    }

    if (!editedUsername.trim() || editedUsername.length < 3) {
      alert('Username must be at least 3 characters')
      return
    }

    if (editedUsername !== user.username && usernameAvailable === false) {
      alert('Username is already taken')
      return
    }

    setSaving(true)
    try {
      // Clean socials - remove empty strings
      const cleanedSocials = {}
      Object.entries(editedSocials).forEach(([key, value]) => {
        if (value && value.trim()) {
          cleanedSocials[key] = value.trim()
        }
      })

      // Handle unconfirmed interest in input box
      let finalInterests = [...editedInterests]
      const trimmedInput = currentInterestInput.trim()
      if (trimmedInput && !finalInterests.includes(trimmedInput)) {
        // Auto-add the unconfirmed interest
        finalInterests.push(trimmedInput)
      }

      const apiUrl = import.meta.env.MODE === 'production' ? `${API_BASE_URL}/users/${user.username}` : `/api/users/${user.username}`
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editedName.trim(),
          username: editedUsername.toLowerCase().trim(),
          socials: cleanedSocials,
          privateInterests: finalInterests
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      const data = await response.json()

      // Update local user state
      setUser(data.user)

      // Clear the interest input since it was saved
      setCurrentInterestInput('')

      // Update localStorage if username changed
      if (editedUsername !== user.username) {
        const updatedUser = { ...loggedInUser, username: data.user.username }
        localStorage.setItem('user', JSON.stringify(updatedUser))

        // Navigate to new username URL
        window.location.href = `/user/${data.user.username}`
      } else {
        setIsEditMode(false)
      }
    } catch (err) {
      alert('Failed to update profile: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  function updateSocial(platform, value) {
    if (value.trim()) {
      setEditedSocials({ ...editedSocials, [platform]: value.trim() })
    } else {
      const newSocials = { ...editedSocials }
      delete newSocials[platform]
      setEditedSocials(newSocials)
    }
  }

  function saveSocialFromModal() {
    if (socialInput.trim() && editingSocialPlatform) {
      updateSocial(editingSocialPlatform.id, socialInput.trim())
      setEditingSocialPlatform(null)
      setSocialInput('')
    }
  }

  function cancelSocialModal() {
    setEditingSocialPlatform(null)
    setSocialInput('')
  }

  function handleInterestInputChange(e) {
    const value = e.target.value

    // Check if user typed comma or semicolon
    if (value.endsWith(', ') || value.endsWith('; ')) {
      const newInterest = value.slice(0, -2).trim()
      if (newInterest && !editedInterests.includes(newInterest)) {
        setEditedInterests([...editedInterests, newInterest])
      }
      setCurrentInterestInput('')
    } else {
      setCurrentInterestInput(value)
    }
  }

  function handleInterestInputKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = currentInterestInput.trim()
      if (trimmed && !editedInterests.includes(trimmed)) {
        setEditedInterests([...editedInterests, trimmed])
        setCurrentInterestInput('')
        setHighlightedInterestIndex(-1)
      }
    } else if (e.key === 'Backspace' && !currentInterestInput) {
      if (highlightedInterestIndex >= 0) {
        setEditedInterests(editedInterests.filter((_, i) => i !== highlightedInterestIndex))
        setHighlightedInterestIndex(-1)
      } else if (editedInterests.length > 0) {
        setHighlightedInterestIndex(editedInterests.length - 1)
      }
    } else if (e.key !== 'Backspace' && highlightedInterestIndex >= 0) {
      // User started typing - deselect highlighted interest
      setHighlightedInterestIndex(-1)
    }
  }

  function removeInterest(index) {
    setEditedInterests(editedInterests.filter((_, i) => i !== index))
  }

  function handleAvatarFileChange(e) {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    setSelectedAvatarFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  async function handleUploadAvatar() {
    if (!selectedAvatarFile || !avatarPreview) return

    setUploadingAvatar(true)
    try {
      // avatarPreview already contains the base64 data URL
      const response = await fetch(`http://localhost:3000/api/users/${user.username}/avatar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          avatar: avatarPreview
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload avatar')
      }

      // Update user state with new avatar (base64 data URL)
      setUser({ ...user, avatar: avatarPreview })

      // Clear preview
      setSelectedAvatarFile(null)
      setAvatarPreview(null)

      alert('Avatar uploaded successfully!')
    } catch (err) {
      alert('Failed to upload avatar: ' + err.message)
    } finally {
      setUploadingAvatar(false)
    }
  }

  function cancelAvatarUpload() {
    setSelectedAvatarFile(null)
    setAvatarPreview(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-2xl text-white/50">Loading...</div>
      </div>
    )
  }

  function handleConversationStarterClick(message) {
    if (!isAuthenticated()) {
      alert('Please log in to send messages');
      window.location.href = '/auth';
      return;
    }

    // Store the message in localStorage and navigate to messages page
    localStorage.setItem('pendingMessage', message);
    localStorage.setItem('messageRecipient', username);

    // Clear custom message input
    setCustomMessage('');

    // Navigate to messages page
    window.location.href = '/messages';
  }

  if (error || (!loading && !user)) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="text-8xl mb-6">❄️</div>
          <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif' }}>
            Oops!
          </h1>
          <p className="text-white/60 text-lg mb-8">
            {error || "This roommate profile doesn't exist. Check the link and try again."}
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all text-white font-medium"
          >
            Go Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden" style={{ overflowY: 'auto' }}>
      <Header />

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
      <header className="pt-24 pb-4 px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Avatar */}
          <img
            src={user.avatar && user.avatar.startsWith('data:image/')
              ? user.avatar
              : `https://i.pravatar.cc/150?u=${user.username}`}
            alt={user.name}
            className="w-24 h-24 rounded-full mx-auto mb-4 ring-4 ring-white/20 object-cover"
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

          {/* Edit Buttons (only shown on own profile) */}
          {isOwnProfile && !isEditMode && (
            <div className="flex gap-3 justify-center mb-4 flex-wrap">
              <button
                onClick={startEditMode}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all text-white text-sm font-medium"
              >
                ✏️ Edit Profile
              </button>
              <button
                onClick={() => window.location.href = '/preferences'}
                className="px-6 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-full transition-all text-white text-sm font-medium"
              >
                🏠 Roommate Preferences
              </button>
            </div>
          )}

          {/* Developer Mode Toggle (visible on all profiles) */}
          <button
            onClick={toggleDevMode}
            className="px-6 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/30 rounded-full transition-all text-white text-sm font-medium"
          >
            {devMode ? '👁️ Hide Private Interests' : '🔍 Developer Mode'}
          </button>

          {/* Developer Mode Panel - Show Private Interests */}
          {devMode && privateInterests && (
            <div className="mt-6 p-6 bg-yellow-900/20 border border-yellow-500/30 rounded-2xl">
              <h3 className="text-yellow-300 text-sm font-bold uppercase tracking-wider mb-3">
                🔐 Private Interests (Developer View)
              </h3>
              <div className="flex flex-wrap gap-2">
                {privateInterests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-yellow-600/30 border border-yellow-500/40 rounded-full text-sm text-yellow-100"
                  >
                    {interest}
                  </span>
                ))}
              </div>
              {privateInterests.length === 0 && (
                <p className="text-yellow-300/60 text-sm">No private interests set</p>
              )}
            </div>
          )}

          {/* Social Links */}
          {!isEditMode && user.socials && (
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

          {/* Edit Form */}
          {isEditMode && (
            <div className="mt-6 max-w-lg mx-auto">
              <div
                className="p-6 rounded-3xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(40px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <h3 className="text-xl font-bold mb-4">Edit Profile</h3>

                {/* Name */}
                <div className="mb-4">
                  <label className="block text-sm text-white/60 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                    disabled={saving}
                  />
                </div>

                {/* Username */}
                <div className="mb-4">
                  <label className="block text-sm text-white/60 mb-2">Username</label>
                  <input
                    type="text"
                    value={editedUsername}
                    onChange={(e) => setEditedUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                    maxLength={20}
                    disabled={saving}
                  />
                  {editedUsername && editedUsername !== user.username && editedUsername.length >= 3 && (
                    <p className={`text-sm mt-1 ${
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

                {/* Avatar Upload */}
                <div className="mb-6">
                  <label className="block text-sm text-white/60 mb-2">Profile Picture</label>

                  <div className="flex flex-col items-center gap-4">
                    {/* Current/Preview Avatar */}
                    <div className="relative">
                      <img
                        src={avatarPreview || (user.avatar && user.avatar.startsWith('data:image/') ? user.avatar : `https://i.pravatar.cc/150?u=${user.username}`)}
                        alt="Avatar preview"
                        className="w-24 h-24 rounded-full ring-4 ring-white/20 object-cover"
                      />
                      {uploadingAvatar && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                          <div className="text-white text-xs">Uploading...</div>
                        </div>
                      )}
                    </div>

                    {/* File Selection or Upload Actions */}
                    {!selectedAvatarFile ? (
                      <label className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white text-sm font-medium transition-all cursor-pointer">
                        Choose Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFileChange}
                          className="hidden"
                          disabled={saving || uploadingAvatar}
                        />
                      </label>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleUploadAvatar}
                          disabled={uploadingAvatar}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 rounded-xl text-white text-sm font-medium transition-all"
                        >
                          {uploadingAvatar ? 'Uploading...' : 'Upload'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelAvatarUpload}
                          disabled={uploadingAvatar}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white text-sm font-medium transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-white/40 text-center">
                      Max size: 5MB • JPEG, PNG, GIF, WebP
                    </p>
                  </div>
                </div>

                {/* Social Media */}
                <div className="mb-6">
                  <label className="block text-sm text-white/60 mb-2">Social Media</label>

                  {/* Added socials */}
                  {Object.entries(editedSocials).filter(([_, value]) => value && value.trim()).length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(editedSocials)
                        .filter(([_, value]) => value && value.trim())
                        .map(([platform, value]) => {
                          const platformInfo = availableSocials.find(s => s.id === platform)
                          return (
                            <div key={platform} className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-full">
                              <span className="text-lg">{platformInfo?.icon}</span>
                              <span className="text-sm text-white">{value}</span>
                              <button
                                type="button"
                                onClick={() => updateSocial(platform, '')}
                                className="text-white/40 hover:text-red-400 transition-colors ml-1"
                                disabled={saving}
                              >
                                ×
                              </button>
                            </div>
                          )
                        })}
                    </div>
                  )}

                  {/* Add social buttons */}
                  <div className="flex flex-wrap gap-2">
                    {availableSocials
                      .filter(platform => !editedSocials[platform.id] || !editedSocials[platform.id].trim())
                      .map((platform) => (
                        <button
                          key={platform.id}
                          type="button"
                          onClick={() => setEditingSocialPlatform(platform)}
                          className="px-3 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/60 hover:text-white hover:border-white/30 transition-all flex items-center gap-2"
                          disabled={saving}
                        >
                          <span className="text-base">{platform.icon}</span>
                          <span>Add {platform.name}</span>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Interests */}
                <div className="mb-6">
                  <label className="block text-sm text-white/60 mb-2">Interests (Private)</label>
                  <div
                    className="min-h-[100px] px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus-within:border-white/30 transition-colors cursor-text"
                    onClick={() => document.getElementById('edit-interest-input')?.focus()}
                  >
                    <div className="flex flex-wrap gap-2 items-center">
                      {editedInterests.map((interest, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                            highlightedInterestIndex === index
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
                            disabled={saving}
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      <input
                        id="edit-interest-input"
                        type="text"
                        value={currentInterestInput}
                        onChange={handleInterestInputChange}
                        onKeyDown={handleInterestInputKeyDown}
                        placeholder={editedInterests.length === 0 ? "Type interests and press Enter..." : ""}
                        className="flex-1 min-w-[150px] bg-transparent text-white placeholder-white/30 focus:outline-none text-sm"
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-white/40 mt-2">
                    💡 Press Enter or comma+space to add | Press Backspace twice to remove last
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={cancelEditMode}
                    disabled={saving}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex-1 px-4 py-3 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Stage Region (Below Header) */}
      <div className="px-4 mt-4" style={{ overflow: 'visible' }}>
        <div className="max-w-2xl mx-auto relative" style={{ overflow: 'visible' }}>
          {isOwnProfile ? (
            <div className="text-center py-12 px-6">
              <div className="text-6xl mb-4">👋</div>
              <h2 className="text-2xl font-bold mb-3">Welcome back, {user.name}!</h2>
              <p className="text-white/60 mb-6">
                Put your profile link in your Instagram bio to find roommates! Share it with potential roommates to see your compatibility score.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    alert('Profile link copied to clipboard!')
                  }}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all text-white font-medium"
                >
                  📋 Copy Profile Link
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center" style={{ position: 'relative', overflow: 'visible' }}>
              {!hideIceCube && (
                <div style={{
                  position: cubeShattered ? 'absolute' : 'relative',
                  top: cubeShattered ? 0 : 'auto',
                  left: cubeShattered ? 0 : 'auto',
                  right: cubeShattered ? 0 : 'auto',
                  zIndex: 5, // Lower z-index so it doesn't block buttons
                  overflow: 'visible',
                  height: cubeShattered ? 0 : 'auto'
                }}>
                  <IceCube onShatter={handleAnimationComplete} onClick={handleCubeClick} disabled={calculating} />
                </div>
              )}

              {animationComplete && !showScore && (
                <div className="text-center py-8" style={{ position: 'relative', zIndex: 5 }}>
                  <div className="text-6xl font-bold text-white/50">
                    <span className="inline-block animate-fade-in-out" style={{ animationDelay: '0ms' }}>.</span>
                    <span className="inline-block animate-fade-in-out" style={{ animationDelay: '200ms' }}>.</span>
                    <span className="inline-block animate-fade-in-out" style={{ animationDelay: '400ms' }}>.</span>
                  </div>
                </div>
              )}

              {showScore && matchData && hideIceCube && (
                <div className="animate-fade-in py-8" style={{ position: 'relative', zIndex: 10 }}>
                  {matchData.revealDetails ? (
                    <>
                      {/* Dual Score Display */}
                      <div className="max-w-2xl mx-auto px-6 mb-8">
                        {/* Roommate Eligibility Badge */}
                        {matchData.isEligibleRoommate !== undefined && (
                          <div className="text-center mb-6">
                            {matchData.isEligibleRoommate ? (
                              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-300 text-sm font-semibold">
                                ✅ Eligible Roommate Match
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full text-red-300 text-sm font-semibold">
                                🚫 Not Eligible as Roommate
                              </div>
                            )}
                          </div>
                        )}

                        {/* Scores Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Friend Compatibility */}
                          <div
                            className="p-6 rounded-2xl border border-white/10"
                            style={{
                              background: 'rgba(255, 255, 255, 0.03)',
                              backdropFilter: 'blur(10px)'
                            }}
                          >
                            <div className="text-xs text-white/40 uppercase tracking-widest mb-2 text-center">Friend Match</div>
                            <div className={`text-5xl font-black text-center mb-2 ${matchData.friendScore >= 70 ? 'text-green-400' : 'text-white/70'}`}>
                              {animatedFriendScore}%
                            </div>
                            <div className="text-xs text-white/50 text-center">Pure Interest Compatibility</div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-3">
                              <div
                                className={`h-full ${matchData.friendScore >= 70 ? 'bg-green-500' : 'bg-white/30'}`}
                                style={{ width: `${matchData.friendScore}%` }}
                              />
                            </div>
                          </div>

                          {/* Roommate Compatibility */}
                          <div
                            className="p-6 rounded-2xl border border-white/10"
                            style={{
                              background: matchData.isEligibleRoommate
                                ? 'rgba(59, 130, 246, 0.05)'
                                : 'rgba(239, 68, 68, 0.05)',
                              backdropFilter: 'blur(10px)',
                              borderColor: matchData.isEligibleRoommate ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                            }}
                          >
                            <div className="text-xs text-white/40 uppercase tracking-widest mb-2 text-center">Roommate Match</div>
                            <div className={`text-5xl font-black text-center mb-2 ${
                              !matchData.isEligibleRoommate ? 'text-red-400' :
                              matchData.roommateScore >= 70 ? 'text-blue-400' : 'text-white/70'
                            }`}>
                              {matchData.isEligibleRoommate ? `${animatedRoommateScore}%` : 'N/A'}
                            </div>
                            <div className="text-xs text-white/50 text-center">
                              {matchData.isEligibleRoommate ? 'Interests + Lifestyle' : 'Hard Filter Failed'}
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-3">
                              <div
                                className={`h-full ${
                                  !matchData.isEligibleRoommate ? 'bg-red-500' :
                                  matchData.roommateScore >= 70 ? 'bg-blue-500' : 'bg-white/30'
                                }`}
                                style={{ width: matchData.isEligibleRoommate ? `${matchData.roommateScore}%` : '100%' }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Explanation */}
                        <div className="mt-4 text-center text-xs text-white/40">
                          <p>Friend Match = Interests only • Roommate Match = (Interests + Lifestyle Preferences) / 2</p>
                          {!matchData.isEligibleRoommate && (
                            <p className="mt-2 text-red-300/60">⚠️ {matchData.roommateIneligibilityReason}</p>
                          )}
                        </div>
                      </div>

                      {/* Trigger chip reveal */}
                      {setTimeout(() => handleScoreComplete(), 500) && null}
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="text-6xl font-bold text-white/70 mb-4">
                        {Math.round(matchData.score || matchData.friendScore)}%
                      </div>
                      <p className="text-white/50 max-w-md mx-auto">
                        {matchData.privacyMessage}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
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
          {(matchData?.friendScore || matchData?.score) >= 70 && matchData?.sharedInterests?.length > 0 && (
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

                  {/* Custom Message Input */}
                  <div
                    className="relative overflow-hidden rounded-2xl p-4"
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
                    <p className="text-white/60 text-xs mb-2 uppercase tracking-wider">Or write your own:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && customMessage.trim()) {
                            handleConversationStarterClick(customMessage)
                          }
                        }}
                        placeholder="Type your message..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                      />
                      <button
                        onClick={() => customMessage.trim() && handleConversationStarterClick(customMessage)}
                        disabled={!customMessage.trim()}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed border border-white/10 rounded-lg text-white text-sm font-medium transition-all"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Social Media Input Modal */}
      {editingSocialPlatform && (
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
              <span className="text-4xl">{editingSocialPlatform.icon}</span>
              <h3 className="text-2xl font-bold text-white">Add {editingSocialPlatform.name}</h3>
            </div>

            <input
              type="text"
              value={socialInput}
              onChange={(e) => setSocialInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveSocialFromModal()}
              placeholder={editingSocialPlatform.placeholder}
              autoFocus
              className="w-full px-4 py-3 mb-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={cancelSocialModal}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveSocialFromModal}
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

export default UserProfileNew
