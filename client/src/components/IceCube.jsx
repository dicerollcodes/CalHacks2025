import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import Model from './Model'

export default function IceCube({ onShatter, disabled }) {
  const handleShatterComplete = () => {
    if (onShatter && !disabled) {
      // Call onShatter after the explosion animation completes
      // Total animation time: shake1(0.4s) + pause(0.15s) + shake2(0.3s) + explode(~1s) ≈ 2s
      setTimeout(() => onShatter(), 2000)
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
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50, near: 0.1, far: 1000 }}
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
          pointerEvents: disabled ? 'none' : 'auto',
          zIndex: 2
        }}
        shadows
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      >
        {/* Dramatic lighting setup */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[0, 3, 2]} intensity={3} />
        <pointLight position={[5, 5, 5]} intensity={15} color="#ffffff" castShadow />
        <directionalLight position={[4, 4, 4]} intensity={8} color="#ffffff" castShadow />
        <directionalLight position={[3, 4, 3]} intensity={12} color="#ffffff" />
        <directionalLight position={[-4, 2, 3]} intensity={10} color="#105e82ff" />
        <directionalLight position={[0, -2, -4]} intensity={6} color="#38bdf8" />
        <pointLight position={[2, 2, 4]} intensity={3} color="#e0f2fe" />
        <pointLight position={[-2, -2, 4]} intensity={5} color="#7dd3fc" />
        <pointLight position={[0, 0, 3]} intensity={8} color="#ffffff" />

        <Environment preset="city" />
        
        <Model onAnimationComplete={handleShatterComplete} disabled={disabled} />
      </Canvas>
    </div>
  )
}
