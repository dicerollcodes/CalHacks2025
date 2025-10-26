import React from 'react';
import  { Canvas } from '@react-three/fiber';
import Model from './Model';
import { Environment } from '@react-three/drei';
import { useEffect, useState } from 'react';


export default function Scene() {
    return (
        <main className="relative h-screen w-screen">
           <Canvas camera={{ position: [0, 0, 10], fov: 50, near: 0.1, far: 1000 }}>
            <directionalLight position={[0, 3, 2]} intensity={3} />


            <Environment preset="city" />
            
            <Model />
            {/* Post-processing: bloom for glow + subtle noise/vignette */} 
            </Canvas>
        </main>
        ); 
    }
