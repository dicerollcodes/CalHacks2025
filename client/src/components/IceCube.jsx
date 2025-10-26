import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, RoundedBox, MeshTransmissionMaterial } from '@react-three/drei'
import { useRef, useState } from 'react'
import * as THREE from 'three'

function AnimatedCube({ onShatter, onClick, disabled }) {
  const groupRef = useRef()
  const [state, setState] = useState('idle')
  const [shards, setShards] = useState([])
  const explodeProgress = useRef(0)
  const spinStart = useRef(null)
  const hasCalledShatter = useRef(false)

  useFrame((frameState) => {
    const t = frameState.clock.getElapsedTime()

    if (groupRef.current) {
      if (state === 'idle') {
        groupRef.current.rotation.y += 0.01
        groupRef.current.rotation.x = Math.sin(t * 0.5) * 0.1
        groupRef.current.position.y = Math.sin(t * 1.2) * 0.2
      } else if (state === 'spinning') {
        if (spinStart.current === null) {
          spinStart.current = t
        }
        const elapsed = t - spinStart.current
        if (elapsed < 1.5) {
          const baseSpeed = 0.01
          const accelerationFactor = 1 + (elapsed / 1.5) * 25
          groupRef.current.rotation.y += baseSpeed * accelerationFactor
        } else {
          setState('exploding')
        }
      }
    }

    if (state === 'exploding') {
      explodeProgress.current += 0.03
      shards.forEach((shard) => {
        if (shard.ref.current) {
          const p = explodeProgress.current
          shard.ref.current.position.x = shard.basePos.x + shard.velocity.x * p * 10
          shard.ref.current.position.y = shard.basePos.y + shard.velocity.y * p * 10
          shard.ref.current.position.z = shard.basePos.z + shard.velocity.z * p * 10
          shard.ref.current.rotation.x += shard.rotSpeed.x
          shard.ref.current.rotation.y += shard.rotSpeed.y
          shard.ref.current.rotation.z += shard.rotSpeed.z
        }
      })

      if (explodeProgress.current > 1.5 && !hasCalledShatter.current && onShatter) {
        hasCalledShatter.current = true
        onShatter()
      }
    }
  })

  const handleClick = () => {
    if (disabled || state !== 'idle') return

    // Call onClick callback immediately to start API
    if (onClick) onClick()

    const newShards = []
    for (let i = 0; i < 24; i++) {
      const theta = (Math.PI * 2 * i) / 24
      const phi = Math.acos((Math.random() * 2) - 1)
      const velocity = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi)
      )
      newShards.push({
        id: i,
        ref: { current: null },
        basePos: { x: velocity.x * 0.2, y: velocity.y * 0.2, z: velocity.z * 0.2 },
        velocity,
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.3,
          y: (Math.random() - 0.5) * 0.3,
          z: (Math.random() - 0.5) * 0.3,
        }
      })
    }
    setShards(newShards)
    spinStart.current = null
    setState('spinning')
  }

  return (
    <group ref={groupRef} onClick={handleClick}>
      {state !== 'exploding' ? (
        <RoundedBox args={[2, 2, 2]} radius={0.3} smoothness={6}>
          <MeshTransmissionMaterial
            thickness={0.3}
            transmission={1}
            roughness={0.02}
            ior={1.45}
            chromaticAberration={0.05}
            distortion={0.2}
            color="#e0f2fe"
            transparent
            opacity={0.7}
          />
        </RoundedBox>
      ) : (
        shards.map((shard) => (
          <mesh
            key={shard.id}
            ref={(el) => (shard.ref.current = el)}
            position={[shard.basePos.x, shard.basePos.y, shard.basePos.z]}
          >
            <tetrahedronGeometry args={[0.3, 0]} />
            <MeshTransmissionMaterial
              thickness={0.2}
              transmission={0.94}
              roughness={0.02}
              ior={1.5}
              metalness={0.3}
              reflectivity={0.9}
              color="#d0ebff"
              transparent
              opacity={0.8}
            />
          </mesh>
        ))
      )}
    </group>
  )
}

export default function IceCube({ onShatter, onClick, disabled }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1, cursor: disabled ? 'default' : 'pointer', pointerEvents: disabled ? 'none' : 'auto' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 50%)', pointerEvents: 'none' }} />
      <Canvas camera={{ position: [0, 0, 10], fov: 40 }} style={{ position: 'relative', top: '105px' }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
        <directionalLight position={[-5, 5, 5]} intensity={1.2} color="#38bdf8" />
        <Environment preset="city" />
        <AnimatedCube onShatter={onShatter} onClick={onClick} disabled={disabled} />
      </Canvas>
      {!disabled && (
        <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '500', pointerEvents: 'none' }}>
          Tap to Shatter the Ice
        </div>
      )}
    </div>
  )
}
