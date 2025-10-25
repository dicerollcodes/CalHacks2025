import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-3xl text-center">
        <h1 className="text-6xl font-bold text-ice-800 mb-4">
          🧊 Shatter the Ice
        </h1>
        <p className="text-2xl text-ice-700 mb-6 italic">
          "Don't just break the ice — shatter it."
        </p>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <p className="text-lg text-gray-700 mb-4">
            Students hide their most authentic interests because they fear judgment.
            This app helps them reveal those interests only where they're appreciated —
            with people who share the same passions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-ice-50 p-4 rounded-lg">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-bold text-ice-800 mb-1">Private by Default</h3>
              <p className="text-sm text-gray-600">
                Your interests stay hidden until there's meaningful overlap
              </p>
            </div>

            <div className="bg-ice-50 p-4 rounded-lg">
              <div className="text-3xl mb-2">🤝</div>
              <h3 className="font-bold text-ice-800 mb-1">Smart Matching</h3>
              <p className="text-sm text-gray-600">
                AI finds semantic connections between different interests
              </p>
            </div>

            <div className="bg-ice-50 p-4 rounded-lg">
              <div className="text-3xl mb-2">💬</div>
              <h3 className="font-bold text-ice-800 mb-1">Conversation Starters</h3>
              <p className="text-sm text-gray-600">
                Get personalized suggestions based on shared passions
              </p>
            </div>

            <div className="bg-ice-50 p-4 rounded-lg">
              <div className="text-3xl mb-2">🎓</div>
              <h3 className="font-bold text-ice-800 mb-1">Multi-School</h3>
              <p className="text-sm text-gray-600">
                Find matches at your school and beyond
              </p>
            </div>
          </div>
        </div>

        <div className="bg-ice-100 rounded-lg p-6 text-left">
          <h3 className="font-bold text-lg mb-3">🚀 Phase 1 Demo</h3>
          <p className="text-sm text-gray-700 mb-2">
            The backend is ready! To test:
          </p>
          <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
            <li>Run <code className="bg-white px-2 py-1 rounded">npm run seed</code> in the server directory</li>
            <li>Start the server with <code className="bg-white px-2 py-1 rounded">npm run dev</code></li>
            <li>Visit a user profile link (check console for generated IDs)</li>
            <li>Add <code className="bg-white px-2 py-1 rounded">?viewer=YOUR_ID</code> to test matching</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default Home
