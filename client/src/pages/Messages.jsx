import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FaArrowLeft, FaPaperPlane } from 'react-icons/fa'
import { io } from 'socket.io-client'
import { getConversations, getMessages, sendMessage } from '../services/api'
import { getUser, isAuthenticated } from '../services/auth'
import { SOCKET_URL } from '../config/api'

function Messages() {
  const navigate = useNavigate()
  const location = useLocation()
  const loggedInUser = getUser()
  const userId = loggedInUser?.username

  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated() || !userId) {
      alert('Please log in to view messages')
      navigate('/auth')
      return
    }

    // Connect to Socket.IO
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    })

    // Announce user is online
    socketRef.current.emit('user:online', userId)

    // Listen for incoming messages
    socketRef.current.on('message:receive', (message) => {
      console.log('📨 Received real-time message:', message)
      // Add message to current conversation if it matches
      if (selectedConversation &&
          (message.senderId === selectedConversation.userId ||
           message.recipientId === selectedConversation.userId)) {
        setMessages(prev => [...prev, message])
      }
    })

    loadConversations()

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [userId, navigate])

  useEffect(() => {
    // Handle pending message from conversation starters
    const pendingMessage = localStorage.getItem('pendingMessage')
    const recipientId = localStorage.getItem('messageRecipient')

    // Handle recipient from Connect page (via navigation state)
    const stateRecipient = location.state?.pendingRecipient

    if (pendingMessage) {
      setMessageInput(pendingMessage)
      localStorage.removeItem('pendingMessage')
    }

    if (conversations.length > 0) {
      const targetRecipient = stateRecipient || recipientId
      if (targetRecipient) {
        // Find and select this conversation
        const conv = conversations.find(c => c.userId === targetRecipient)
        if (conv) {
          handleSelectConversation(conv)
        }
        localStorage.removeItem('messageRecipient')
        // Clear navigation state
        if (stateRecipient) {
          window.history.replaceState({}, document.title)
        }
      }
    }
  }, [conversations, location.state])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function loadConversations() {
    try {
      setLoading(true)
      const response = await getConversations(userId)
      setConversations(response.conversations)
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSelectConversation(conversation) {
    setSelectedConversation(conversation)
    await loadMessages(conversation.userId)
  }

  async function loadMessages(otherUserId) {
    try {
      const response = await getMessages(userId, otherUserId)
      setMessages(response.messages)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault()

    if (!messageInput.trim() || !selectedConversation || sending) return

    try {
      setSending(true)

      const messageId = Date.now().toString()
      const newMessage = {
        id: messageId,
        senderId: userId,
        recipientId: selectedConversation.userId,
        content: messageInput,
        createdAt: new Date().toISOString()
      }

      // Add to local messages immediately (optimistic update)
      setMessages([...messages, newMessage])
      const sentContent = messageInput
      setMessageInput('')

      // Send via Socket.IO for instant delivery
      if (socketRef.current) {
        socketRef.current.emit('message:send', {
          senderId: userId,
          recipientId: selectedConversation.userId,
          content: sentContent,
          messageId: messageId
        })
      }

      // Also save to database for offline users and history
      await sendMessage(
        userId,
        selectedConversation.userId,
        sentContent
      )

      console.log('✓ Message sent via Socket.IO + Database')

    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message: ' + error.message)
    } finally {
      setSending(false)
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  function getAvatarUrl(avatar, username) {
    if (avatar && avatar.startsWith('data:image/')) {
      return avatar
    }
    return `https://i.pravatar.cc/150?u=${username}`
  }

  if (!isAuthenticated() || !userId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/50 mb-4">Please log in to view messages</p>
          <button
            onClick={() => navigate('/auth')}
            className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-all"
          >
            Log In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with back button */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            to={`/user/${userId}`}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <FaArrowLeft className="text-white/70" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Messages</h1>
            <p className="text-xs text-white/40">Logged in as @{userId}</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto h-[calc(100vh-73px)] flex">
        {/* Conversations List */}
        <div className="w-80 border-r border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white/90">Conversations</h2>
            <p className="text-xs text-white/40 mt-1">
              {conversations.length} match{conversations.length !== 1 ? 'es' : ''}
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-white/40">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-white/40">
                <p>No conversations yet</p>
                <p className="text-xs mt-2">Get a 70+ match score to start messaging!</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.userId}
                  onClick={() => handleSelectConversation(conv)}
                  className={`
                    w-full p-4 border-b border-white/5 text-left transition-colors
                    hover:bg-white/5
                    ${selectedConversation?.userId === conv.userId ? 'bg-white/10' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={getAvatarUrl(conv.userAvatar, conv.userId)}
                      alt={conv.userName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold truncate">{conv.userName}</h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {conv.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold bg-blue-500 text-white rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                          {conv.canMessage === false ? (
                            <span className="text-xs text-red-400 flex items-center gap-1">
                              🚫 {conv.matchScore}%
                            </span>
                          ) : (
                            <span className="text-xs text-green-400">{conv.matchScore}%</span>
                          )}
                        </div>
                      </div>
                      {conv.lastMessage && (
                        <p className="text-sm text-white/50 truncate mt-1">
                          {conv.lastMessage.senderId === userId ? 'You: ' : ''}
                          {conv.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 bg-black/50 backdrop-blur-lg">
                <Link
                  to={`/user/${selectedConversation.userId}`}
                  className="flex items-center gap-3 hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors"
                >
                  <img
                    src={getAvatarUrl(selectedConversation.userAvatar, selectedConversation.userId)}
                    alt={selectedConversation.userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold hover:text-white/80 transition-colors">{selectedConversation.userName}</h3>
                    <p className="text-xs text-green-400">{selectedConversation.matchScore}% match • View profile →</p>
                  </div>
                </Link>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => {
                  const isSent = msg.senderId === userId
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isSent ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div
                        className={`
                          max-w-[70%] rounded-2xl px-4 py-2 transform transition-all hover:scale-105
                          ${isSent
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/10 text-white/90'
                          }
                        `}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <p className={`text-xs mt-1 ${isSent ? 'text-blue-200' : 'text-white/40'}`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              {selectedConversation.canMessage !== false ? (
                <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-black/50 backdrop-blur-lg">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                    />
                    <button
                      type="submit"
                      disabled={!messageInput.trim() || sending}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-white/10 disabled:text-white/30 rounded-full font-semibold transition-colors flex items-center gap-2"
                    >
                      <FaPaperPlane className="text-sm" />
                      <span>Send</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 border-t border-white/10 bg-black/50 backdrop-blur-lg">
                  <div className="text-center py-3 px-4 bg-red-500/10 border border-red-500/20 rounded-full">
                    <p className="text-red-400 text-sm">
                      🚫 Match score dropped below 70% - messaging disabled
                    </p>
                    <p className="text-red-400/60 text-xs mt-1">
                      Update your interests to improve compatibility
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/40">
              <div className="text-center">
                <p className="text-lg mb-2">Select a conversation to start messaging</p>
                <p className="text-sm">Messages with 70+ matches 💬</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages

