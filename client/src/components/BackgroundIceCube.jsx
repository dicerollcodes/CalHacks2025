import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, RoundedBox } from '@react-three/drei'
import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'

function FloatingIceCube({ mousePosition }) {
  const meshRef = useRef()
  const targetRotation = useRef({ x: 0, y: 0 })

  useFrame((state) => {
    if (!meshRef.current) return

    const t = state.clock.getElapsedTime()

    // Smooth follow mouse position (parallax effect)
    const parallaxStrength = 0.15
    targetRotation.current.x = -mousePosition.y * parallaxStrength
    targetRotation.current.y = mousePosition.x * parallaxStrength

    // Smooth interpolation
    meshRef.current.rotation.x += (targetRotation.current.x - meshRef.current.rotation.x) * 0.05
    meshRef.current.rotation.y += (targetRotation.current.y - meshRef.current.rotation.y) * 0.05

    // Gentle continuous rotation
    meshRef.current.rotation.y += 0.002

    // Gentle floating motion
    meshRef.current.position.y = Math.sin(t * 0.8) * 0.3
  })

  return (
    <RoundedBox ref={meshRef} args={[1, 1, 1]} radius={0.15} smoothness={4} scale={2.5}>
      <meshPhysicalMaterial
        color="#000000"
        transmission={0.98}
        opacity={1}
        metalness={0.1}
        roughness={0.02}
        ior={1.5}
        thickness={0.5}
        specularIntensity={2}
        specularColor="#ffffff"
        envMapIntensity={2}
        clearcoat={1}
        clearcoatRoughness={0.05}
        side={THREE.DoubleSide}
      />
    </RoundedBox>
  )
}

export default function BackgroundIceCube() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize to -1 to 1 range
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      setMousePosition({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.7
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={5} />
        <directionalLight position={[5, 5, 5]} intensity={25} color="#ffffff" />
        <directionalLight position={[-5, 5, 5]} intensity={20} color="#ffffff" />
        <directionalLight position={[5, -5, 5]} intensity={18} color="#ffffff" />
        <directionalLight position={[-5, -5, 5]} intensity={16} color="#38bdf8" />
        <pointLight position={[3, 3, 6]} intensity={40} color="#ffffff" />
        <pointLight position={[-3, -3, 6]} intensity={35} color="#7dd3fc" />
        <pointLight position={[0, 0, 7]} intensity={45} color="#ffffff" />

        <Environment preset="city" environmentIntensity={3} />

        <FloatingIceCube mousePosition={mousePosition} />
      </Canvas>
    </div>
  )
}
