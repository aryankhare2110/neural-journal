'use client';

import { useMemo } from 'react';
import { useJournalStore } from '@/store/useJournalStore';
import { ThoughtNode } from './ThoughtNode';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Simple hash function to generate a deterministic value from a string.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

export function ThoughtNetwork() {
  const entries = useJournalStore((s) => s.entries);
  const sentimentFilter = useJournalStore((s) => s.sentimentFilter);
  const tagFilter = useJournalStore((s) => s.tagFilter);

  let visibleEntries = entries;
  if (sentimentFilter) visibleEntries = visibleEntries.filter((e) => e.sentiment === sentimentFilter);
  if (tagFilter) visibleEntries = visibleEntries.filter((e) => e.tags.includes(tagFilter));

  // Compute positions, opacity, and connections
  const { nodesData, edgeData } = useMemo(() => {
    if (visibleEntries.length === 0) return { nodesData: [], edgeData: [] };
    // Find date range for Z-mapping
    const dates = visibleEntries.map((e) => new Date(e.date).getTime());
    const newestDate = Math.max(...dates);
    const oldestDate = Math.min(...dates);
    
    // Enforce a minimum timeline range of 30 days so entries created seconds apart aren't stretched across the entire Z-axis
    const MIN_RANGE_MS = 30 * 24 * 60 * 60 * 1000;
    const dateRange = Math.max(newestDate - oldestDate, MIN_RANGE_MS);

    const computedNodes = visibleEntries.map((entry) => {
      // 1. Calculate cluster center based on the day
      const entryDate = new Date(entry.date);
      const dayString = entryDate.toISOString().split('T')[0];
      const dayHash = hashString(dayString);
      const dayRand1 = seededRandom(dayHash);
      const dayRand2 = seededRandom(dayHash + 1);
      
      const baseX = (dayRand1 - 0.5) * 8;
      const baseY = (dayRand2 - 0.5) * 6;

      // 2. Add a micro-jitter based on the individual thought so they don't overlap
      const idHash = hashString(entry.id);
      const jitterX = (seededRandom(idHash) - 0.5) * 6;
      const jitterY = (seededRandom(idHash + 1) - 0.5) * 6;
      const jitterZ = (seededRandom(idHash + 2) - 0.5) * 5;

      const x = baseX + jitterX;
      const y = baseY + jitterY;
      
      // Z: time-based. Newest = 0, oldest = -80
      const dateMs = new Date(entry.date).getTime();
      const normalizedAge = (newestDate - dateMs) / dateRange;
      const z = (-normalizedAge * 80) + jitterZ;

      const opacity = Math.max(0.2, 1 - normalizedAge * 0.6);

      return {
        entry,
        position: [x, y, z] as [number, number, number],
        opacity,
        refVec: new THREE.Vector3(x, y, z)
      };
    });

    // Compute edges (synaptic connections between close nodes)
    const computedEdges: { start: THREE.Vector3; end: THREE.Vector3; opacity: number }[] = [];
    const MAX_DISTANCE = 12.0;

    for (let i = 0; i < computedNodes.length; i++) {
       for (let j = i + 1; j < computedNodes.length; j++) {
          const dist = computedNodes[i].refVec.distanceTo(computedNodes[j].refVec);
          if (dist < MAX_DISTANCE) {
             const edgeOpacity = (1 - (dist / MAX_DISTANCE)) * 0.15; // closer = brighter
             computedEdges.push({
                start: computedNodes[i].refVec,
                end: computedNodes[j].refVec,
                opacity: edgeOpacity * Math.min(computedNodes[i].opacity, computedNodes[j].opacity)
             });
          }
       }
    }

    return { nodesData: computedNodes, edgeData: computedEdges };
  }, [visibleEntries]);

  return (
    <group position={[-3, 0, 0]}>
      {/* Render synaptic network lines first so they sit behind nodes */}
      {edgeData.map((edge, i) => (
        <Line
          key={`edge-${i}`}
          points={[edge.start, edge.end]}
          color="#a78bfa"
          lineWidth={0.5}
          transparent
          opacity={edge.opacity}
          depthWrite={false}
        />
      ))}

      {nodesData.map(({ entry, position, opacity }) => (
        <ThoughtNode
          key={entry.id}
          id={entry.id}
          title={entry.title}
          content={entry.content}
          sentiment={entry.sentiment}
          textLength={entry.textLength}
          position={position}
          opacity={opacity}
        />
      ))}
    </group>
  );
}
