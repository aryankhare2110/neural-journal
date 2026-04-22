'use client';

import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { useJournalStore } from '@/store/useJournalStore';
import { landingScrollProgress } from '@/lib/scrollProgress';

const SPRING_CONFIG = { damping: 40, stiffness: 300, mass: 0.5 };

export function HeroOverlay() {
  const viewState = useJournalStore((s) => s.viewState);
  const isVisible = viewState === 'Landing';

  const smoothProgress = useSpring(landingScrollProgress, SPRING_CONFIG);

  // Fade out UI gracefully as the user zooms in
  const globalOpacity = useTransform(smoothProgress, [0, 0.3], [1, 0]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 select-none overflow-hidden"
          style={{ pointerEvents: 'none', zIndex: 20 }}
        >
          <motion.div style={{ opacity: globalOpacity }} className="w-full h-full relative">
            
            {/* ─── Top Left: Branding ─── */}
            <div className="absolute top-8 left-8 md:top-12 md:left-12 flex flex-col gap-2">
              <h1 className="text-xl md:text-2xl font-semibold tracking-widest text-white">
                Neural Journal
              </h1>
              <div className="text-[10px] md:text-xs text-white/40 font-mono tracking-widest uppercase flex flex-col gap-1">
                <span>// Copyright © 2026</span>
                <span>All Rights Reserved.</span>
              </div>
            </div>

            {/* ─── Top Right: Auth ─── */}
            <div className="absolute top-8 right-8 md:top-12 md:right-12 flex items-center gap-6 font-mono text-[10px] md:text-xs tracking-widest uppercase pointer-events-auto">
              <button className="text-white/50 hover:text-white transition-colors cursor-pointer">
                Log In
              </button>
              <button className="text-white hover:text-violet-300 transition-colors cursor-pointer">
                Sign Up
              </button>
            </div>

            {/* ─── Bottom Left: Interaction Hint ─── */}
            <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 flex flex-col gap-3">
              <span className="text-[10px] text-white/50 font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                Drag to orbit
              </span>
              <span className="text-xs text-white/90 font-mono uppercase tracking-[0.2em]">
                Scroll down to enter.
              </span>
            </div>

            {/* ─── Bottom Right: Mission ─── */}
            <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 flex flex-col items-end gap-2 text-right max-w-[200px] md:max-w-[260px]">
              <span className="text-[9px] text-white/30 font-mono tracking-widest uppercase">
                ////// Mission
              </span>
              <p className="text-[11px] text-white/40 font-mono uppercase tracking-widest leading-relaxed">
                Map your consciousness in a 3D interface. Dive into your thoughts, find connections, and explore your neural pathways.
              </p>
            </div>

            {/* ─── Vignette for depth, avoiding the center ─── */}
            <div
              className="absolute inset-0 pointer-events-none mix-blend-overlay"
              style={{
                background: 'radial-gradient(circle at 50% 50%, transparent 30%, rgba(0,0,0,0.8) 100%)',
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
