import { motionValue } from 'framer-motion';

/**
 * Shared MotionValue (0→1) tracking the user's scroll-zoom progress
 * on the landing page. Read by SplineHero (zoom) and HeroOverlay (fade).
 * Updated directly — no React re-renders.
 */
export const landingScrollProgress = motionValue(0);
