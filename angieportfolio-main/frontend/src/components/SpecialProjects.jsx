import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useInView,
} from "framer-motion";
import { Plus, X, ArrowUpRight, ChevronLeft, ChevronRight, BookOpen, ExternalLink } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";
import { useTheme } from "../hooks/useTheme";
import { getProjectLogo, getSoftwareLogo } from "../lib/logoAssets";
import HalftoneDecor from "./HalftoneDecor";
import CyberDecor from "./CyberDecor";
import SmartVideo from "./SmartVideo";

// Shared tool monogram lookup
const TOOL_MONO = {
  ZBrush: "Zb",
  Maya: "Ma",
  "Marvelous Designer": "Md",
  "Substance 3D Painter": "Sp",
  Blender: "Bl",
  Canva: "Cv",
  Figma: "Fg",
  Framer: "Fr",
  "Adobe Creative Cloud": "Ai",
  CapCut: "Cc",
  "After Effects": "Ae",
};

function ToolBadge({ name }) {
  const mono = TOOL_MONO[name] || name.slice(0, 2);
  const logo = getSoftwareLogo(name);
  return (
    <span
      title={name}
      className="glow-hover grid h-9 w-9 place-items-center rounded-md border border-white/15 bg-white/[0.03] font-heading text-[11px] font-semibold uppercase tracking-tight text-white/85 transition-all hover:border-white hover:bg-white/10 hover:text-white"
    >
      {logo ? (
        <img src={logo} alt={name} loading="lazy" decoding="async" fetchPriority="low" className="tool-logo h-5 w-5 object-contain" />
      ) : (
        mono
      )}
    </span>
  );
}

// ============ Accordion variants ============
const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.7, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    y: 12,
    transition: { duration: 0.3, ease: [0.7, 0, 0.2, 1] },
  },
};

// Header meta: combines studio+team, subtitle, and institution as needed.
function ProjectMeta({ p }) {
  const { ui } = useLanguage();
  const hasStudioTeam = p.studio && p.team;
  const hasSubtitle = !!p.subtitle;
  const hasInstitution = !!p.institution;
  if (!hasStudioTeam && !hasSubtitle && !hasInstitution) return null;

  return (
    <div className="project-meta mt-6 space-y-5 border-y border-white/10 py-5">
      {hasStudioTeam && (
        <div className="project-meta__grid grid grid-cols-2 gap-x-7 gap-y-2">
          <span className="font-mono-label text-white/45">{ui.studio}</span>
          <span className="font-mono-label text-white/45">{ui.team}</span>
          <p className="font-body text-base text-white/90">{p.studio}</p>
          <p className="font-body text-base text-white/90">{p.team}</p>
        </div>
      )}
      {hasSubtitle && (
        <div>
          <span className="font-mono-label text-white/45">{ui.type}</span>
          <p className="mt-2 font-body text-base uppercase tracking-wider text-white/90">
            {p.subtitle}
          </p>
        </div>
      )}
      {hasInstitution && (
        <div>
          <span className="font-mono-label text-white/45">{ui.institution}</span>
          <p className="mt-2 font-body text-base text-white/90">{p.institution}</p>
        </div>
      )}
    </div>
  );
}

// Magnetic title — subtle cursor-follow on desktop pointers only.
function MagneticTitle({ children }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [hovering, setHovering] = useState(false);
  const xSp = useSpring(x, { stiffness: 160, damping: 18, mass: 0.4 });
  const ySp = useSpring(y, { stiffness: 160, damping: 18, mass: 0.4 });

  const handleMove = (e) => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none)").matches
    )
      return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left - rect.width / 2;
    const cy = e.clientY - rect.top - rect.height / 2;
    // Small magnetic pull — max ~10px
    x.set((cx / rect.width) * 14);
    y.set((cy / rect.height) * 10);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
    setHovering(false);
  };

  return (
    <motion.h3
      onMouseMove={handleMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={handleLeave}
      style={{ x: xSp, y: ySp }}
      animate={{
        letterSpacing: hovering ? "0.005em" : "-0.02em",
        filter: hovering ? "blur(0.3px)" : "blur(0px)",
      }}
      transition={{ duration: 0.5, ease: [0.7, 0, 0.2, 1] }}
      className="font-heading uppercase leading-[0.95] tracking-tight text-white text-balance text-[clamp(1.75rem,4vw,3.25rem)] will-change-transform [word-break:normal] [overflow-wrap:normal] [hyphens:none]"
    >
      {children}
    </motion.h3>
  );
}

function AdaptiveImage({ src, alt = "", className = "", contentClassName = "", priority = false }) {
  return (
    <div className={`adaptive-media-frame ${className}`}>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="adaptive-media-frame__backdrop"
      />
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "low"}
        className={`adaptive-media-frame__content ${contentClassName}`}
      />
    </div>
  );
}

// UNACH variations remain separate cards, centered as a single group.
function VariationsGallery({ variations, projectId }) {
  const { ui } = useLanguage();
  const [openId, setOpenId] = useState(null);
  const openItem = variations.find((v) => v.id === openId);

  useEffect(() => {
    if (!openId) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => event.key === "Escape" && setOpenId(null);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [openId]);

  return (
    <>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-3 md:gap-6">
        {variations.map((variation, index) => (
          <motion.div key={variation.id} variants={ITEM_VARIANTS} className="deferred-paint-item min-w-0">
            <button
              type="button"
              data-testid={`${projectId}-variation-${index}`}
              onClick={() => setOpenId(variation.id)}
              className="media-glass group relative block aspect-[3/4] w-full overflow-hidden border border-white/10"
              aria-label={`${ui.openVariation} ${index + 1}`}
            >
              <AdaptiveImage
                src={variation.image}
                alt={variation.label || ""}
                className="absolute inset-0"
                contentClassName="transition-transform duration-700 ease-out group-hover:scale-[1.025]"
              />
              <div className="pointer-events-none absolute inset-0 halftone opacity-[0.09] mix-blend-overlay" />
              <span className="media-icon-chip absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full transition-all duration-300 group-hover:scale-105">
                <ArrowUpRight size={12} />
              </span>
              <span className="media-label-chip bottom-2 left-2">
                {variation.final ? variation.label : `0${index + 1}`}
              </span>
            </button>
            {!variation.final && variation.label && (
              <p className="mt-3 text-center font-mono-label text-[10px] text-white/48">{variation.label}</p>
            )}
          </motion.div>
        ))}
      </div>

      {typeof document !== "undefined" && openId && openItem
        ? createPortal(
            <AnimatePresence>
              <motion.div
                data-testid={`${projectId}-variation-lightbox`}
                role="dialog"
                aria-modal="true"
                className="media-lightbox"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setOpenId(null)}
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenId(null);
                  }}
                  aria-label={ui.close}
                  className="media-lightbox__close"
                >
                  <X size={16} />
                </button>
                <motion.div
                  className="media-lightbox__content media-lightbox__content--image"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  onClick={(event) => event.stopPropagation()}
                >
                  <img src={openItem.image} alt={openItem.label || ""} decoding="async" className="media-lightbox__image" />
                </motion.div>
              </motion.div>
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}

function BookState({ state }) {
  if (!state) return null;
  if (state.type === "spread") {
    return (
      <div className="artbook-book__spread">
        <img src={state.left} alt="Página izquierda" draggable="false" className="artbook-book__page artbook-book__page--left" />
        <img src={state.right} alt="Página derecha" draggable="false" className="artbook-book__page artbook-book__page--right" />
      </div>
    );
  }
  return (
    <div className="artbook-book__single">
      <img src={state.image} alt={state.type === "cover" ? "Portada" : "Contraportada"} draggable="false" className="artbook-book__page" />
    </div>
  );
}

function ArtbookPreview({ config, projectId }) {
  const { ui } = useLanguage();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState(null);
  const turnTimerRef = useRef(null);

  const states = [
    { type: "cover", image: config.cover },
    ...(config.spreads || []).map((spread, spreadIndex) => ({
      type: "spread",
      left: spread.left,
      right: spread.right,
      number: spreadIndex + 1,
    })),
    { type: "back", image: config.backCover },
  ].filter((state) => state.image || (state.left && state.right));

  const current = states[index];

  const move = useCallback((step) => {
    if (turn || states.length < 2) return;
    const target = Math.max(0, Math.min(states.length - 1, index + step));
    if (target === index) return;
    setTurn({ step, target, from: states[index], to: states[target] });
    window.clearTimeout(turnTimerRef.current);
    turnTimerRef.current = window.setTimeout(() => {
      setIndex(target);
      setTurn(null);
    }, 720);
  }, [index, states, turn]);

  useEffect(() => () => window.clearTimeout(turnTimerRef.current), []);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowRight") move(1);
      if (event.key === "ArrowLeft") move(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [move, open]);

  useEffect(() => {
    if (!open || !states.length) return;
    [index - 1, index + 1].forEach((candidate) => {
      const state = states[candidate];
      if (!state) return;
      [state.image, state.left, state.right].filter(Boolean).forEach((src) => {
        const image = new Image();
        image.src = src;
      });
    });
  }, [index, open, states]);

  const turningBase = (() => {
    if (!turn || turn.from.type !== "spread" || turn.to.type !== "spread") return turn?.to || current;
    if (turn.step > 0) {
      return { type: "spread", left: turn.from.left, right: turn.to.right };
    }
    return { type: "spread", left: turn.to.left, right: turn.from.right };
  })();

  const turnFront = turn
    ? turn.step > 0
      ? turn.from.right || turn.from.image
      : turn.from.left || turn.from.image
    : null;
  const turnBack = turn
    ? turn.step > 0
      ? turn.to.left || turn.to.image
      : turn.to.right || turn.to.image
    : null;

  return (
    <>
      <motion.div variants={ITEM_VARIANTS} className="artbook-preview mt-16">
        <div className="grid items-center gap-7 md:grid-cols-[minmax(0,1.25fr)_minmax(16rem,.75fr)] md:gap-10">
          <button
            type="button"
            onClick={() => { setIndex(0); setTurn(null); setOpen(true); }}
            className="media-glass group relative overflow-hidden border border-white/10 text-left"
            aria-label={config.title}
          >
            <AdaptiveImage
              src={config.cover}
              alt={config.title}
              className="aspect-[3/2] w-full"
              contentClassName="transition-transform duration-700 group-hover:scale-[1.015]"
            />
            <div className="pointer-events-none absolute inset-0 halftone opacity-[0.08] mix-blend-overlay" />
            <span className="media-icon-chip absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full">
              <BookOpen size={15} />
            </span>
          </button>
          <div>
            <span className="font-mono-label text-[10px] text-white/45">ARTBOOK / PREVIEW</span>
            <h4 className="mt-3 font-heading text-2xl uppercase tracking-tight text-white md:text-4xl">{config.title}</h4>
            <p className="mt-4 font-body text-sm leading-relaxed text-white/65 md:text-base">{config.note}</p>
            <button
              type="button"
              onClick={() => { setIndex(0); setTurn(null); setOpen(true); }}
              className="glow-hover mt-6 inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/5 px-5 py-3 font-mono-label text-[10px] text-white hover:border-white"
            >
              {config.title} <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
      </motion.div>

      {typeof document !== "undefined" && open
        ? createPortal(
            <AnimatePresence>
              <motion.div
                data-testid={`${projectId}-artbook-lightbox`}
                role="dialog"
                aria-modal="true"
                className="media-lightbox artbook-lightbox"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
              >
                <button type="button" className="media-lightbox__close" onClick={() => setOpen(false)} aria-label={ui.close}>
                  <X size={18} />
                </button>
                <button
                  type="button"
                  className="media-lightbox__arrow media-lightbox__arrow--left"
                  onClick={(event) => { event.stopPropagation(); move(-1); }}
                  aria-label={ui.previousView}
                  disabled={index === 0 || !!turn}
                >
                  <ChevronLeft size={24} />
                </button>

                <div className="artbook-book" onClick={(event) => event.stopPropagation()} onContextMenu={(event) => event.preventDefault()}>
                  <BookState state={turn ? turningBase : current} />
                  {turn && turnFront && turnBack && (
                    <div className={`artbook-book__turn artbook-book__turn--${turn.step > 0 ? "forward" : "backward"}`}>
                      <img src={turnFront} alt="" draggable="false" className="artbook-book__turn-face artbook-book__turn-face--front" />
                      <img src={turnBack} alt="" draggable="false" className="artbook-book__turn-face artbook-book__turn-face--back" />
                    </div>
                  )}
                  <span className="artbook-lightbox__counter font-mono-label">
                    {String(index + 1).padStart(2, "0")} / {String(states.length).padStart(2, "0")}
                  </span>
                </div>

                <button
                  type="button"
                  className="media-lightbox__arrow media-lightbox__arrow--right"
                  onClick={(event) => { event.stopPropagation(); move(1); }}
                  aria-label={ui.nextView}
                  disabled={index === states.length - 1 || !!turn}
                >
                  <ChevronRight size={24} />
                </button>
              </motion.div>
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}

function ExpandableCard({ p, i }) {
  const { ui } = useLanguage();
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const projectLogo = getProjectLogo(p.id, theme);

  const videoConfig = p.artbookVideo || p.videoMapping;
  const videoSrc =
    videoConfig &&
    (videoConfig.src && !videoConfig.src.startsWith("INSERT_")
      ? videoConfig.src
      : videoConfig.fallback);

  return (
    <motion.article
      data-testid={`special-project-${p.id}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.8, ease: [0.7, 0, 0.2, 1] }}
      className="special-project-card relative mx-auto max-w-7xl overflow-visible border-t border-white/10 px-5 py-16 md:px-10 md:py-24"
    >
      <CyberDecor variant={`specialRow${i % 4}`} />

      {/* Collapsed grid — staggered entrance */}
      <motion.div
        variants={CONTAINER_VARIANTS}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-15%" }}
        className="relative z-10 grid grid-cols-12 gap-6 md:gap-10"
      >
        <motion.div
          variants={ITEM_VARIANTS}
          className="col-span-12 min-w-0 md:col-span-5 lg:col-span-4"
        >
          <span className="font-mono-label text-[10px] text-white/40">
            {ui.project} / 0{i + 1}
          </span>
          <div className="project-logo-frame mt-4">
            {projectLogo ? (
              <img
                src={projectLogo}
                alt={p.title}
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                className="project-title-logo"
              />
            ) : (
              <MagneticTitle>{p.title}</MagneticTitle>
            )}
          </div>

          <ProjectMeta p={p} />

          <p className="mt-6 max-w-md font-body text-base leading-relaxed text-white/60 md:text-lg">
            {p.description}
          </p>

          {p.officialPost && (
            <a
              href={p.officialPost.url}
              target="_blank"
              rel="noreferrer noopener"
              data-testid={`special-project-${p.id}-official-post`}
              className="official-post group mt-7"
            >
              <span className="official-post__tag" aria-hidden="true">
                {ui.officialPostTag || "PRESS"}
              </span>
              <span className="official-post__label">
                {p.officialPost.label}
                <span className="official-post__rule" aria-hidden="true" />
              </span>
              <span className="official-post__icon" aria-hidden="true">
                <ExternalLink size={14} />
              </span>
            </a>
          )}

          <button
            type="button"
            data-testid={`special-project-${p.id}-toggle`}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="glow-hover mt-8 inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/5 px-6 py-3 font-mono-label text-[11px] text-white hover:border-white"
          >
            <motion.span
              key={open ? "less" : "more"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {open ? ui.viewLess : ui.viewMore}
            </motion.span>
            <motion.span
              animate={{ rotate: open ? 135 : 0 }}
              transition={{ duration: 0.5, ease: [0.7, 0, 0.2, 1] }}
              className="inline-flex"
            >
              <Plus size={14} />
            </motion.span>
          </button>
        </motion.div>

        <motion.div
          variants={ITEM_VARIANTS}
          className="col-span-12 md:col-span-7 lg:col-span-8"
        >
          <div
            className={`media-glass special-image-float special-image-float--${(i % 3) + 1} relative aspect-[16/11] w-full overflow-hidden border border-white/10`}
          >
            <AdaptiveImage
              src={p.image}
              alt={p.title}
              className="absolute inset-0"
              contentClassName="transition-transform duration-1000 ease-out hover:scale-[1.025]"
            />
            <div className="pointer-events-none absolute inset-0 halftone opacity-[0.09] mix-blend-overlay" />
            <div className="absolute left-4 top-4 font-mono-label text-[10px] text-white/70">
              {p.period || "—"}
            </div>
            <div className="absolute bottom-4 right-4 font-mono-label text-[10px] text-white/70">
              +
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key={`${p.id}-expanded`}
            data-testid={`special-project-${p.id}-expanded`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.7, ease: [0.7, 0, 0.2, 1] },
              opacity: { duration: 0.4, ease: [0.7, 0, 0.2, 1] },
            }}
            className="relative z-10 overflow-hidden"
          >
            <motion.div
              variants={CONTAINER_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="pt-14"
            >
              {/* Roles + Tools + Contribution */}
              <div className="grid grid-cols-12 gap-6 md:gap-10">
                <motion.div
                  variants={ITEM_VARIANTS}
                  className="col-span-12 md:col-span-5 lg:col-span-4"
                >
                  {p.roles && p.roles.length > 0 && (
                    <div>
                      <span className="font-mono-label text-[10px] text-white/40">
                        {ui.myRoles}
                      </span>
                      <motion.div
                        variants={CONTAINER_VARIANTS}
                        className="mt-3 flex flex-wrap gap-2"
                      >
                        {p.roles.map((r) => (
                          <motion.span
                            key={r}
                            variants={ITEM_VARIANTS}
                            className="rounded-full border border-white/20 px-3 py-1 font-mono-label text-[10px] text-white/80"
                          >
                            {r}
                          </motion.span>
                        ))}
                      </motion.div>
                    </div>
                  )}

                  <div className="mt-8">
                    <span className="font-mono-label text-[10px] text-white/40">
                      {ui.tools}
                    </span>
                    {p.tools && p.tools.length > 0 ? (
                      <motion.div
                        variants={CONTAINER_VARIANTS}
                        className="mt-3 flex flex-wrap gap-2"
                      >
                        {p.tools.map((t) => (
                          <motion.span key={t} variants={ITEM_VARIANTS}>
                            <ToolBadge name={t} />
                          </motion.span>
                        ))}
                      </motion.div>
                    ) : (
                      <p className="mt-3 rounded-md border border-dashed border-white/15 px-3 py-2 font-mono-label text-[10px] text-white/40">
                        {p.toolsPlaceholder || "INSERT_TOOLS_HERE"}
                      </p>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  variants={ITEM_VARIANTS}
                  className="col-span-12 md:col-span-7 lg:col-span-8"
                >
                  <span className="font-mono-label text-[10px] text-white/40">
                    {ui.myContribution}
                  </span>
                  <p className="mt-3 max-w-2xl font-body text-base leading-relaxed text-white/75 md:text-lg">
                    {p.contribution}
                  </p>
                </motion.div>
              </div>

              {/* Project media cards */}
              {p.imageBlocks && (
                <motion.div
                  variants={CONTAINER_VARIANTS}
                  className={`mt-14 grid grid-cols-1 gap-6 md:gap-8 ${p.imageBlocks.length === 2 || p.imageBlocks.some((block) => block.wideMedia) ? "md:grid-cols-2" : "md:grid-cols-3"}`}
                >
                  {p.imageBlocks.map((b, bi) => (
                    <motion.div key={b.id} variants={ITEM_VARIANTS} className={`deferred-paint-item ${b.wideMedia ? "md:col-span-2" : ""}`}>
                      <div className={`special-image-float special-image-float--${(bi % 3) + 1}`}>
                        <div className={`media-glass group relative w-full overflow-hidden border border-white/10 transition-all duration-700 hover:border-white/30 ${b.wideMedia ? "aspect-[16/7]" : "aspect-[4/5]"}`}>
                          {b.type === "video" ? (
                            <SmartVideo
                              src={b.src}
                              poster={b.poster}
                              autoPlay
                              loop
                              className="absolute inset-0 h-full w-full"
                              videoClassName="h-full w-full"
                              videoStyle={{ objectFit: b.mediaFit || "cover", objectPosition: "center" }}
                              controlLabel={ui.playPauseVideo || "Reproducir o pausar video"}
                            />
                          ) : (
                            <AdaptiveImage
                              src={b.image}
                              alt={b.title}
                              className="absolute inset-0"
                              contentClassName="transition-transform duration-1000 ease-out group-hover:scale-[1.025]"
                            />
                          )}
                          <div className="pointer-events-none absolute inset-0 halftone opacity-[0.09] mix-blend-overlay" />
                          <div className="media-label-chip left-3 top-3">0{bi + 1}</div>
                        </div>
                      </div>
                      <h4 className="mt-4 font-heading text-lg uppercase tracking-tight text-white">{b.title}</h4>
                      <p className="mt-2 font-body text-sm leading-relaxed text-white/60">{b.text}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Bashequen teaser as an editorial feature block. */}
              {p.teaserVideo && (
                <motion.div variants={ITEM_VARIANTS} className="teaser-feature mt-16 border-y border-white/10 py-10 md:py-14">
                  <div className="grid items-center gap-8 md:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] md:gap-12">
                    <div>
                      <span className="font-mono-label text-[10px] text-white/45">{p.teaserVideo.eyebrow}</span>
                      <h4 className="mt-4 font-heading text-3xl uppercase tracking-tight text-white md:text-5xl">{p.teaserVideo.title}</h4>
                      <p className="mt-5 max-w-xl font-body text-sm leading-relaxed text-white/70 md:text-base">{p.teaserVideo.description}</p>
                      <p className="mt-4 max-w-xl font-body text-sm leading-relaxed text-white/55">{p.teaserVideo.collaboration}</p>
                      <span className="mt-6 inline-flex rounded-full border border-white/20 bg-white/[0.04] px-4 py-2 font-mono-label text-[10px] leading-relaxed text-white/78">
                        {p.teaserVideo.status}
                      </span>
                    </div>
                    <div data-testid={`special-project-${p.id}-video`} className="media-glass relative aspect-video w-full overflow-hidden border border-white/10">
                      <SmartVideo
                        src={p.teaserVideo.src}
                        poster={p.teaserVideo.poster}
                        autoPlay
                        loop
                        className="h-full w-full"
                        videoClassName="h-full w-full object-contain"
                        controlLabel={ui.playPauseVideo || "Reproducir o pausar video"}
                      />
                      <div className="pointer-events-none absolute inset-0 halftone opacity-[0.08] mix-blend-overlay" />
                    </div>
                  </div>
                </motion.div>
              )}

              {!p.teaserVideo && videoConfig && (
                <motion.div variants={ITEM_VARIANTS} className="mt-16">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="font-mono-label text-[10px] text-white/45">{videoConfig.title || ui.videomapping || "Video"}</span>
                    <span className="h-px flex-1 bg-white/10" />
                  </div>
                  <div data-testid={`special-project-${p.id}-video`} className="media-glass relative aspect-video w-full overflow-hidden border border-white/10">
                    <SmartVideo
                      src={videoSrc}
                      poster={videoConfig.poster}
                      autoPlay
                      loop
                      className="h-full w-full"
                      videoClassName="h-full w-full object-contain"
                      controlLabel={ui.playPauseVideo || "Reproducir o pausar video"}
                    />
                  </div>
                </motion.div>
              )}

              {p.artbookPreview && (
                <ArtbookPreview config={p.artbookPreview} projectId={p.id} />
              )}

              {/* Three-card project gallery (image / video / image supported) */}
              {p.gallery && p.gallery.length > 0 && (
                <motion.div
                  variants={CONTAINER_VARIANTS}
                  className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-3"
                >
                  {p.gallery.map((g, gi) => (
                    <motion.div key={g.id} variants={ITEM_VARIANTS} className="deferred-paint-item">
                      <div className={`special-image-float special-image-float--${(gi % 3) + 1}`}>
                        <div className="media-glass relative aspect-[4/5] overflow-hidden border border-white/10">
                          {g.type === "video" ? (
                            <SmartVideo
                              src={g.src}
                              poster={g.poster}
                              autoPlay
                              loop
                              className="absolute inset-0 h-full w-full"
                              videoClassName="h-full w-full"
                              videoStyle={{ objectFit: g.mediaFit || "contain", objectPosition: "center" }}
                              controlLabel={ui.playPauseVideo || "Reproducir o pausar video"}
                            />
                          ) : (
                            <AdaptiveImage
                              src={g.image}
                              alt={g.title || ""}
                              className="absolute inset-0"
                              contentClassName="transition-transform duration-700 hover:scale-[1.025]"
                            />
                          )}
                          <div className="pointer-events-none absolute inset-0 halftone opacity-15 mix-blend-overlay" />
                          <span className="media-label-chip bottom-2 left-2">0{gi + 1} · {g.title}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Compact variations gallery (UNACH) */}
              {p.variations && p.variations.length > 0 && (
                <motion.div variants={CONTAINER_VARIANTS} className="mt-14">
                  <span className="font-mono-label text-[10px] text-white/40">
                    {ui.variations}
                  </span>
                  <div className="mt-4">
                    <VariationsGallery
                      variations={p.variations}
                      projectId={p.id}
                    />
                  </div>
                </motion.div>
              )}

              <motion.div
                variants={ITEM_VARIANTS}
                className="mt-8 flex justify-end"
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  data-testid={`special-project-${p.id}-close`}
                  className="glow-hover inline-flex items-center gap-2 font-mono-label text-[11px] text-white/60 hover:text-white"
                  aria-label={ui.collapse}
                >
                  {ui.collapse} <X size={12} />
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

export default function SpecialProjects() {
  const { content: siteContent, ui } = useLanguage();
  const { specialProjects } = siteContent;
  const sectionRef = useRef(null);
  const isVisible = useInView(sectionRef, { amount: 0.02, margin: "180px 0px" });
  return (
    <section
      ref={sectionRef}
      id="special-projects"
      data-testid="section-special-projects"
      className={`relative overflow-hidden border-t border-white/5 py-24 md:py-32 ${isVisible ? "viewport-active" : "viewport-paused"}`}
    >
      <HalftoneDecor variant="special" intensity="strong" />
      <CyberDecor variant="special" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-10">
        <div className="mb-14 flex items-end justify-between">
          <span className="font-mono-label text-[11px] text-white/40">
            {specialProjects.label}
          </span>
          <span className="font-mono-label text-[11px] text-white/40">
            {ui.selectedCollaborations}
          </span>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease: [0.7, 0, 0.2, 1] }}
          className="section-title max-w-5xl font-heading uppercase tracking-tight text-white"
        >
          {specialProjects.heading}
        </motion.h2>
      </div>

      {specialProjects.items.map((p, i) => (
        <ExpandableCard key={p.id} p={p} i={i} />
      ))}
    </section>
  );
}
