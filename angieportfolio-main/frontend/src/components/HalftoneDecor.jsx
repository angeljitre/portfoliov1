import { memo, useRef } from "react";
import { useInView } from "framer-motion";

const layouts = {
  hero: [
    { type: "orb", size: "ambient-orb--lg", tone: "ambient-orb--silver", motion: "ambient-breathe", className: "right-[7%] top-[17%]" },
    { type: "orb", size: "ambient-orb--md", tone: "ambient-orb--smoke", motion: "ambient-float-a", className: "left-[8%] bottom-[14%]", delay: "1.1s" },
    { type: "spark", scale: "ambient-sparkle--md", className: "right-[14%] bottom-[20%]", delay: "0.4s" },
    { type: "spark", scale: "ambient-sparkle--sm", className: "left-[13%] top-[29%]", delay: "1.5s" },
  ],
  about: [
    { type: "orb", size: "ambient-orb--md", tone: "ambient-orb--silver", motion: "ambient-float-b", className: "left-[7%] top-[25%]" },
    { type: "orb", size: "ambient-orb--lg", tone: "ambient-orb--pearl", motion: "ambient-breathe", className: "right-[7%] bottom-[13%]", delay: "0.9s" },
    { type: "spark", scale: "ambient-sparkle--sm", className: "right-[10%] top-[23%]", delay: "1.1s" },
    { type: "spark", scale: "ambient-sparkle--md", className: "left-[17%] bottom-[16%]", delay: "2.1s" },
  ],
  work: [
    { type: "orb", size: "ambient-orb--lg", tone: "ambient-orb--smoke", motion: "ambient-float-a", className: "right-[7%] top-[12%]" },
    { type: "orb", size: "ambient-orb--md", tone: "ambient-orb--silver", motion: "ambient-drift", className: "left-[8%] bottom-[11%]", delay: "0.8s" },
    { type: "spark", scale: "ambient-sparkle--md", className: "left-[12%] top-[21%]", delay: "0.4s" },
    { type: "spark", scale: "ambient-sparkle--sm", className: "right-[13%] bottom-[17%]", delay: "1.8s" },
  ],
  projects: [
    { type: "orb", size: "ambient-orb--lg", tone: "ambient-orb--silver", motion: "ambient-float-b", className: "left-[6%] top-[10%]" },
    { type: "orb", size: "ambient-orb--md", tone: "ambient-orb--pearl", motion: "ambient-breathe", className: "right-[8%] top-[43%]", delay: "0.9s" },
    { type: "orb", size: "ambient-orb--md", tone: "ambient-orb--smoke", motion: "ambient-drift", className: "left-[9%] bottom-[8%]", delay: "1.8s" },
    { type: "spark", scale: "ambient-sparkle--sm", className: "right-[12%] top-[18%]", delay: "0.6s" },
    { type: "spark", scale: "ambient-sparkle--md", className: "left-[17%] top-[58%]", delay: "1.9s" },
    { type: "spark", scale: "ambient-sparkle--sm", className: "right-[16%] bottom-[13%]", delay: "2.5s" },
  ],
  design: [
    { type: "orb", size: "ambient-orb--lg", tone: "ambient-orb--silver", motion: "ambient-float-a", className: "right-[6%] top-[13%]" },
    { type: "orb", size: "ambient-orb--md", tone: "ambient-orb--smoke", motion: "ambient-breathe", className: "left-[7%] bottom-[15%]", delay: "1.1s" },
    { type: "spark", scale: "ambient-sparkle--sm", className: "left-[12%] top-[19%]", delay: "0.8s" },
    { type: "spark", scale: "ambient-sparkle--md", className: "right-[14%] bottom-[12%]", delay: "1.8s" },
  ],
  special: [
    { type: "orb", size: "ambient-orb--lg", tone: "ambient-orb--pearl", motion: "ambient-float-b", className: "left-[6%] top-[15%]" },
    { type: "orb", size: "ambient-orb--md", tone: "ambient-orb--smoke", motion: "ambient-drift", className: "right-[8%] top-[53%]", delay: "1s" },
    { type: "orb", size: "ambient-orb--sm", tone: "ambient-orb--silver", motion: "ambient-breathe", className: "left-[11%] bottom-[9%]", delay: "2s" },
    { type: "spark", scale: "ambient-sparkle--md", className: "right-[11%] top-[18%]", delay: "0.5s" },
    { type: "spark", scale: "ambient-sparkle--sm", className: "left-[16%] top-[61%]", delay: "2.2s" },
  ],
  contact: [
    { type: "orb", size: "ambient-orb--md", tone: "ambient-orb--smoke", motion: "ambient-float-a", className: "left-[8%] top-[24%]" },
    { type: "orb", size: "ambient-orb--md", tone: "ambient-orb--silver", motion: "ambient-breathe", className: "right-[8%] bottom-[12%]", delay: "1.2s" },
    { type: "spark", scale: "ambient-sparkle--sm", className: "right-[12%] top-[18%]", delay: "0.7s" },
    { type: "spark", scale: "ambient-sparkle--sm", className: "left-[19%] bottom-[18%]", delay: "2s" },
  ],
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
      className={`ambient-decor pointer-events-none absolute inset-0 z-[1] overflow-hidden ${intensityClass} ${isVisible ? "ambient-decor--active" : "ambient-decor--paused"}`}
    >
      <div className="ambient-texture" />
      <div className="ambient-sheen" />

      {items.map((item, index) => {
        if (item.type === "spark") {
          return (
            <span
              key={`${variant}-spark-${index}`}
              style={{ animationDelay: item.delay || "0s" }}
              className={`ambient-sparkle ${item.scale} ${item.className}`}
            />
          );
        }

        return (
          <div
            key={`${variant}-orb-${index}`}
            style={{ animationDelay: item.delay || "0s" }}
            className={`ambient-orb ${item.size} ${item.tone} ${item.motion} ${item.className}`}
          />
        );
      })}
    </div>
  );
}

export default memo(HalftoneDecor);
