'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { ThoughtNetwork } from './ThoughtNetwork';
import { CameraRig } from './CameraRig';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';

export default function CanvasScene() {
  return (
    <Canvas
      camera={{ position: [0, 2, 18], fov: 60, near: 0.1, far: 200 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      style={{ background: 'transparent' }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#a78bfa" />
      <pointLight position={[-10, -5, -10]} intensity={0.4} color="#60a5fa" />
      <pointLight position={[0, 5, -5]} intensity={0.3} color="#f472b6" />

      {/* Fog for depth */}
      <fog attach="fog" args={['#050508', 25, 130]} />

      <Suspense fallback={null}>
        <ThoughtNetwork />
      </Suspense>

      {/* Camera controller */}
      <CameraRig />

      {/* Post-processing: Advanced Cinematic Styling */}
      <EffectComposer>
        <Bloom
          intensity={0.8}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Noise opacity={0.04} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
}
