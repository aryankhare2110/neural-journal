'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { useJournalStore, type Sentiment } from '@/store/useJournalStore';
import { MeshDistortMaterial, Html } from '@react-three/drei';
import * as THREE from 'three';

import { SENTIMENT_CONFIG } from '@/lib/sentiments';

interface ThoughtNodeProps {
  id: string;
  title: string;
  content: string;
  sentiment: Sentiment;
  textLength: number;
  position: [number, number, number];
  opacity: number;
}

export function ThoughtNode({
  id,
  title,
  sentiment,
  textLength,
  position,
  opacity,
}: ThoughtNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const selectEntry = useJournalStore((s) => s.selectEntry);
  const setCameraTarget = useJournalStore((s) => s.setCameraTarget);
  const selectedEntryId = useJournalStore((s) => s.selectedEntryId);
  const [hovered, setHovered] = useState(false);

  const isSelected = selectedEntryId === id;

  // Map textLength to radius (0.3 – 1.0)
  const radius = useMemo(() => {
    const minLen = 30;
    const maxLen = 200;
    const clamped = Math.max(minLen, Math.min(maxLen, textLength));
    return 0.3 + ((clamped - minLen) / (maxLen - minLen)) * 0.7;
  }, [textLength]);

  const config = SENTIMENT_CONFIG[sentiment];
  const color = config.color;
  const emissive = config.emissive;

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    // Gentle individual floating
    const offset = position[0] + position[1];
    meshRef.current.position.y = Math.sin(t * 0.5 + offset) * 0.15;

    // Hover / select scale
    const targetScale = (hovered ? 1.25 : isSelected ? 1.15 : 1) * radius;
    const currentScale = meshRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
    meshRef.current.scale.setScalar(newScale);
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectEntry(id);
    setCameraTarget(position);
  };

  return (
    <group position={[position[0], position[1], position[2]]}>
      {/* Outer glow aura — mimics Spline's soft illumination */}
      <mesh>
        <sphereGeometry args={[radius * 1.8, 32, 32]} />
        <meshPhysicalMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.1}
          transparent
          opacity={opacity * 0.04}
          roughness={1}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Main Spline-like Blob */}
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
        <sphereGeometry args={[radius, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={hovered ? 0.8 : isSelected ? 0.6 : 0.2}
          roughness={0}
          metalness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.01}
          transparent
          opacity={0.9}
          transmission={0.99}
          thickness={1.5}
          ior={1.5}
          iridescence={1.0}
          iridescenceIOR={1.4}
          iridescenceThicknessRange={[100, 400]}
          distort={0.4}
          speed={2.2}
        />
      </mesh>

      {/* Inner luminous core */}
      <mesh>
        <sphereGeometry args={[radius * 0.12, 32, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          emissive={emissive}
          emissiveIntensity={hovered ? 5.0 : 3.0}
          transparent
          opacity={opacity * 0.8}
          depthWrite={false}
        />
      </mesh>

      {/* Hover Label */}
      <Html
        position={[0, radius * 1.5, 0]}
        center
        className="pointer-events-none transition-opacity duration-300"
        style={{ opacity: hovered && !isSelected ? 1 : 0 }}
      >
        <div 
          className="bg-[#050508]/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full whitespace-nowrap text-white/90 font-mono tracking-widest uppercase shadow-2xl" 
          style={{ fontSize: 10 }}
        >
          {title}
        </div>
      </Html>
    </group>
  );
}
