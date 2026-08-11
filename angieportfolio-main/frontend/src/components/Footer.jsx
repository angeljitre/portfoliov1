import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "../hooks/useLanguage";
import { revealUp } from "../lib/motion";

export default function Footer() {
  const { content: siteContent, ui } = useLanguage();
  const { footer, meta } = siteContent;
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Very slow parallax on the large background lettering
  const bgX = useTransform(scrollYProgress, [0, 1], ["-2%", "-14%"]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.4, 1], [0, 0.06, 0.09]);

  return (
    <footer
      ref={ref}
      data-testid="section-footer"
      className="relative overflow-hidden border-t border-white/10 py-16"
    >
      <motion.div
        style={{ x: bgX, opacity: bgOpacity }}
        className="pointer-events-none absolute inset-x-0 -top-20 select-none"
      >
        <div className="whitespace-nowrap font-display text-[16vw] font-bold uppercase leading-none tracking-tight text-white">
          <span className="mr-16">
            ANGÉLICA · JIMÉNEZ · ANGÉLICA · JIMÉNEZ ·
          </span>
        </div>
      </motion.div>

      <motion.div
        {...revealUp()}
        className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-8 px-5 md:px-10"
      >
        <div data-testid="footer-logo" className="flex items-center">
          <img
            src={meta.logoPath}
            alt="Angélica Jiménez"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className="theme-logo h-12 w-16 object-contain"
          />
        </div>
        <div
          data-testid="footer-tagline"
          className="font-mono-label text-[11px] text-white/60 text-right"
        >
          {footer.tagline}
        </div>
      </motion.div>

      <div className="relative z-10 mx-auto mt-10 max-w-7xl px-5 md:px-10">
        <div className="border-t border-white/10 pt-6 font-mono-label text-[10px] text-white/40">
          {footer.copyright} · {ui.designedBuilt}
        </div>
      </div>
    </footer>
  );
}
