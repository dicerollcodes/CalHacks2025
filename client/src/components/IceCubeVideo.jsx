import { useRef, useState } from 'react'

export default function IceCubeVideo({ onShatter, disabled }) {
  const videoRef = useRef(null)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleClick = () => {
    if (disabled || hasPlayed || isPlaying) return

    setIsPlaying(true)
    setHasPlayed(true)

    // Play the video
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
    }
  }

  const handleVideoEnd = () => {
    setIsPlaying(false)
    if (onShatter) {
      onShatter()
    }
  }

  return (
    <div
      className="w-full flex items-center justify-center"
      style={{
        overflow: 'visible',
        height: '200px',
        position: 'relative',
        cursor: disabled || hasPlayed ? 'default' : 'pointer'
      }}
      onClick={handleClick}
    >
      {/* White circular glow background */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Video element - place your rendered video here */}
      <video
        ref={videoRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
          pointerEvents: 'none'
        }}
        onEnded={handleVideoEnd}
        playsInline
        muted
      >
        {/* Add your video source here once you've rendered the animation */}
        <source src="/ice-shatter-animation.webm" type="video/webm" />
        <source src="/ice-shatter-animation.mp4" type="video/mp4" />
      </video>

      {/* Fallback placeholder if video not loaded yet */}
      {!hasPlayed && (
        <div
          style={{
            position: 'absolute',
            width: '150px',
            height: '150px',
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(125, 211, 252, 0.3))',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)',
            border: '2px solid rgba(56, 189, 248, 0.3)',
            zIndex: 3
          }}
        >
          🧊 Click to Shatter
        </div>
      )}
    </div>
  )
}
