import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { Download } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";
import { getSoftwareLogo } from "../lib/logoAssets";
import HalftoneDecor from "./HalftoneDecor";
import { revealUp } from "../lib/motion";

function ToolIcon({ tool, i }) {
  const logo = getSoftwareLogo(tool.name);
  return (
    <motion.div
      data-testid={`tool-${tool.name.toLowerCase().replace(/\s+/g, "-")}`}
      {...revealUp(i * 0.05, { y: 14, duration: 0.55 })}
      className="group relative flex items-center justify-center"
      title={tool.name}
    >
      <div className="glow-hover grid aspect-square w-full place-items-center rounded-xl border border-white/12 bg-white/[0.03] font-heading text-sm font-semibold uppercase tracking-tight text-white/85 transition-all group-hover:border-white group-hover:bg-white/10 group-hover:text-white">
        {logo ? (
          <img src={logo} alt={tool.name} loading="lazy" decoding="async" fetchPriority="low" className="tool-logo h-7 w-7 object-contain" />
        ) : (
          tool.mono
        )}
      </div>
      <span className="pointer-events-none absolute -bottom-5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-black/85 px-2 py-1 font-mono-label text-[9px] text-white/85 opacity-0 backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100">
        {tool.name}
      </span>
    </motion.div>
  );
}

export default function About() {
  const { content: siteContent, ui } = useLanguage();
  const { about, meta } = siteContent;

  // Tilt (desktop pointer only)
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rxSp = useSpring(rx, { stiffness: 120, damping: 14, mass: 0.3 });
  const rySp = useSpring(ry, { stiffness: 120, damping: 14, mass: 0.3 });
  const rotateX = useTransform(rxSp, (v) => `${v}deg`);
  const rotateY = useTransform(rySp, (v) => `${v}deg`);

  const sectionRef = useRef(null);
  const cardRef = useRef(null);
  const isVisible = useInView(sectionRef, { amount: 0.12, margin: "120px 0px" });
  const handleMove = (e) => {
    // Skip on coarse pointers (touch)
    if (window.matchMedia("(hover: none)").matches) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * 6); // rotateY
    rx.set(-py * 6); // rotateX
  };
  const handleLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      data-testid="section-about"
      className={`relative overflow-hidden border-t border-white/5 py-20 md:py-28 ${isVisible ? "viewport-active" : "viewport-paused"}`}
    >
      <HalftoneDecor variant="about" intensity="strong" />

      {/* Background slow marquee */}
      <div className="pointer-events-none absolute inset-x-0 top-6 overflow-hidden opacity-[0.06] select-none">
        <div className="marquee-track whitespace-nowrap font-display text-[18vw] font-bold uppercase leading-none tracking-tight text-white">
          <span className="mr-16">{about.marquee.repeat(3)}</span>
          <span>{about.marquee.repeat(3)}</span>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-10">
        <div className="mb-10 flex items-end justify-between">
          <span className="font-mono-label text-[11px] text-white/40">
            {about.label}
          </span>
          <span className="font-mono-label text-[11px] text-white/40">
            {ui.aboutKicker}
          </span>
        </div>

        <div className="grid grid-cols-12 gap-8 md:gap-10">
          {/* Left: compact copy + toolkit */}
          <div className="col-span-12 md:col-span-7 lg:col-span-8">
            <motion.h2
              {...revealUp()}
              className="section-title font-heading uppercase tracking-tight text-white"
            >
              {ui.aboutHeading}
            </motion.h2>

            <motion.p
              {...revealUp(0.1)}
              className="mt-6 max-w-xl font-body text-base leading-relaxed text-white/70 md:text-lg"
            >
              {about.intro}
            </motion.p>

            {about.lookingFor && (
              <motion.p
                {...revealUp(0.2)}
                className="mt-4 max-w-xl font-body text-sm leading-relaxed text-white/50 md:text-base"
              >
                {about.lookingFor}
              </motion.p>
            )}

            {/* Toolkit (merged in) — 2-column grid, wider tiles */}
            <div className="mt-10">
              <div className="mb-5 flex items-center gap-3">
                <span className="font-mono-label text-[11px] text-white/40">
                  / {about.toolkitLabel}
                </span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <div
                data-testid="about-toolkit"
                className="mx-auto grid max-w-md grid-cols-6 gap-2 md:mx-0 md:max-w-lg md:gap-2.5"
              >
                {about.tools.map((t, i) => (
                  <ToolIcon key={t.name} tool={t} i={i} />
                ))}
              </div>
            </div>
          </div>

          {/* Right: floating portrait with tilt + light sweep */}
          <div className="col-span-12 md:col-span-5 lg:col-span-4">
            <motion.div
              // Slow float — desktop & mobile
              animate={isVisible ? { y: [0, -8, 0] } : { y: 0 }}
              transition={{ duration: 6, repeat: isVisible ? Infinity : 0, ease: "easeInOut" }}
              className="w-full"
              style={{ perspective: 1000 }}
            >
              <motion.div
                ref={cardRef}
                onMouseMove={handleMove}
                onMouseLeave={handleLeave}
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="media-glass relative aspect-[3/4] w-full overflow-hidden border border-white/10 will-change-transform"
              >
                <img
                  src={about.portraitImage}
                  alt={about.portraitAlt}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  className="h-full w-full object-cover grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/30 to-transparent" />
                <div className="absolute inset-0 halftone opacity-30 mix-blend-overlay" />

                {/* CV button attached to the card */}
                <div className="absolute inset-x-4 bottom-4">
                  <a
                    data-testid="about-download-cv"
                    href={meta.cvUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="glow-hover flex items-center justify-between gap-3 rounded-full border border-white bg-white/95 px-5 py-3 font-mono-label text-[11px] text-black hover:bg-white"
                  >
                    {ui.downloadCv}
                    <Download size={14} />
                  </a>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
