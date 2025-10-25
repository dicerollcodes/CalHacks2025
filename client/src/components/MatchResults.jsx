function MatchResults({ matchData }) {
  const { score, sharedInterests, relatedInterests, conversationStarters } = matchData

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const getScoreMessage = (score) => {
    if (score >= 80) return 'Amazing match! 🎉'
    if (score >= 60) return 'Great compatibility! ✨'
    if (score >= 40) return 'Some common ground! 🤝'
    return 'Different paths! 🌟'
  }

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <div className="bg-gradient-to-br from-ice-500 to-ice-600 rounded-2xl shadow-xl p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-2">Compatibility Score</h3>
        <div className={`text-7xl font-bold mb-2 ${getScoreColor(score)} bg-white rounded-full w-32 h-32 flex items-center justify-center mx-auto`}>
          {score}
        </div>
        <p className="text-xl font-semibold">{getScoreMessage(score)}</p>
      </div>

      {/* Shared Interests */}
      {sharedInterests && sharedInterests.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-2xl font-bold text-ice-800 mb-4">
            🎯 Shared Interests
          </h3>
          <div className="flex flex-wrap gap-2">
            {sharedInterests.map((interest, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related Interests */}
      {relatedInterests && relatedInterests.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-2xl font-bold text-ice-800 mb-4">
            🔗 Related Interests
          </h3>
          <div className="space-y-3">
            {relatedInterests.map((relation, idx) => (
              <div key={idx} className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-medium">
                    {relation.userInterest}
                  </span>
                  <span className="text-gray-400">↔️</span>
                  <span className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm font-medium">
                    {relation.targetInterest}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2 italic">
                  {relation.relationship}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conversation Starters */}
      {conversationStarters && conversationStarters.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-2xl font-bold text-ice-800 mb-4">
            💬 Conversation Starters
          </h3>
          <div className="space-y-3">
            {conversationStarters.map((starter, idx) => (
              <div key={idx} className="bg-gradient-to-r from-ice-50 to-blue-50 rounded-lg p-4 border-l-4 border-ice-500">
                <p className="text-gray-800">{starter}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MatchResults
