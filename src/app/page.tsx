'use client';

import dynamic from 'next/dynamic';
import { useJournalStore } from '@/store/useJournalStore';
import { AnimatePresence, motion } from 'framer-motion';

import { HeroOverlay } from '@/components/ui/HeroOverlay';
import { ThoughtInput } from '@/components/ui/ThoughtInput';
import { EntryPanel } from '@/components/ui/EntryPanel';
import { DepthIndicator } from '@/components/ui/DepthIndicator';
import { TopBar } from '@/components/ui/TopBar';
import { NetworkOverlay } from '@/components/ui/NetworkOverlay';
import { ListView } from '@/components/ui/ListView';
import { LeftPanel } from '@/components/ui/LeftPanel';
import { RightPanel } from '@/components/ui/RightPanel';

const SplineHero = dynamic(
  () => import('@/components/spline/SplineHero').then((m) => m.SplineHero),
  { ssr: false },
);

const CanvasScene = dynamic(
  () => import('@/components/canvas/CanvasScene').then((m) => m.default),
  { ssr: false, loading: () => null },
);

export default function Page() {
  const viewState = useJournalStore((s) => s.viewState);
  const showCanvas = viewState === 'Transitioning' || viewState === 'Network_View';

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-background">
      {/* Layer 1 — Spline brain (landing) */}
      <SplineHero />

      {/* Cinematic transition flash */}
      <AnimatePresence>
        {viewState === 'Transitioning' && (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0 z-30 pointer-events-none mix-blend-screen bg-white/5"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent opacity-50" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layer 2 — R3F canvas (always full-screen, fades in) */}
      {showCanvas && (
        <div
          className="canvas-container transition-opacity duration-1000"
          style={{ opacity: viewState === 'Network_View' ? 1 : 0 }}
        >
          <CanvasScene />
        </div>
      )}

      {/* Layer 3 — UI overlay */}
      <div className="ui-overlay z-50 pointer-events-none absolute inset-0">
        {/* Landing screen */}
        <HeroOverlay />

        {/* Network screen */}
        <TopBar />
        <NetworkOverlay />

        <ListView />
        <LeftPanel />
        <RightPanel />
        <DepthIndicator />
        <ThoughtInput />
        <EntryPanel />
      </div>
    </main>
  );
}
