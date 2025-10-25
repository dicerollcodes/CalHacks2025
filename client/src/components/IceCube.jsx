import { useRef, useState, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, RoundedBox, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'

function ShatterParticles({ trigger }) {
  const particlesRef = useRef()
  const [opacity, setOpacity] = useState(1)
  const [showParticles, setShowParticles] = useState(false)
  const explosionTimer = useRef(0)

  // Track time since trigger
  useFrame((state, delta) => {
    if (trigger) {
      explosionTimer.current += delta

      // Start showing particles after spin acceleration
      if (explosionTimer.current > 0.8 && !showParticles) {
        setShowParticles(true)
      }
    }
  })

  const particles = useMemo(() => {
    const positions = []
    const velocities = []
    const count = 150

    for (let i = 0; i < count; i++) {
      // Start from cube center with slight offset
      const spread = 0.3
      positions.push(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread
      )

      // Explode outward in all directions - MORE VIOLENT
      const speed = 0.2 + Math.random() * 0.3
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      velocities.push(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed,
        Math.cos(phi) * speed
      )
    }

    return {
      positions: new Float32Array(positions),
      velocities,
      count
    }
  }, [])

  useFrame(() => {
    // Animate particles once they're visible
    if (showParticles && particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += particles.velocities[i]
        positions[i + 1] += particles.velocities[i + 1]
        positions[i + 2] += particles.velocities[i + 2]

        // Slow down quickly to reduce travel distance
        particles.velocities[i] *= 0.88
        particles.velocities[i + 1] *= 0.88
        particles.velocities[i + 2] *= 0.88
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true

      // Fade out faster
      setOpacity(prev => Math.max(0, prev - 0.05))
    }
  })

  if (!showParticles) return null

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        color="#7dd3fc"
        transparent
        opacity={opacity}
        sizeAttenuation
      />
    </points>
  )
}

function RotatingCube({ onShatter, shattering }) {
  const meshRef = useRef()
  const [scale, setScale] = useState(1)
  const [opacity, setOpacity] = useState(1)
  const [spinSpeed, setSpinSpeed] = useState(0.25)
  const shatterTimer = useRef(0)

  // Gentle rotation animation with acceleration on shatter
  useFrame((state, delta) => {
    if (meshRef.current && !shattering) {
      meshRef.current.rotation.x += delta * 0.25
      meshRef.current.rotation.y += delta * 0.35
    }

    // Shatter animation with delay and acceleration
    if (meshRef.current && shattering) {
      shatterTimer.current += delta

      // Phase 1: Spin acceleration (0-1s)
      if (shatterTimer.current < 0.9) {
        const acceleration = shatterTimer.current / 0.9
        setSpinSpeed(0.25 + acceleration * 12)
        meshRef.current.rotation.x += delta * spinSpeed
        meshRef.current.rotation.y += delta * spinSpeed * 1.2
      }
      // Phase 2: Explosion (0.8s+)
      else {
        setScale(prev => prev * 0.25)
        setOpacity(prev => Math.max(0, prev - 0.04))
        meshRef.current.rotation.x += delta * 10
        meshRef.current.rotation.y += delta * 10
      }
    }
  })

  if (scale < 0.05) return null

  return (
    <Float
      speed={1.5}
      rotationIntensity={0.15}
      floatIntensity={0.4}
    >
      <RoundedBox
        ref={meshRef}
        args={[3.4, 3.4, 3.4]}
        radius={0.25}
        smoothness={4}
        onClick={onShatter}
        scale={scale}
        position={[0, 0.5, 0]}
        castShadow
      >
        <MeshTransmissionMaterial
          transmission={1.0}
          thickness={0.1}
          roughness={0.0}
          ior={1.31}
          chromaticAberration={0.02}
          anisotropy={0.1}
          distortion={0.0}
          distortionScale={0.0}
          temporalDistortion={0.0}
          metalness={0.0}
          clearcoat={0.1}
          clearcoatRoughness={0.0}
          opacity={opacity}
          transparent
        />
      </RoundedBox>
    </Float>
  )
}

export default function IceCube({ onShatter, disabled }) {
  const [shattering, setShattering] = useState(false)

  const handleShatter = () => {
    if (disabled || shattering) return
    setShattering(true)
    if (onShatter) {
      // Wait for spin acceleration (1000ms) + explosion start
      setTimeout(() => onShatter(), 1000)
    }
  }

  return (
    <div className="w-full cursor-pointer flex items-center justify-center" style={{ overflow: 'visible', height: '200px', position: 'relative' }}>
      {/* White circular glow background - outside Canvas */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 70, near: 0.1, far: 100 }}
        style={{
          background: 'transparent',
          width: '100%',
          height: '100%',
          overflow: 'visible',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'auto',
          zIndex: 2
        }}
        shadows
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      >

        {/* Dramatic lighting setup */}
        <ambientLight intensity={230.5} />

        {/* SHIMMER LIGHT - Strong corner light for ice sparkle */}
        <pointLight position={[5, 5, 5]} intensity={100} color="#ffffff" castShadow />
        <directionalLight position={[4, 4, 4]} intensity={50} color="#ffffff" castShadow />

        {/* Key light - bright from top */}
        <directionalLight position={[3, 4, 3]} intensity={100} color="#ffffff" />

        {/* Fill light - soft blue from side */}
        <directionalLight position={[-4, 2, 3]} intensity={100} color="#105e82ff" />

        {/* Rim light - highlight edges from behind */}
        <directionalLight position={[0, -2, -4]} intensity={50} color="#38bdf8" />

        {/* Accent lights for glow */}
        <pointLight position={[2, 2, 4]} intensity={22} color="#e0f2fe" />
        <pointLight position={[-2, -2, 4]} intensity={44} color="#7dd3fc" />
        <pointLight position={[0, 0, 3]} intensity={66} color="#ffffff" />

        {/* Spot light for dramatic effect */}
        <spotLight
          position={[0, 5, 0]}
          angle={0.6}
          penumbra={0.5}
          intensity={100}
          color="#bae6fd"
        />

        {/* Additional back light */}
        <directionalLight position={[0, 0, -5]} intensity={40} color="#7dd3fc" />

        <RotatingCube onShatter={handleShatter} shattering={shattering} />
        <ShatterParticles trigger={shattering} />
      </Canvas>
    </div>
  )
}
