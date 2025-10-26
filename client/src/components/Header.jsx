import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAuthenticated, getUser, logout } from '../services/auth'

export default function Header() {
  const navigate = useNavigate()
  const user = getUser()
  const authenticated = isAuthenticated()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
          <div className="text-xl sm:text-2xl">❄️</div>
          <span
            className="text-base sm:text-xl font-black uppercase tracking-tight text-white group-hover:text-white/80 transition-colors whitespace-nowrap"
            style={{
              fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif',
              fontStyle: 'italic'
            }}
          >
            Shatter the Ice
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
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
              <Link
                to="/connect"
                className="text-white/60 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
              >
                🔗 Connect
              </Link>
              <Link
                to="/explore"
                className="text-white/60 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
              >
                ✨ Explore
              </Link>
              <Link
                to="/messages"
                className="text-white/60 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
              >
                💬 Messages
              </Link>
              <Link
                to="/preferences"
                className="text-white/60 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
              >
                ⚙️ Settings
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-full transition-all text-white text-sm font-medium whitespace-nowrap"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all text-white text-sm font-medium whitespace-nowrap"
            >
              Log In / Sign Up
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-white hover:text-white/80 transition-colors"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-black/95 backdrop-blur-md border-t border-white/10">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="text-white/60 hover:text-white transition-colors text-sm font-medium py-2"
            >
              Home
            </Link>

            {authenticated && user ? (
              <>
                <Link
                  to={`/user/${user.username}`}
                  onClick={closeMobileMenu}
                  className="text-white/60 hover:text-white transition-colors text-sm font-medium py-2"
                >
                  My Profile
                </Link>
                <Link
                  to="/connect"
                  onClick={closeMobileMenu}
                  className="text-white/60 hover:text-white transition-colors text-sm font-medium flex items-center gap-2 py-2"
                >
                  🔗 Connect
                </Link>
                <Link
                  to="/explore"
                  onClick={closeMobileMenu}
                  className="text-white/60 hover:text-white transition-colors text-sm font-medium flex items-center gap-2 py-2"
                >
                  ✨ Explore
                </Link>
                <Link
                  to="/messages"
                  onClick={closeMobileMenu}
                  className="text-white/60 hover:text-white transition-colors text-sm font-medium flex items-center gap-2 py-2"
                >
                  💬 Messages
                </Link>
                <Link
                  to="/preferences"
                  onClick={closeMobileMenu}
                  className="text-white/60 hover:text-white transition-colors text-sm font-medium flex items-center gap-2 py-2"
                >
                  ⚙️ Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="mt-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-full transition-all text-white text-sm font-medium text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={closeMobileMenu}
                className="mt-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all text-white text-sm font-medium text-center"
              >
                Log In / Sign Up
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
