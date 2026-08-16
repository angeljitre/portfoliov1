import { memo, useRef } from "react";
import { useInView } from "framer-motion";

// Soft blurred glow orbs + small cross-bar sparkles — the only background
// decoration system on the site (chrome/metallic pieces were removed).
// Coordinates come from a seeded scatter generator (rejection-sampled, min
// edge-to-edge gap enforced) so nothing clusters.
//
// Kept deliberately light: ~5-8 pieces per section (~40 total sitewide,
// trimmed down from an earlier ~68-piece pass that was too heavy — each
// orb is a blurred, continuously-animating, GPU-layer-promoted element,
// and that count compounded into real strain). See the `.ambient-orb`
// rule in index.css for how `will-change` is scoped to only the section
// currently in view, so idle/off-screen sections hold no GPU layers.
//
// Each orb renders as two nested elements so its two animations never fight
// over the same CSS `transform` property: the outer `.ambient-orb-wrap`
// carries the float/drift/breathe position drift (translate3d), the inner
// `.ambient-orb` carries the `.ambient-heartbeat` pulse (scale + opacity).
// `delay` staggers the wrap's drift, `pulseDelay` staggers the inner pulse,
// independently, so glows never beat in sync with each other.
const layouts = {
  hero: [
    // Large ambient glow orb. NOTE: .hero-depth-gradient (a separate layer
    // painted above this one, z-0 vs this wrapper's z--10) is a two-axis
    // vignette — solid-dark along the left edge fading out by x=61%, and
    // solid-dark along the bottom fading out above y=67% — so anywhere in
    // that left/bottom band is fully masked no matter how bright the orb
    // is. This position sits inside the gradient's actual clear window
    // (x>61%, y 28-67%), which also keeps it under the Spline frame's
    // transparent canvas margin rather than off past its left edge.
    { type: "orb", size: "ambient-orb--xl", tone: "ambient-orb--pearl", motion: "ambient-breathe", className: "right-[11%] top-[21%]", delay: "0.4s", pulseDelay: "1.6s" },
    { type: "orb", size: "ambient-orb--lg", tone: "ambient-orb--silver", motion: "ambient-float-a", className: "left-[0%] top-[29%]", delay: "0.6s", pulseDelay: "0.3s" },
    { type: "orb", size: "ambient-orb--sm", tone: "ambient-orb--smoke", motion: "ambient-drift", className: "right-[25%] bottom-[23%]", delay: "2.1s", pulseDelay: "2.0s" },
    { type: "spark", scale: "ambient-sparkle--md", className: "left-[38%] top-[22%]", delay: "2.3s" },
    { type: "spark", scale: "ambient-sparkle--lg", className: "left-[44%] top-[1%]", delay: "0.3s" },
  ],
  about: [
    { type: "orb", size: "ambient-orb--lg", tone: "ambient-orb--silver", motion: "ambient-float-a", className: "left-[28%] top-[3%]", delay: "0.6s", pulseDelay: "0.3s" },
    { type: "orb", size: "ambient-orb--md", tone: "ambient-orb--pearl", motion: "ambient-float-b", className: "right-[13%] top-[0%]", delay: "1.4s", pulseDelay: "3.0s" },
    { type: "orb", size: "ambient-orb--md", tone: "ambient-orb--smoke", motion: "ambient-drift", className: "left-[34%] bottom-[17%]", delay: "2.1s", pulseDelay: "2.0s" },
    { type: "orb", size: "ambient-orb--sm", tone: "ambient-orb--silver", motion: "ambient-breathe", className: "left-[2%] bottom-[44%]", delay: "2.9s", pulseDelay: "0.9s" },
    { type: "spark", scale: "ambient-sparkle--md", className: "left-[18%] top-[29%]", delay: "1.3s" },
    { type: "spark", scale: "ambient-sparkle--sm", className: "right-[30%] bottom-[25%]", delay: "0.3s" },
    { type: "spark", scale: "ambient-sparkle--lg", className: "right-[41%] bottom-[7%]", delay: "1.8s" },
    { type: "spark", scale: "ambient-sparkle--md", className: "right-[38%] bottom-[44%]", delay: "0.8s" },
  ],
  work: [
    { type: "orb", size: "ambient-orb--lg", tone: "ambient-orb--silver", motion: "ambient-float-a", className: "right-[7%] bottom-[21%]", delay: "0.6s", pulseDelay: "0.3s" },
    { type: "orb", size: "ambient-orb--md", tone: "ambient-orb--pearl", motion: "ambient-float-b", className: "left-[34%] bottom-[0%]", delay: "1.4s", pulseDelay: "3.0s" },
    { type: "orb", size: "ambient-orb--sm", tone: "ambient-orb--smoke", motion: "ambient-drift", className: "left-[5%] bottom-[43%]", delay: "2.1s", pulseDelay: "2.0s" },
    { type: "spark", scale: "ambient-sparkle--sm", className: "right-[45%] bottom-[8%]", delay: "2.3s" },
    { type: "spark", scale: "ambient-sparkle--lg", className: "left-[2%] bottom-[13%]", delay: "0.3s" },
  ],
  projects: [
    { type: "orb", size: "ambient-orb--lg", tone: "ambient-orb--silver", motion: "ambient-float-a", className: "right-[18%] top-[29%]", delay: "0.6s", pulseDelay: "0.3s" },
    { type: "orb", size: "ambient-orb--lg", tone: "ambient-orb--pearl", motion: "ambient-float-b", className: "left-[8%] bottom-[24%]", delay: "1.4s", pulseDelay: "3.0s" },
    { type: "orb", size: "ambient-orb--sm", tone: "ambient-orb--silver", motion: "ambient-breathe", className: "right-[31%] top-[8%]", delay: "2.9s", pulseDelay: "0.9s" },
    { type: "spark", scale: "ambient-sparkle--md", className: "right-[49%] bottom-[5%]", delay: "0.3s" },
    { type: "spark", scale: "ambient-sparkle--sm", className: "left-[25%] top-[10%]", delay: "1.8s" },
    { type: "spark", scale: "ambient-sparkle--lg", className: "right-[5%] top-[44%]", delay: "0.8s" },
  ],
  design: [
    { type: "orb", size: "ambient-orb--lg", tone: "ambient-orb--silver", motion: "ambient-float-a", className: "left-[5%] bottom-[34%]", delay: "0.6s", pulseDelay: "0.3s" },
    { type: "orb", size: "ambient-orb--md", tone: "ambient-orb--pearl", motion: "ambient-float-b", className: "left-[0%] top-[13%]", delay: "1.4s", pulseDelay: "3.0s" },
    { type: "orb", size: "ambient-orb--sm", tone: "ambient-orb--smoke", motion: "ambient-drift", className: "right-[20%] top-[31%]", delay: "2.1s", pulseDelay: "2.0s" },
    { type: "spark", scale: "ambient-sparkle--md", className: "left-[24%] top-[22%]", delay: "2.3s" },
    { type: "spark", scale: "ambient-sparkle--lg", className: "left-[32%] bottom-[46%]", delay: "1.3s" },
  ],
  special: [
    { type: "orb", size: "ambient-orb--lg", tone: "ambient-orb--silver", motion: "ambient-float-a", className: "left-[0%] bottom-[0%]", delay: "0.6s", pulseDelay: "0.3s" },
    { type: "orb", size: "ambient-orb--md", tone: "ambient-orb--pearl", motion: "ambient-float-b", className: "left-[24%] bottom-[28%]", delay: "1.4s", pulseDelay: "3.0s" },
    { type: "orb", size: "ambient-orb--sm", tone: "ambient-orb--silver", motion: "ambient-breathe", className: "right-[16%] top-[14%]", delay: "2.9s", pulseDelay: "0.9s" },
    { type: "spark", scale: "ambient-sparkle--sm", className: "left-[31%] top-[3%]", delay: "1.3s" },
    { type: "spark", scale: "ambient-sparkle--md", className: "right-[27%] bottom-[28%]", delay: "0.3s" },
    { type: "spark", scale: "ambient-sparkle--lg", className: "right-[29%] bottom-[39%]", delay: "1.8s" },
  ],
  contact: [
    { type: "orb", size: "ambient-orb--lg", tone: "ambient-orb--silver", motion: "ambient-float-a", className: "left-[25%] bottom-[9%]", delay: "0.6s", pulseDelay: "0.3s" },
    { type: "orb", size: "ambient-orb--md", tone: "ambient-orb--pearl", motion: "ambient-float-b", className: "right-[29%] top-[18%]", delay: "1.4s", pulseDelay: "3.0s" },
    { type: "orb", size: "ambient-orb--sm", tone: "ambient-orb--smoke", motion: "ambient-drift", className: "left-[2%] bottom-[10%]", delay: "2.1s", pulseDelay: "2.0s" },
    { type: "spark", scale: "ambient-sparkle--md", className: "left-[15%] bottom-[23%]", delay: "2.3s" },
    { type: "spark", scale: "ambient-sparkle--sm", className: "left-[12%] top-[21%]", delay: "1.3s" },
    { type: "spark", scale: "ambient-sparkle--lg", className: "left-[3%] bottom-[33%]", delay: "0.3s" },
  ],
};

// Deterministic 0..1 pseudo-random (GLSL-style sine hash) — not Math.random,
// so every instance gets a stable jitter value instead of reshuffling on
// every re-render.
const pseudoFrac = (n) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const seedFor = (variant, index, salt) => {
  let h = salt;
  for (let i = 0; i < variant.length; i++) h = h * 31 + variant.charCodeAt(i);
  return h + index * 97;
};

const MOTION_BASE_DURATION = {
  "ambient-float-a": 12,
  "ambient-float-b": 14,
  "ambient-drift": 15,
  "ambient-breathe": 10,
};

function HalftoneDecor({ variant = "about", intensity = "normal" }) {
  const rootRef = useRef(null);
  const isVisible = useInView(rootRef, { amount: 0.04, margin: "180px 0px" });
  const items = layouts[variant] || layouts.about;
  const intensityClass =
    intensity === "soft"
      ? "ambient-decor--soft"
      : intensity === "strong"
        ? "ambient-decor--strong"
        : "ambient-decor--normal";

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={`ambient-decor pointer-events-none absolute inset-0 z-[-10] overflow-hidden ${intensityClass} ${isVisible ? "ambient-decor--active" : "ambient-decor--paused"}`}
    >
      <div className="ambient-texture" />
      <div className="ambient-sheen" />

      {items.map((item, index) => {
        if (item.type === "spark") {
          // Negative delay: the twinkle starts already mid-cycle instead of
          // every sparkle visibly beginning from frame 0 together. Duration
          // is jittered per-instance so none of them ever re-sync.
          const baseDelay = parseFloat(item.delay || "0");
          const twinkleDelay = -(baseDelay + pseudoFrac(seedFor(variant, index, 11)) * 3).toFixed(2);
          const twinkleDuration = (3.6 + pseudoFrac(seedFor(variant, index, 23)) * 2.4).toFixed(2);
          return (
            <span
              key={`${variant}-spark-${index}`}
              style={{
                "--twinkle-delay": `${twinkleDelay}s`,
                "--twinkle-duration": `${twinkleDuration}s`,
              }}
              className={`ambient-sparkle ${item.scale} ${item.className}`}
            />
          );
        }

        const baseMotionDelay = parseFloat(item.delay || "0");
        const motionDelay = -(baseMotionDelay + pseudoFrac(seedFor(variant, index, 37)) * 4).toFixed(2);
        const motionBase = MOTION_BASE_DURATION[item.motion] || 12;
        const motionDuration = (motionBase * (0.8 + pseudoFrac(seedFor(variant, index, 41)) * 0.4)).toFixed(2);

        const basePulseDelay = parseFloat(item.pulseDelay || "0");
        const pulseDelay = -(basePulseDelay + pseudoFrac(seedFor(variant, index, 59)) * 3).toFixed(2);
        const pulseDuration = (3.2 + pseudoFrac(seedFor(variant, index, 67)) * 2.3).toFixed(2);

        return (
          <div
            key={`${variant}-orb-${index}`}
            style={{
              "--motion-delay": `${motionDelay}s`,
              "--motion-duration": `${motionDuration}s`,
            }}
            className={`ambient-orb-wrap ${item.motion} ${item.className}`}
          >
            <div
              style={{
                "--pulse-delay": `${pulseDelay}s`,
                "--pulse-duration": `${pulseDuration}s`,
              }}
              className={`ambient-orb ${item.size} ${item.tone} ambient-heartbeat`}
            />
          </div>
        );
      })}
    </div>
  );
}

export default memo(HalftoneDecor);
