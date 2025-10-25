import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { FaArrowLeft, FaPaperPlane, FaLock } from 'react-icons/fa'
import { getConversations, getMessages, sendMessage, getPublicKey, updatePublicKey } from '../services/api'
import { getOrCreateKeyPair, getPublicKeyString, encryptMessage, decryptMessage } from '../utils/encryption'

function Messages() {
  const [searchParams] = useSearchParams()
  const userId = searchParams.get('userId')
  
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!userId) {
      alert('Please add ?userId=YOUR_ID to the URL')
      return
    }
    
    initializeEncryption()
    loadConversations()
    
    // Check if there's a pending message from conversation starters
    const pendingMessage = localStorage.getItem('pendingMessage')
    const recipientId = localStorage.getItem('messageRecipient')
    
    if (pendingMessage) {
      setMessageInput(pendingMessage)
      localStorage.removeItem('pendingMessage')
    }
    
    if (recipientId) {
      // Find and select this conversation
      setTimeout(() => {
        const conv = conversations.find(c => c.userId === recipientId)
        if (conv) {
          handleSelectConversation(conv)
        }
      }, 500)
      localStorage.removeItem('messageRecipient')
    }
  }, [userId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function initializeEncryption() {
    try {
      // Generate or load keypair
      await getOrCreateKeyPair()
      
      // Upload public key to server
      const publicKey = await getPublicKeyString()
      await updatePublicKey(userId, publicKey)
    } catch (error) {
      console.error('Encryption setup error:', error)
    }
  }

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
      
      // Decrypt messages
      const decryptedMessages = await Promise.all(
        response.messages.map(async (msg) => {
          try {
            const decrypted = await decryptMessage(msg.encryptedContent)
            return {
              ...msg,
              content: decrypted
            }
          } catch (error) {
            console.error('Failed to decrypt message:', error)
            return {
              ...msg,
              content: '[Unable to decrypt]'
            }
          }
        })
      )
      
      setMessages(decryptedMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault()
    
    if (!messageInput.trim() || !selectedConversation || sending) return
    
    try {
      setSending(true)
      
      // Get recipient's public key
      const recipientKeyResponse = await getPublicKey(selectedConversation.userId)
      
      if (!recipientKeyResponse.publicKey) {
        alert('Recipient has not set up encryption yet. They need to visit the messages page first.')
        return
      }
      
      // Encrypt for recipient
      const encryptedForRecipient = await encryptMessage(
        messageInput,
        recipientKeyResponse.publicKey
      )
      
      // Encrypt for self (so we can read it later)
      const myPublicKey = await getPublicKeyString()
      const encryptedForSelf = await encryptMessage(messageInput, myPublicKey)
      
      // Send to server
      await sendMessage(
        userId,
        selectedConversation.userId,
        encryptedForRecipient,
        encryptedForSelf
      )
      
      // Add to local messages (optimistic update)
      const newMessage = {
        id: Date.now().toString(),
        senderId: userId,
        recipientId: selectedConversation.userId,
        content: messageInput,
        createdAt: new Date().toISOString()
      }
      
      setMessages([...messages, newMessage])
      setMessageInput('')
      
      // Reload messages to get server version
      setTimeout(() => {
        loadMessages(selectedConversation.userId)
      }, 500)
      
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

  if (!userId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/50">Please add ?userId=YOUR_ID to the URL</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with back button */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link 
            to="/"
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <FaArrowLeft className="text-white/70" />
          </Link>
          <h1 className="text-xl font-bold">Messages</h1>
          <div className="ml-auto flex items-center gap-2 text-xs text-white/40">
            <FaLock />
            <span>End-to-end encrypted</span>
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
                      src={conv.userAvatar}
                      alt={conv.userName}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold truncate">{conv.userName}</h3>
                        <span className="text-xs text-green-400">{conv.matchScore}%</span>
                      </div>
                      {conv.lastMessage && (
                        <p className="text-sm text-white/50 truncate mt-1">
                          {conv.lastMessage.senderId === userId ? 'You: ' : ''}
                          [Encrypted message]
                        </p>
                      )}
                      {conv.unreadCount > 0 && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-500 rounded-full">
                          {conv.unreadCount}
                        </span>
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
                <div className="flex items-center gap-3">
                  <img
                    src={selectedConversation.userAvatar}
                    alt={selectedConversation.userName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold">{selectedConversation.userName}</h3>
                    <p className="text-xs text-green-400">{selectedConversation.matchScore}% match</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                  const isSent = msg.senderId === userId
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`
                          max-w-[70%] rounded-2xl px-4 py-2
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/40">
              <div className="text-center">
                <p className="text-lg mb-2">Select a conversation to start messaging</p>
                <p className="text-sm">All messages are end-to-end encrypted 🔒</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages

