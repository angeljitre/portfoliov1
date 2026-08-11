import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, Linkedin, Mail } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";
import angelicaWordmark from "../assets/branding/angelica-vixa.svg";
import jimenezWordmark from "../assets/branding/jimenez-vixa.svg";
import HalftoneDecor from "./HalftoneDecor";

const Spline = lazy(() => import("@splinetool/react-spline"));


class SplineErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error("Spline failed to load:", error);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.failed) return <div className="h-full w-full" aria-hidden="true" />;
    return this.props.children;
  }
}

// Relies on the target's own CSS scroll-margin-top (see index.css / each
// section's scroll-mt-32) as the single source of truth for header
// clearance, instead of a second hardcoded pixel offset here that could
// drift out of sync with it.
const scrollToWork = () => {
  const el = document.getElementById("work");
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
};

function RotatingRoles({ roles }) {
  const [index, setIndex] = useState(0);
  const longestRole = useMemo(
    () => roles.reduce((longest, role) => (role.length > longest.length ? role : longest), ""),
    [roles],
  );

  useEffect(() => {
    let timer;
    const start = () => {
      window.clearInterval(timer);
      if (document.visibilityState !== "visible") return;
      timer = window.setInterval(
        () => setIndex((value) => (value + 1) % roles.length),
        2600,
      );
    };
    start();
    document.addEventListener("visibilitychange", start);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", start);
    };
  }, [roles.length]);

  return (
    <span className="role-slot" aria-live="polite">
      <span className="role-slot__sizer" aria-hidden="true">
        {longestRole}
      </span>
      <AnimatePresence initial={false} mode="sync">
        <motion.span
          key={roles[index]}
          className="role-slot__item"
          initial={{ y: "70%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-70%", opacity: 0 }}
          transition={{ duration: 0.58, ease: [0.7, 0, 0.2, 1] }}
        >
          {roles[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function VixaName({ ready }) {
  return (
    <h1 data-testid="hero-name" className="hero-vixa-name">
      <span className="sr-only">ANGÉLICA JIMÉNEZ</span>
      {[angelicaWordmark, jimenezWordmark].map((src, index) => (
        <span className="hero-vixa-line" key={src}>
          <motion.img
            src={src}
            alt=""
            aria-hidden="true"
            initial={{ y: "112%" }}
            animate={{ y: ready ? "0%" : "112%" }}
            transition={{
              duration: 1.05,
              delay: 0.12 + index * 0.08,
              ease: [0.7, 0, 0.2, 1],
            }}
          />
        </span>
      ))}
    </h1>
  );
}

export default function Hero({ ready, onSplineLoad, onSplineError }) {
  const { content: siteContent, ui } = useLanguage();
  const { hero, meta, socials } = siteContent;
  const sectionRef = useRef(null);
  const splineAppRef = useRef(null);
  const heroVisibleRef = useRef(true);

  const syncSplinePlayback = useCallback(() => {
    const app = splineAppRef.current;
    if (!app) return;
    const shouldPlay =
      heroVisibleRef.current && document.visibilityState === "visible";
    try {
      if (shouldPlay) app.play();
      else app.stop();
    } catch (error) {
      console.warn("Unable to update Spline playback:", error);
    }
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        heroVisibleRef.current = entry.isIntersecting;
        syncSplinePlayback();
      },
      { threshold: 0.02, rootMargin: "80px 0px" },
    );
    observer.observe(node);
    const onVisibilityChange = () => syncSplinePlayback();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [syncSplinePlayback]);

  const handleSplineLoad = useCallback(
    (app) => {
      splineAppRef.current = app;
      syncSplinePlayback();
      // Spline's onLoad fires once the scene data is ready, not necessarily
      // once the canvas has actually painted that first frame — dismissing
      // the loader on the same tick can show a blank/pop-in flash. Wait two
      // animation frames so the browser has painted before we reveal it.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          onSplineLoad?.(app);
        });
      });
    },
    [onSplineLoad, syncSplinePlayback],
  );

  return (
    <section ref={sectionRef} id="hero" data-testid="section-hero" className="relative min-h-screen w-full scroll-mt-32 overflow-hidden">
      <HalftoneDecor variant="hero" intensity="normal" />

      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="spline-hero spline-hero-frame absolute inset-y-0 left-[19%] right-[-3%] md:left-[26%] md:right-[0%] lg:left-[29%] lg:right-[2%]">
          <SplineErrorBoundary onError={onSplineError}>
            <Suspense fallback={<div className="h-full w-full" aria-hidden="true" />}>
              <Spline
                scene={meta.splineSceneUrl}
                onLoad={handleSplineLoad}
                renderOnDemand
                className="h-full w-full opacity-95"
                style={{ background: "transparent" }}
              />
            </Suspense>
          </SplineErrorBoundary>
        </div>
        <div className="pointer-events-none absolute inset-0 halftone opacity-20 mix-blend-overlay" />
        <div className="hero-depth-gradient pointer-events-none absolute inset-0" />
      </div>

      <div className="pointer-events-none relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-5 pb-14 pt-28 md:px-10 md:pb-16 md:pt-36">
        <div className="flex justify-end">
          <motion.span
            className="hidden font-mono-label text-[11px] text-white/40 md:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {ui.portfolioMeta}
          </motion.span>
        </div>

        <div className="hero-copy mt-7 max-w-[57%] md:mt-2 md:max-w-[47%] lg:max-w-[45%]">
          <motion.span
            className="mb-2 block font-body text-sm font-semibold uppercase tracking-[0.18em] text-white/70 md:text-base"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 10 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            {hero.intro}
          </motion.span>

          <VixaName ready={ready} />

          <motion.div
            className="hero-focus-row mt-5 flex items-center gap-3 md:mt-7"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 10 }}
            transition={{ duration: 0.8, delay: 1.05 }}
          >
            <span className="shrink-0 font-mono-label text-[11px] text-white/65 md:text-[12px]">
              {ui.focusOn}
            </span>
            <span className="min-w-0 font-heading text-[clamp(1.15rem,2.1vw,2rem)] font-black uppercase leading-none tracking-[-0.035em] text-white" data-testid="rotating-role">
              <RotatingRoles roles={hero.rotatingRoles} />
            </span>
          </motion.div>
        </div>

        <motion.div
          className="mt-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 1.35 }}
        >
          <button
            data-testid="hero-view-work"
            onClick={scrollToWork}
            className="pointer-events-auto glow-hover group flex w-fit items-center gap-3 rounded-full border border-white bg-white px-6 py-3 font-mono-label text-[11px] text-black hover:bg-white/90"
          >
            {hero.ctaPrimary}
            <ArrowDown size={14} className="transition-transform group-hover:translate-y-0.5" />
          </button>

          <div className="flex items-center gap-3">
            <span className="font-mono-label text-[10px] text-white/40">{ui.scroll}</span>
            <motion.span
              className="block h-8 w-px bg-white/40"
              animate={{ scaleY: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>

      <span className="hero-spline-accent" aria-hidden="true" />

      <motion.aside
        className="hero-social-rail pointer-events-auto absolute right-3 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-1 rounded-full border border-white/10 bg-black/50 p-1.5 backdrop-blur-xl sm:right-5 md:right-8"
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: ready ? 1 : 0, x: ready ? 0 : 18 }}
        transition={{ duration: 0.75, delay: 1.2 }}
        aria-label={ui.socialLinks || "Social links"}
      >
        <a href={socials.behance} target="_blank" rel="noreferrer noopener" aria-label="Behance" className="hero-social-link">
          <span className="hero-social-behance" aria-hidden="true">Bē</span>
        </a>
        <a href={socials.linkedin} target="_blank" rel="noreferrer noopener" aria-label="LinkedIn" className="hero-social-link">
          <Linkedin size={17} strokeWidth={2} />
        </a>
        <a href={`mailto:${meta.email}`} aria-label={ui.emailDirect || "Enviar correo"} className="hero-social-link">
          <Mail size={17} strokeWidth={2} />
        </a>
      </motion.aside>
    </section>
  );
}
