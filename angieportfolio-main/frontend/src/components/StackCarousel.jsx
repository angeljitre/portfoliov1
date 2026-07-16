import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";
import SmartVideo from "./SmartVideo";

const IMAGE_DELAY = 6000;
const MANUAL_PAUSE = 3600;

function circularOffset(itemIndex, activeIndex, length) {
  let offset = itemIndex - activeIndex;
  if (offset > length / 2) offset -= length;
  if (offset < -length / 2) offset += length;
  return offset;
}

function shortCategory(project, language) {
  if (project.id === "male") return language === "es" ? "VIDEOJUEGO" : "GAME";
  return project.category;
}

function cardMediaStyle(item) {
  const scale = Number(item?.cardScale) || 1;
  return {
    // Restores the pre-v26 3D-section framing: the card always crops to
    // fill (as in v23) instead of letterboxing, which is what removes any
    // chance of a black bar showing on odd-aspect stills or video frames.
    // Set an explicit `cardFit: "contain"` on an item if a specific piece
    // must never be cropped.
    objectFit: item?.cardFit || "cover",
    objectPosition: item?.cardPosition || "50% 50%",
    transform: scale === 1 ? undefined : `scale(${scale})`,
  };
}

export default function StackCarousel({ gallery, project, projectNumber }) {
  const { ui, language } = useLanguage();
  const items = useMemo(
    () => (gallery || []).map((item) => (typeof item === "string" ? { type: "image", src: item } : item)),
    [gallery],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [manualPause, setManualPause] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const manualTimer = useRef(null);
  const carouselRef = useRef(null);
  const inView = useInView(carouselRef, { amount: 0.22, margin: "160px 0px" });

  const active = items[activeIndex];
  const paused = hovered || manualPause || lightboxOpen || !inView;

  const advance = useCallback(() => {
    setActiveIndex((value) => (value + 1) % items.length);
  }, [items.length]);

  const retreat = useCallback(() => {
    setActiveIndex((value) => (value - 1 + items.length) % items.length);
  }, [items.length]);

  const pauseAfterManualAction = useCallback(() => {
    setManualPause(true);
    window.clearTimeout(manualTimer.current);
    manualTimer.current = window.setTimeout(() => setManualPause(false), MANUAL_PAUSE);
  }, []);

  const goNext = useCallback(() => {
    pauseAfterManualAction();
    advance();
  }, [advance, pauseAfterManualAction]);

  const goPrevious = useCallback(() => {
    pauseAfterManualAction();
    retreat();
  }, [pauseAfterManualAction, retreat]);

  useEffect(() => {
    if (!active || active.type === "video" || paused || items.length < 2) return undefined;
    const timer = window.setTimeout(advance, IMAGE_DELAY);
    return () => window.clearTimeout(timer);
  }, [active, activeIndex, advance, paused, items.length]);

  useEffect(() => () => window.clearTimeout(manualTimer.current), []);

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrevious();
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [goNext, goPrevious, lightboxOpen]);

  if (!items.length) return null;

  const lightbox = lightboxOpen && active ? (
    <AnimatePresence>
      <motion.div
        className="media-lightbox"
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setLightboxOpen(false)}
      >
        <button type="button" className="media-lightbox__close" onClick={() => setLightboxOpen(false)} aria-label={ui.close}>
          <X size={18} />
        </button>
        <button
          type="button"
          className="media-lightbox__arrow media-lightbox__arrow--left"
          onClick={(event) => { event.stopPropagation(); goPrevious(); }}
          aria-label={ui.previousView}
        >
          <ChevronLeft size={24} />
        </button>
        <motion.div
          key={`${active.src}-${activeIndex}`}
          className="media-lightbox__content media-glass"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          onClick={(event) => event.stopPropagation()}
        >
          {active.type === "video" ? (
            <SmartVideo
              src={active.src}
              poster={active.poster || project.image}
              active={lightboxOpen}
              autoPlay
              className="media-lightbox__video-wrap"
              videoClassName="media-lightbox__video"
              controlLabel={ui.playPauseVideo || "Reproducir o pausar video"}
            />
          ) : (
            <img
              src={active.src}
              alt={project.title}
              decoding="async"
              className="media-lightbox__image"
            />
          )}
        </motion.div>
        <button
          type="button"
          className="media-lightbox__arrow media-lightbox__arrow--right"
          onClick={(event) => { event.stopPropagation(); goNext(); }}
          aria-label={ui.nextView}
        >
          <ChevronRight size={24} />
        </button>
      </motion.div>
    </AnimatePresence>
  ) : null;

  return (
    <>
      <div
        ref={carouselRef}
        className="stack-carousel"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => setHovered(true)}
        onBlurCapture={() => setHovered(false)}
      >
        <div className="stack-carousel__stage">
          {items.map((item, index) => {
            const offset = circularOffset(index, activeIndex, items.length);
            const distance = Math.abs(offset);
            if (distance > 2) return null;
            const isActive = offset === 0;
            const poster = item.poster || project.image;

            return (
              <motion.div
                role="button"
                tabIndex={isActive ? 0 : -1}
                key={`${item.src}-${index}`}
                className={`media-glass stack-carousel__card ${isActive ? "stack-carousel__card--active" : ""}`}
                animate={{
                  x: `${offset * 8.7}%`,
                  y: distance * 10,
                  scale: 1 - distance * 0.052,
                  rotate: offset * 1.05,
                  opacity: distance === 0 ? 1 : distance === 1 ? 0.94 : 0.74,
                }}
                transition={{ duration: 0.64, ease: [0.22, 0.76, 0.32, 1] }}
                style={{ zIndex: 20 - distance }}
                onClick={() => {
                  if (isActive) setLightboxOpen(true);
                  else { pauseAfterManualAction(); setActiveIndex(index); }
                }}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  if (isActive) setLightboxOpen(true);
                  else { pauseAfterManualAction(); setActiveIndex(index); }
                }}
                aria-label={`${ui.viewNumber} ${index + 1}`}
              >
                {isActive && item.type === "video" ? (
                  <SmartVideo
                    src={item.src}
                    poster={poster}
                    active={!paused}
                    autoPlay
                    onEnded={advance}
                    className="absolute inset-0 h-full w-full"
                    videoClassName="stack-carousel__media"
                    videoStyle={cardMediaStyle(item)}
                    controlLabel={ui.playPauseVideo || "Reproducir o pausar video"}
                  />
                ) : (
                  <>
                    <img
                      src={item.type === "video" ? poster : item.src}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      className="stack-carousel__media-backdrop"
                    />
                    <img
                      src={item.type === "video" ? poster : item.src}
                      alt={project.title}
                      loading="lazy"
                      decoding="async"
                      fetchPriority={isActive && inView ? "high" : "low"}
                      className="stack-carousel__media"
                      style={cardMediaStyle(item)}
                    />
                  </>
                )}

                {isActive && (
                  <>
                    <div className="media-label-chip stack-carousel__category left-4 top-4">
                      0{projectNumber} · {item.label || shortCategory(project, language)}
                    </div>
                    <div className="media-label-chip stack-carousel__counter right-4 top-4">
                      {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                    </div>
                    {item.type !== "video" && (
                      <div className="stack-carousel__open-hint">{ui.clickToExpand || "Abrir"}</div>
                    )}
                  </>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="stack-carousel__controls">
          <button type="button" onClick={goPrevious} className="stack-carousel__arrow" aria-label={ui.previousView}>
            <ChevronLeft size={17} />
          </button>
          <div className="stack-carousel__dots">
            {items.map((_, index) => (
              <button
                type="button"
                key={index}
                onClick={() => { pauseAfterManualAction(); setActiveIndex(index); }}
                className={`stack-carousel__dot ${index === activeIndex ? "stack-carousel__dot--active" : ""}`}
                aria-label={`${ui.viewNumber} ${index + 1}`}
              />
            ))}
          </div>
          <button type="button" onClick={goNext} className="stack-carousel__arrow" aria-label={ui.nextView}>
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
      {typeof document !== "undefined" && lightbox ? createPortal(lightbox, document.body) : null}
    </>
  );
}
