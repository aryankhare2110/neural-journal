'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useJournalStore } from '@/store/useJournalStore';
import * as THREE from 'three';

export function SplineBrain() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const setViewState = useJournalStore((s) => s.setViewState);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    // Gentle floating
    meshRef.current.position.y = Math.sin(t * 0.6) * 0.3;
    meshRef.current.rotation.y = t * 0.15;
    meshRef.current.rotation.x = Math.sin(t * 0.4) * 0.1;

    // Pulsing scale
    const pulse = 1 + Math.sin(t * 1.5) * 0.04;
    meshRef.current.scale.setScalar(hovered ? pulse * 1.12 : pulse);

    // Outer glow follows
    if (glowRef.current) {
      glowRef.current.position.copy(meshRef.current.position);
      glowRef.current.rotation.copy(meshRef.current.rotation);
      const glowPulse = 1.4 + Math.sin(t * 1.2) * 0.1;
      glowRef.current.scale.setScalar(glowPulse);
    }
  });

  const handleClick = () => {
    setViewState('Transitioning');
  };

  return (
    <group>
      {/* Outer glow shell */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshPhysicalMaterial
          color="#7c3aed"
          emissive="#7c3aed"
          emissiveIntensity={0.3}
          transparent
          opacity={0.08}
          roughness={1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Main brain sphere */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerEnter={() => {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhysicalMaterial
          color="#8b5cf6"
          emissive="#7c3aed"
          emissiveIntensity={hovered ? 1.5 : 0.8}
          roughness={0.15}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.3}
          thickness={1.5}
          ior={1.5}
          iridescence={1}
          iridescenceIOR={1.3}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Inner particle core */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshPhysicalMaterial
          color="#c4b5fd"
          emissive="#a78bfa"
          emissiveIntensity={2}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}
