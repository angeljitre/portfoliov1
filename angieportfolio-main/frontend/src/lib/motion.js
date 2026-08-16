// Shared "fade-in up" scroll-reveal presets for framer-motion's
// `whileInView` (IntersectionObserver-based internally — no scroll
// listeners, and framer-motion disconnects the observer for a given
// element as soon as it fires because every call site sets
// `viewport: { once: true }`). Centralizing these keeps every content
// block/card on the same easing curve and duration instead of drifting
// per-component.
//
// Results are cached by their primitive args (delay/y/duration) so two
// calls with the same numbers return the *same* object reference instead
// of a fresh literal every render. Passing a fresh inline object as a prop
// on every render is a known way to make a hook's effect (anything keyed
// on that prop's identity) re-run needlessly on every re-render — caching
// avoids that class of churn entirely, independent of whatever framer-
// motion does internally.
export const REVEAL_EASE = [0.16, 1, 0.3, 1];

const revealCache = new Map();

// `y`: initial translateY offset (px) it falls in from.
// `duration`: seconds, kept inside the 0.6-0.8s band.
// `delay`: extra per-instance stagger offset (seconds).
export const revealUp = (delay = 0, { y = 40, duration = 0.7 } = {}) => {
  const key = `${delay}|${y}|${duration}`;
  let cached = revealCache.get(key);
  if (!cached) {
    cached = {
      initial: { opacity: 0, y },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-10%" },
      transition: { duration, ease: REVEAL_EASE, delay },
    };
    revealCache.set(key, cached);
  }
  return cached;
};

// For siblings rendered from the same `.map()` that can enter the viewport
// together (grid/row cards) — cascades them in one after another instead of
// all popping at once. `step` is the per-item delay; `max` caps how far the
// stagger grows so far-down items don't wait multiple seconds.
export const cardReveal = (index, { step = 0.08, max = 0.32, ...rest } = {}) =>
  revealUp(Math.min(index * step, max), rest);
