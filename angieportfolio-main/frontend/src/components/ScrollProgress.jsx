import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";

export default function ScrollProgress() {
  const { ui } = useLanguage();
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 20,
    mass: 0.3,
  });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsub = smooth.on("change", (v) => setVisible(v > 0.06));
    return () => unsub();
  }, [smooth]);

  const RADIUS = 22;
  const CIRC = 2 * Math.PI * RADIUS;

  return (
    <motion.button
      data-testid="scroll-progress"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="scroll-progress-button glow-hover fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full border border-white/15 bg-black/50 backdrop-blur-xl md:bottom-8 md:right-8"
      aria-label={ui.scrollTop}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.7 }}
      transition={{ duration: 0.4 }}
    >
      <svg
        width="56"
        height="56"
        viewBox="0 0 56 56"
        className="absolute inset-0"
      >
        <circle
          cx="28"
          cy="28"
          r={RADIUS}
          fill="none"
          className="scroll-progress-track"
          stroke="currentColor"
          opacity="0.14"
          strokeWidth="1.5"
        />
        <motion.circle
          cx="28"
          cy="28"
          r={RADIUS}
          fill="none"
          className="scroll-progress-value"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          style={{
            pathLength: smooth,
            rotate: -90,
            transformOrigin: "50% 50%",
          }}
        />
      </svg>
      <ArrowUp
        size={14}
        className="scroll-progress-icon relative z-10 text-white"
      />
    </motion.button>
  );
}
