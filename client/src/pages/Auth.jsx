import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { sendVerificationCode, verifyCode, login, verifyLogin, saveAuthToken, saveUser, isAuthenticated, getUser } from '../services/auth'
import { API_BASE_URL } from '../config/api'

export default function Auth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState(null) // Will be determined automatically: 'signup' or 'login'
  const [step, setStep] = useState('email') // 'email' or 'code'
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [codeSent, setCodeSent] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      const user = getUser()
      navigate(`/user/${user.username}`, { replace: true })
    }
  }, [])

  async function handleSendCode() {
    if (!email) {
      setError('Please enter your email')
      return
    }

    setLoading(true)
    setError('')

    try {
      // First check if user exists
      const apiUrl = import.meta.env.MODE === 'production' ? `${API_BASE_URL}/auth/check-user` : '/api/auth/check-user'
      const checkResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const checkData = await checkResponse.json()

      if (checkData.exists) {
        // User exists - send login code
        setMode('login')
        await login(email)
      } else {
        // User doesn't exist - send signup code
        setMode('signup')
        await sendVerificationCode(email)
      }
      setCodeSent(true)
      setStep('code')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode() {
    if (!code || code.length !== 6) {
      setError('Please enter the 6-digit code')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (mode === 'signup') {
        await verifyCode(email, code)
        // Go to profile creation
        navigate('/create', { state: { email } })
      } else {
        const response = await verifyLogin(email, code)
        saveAuthToken(response.token)
        saveUser(response.user)
        // Go to their profile
        navigate(`/user/${response.user.username}`)
      }
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
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">❄️</div>
            <h1 className="text-4xl font-bold mb-2">
              {step === 'email' ? 'Get Started' : (mode === 'signup' ? 'Create Your Profile' : 'Welcome Back')}
            </h1>
            <p className="text-white/60">
              {step === 'email'
                ? 'Enter your email to continue'
                : mode === 'signup'
                ? 'Verify your email to create your profile'
                : 'Verify your email to access your profile'}
            </p>
          </div>

          {/* Auth Form */}
          <div
            className="p-8 rounded-3xl"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            {step === 'email' ? (
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendCode()}
                  placeholder="you@college.edu"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  disabled={loading}
                />

                {error && (
                  <p className="mt-2 text-sm text-red-400">{error}</p>
                )}

                <button
                  onClick={handleSendCode}
                  disabled={loading}
                  className="w-full mt-4 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Continue'}
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-white/60">
                    We sent a 6-digit code to:
                  </p>
                  <p className="text-white font-medium">{email}</p>
                  <button
                    onClick={() => setStep('email')}
                    className="text-sm text-white/40 hover:text-white/60 transition-colors mt-1"
                  >
                    Change email
                  </button>
                </div>

                <label className="block text-sm font-medium text-white/60 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyPress={(e) => e.key === 'Enter' && handleVerifyCode()}
                  placeholder="000000"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-center text-2xl font-bold tracking-widest placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  maxLength={6}
                  disabled={loading}
                />

                {error && (
                  <p className="mt-2 text-sm text-red-400">{error}</p>
                )}

                <button
                  onClick={handleVerifyCode}
                  disabled={loading || code.length !== 6}
                  className="w-full mt-4 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>

                <button
                  onClick={handleSendCode}
                  disabled={loading}
                  className="w-full mt-3 text-sm text-white/40 hover:text-white/60 transition-colors"
                >
                  Resend code
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
