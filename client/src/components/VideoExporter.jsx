import { useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import Model from './Model'

/**
 * VideoExporter - Tool to render the ice cube animation to video frames
 *
 * This component captures the animation frame-by-frame and saves frames to disk.
 * Then use ffmpeg to convert frames to video.
 */

export default function VideoExporter() {
  const [isRecording, setIsRecording] = useState(false)
  const [progress, setProgress] = useState(0)
  const [frames, setFrames] = useState([])
  const canvasRef = useRef(null)
  const frameCount = useRef(0)
  const mediaRecorder = useRef(null)
  const recordedChunks = useRef([])

  const startRecording = () => {
    if (!canvasRef.current) return

    // Get the canvas element from react-three-fiber
    const canvas = document.querySelector('canvas')
    if (!canvas) return

    // Use MediaRecorder API to capture canvas
    const stream = canvas.captureStream(60) // 60 FPS
    const options = {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 8000000 // 8 Mbps for high quality
    }

    try {
      mediaRecorder.current = new MediaRecorder(stream, options)
    } catch (e) {
      // Fallback to vp8 if vp9 not supported
      const fallbackOptions = {
        mimeType: 'video/webm;codecs=vp8',
        videoBitsPerSecond: 5000000
      }
      mediaRecorder.current = new MediaRecorder(stream, fallbackOptions)
    }

    recordedChunks.current = []

    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data)
      }
    }

    mediaRecorder.current.onstop = () => {
      const blob = new Blob(recordedChunks.current, {
        type: 'video/webm'
      })
      const url = URL.createObjectURL(blob)

      // Create download link
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = 'ice-shatter-animation.webm'
      document.body.appendChild(a)
      a.click()

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)

      setIsRecording(false)
      alert('Video exported! Check your downloads folder.')
    }

    mediaRecorder.current.start()
    setIsRecording(true)

    // Auto-stop after animation completes and pieces fly off screen (~3 seconds)
    setTimeout(() => {
      if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
        mediaRecorder.current.stop()
      }
    }, 3500)
  }

  const triggerAnimation = () => {
    // Trigger the ice cube click programmatically
    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.click()
    }
  }

  const startFullCapture = () => {
    startRecording()
    // Wait a moment for recording to start, then trigger animation
    setTimeout(() => {
      triggerAnimation()
    }, 300)
  }

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '400px',
      height: '400px',
      background: '#000',
      border: '2px solid #38bdf8',
      borderRadius: '12px',
      padding: '20px',
      zIndex: 9999
    }}>
      <h2 style={{ color: '#fff', marginBottom: '20px' }}>Video Exporter</h2>

      <div style={{
        width: '100%',
        height: '250px',
        background: '#111',
        borderRadius: '8px',
        marginBottom: '20px',
        position: 'relative'
      }}>
        <Canvas
          ref={canvasRef}
          camera={{ position: [0, 0, 15], fov: 35, near: 0.1, far: 1000 }}
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent'
          }}
          gl={{
            alpha: true,
            antialias: false,
            preserveDrawingBuffer: true,
            powerPreference: 'high-performance'
          }}
        >
          <ambientLight intensity={0.2} />
          <directionalLight position={[0, 3, 2]} intensity={1.5} />
          <pointLight position={[5, 5, 5]} intensity={6} color="#ffffff" castShadow />
          <directionalLight position={[4, 4, 4]} intensity={3} color="#ffffff" castShadow />
          <directionalLight position={[3, 4, 3]} intensity={4} color="#ffffff" />
          <directionalLight position={[-4, 2, 3]} intensity={3} color="#105e82ff" />
          <directionalLight position={[0, -2, -4]} intensity={2} color="#38bdf8" />
          <pointLight position={[2, 2, 4]} intensity={2} color="#e0f2fe" />
          <pointLight position={[-2, -2, 4]} intensity={2} color="#7dd3fc" />
          <pointLight position={[0, 0, 3]} intensity={3} color="#ffffff" />

          <Environment preset="city" />

          <Model disabled={false} />
        </Canvas>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={startFullCapture}
          disabled={isRecording}
          style={{
            padding: '12px 24px',
            background: isRecording ? '#555' : '#38bdf8',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isRecording ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {isRecording ? '🔴 Recording...' : '🎥 Record Animation'}
        </button>

        <div style={{ color: '#aaa', fontSize: '12px', textAlign: 'center' }}>
          Click "Record Animation" to capture the ice cube animation.
          <br />
          The video will auto-download when complete.
        </div>
      </div>
    </div>
  )
}
