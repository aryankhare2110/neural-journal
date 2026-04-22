'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useJournalStore } from '@/store/useJournalStore';
import * as THREE from 'three';
import { scrollDepthMV } from '@/components/ui/DepthIndicator';

// ─── Scroll-zoom constants ───────────────────────────────────────────────────
const SCROLL_SENSITIVITY = 0.025;
const CAMERA_Z_FAR  =  18;   // Start (newest memories)
const CAMERA_Z_NEAR = -69;   // Deepest (face of oldest memory at Z = -80)
const Z_RANGE = CAMERA_Z_FAR - CAMERA_Z_NEAR;

// Module-level mutable — persists between renders, reset when entering network
let scrollTargetZ = CAMERA_Z_FAR;

export function CameraRig() {
  const { camera, gl } = useThree();
  const viewState       = useJournalStore((s) => s.viewState);
  const cameraTarget    = useJournalStore((s) => s.cameraTarget);
  const selectedEntryId = useJournalStore((s) => s.selectedEntryId);

  const targetPosition  = useRef(new THREE.Vector3(0, 2, CAMERA_Z_FAR));
  const targetLookAt    = useRef(new THREE.Vector3(0, 0, CAMERA_Z_FAR - 18));
  const isNodeSelected  = useRef(false);

  // ── Wheel handler — attach to the R3F canvas ────────────────────────────────
  useEffect(() => {
    if (viewState !== 'Network_View') return;

    // Sync scroll target to current camera Z when entering
    scrollTargetZ = Math.max(CAMERA_Z_NEAR, Math.min(CAMERA_Z_FAR, camera.position.z));

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isNodeSelected.current) return;

      // deltaY > 0 = scroll down = dive deeper (Z decreases)
      scrollTargetZ -= e.deltaY * SCROLL_SENSITIVITY;
      scrollTargetZ = Math.max(CAMERA_Z_NEAR, Math.min(CAMERA_Z_FAR, scrollTargetZ));

      // Update depth progress motionValue (0 = start, 1 = deepest)
      const depth = (CAMERA_Z_FAR - scrollTargetZ) / Z_RANGE;
      scrollDepthMV.set(depth);
    };

    const canvas = gl.domElement;
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, [viewState, gl, camera]);

  // ── Handle node panel open ─────────────────────────────────────────────────
  useEffect(() => {
    isNodeSelected.current = !!selectedEntryId;

    if (cameraTarget && viewState === 'Network_View' && selectedEntryId) {
      const [x, y, z] = cameraTarget;
      targetPosition.current.set(x + 2, y + 1, z + 6);
      targetLookAt.current.set(x, y, z);
    }
  }, [cameraTarget, selectedEntryId, viewState]);

  // ── Handle panel close — restore scroll-driven position ───────────────────
  useEffect(() => {
    if (!selectedEntryId && viewState === 'Network_View') {
      targetPosition.current.set(0, 2, scrollTargetZ);
      targetLookAt.current.set(0, 0, scrollTargetZ - 30);
    }
  }, [selectedEntryId, viewState]);

  // ── Per-frame lerp ─────────────────────────────────────────────────────────
  useFrame((_, delta) => {
    if (viewState !== 'Network_View') return;

    const speed = 3.0;

    if (!isNodeSelected.current) {
      targetPosition.current.set(0, 2, scrollTargetZ);
      targetLookAt.current.set(0, 0, scrollTargetZ - 30);
    }

    camera.position.lerp(targetPosition.current, delta * speed);

    const lookAtMatrix = new THREE.Matrix4();
    lookAtMatrix.lookAt(camera.position, targetLookAt.current, camera.up);
    const targetQuat = new THREE.Quaternion().setFromRotationMatrix(lookAtMatrix);
    camera.quaternion.slerp(targetQuat, delta * speed);
  });

  return null;
}
