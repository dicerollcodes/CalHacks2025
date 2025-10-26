import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useGLTF, MeshTransmissionMaterial, Text } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import iceModel from './ICE.glb?url';

export default function Model(props) {
    const { viewport } = useThree();
    const groupRef = useRef();
    const gltf = useGLTF(iceModel);

    // parts: array of {geometry, basePos, quaternion, scale, dir, name, isBase}
    const [parts, setParts] = useState([]);
    const partsRef = useRef([]);
    const partsMeshRefs = useRef([]);

    // animation state machine: 'idle' | 'shake1' | 'pause' | 'shake2' | 'exploding' | 'exploded'
    const [animState, setAnimState] = useState('idle');
    const animStateStartTime = useRef(0);
    const hasCalledCallback = useRef(false);

    // explode progress (0..1)
    const explodeProgress = useRef(0);
    const explodeTarget = useRef(0);

    // Animation timing (in seconds)
    const shakeDuration1 = 0.4;
    const pauseDuration = 0.15;
    const shakeDuration2 = 0.3;

    // Configurable explosion distances per shard. You can edit these values!
    // We'll generate staggered distances for realism (not a perfect grid)
    const shardDistances = useRef({});

    // Helper function to parse shard name into direction vector
    // e.g., "x" -> (1, 0, 0), "nxpypz" -> (-1, 1, 1), "base" -> null
    function parseShardDirection(name) {
        const lower = name.toLowerCase();
        
        // "base" is the filler object - no direction
        if (lower === 'base') return null;

        const vec = new THREE.Vector3(0, 0, 0);
        
        // Parse each axis: look for patterns like 'px', 'nx', 'py', 'ny', 'pz', 'nz'
        // or single letters 'x', 'y', 'z' (which default to positive)
        
        // Check for x
        if (lower.includes('nx')) {
            vec.x = -1;
        } else if (lower.includes('px') || lower === 'x') {
            vec.x = 1;
        }
        
        // Check for y
        if (lower.includes('ny')) {
            vec.y = -1;
        } else if (lower.includes('py') || lower === 'y') {
            vec.y = 1;
        }
        
        // Check for z
        if (lower.includes('nz')) {
            vec.z = -1;
        } else if (lower.includes('pz') || lower === 'z') {
            vec.z = 1;
        }

        // Normalize if we got a valid direction
        if (vec.lengthSq() > 0) {
            return vec.normalize();
        }

        // Fallback for unknown names: use position-based direction
        return undefined;
    }

    useEffect(() => {
        if (!gltf || !gltf.scene) return;

        // compute center of model
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());

        const collected = [];

        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                // ensure geometry has bounding box
                if (!child.geometry.boundingBox) child.geometry.computeBoundingBox();

                // world position of the mesh
                const worldPos = child.getWorldPosition(new THREE.Vector3());

                // position relative to model center
                const rel = new THREE.Vector3().subVectors(worldPos, center);

                const name = child.name || Math.random().toString(36).slice(2, 7);
                const isBase = name.toLowerCase() === 'base';

                // Parse direction from name
                let dir = parseShardDirection(name);
                
                // If parsing failed, fall back to position-based direction
                if (dir === undefined) {
                    dir = rel.clone().normalize();
                    if (dir.length() === 0) {
                        dir.set((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).normalize();
                    }
                }

                // Assign staggered explosion distance for realism (between 1.0 and 1.75)
                if (!shardDistances.current[name]) {
                    shardDistances.current[name] = 1.0 + Math.random() * 1;
                }

                // Random rotation axis and speed for spinning during explosion
                const rotAxis = new THREE.Vector3(
                    (Math.random() - 0.5),
                    (Math.random() - 0.5),
                    (Math.random() - 0.5)
                ).normalize();
                const rotSpeed = (Math.random() * 2 + 0.5) * (Math.random() > 0.5 ? 1 : -1);

                collected.push({
                    name,
                    geometry: child.geometry,
                    basePos: rel.clone(),
                    quaternion: child.quaternion.clone(),
                    scale: child.scale.clone(),
                    dir, // null for base, normalized vector for shards
                    isBase,
                    rotAxis,
                    rotSpeed,
                });
            }
        });

        partsRef.current = collected;
        setParts(collected);
    }, [gltf]);

    // Remove key toggle effect
    // useEffect(() => {
    //     function onKey(e) {
    //         if (e.key === 'e' || e.key === 'E') {
    //             explodeTarget.current = explode ? 0 : 1;
    //             setExplode((s) => !s);
    //         }
    //     }
    //     window.addEventListener('keydown', onKey);
    //     return () => window.removeEventListener('keydown', onKey);
    // }, [explode]);

    // animate rotation/hover, shake, and explode progress
    useFrame((state, delta) => {
        const t = state.clock.getElapsedTime();
        
        if (groupRef.current) {
            // Base idle motion (only when idle)
            if (animState === 'idle') {
                groupRef.current.rotation.y += 0.005;
                groupRef.current.rotation.x = Math.sin(t * 0.5) * 0.05;
                groupRef.current.position.y = Math.sin(t * 1.2) * 0.25;
            } else {
                // During animation, keep base rotation/position but add shake
                groupRef.current.rotation.y += 0.005;
                const baseY = Math.sin(t * 1.2) * 0.25;
                groupRef.current.position.y = baseY;

                // State machine for shake -> pause -> shake -> explode
                const elapsed = t - animStateStartTime.current;

                if (animState === 'shake1') {
                    // First shake
                    const intensity = 0.5;
                    groupRef.current.rotation.z = Math.sin(t * 50) * 0.02 * intensity;
                    groupRef.current.rotation.x = Math.sin(t * 40) * 0.025 * intensity;
                    groupRef.current.position.x = Math.sin(t * 60) * 0.05 * intensity;

                    if (elapsed >= shakeDuration1) {
                        setAnimState('pause');
                        animStateStartTime.current = t;
                    }
                } else if (animState === 'pause') {
                    // Brief pause - reset shake offsets
                    groupRef.current.rotation.z = 0;
                    groupRef.current.rotation.x = Math.sin(t * 0.5) * 0.05;
                    groupRef.current.position.x = 0;

                    if (elapsed >= pauseDuration) {
                        setAnimState('shake2');
                        animStateStartTime.current = t;
                    }
                } else if (animState === 'shake2') {
                    // Second, more intense shake
                    const intensity = 0.8;
                    groupRef.current.rotation.z = Math.sin(t * 55) * 0.03 * intensity;
                    groupRef.current.rotation.x = Math.sin(t * 45) * 0.03 * intensity;
                    groupRef.current.position.x = Math.sin(t * 65) * 0.06 * intensity;

                    if (elapsed >= shakeDuration2) {
                        setAnimState('exploding');
                        animStateStartTime.current = t;
                        explodeTarget.current = 1;
                    }
                } else if (animState === 'exploding') {
                    // Smooth the shake out and start exploding
                    const fadeOut = Math.max(0, 1 - elapsed * 3);
                    groupRef.current.rotation.z *= fadeOut;
                    groupRef.current.position.x *= fadeOut;

                    if (explodeProgress.current >= 0.99) {
                        setAnimState('exploded');
                    }
                }
            }
        }

        // Smooth progress towards target
        explodeProgress.current += (explodeTarget.current - explodeProgress.current) * 0.08;

        // Update mesh transforms directly for smooth per-frame animation
        if (partsRef.current.length > 0 && partsMeshRefs.current.length > 0) {
            const prog = explodeProgress.current;
            for (let i = 0; i < partsRef.current.length; i++) {
                const p = partsRef.current[i];
                const mesh = partsMeshRefs.current[i];
                if (!mesh) continue;

                // Get explosion distance for this shard (staggered for realism)
                const distance = shardDistances.current[p.name] ?? 1.25;

                if (p.dir) {
                    // Shard: move along its named direction based on explode progress
                    const offset = p.dir.clone().multiplyScalar(prog * distance);
                    mesh.position.set(
                        p.basePos.x + offset.x,
                        p.basePos.y + offset.y,
                        p.basePos.z + offset.z
                    );

                    // Only spin during explosion animation, then keep spinning at final position
                    if (animState === 'exploding' || animState === 'exploded') {
                        const spinSpeed = p.rotSpeed * 0.3;
                        mesh.rotateOnAxis(p.rotAxis, spinSpeed * delta);
                    }
                } else {
                    // Base piece: keep in place
                    mesh.position.copy(p.basePos);
                }
            }
        }
    });

    // click/tap to start the animation sequence (only once)
    function handleClick() {
        if (animState === 'idle') {
            // Start shake -> pause -> shake -> explode sequence
            setAnimState('shake1');
            animStateStartTime.current = performance.now() / 1000;
        }
        // Do nothing if already animating or exploded
    }

    return (
        <group ref={groupRef} scale={viewport.width / 10} onPointerDown={handleClick}>
           

            {/* Render each mesh from the gltf with a transmission material */}
            {parts.map((p, i) => {
                // Hide the "base" filler object when exploding
                const hideBase = p.isBase && explodeProgress.current > 0.05;

                return (
                    <mesh
                        key={p.name + '_' + i}
                        ref={(el) => (partsMeshRefs.current[i] = el)}
                        geometry={p.geometry}
                        position={[p.basePos.x, p.basePos.y, p.basePos.z]}
                        quaternion={p.quaternion}
                        scale={p.scale}
                        castShadow
                        receiveShadow
                        renderOrder={i}
                        visible={!hideBase}
                    >
                        <MeshTransmissionMaterial
                            thickness={0.96}
                            transmission={1}
                            roughness={0.16}
                            ior={1.5}
                            chromaticAberration={0.1}
                            distortion={0.18}
                            anisotropy={0.1}
                            reflectivity={0.3}
                            backside={true}
                            depthWrite={false}
                            toneMapped={false}
                        />
                    </mesh>
                );
            })}
        </group>
    );
}

useGLTF.preload(iceModel);
