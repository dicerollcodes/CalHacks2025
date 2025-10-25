import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

const SHARD_COUNT = 95;

function FrostedCube({ size = 2.4, onClick }) {
  const ref = useRef();
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.x += dt * 0.3;
      ref.current.rotation.y += dt * 0.4;
    }
  });

  const geometry = useMemo(
    () => new THREE.BoxGeometry(size, size, size, 8, 8, 8),
    [size]
  );

  return (
    <mesh ref={ref} onClick={onClick} castShadow>
      <primitive object={geometry} />
      <meshPhysicalMaterial
        roughness={0.08}
        clearcoat={1}
        transmission={0.96}
        thickness={1}
        opacity={0.95}
        reflectivity={0.8}
        color="#f2f6f8"
      />
    </mesh>
  );
}

function ShatterParticles({ run }) {
  const ref = useRef();
  const shards = useMemo(
    () =>
      Array.from({ length: SHARD_COUNT }, () => ({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.4
        ),
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 3.4,
          (Math.random() - 0.5) * 3.4,
          (Math.random() - 0.5) * 3.4
        ),
      })),
    []
  );

  useFrame((_, dt) => {
    if (!run || !ref.current) return;
    ref.current.children.forEach((child, i) => {
      const s = shards[i];
      s.pos.add(s.vel.clone().multiplyScalar(dt * 0.85));
      child.position.copy(s.pos);
      child.material.opacity -= dt * 0.65;
    });
  });

  return (
    <group ref={ref} visible={run}>
      {shards.map((s, i) => (
        <mesh key={i} position={s.pos}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshPhysicalMaterial transparent opacity={1} thickness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

export default function ThreeCube({ shattered, onShatter, hintText }) {
  const [run, setRun] = useState(false);
  const interactive = !run && !shattered;

  const click = () => {
    if (!run) {
      setRun(true);
      onShatter?.();
    }
  };

  return (
    <div className={`relative h-72 w-full select-none ${interactive ? "cursor-pointer" : ""}`}>
      {/* Soft DOM shadow */}
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="w-40 h-10 rounded-full bg-black/40 blur-2xl" />
      </div>

      <Canvas
        camera={{ position: [0, 0, 6], fov: 40 }}
        style={{ width: "100%", height: "100%", display: "block" }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={1.05} />
        <directionalLight intensity={1.25} position={[4, 6, 6]} />

        {/* Big circular click zone */}
        {interactive && (
          <mesh onClick={click}>
            <circleGeometry args={[2.3, 64]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        )}

        {!run && !shattered && <FrostedCube onClick={click} />}
        <ShatterParticles run={run || shattered} />

        <Environment preset="warehouse" />
      </Canvas>

      {/* Hint under cube */}
      {interactive && (
        <div className="absolute bottom-0 left-0 right-0 text-center text-[10px] tracking-widest text-white/85 pointer-events-none">
          {hintText}
        </div>
      )}
    </div>
  );
}
