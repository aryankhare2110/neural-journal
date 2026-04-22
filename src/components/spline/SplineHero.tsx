'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Spline from '@splinetool/react-spline';
import {
  motion,
  AnimatePresence,
  useSpring,
  useTransform,
  useMotionValueEvent,
} from 'framer-motion';
import { useJournalStore } from '@/store/useJournalStore';
import { landingScrollProgress } from '@/lib/scrollProgress';

const SCENE_URL = 'https://prod.spline.design/4fkBuKTLTDTWI0fi/scene.splinecode';

// Premium website connection feel
const SPRING_CONFIG = { damping: 40, stiffness: 300, mass: 0.5, restDelta: 0.0001 };

export function SplineHero() {
  const viewState = useJournalStore((s) => s.viewState);
  const setViewState = useJournalStore((s) => s.setViewState);
  const [loaded, setLoaded] = useState(false);
  const splineRef = useRef<any>(null);

  const isVisible = viewState === 'Landing' || viewState === 'Transitioning';

  const onLoad = useCallback((splineApp: unknown) => {
    splineRef.current = splineApp;
    setLoaded(true);
  }, []);

  const smoothProgress = useSpring(landingScrollProgress, SPRING_CONFIG);

  // ─── Perfect Scale Mapping ───
  // Brain starts at 1.0 (perfectly centered, no overlap) and scales massively up
  const scale = useTransform(smoothProgress, [0, 0.5, 1], [1.25, 3.5, 12]);
  
  // ─── Performance Fix ───
  // REMOVED 'filter: blur()' entirely. CSS Blurs on WebGL canvases cause massive framerate drops (particle lag on hover).
  // We use opacity fade + scale for a performant transition
  const fadeTarget = useTransform(smoothProgress, [0.7, 0.95, 1], [1, 0, 0]);

  // ─── Native Wheel Interception ───
  useEffect(() => {
    if (viewState !== 'Landing') return;

    // Use capture: true so we intercept the wheel event BEFORE Spline sees it.
    // This entirely prevents Spline's camera from zooming/spazzing out when scrolling.
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation(); // Block Spline from handling the scroll!
      
      const current = landingScrollProgress.get();
      // Trackpad bidirectional scrolling. Scrolling up deeply reverses natively.
      const delta = e.deltaY * 0.0012;
      const next = Math.max(0, Math.min(1, current + delta));
      
      landingScrollProgress.set(next);
    };

    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    return () => window.removeEventListener('wheel', handleWheel, { capture: true });
  }, [viewState]);

  // ─── Touch support (intercepted) ───
  useEffect(() => {
    if (viewState !== 'Landing') return;
    let lastTouchY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0].clientY;
      // Do NOT stop propagation here so user can touch-drag to orbit the brain
    };

    const handleTouchMove = (e: TouchEvent) => {
      // e.touches.length > 1 is zoom pinch; else we use it for scroll tracking
      if (e.touches.length > 1) {
         e.preventDefault();
         e.stopPropagation();
         return;
      }

      // If dragging single finger, update scroll progress
      const currentY = e.touches[0].clientY;
      const delta = lastTouchY - currentY;
      
      // Treat larger deltas as intentional vertical scroll vs horizontal panning
      if (Math.abs(delta) > 5) {
         e.preventDefault(); 
         e.stopPropagation(); // Block spline camera panning
      }

      lastTouchY = currentY;

      const current = landingScrollProgress.get();
      const next = Math.max(0, Math.min(1, current + delta * 0.002));
      landingScrollProgress.set(next);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false, capture: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart, { capture: true });
      window.removeEventListener('touchmove', handleTouchMove, { capture: true });
    };
  }, [viewState]);

  // ─── Seamless Trigger ───
  useMotionValueEvent(smoothProgress, 'change', (v) => {
    if (v >= 0.98 && viewState === 'Landing') {
      setViewState('Transitioning');
    }
  });

  // ─── Handover ───
  useEffect(() => {
    if (viewState === 'Transitioning') {
      const timer = setTimeout(() => {
        setViewState('Network_View');
        landingScrollProgress.set(0);
      }, 800); 
      return () => clearTimeout(timer);
    }
  }, [viewState, setViewState]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible && loaded ? 1 : 0 }}
      transition={{ opacity: { duration: 1.2, ease: "easeInOut" } }}
      className="fixed inset-0 z-[1]"
      style={{
        scale,
        transformOrigin: 'center center',
        willChange: 'transform, opacity',
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
    >
      {/* Performance overlay fade */}
      <motion.div 
         className="absolute inset-0 z-10 bg-background pointer-events-none"
         style={{ opacity: useTransform(fadeTarget, [1, 0], [0, 1]) }}
      />

      {!loaded && isVisible && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border border-white/5 bg-white/5 animate-pulse" />
        </div>
      )}

      <motion.div className="w-full h-full flex items-center justify-center" style={{ opacity: fadeTarget }}>
        {isVisible && (
          <Spline
            scene={SCENE_URL}
            onLoad={onLoad}
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
