import { Link, useNavigate } from 'react-router-dom'
import { isAuthenticated, getUser, logout } from '../services/auth'

export default function Header() {
  const navigate = useNavigate()
  const user = getUser()
  const authenticated = isAuthenticated()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="text-2xl">❄️</div>
          <span
            className="text-xl font-black uppercase tracking-tight text-white group-hover:text-white/80 transition-colors"
            style={{
              fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif',
              fontStyle: 'italic'
            }}
          >
            Shatter the Ice
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="text-white/60 hover:text-white transition-colors text-sm font-medium"
          >
            Home
          </Link>

          {authenticated && user ? (
            <>
              <Link
                to={`/user/${user.username}`}
                className="text-white/60 hover:text-white transition-colors text-sm font-medium"
              >
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-full transition-all text-white text-sm font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all text-white text-sm font-medium"
            >
              Log In / Sign Up
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
