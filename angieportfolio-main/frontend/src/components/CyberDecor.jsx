import { motion, useInView } from "framer-motion";
import { memo, useRef } from "react";

// Decorative chrome pieces are deliberately sparse. Section-level pieces
// balance the composition, while row-level pieces stay close to media instead
// of competing with headings or paragraphs.
const LAYOUTS = {
  hero: [
    { type: "bubble", className: "right-[8%] top-[23%] scale-[0.58]", motion: "drift" },
    { type: "pill", className: "right-[18%] bottom-[14%] scale-[0.54]", motion: "float" },
  ],
  about: [
    { type: "ribbon", className: "right-[6%] top-[18%] scale-[0.58]", motion: "float" },
    { type: "bubble", className: "left-[8%] bottom-[15%] scale-[0.5]", motion: "breathe" },
  ],
  work: [
    { type: "liquid", className: "left-[6%] top-[18%] scale-[0.54]", motion: "drift" },
    { type: "bubble", className: "right-[8%] bottom-[14%] scale-[0.5]", motion: "breathe" },
  ],
  projects: [
    { type: "bubble", className: "left-[7%] top-[12%] scale-[0.5]", motion: "breathe" },
    { type: "liquid", className: "right-[7%] top-[48%] scale-[0.54]", motion: "drift" },
    { type: "pill", className: "left-[12%] bottom-[8%] scale-[0.46]", motion: "float" },
  ],
  design: [
    { type: "liquid", className: "right-[6%] top-[13%] scale-[0.52]", motion: "drift" },
    { type: "bubble", className: "left-[8%] bottom-[12%] scale-[0.48]", motion: "breathe" },
  ],
  special: [
    { type: "bubble", className: "right-[7%] top-[12%] scale-[0.5]", motion: "breathe" },
    { type: "ribbon", className: "left-[8%] bottom-[11%] scale-[0.52]", motion: "float" },
  ],
  contact: [
    { type: "liquid", className: "right-[8%] top-[20%] scale-[0.5]", motion: "drift" },
    { type: "bubble", className: "left-[10%] bottom-[13%] scale-[0.46]", motion: "breathe" },
  ],

  // 3D rows: one object only, always on the media side.
  projectRow0: [{ type: "bubble", className: "left-[2%] top-[37%] scale-[0.43]", motion: "breathe" }],
  projectRow1: [{ type: "lens", className: "right-[2%] top-[39%] scale-[0.43]", motion: "drift" }],
  projectRow2: [{ type: "plate", className: "left-[2%] top-[42%] scale-[0.42]", motion: "float" }],
  projectRow3: [{ type: "pill", className: "right-[2%] top-[40%] scale-[0.43]", motion: "float" }],

  // Environment media begins below the heading, so pieces sit beside video/frames.
  environmentRow0: [{ type: "bubble", className: "left-[5%] top-[61%] scale-[0.46]", motion: "breathe" }],
  environmentRow1: [{ type: "lens", className: "right-[5%] top-[62%] scale-[0.45]", motion: "drift" }],

  // Collaboration media sits on the right. One different accent per row.
  specialRow0: [{ type: "bubble", className: "right-[2%] top-[32%] scale-[0.42]", motion: "breathe" }],
  specialRow1: [{ type: "lens", className: "right-[3%] bottom-[15%] scale-[0.42]", motion: "drift" }],
  specialRow2: [{ type: "plate", className: "right-[2%] top-[37%] scale-[0.42]", motion: "float" }],
  specialRow3: [{ type: "pill", className: "right-[3%] bottom-[14%] scale-[0.42]", motion: "float" }],
};

const STARS = {
  hero: ["left-[12%] top-[32%]", "right-[12%] top-[38%]", "right-[23%] bottom-[22%]"],
  about: ["left-[10%] top-[22%]", "right-[10%] top-[43%]", "left-[22%] bottom-[15%]"],
  work: ["left-[10%] top-[18%]", "right-[9%] top-[30%]", "left-[18%] bottom-[18%]", "right-[20%] bottom-[11%]"],
  projects: ["left-[9%] top-[12%]", "right-[10%] top-[27%]", "left-[13%] top-[55%]", "right-[12%] top-[72%]"],
  design: ["left-[10%] top-[16%]", "right-[11%] top-[35%]", "left-[14%] bottom-[20%]", "right-[19%] bottom-[10%]"],
  special: ["left-[10%] top-[13%]", "right-[10%] top-[31%]", "left-[13%] top-[59%]", "right-[13%] bottom-[11%]"],
  contact: ["left-[11%] top-[22%]", "right-[12%] top-[19%]", "left-[23%] bottom-[15%]"],
};

const MOTIONS = {
  float: { y: [0, -7, 0], x: [0, 3, 0], rotate: [0, 1.2, 0] },
  drift: { y: [0, -4, 0], x: [0, -7, 0], rotate: [0, -1, 0] },
  breathe: { y: [0, -5, 0], x: [0, 2, 0], scale: [1, 1.035, 1] },
};

function CyberDecor({ variant = "hero" }) {
  const rootRef = useRef(null);
  const isVisible = useInView(rootRef, { amount: 0.08, margin: "160px 0px" });
  const pieces = LAYOUTS[variant] || LAYOUTS.hero;
  const stars = STARS[variant] || [];

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={`cyber-decor cyber-decor--${variant} pointer-events-none absolute inset-0 z-[2]`}
    >
      {pieces.map((piece, index) => (
        <motion.span
          key={`${variant}-${piece.type}-${index}`}
          className={`cyber-piece cyber-piece--${piece.type} ${piece.className}`}
          animate={isVisible ? MOTIONS[piece.motion || "float"] : { y: 0, x: 0, rotate: 0, scale: 1 }}
          transition={{
            duration: 9.5 + index * 1.4,
            repeat: isVisible ? Infinity : 0,
            ease: "easeInOut",
            delay: index * 0.55,
          }}
        />
      ))}
      {stars.map((className, index) => (
        <motion.span
          key={`${variant}-star-${index}`}
          className={`cyber-star ${className}`}
          animate={isVisible ? { opacity: [0.18, 0.62, 0.18], scale: [0.92, 1.04, 0.92] } : { opacity: 0.18, scale: 0.92 }}
          transition={{ duration: 5.2 + (index % 2), repeat: isVisible ? Infinity : 0, ease: "easeInOut", delay: index * 0.55 }}
        />
      ))}
    </div>
  );
}

export default memo(CyberDecor);
