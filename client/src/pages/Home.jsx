import { Link, useNavigate } from 'react-router-dom'
import { isAuthenticated, getUser } from '../services/auth'
import Header from '../components/Header'

function Home() {
  const loggedIn = isAuthenticated()
  const user = getUser()
  const navigate = useNavigate()

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

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-8xl mb-8 animate-pulse">❄️</div>
          <h1
            className="text-7xl md:text-8xl font-black uppercase tracking-tight mb-6"
            style={{
              fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif',
              fontStyle: 'italic',
              background: 'linear-gradient(135deg, #ffffff 0%, #a5f3fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Shatter the Ice
          </h1>
          <p className="text-2xl md:text-3xl text-white/60 mb-12 italic">
            Don't just break the ice — shatter it.
          </p>

          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed">
            Finding the right roommate shouldn't be awkward. Share your authentic interests privately,
            and only reveal them when there's real compatibility.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {loggedIn ? (
              <>
                <button
                  onClick={() => navigate(`/user/${user.username}`)}
                  className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-all text-lg"
                >
                  View My Profile
                </button>
                <a
                  href="#how-it-works"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all text-white font-medium text-lg"
                >
                  How It Works
                </a>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-all text-lg"
                >
                  Get Started
                </Link>
                <a
                  href="#how-it-works"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all text-white font-medium text-lg"
                >
                  How It Works
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="how-it-works" className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Why Shatter the Ice?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature Card */}
            <div
              className="p-6 rounded-3xl"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold mb-3">Privacy First</h3>
              <p className="text-white/60 leading-relaxed">
                Your interests stay completely private until you find meaningful overlap with someone.
                No awkward rejections, no judgment — just authentic connections.
              </p>
            </div>

            <div
              className="p-6 rounded-3xl"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold mb-3">AI-Powered Matching</h3>
              <p className="text-white/60 leading-relaxed">
                Our AI doesn't just look for exact matches. It finds semantic connections between interests
                you never knew were related.
              </p>
            </div>

            <div
              className="p-6 rounded-3xl"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div className="text-5xl mb-4">🏠</div>
              <h3 className="text-2xl font-bold mb-3">Roommate-Specific</h3>
              <p className="text-white/60 leading-relaxed">
                Built specifically for finding college roommates who share your lifestyle, hobbies,
                and values — not just anyone who needs a place.
              </p>
            </div>

            <div
              className="p-6 rounded-3xl"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-3">Instant Chemistry</h3>
              <p className="text-white/60 leading-relaxed">
                See your compatibility score instantly. The ice cube shatters to reveal how well
                you match — a cinematic experience that makes finding roommates exciting.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!loggedIn && (
        <div className="relative py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-5xl font-bold mb-6">Ready to find your perfect roommate?</h2>
            <p className="text-xl text-white/60 mb-8">
              Join students who are tired of random roommate assignments.
            </p>
            <Link
              to="/auth"
              className="inline-block px-10 py-5 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-all text-xl"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-7xl mx-auto text-center text-white/40 text-sm">
          <p>© 2025 Shatter the Ice • Built for college students finding authentic connections</p>
        </div>
      </footer>
    </div>
  )
}

export default Home
