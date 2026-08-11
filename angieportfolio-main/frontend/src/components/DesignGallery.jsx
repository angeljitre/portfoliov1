import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowUpRight, Play } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";
import HalftoneDecor from "./HalftoneDecor";
import SmartVideo from "./SmartVideo";
import { revealUp, cardReveal } from "../lib/motion";

// Justified rows (the Google Photos / Flickr technique): greedily fill a
// row until it reaches the container width at a nominal row height, then
// solve the row's *actual* height so every item's width (ratio × height)
// sums exactly back to the container width. Every card ends up exactly
// its own image's shape — never a quantized cell the image has to
// letterbox or crop into — and every row closes flush with zero gap.
// A trailing row that can't reach a full width on its own is dropped
// rather than stretched or left short, since not every asset has to be
// shown — a clean, fully justified board beats a complete but ragged one.
function buildJustifiedRows(items, containerWidth, rowHeight, gap) {
  if (!containerWidth) return [];
  const rows = [];
  let row = [];
  let ratioSum = 0;

  for (const item of items) {
    const ratio = item.w / item.h;
    row.push({ item, ratio });
    ratioSum += ratio;
    const widthAtNominal = ratioSum * rowHeight + (row.length - 1) * gap;
    if (widthAtNominal >= containerWidth) {
      const height = (containerWidth - (row.length - 1) * gap) / ratioSum;
      rows.push({ height, cards: row.map((r) => ({ item: r.item, width: r.ratio * height })) });
      row = [];
      ratioSum = 0;
    }
  }
  return rows;
}

function useElementWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  // Rounded, threshold-gated updates: ResizeObserver's contentRect and
  // getBoundingClientRect() can disagree by a sub-pixel fraction on the
  // same element, and without a guard that reads as a "real" width change
  // to React — triggering a full row re-layout (and a page-height shift)
  // moments after mount, which can cut short an in-progress smooth scroll
  // to a section further down the page. Rounding to whole pixels and
  // skipping no-op updates keeps the justified-row math stable once it's
  // already correct.
  const applyWidth = (next) => {
    const rounded = Math.round(next);
    setWidth((prev) => (prev === rounded ? prev : rounded));
  };

  // Synchronous initial measurement (covers browsers/environments where
  // ResizeObserver's guaranteed first callback doesn't fire before paint)
  // plus a plain window resize listener as a second fallback, on top of
  // ResizeObserver for live container-only resizes (e.g. sidebar toggles
  // that don't change window size).
  useLayoutEffect(() => {
    if (ref.current) applyWidth(ref.current.getBoundingClientRect().width);
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const measure = () => applyWidth(node.getBoundingClientRect().width);
    measure();

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) applyWidth(entry.contentRect.width);
    });
    observer.observe(node);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return [ref, width];
}

// Approved-layout exception: for the two flagged items only (g19, g26),
// zoom the media past its own box and let overflow-hidden on the card
// crop it evenly on all sides — card size/position stay exactly as the
// justified-row layout computed them, only the media inside scales up.
const SCALE_FILL_STYLE = {
  position: "absolute",
  top: "-12%",
  left: "-12%",
  width: "124%",
  height: "124%",
  maxWidth: "none",
  maxHeight: "none",
  objectFit: "cover",
};

function GalleryCard({ item, ui, onOpen, index = 0 }) {
  return (
    <motion.div
      data-testid={`design-item-${item.id}`}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onOpen();
      }}
      className="deferred-paint-item media-glass group relative block cursor-pointer overflow-hidden border border-white/10 text-left"
      style={{ width: "100%", height: "100%" }}
      {...cardReveal(index, { y: 18, duration: 0.5 })}
      aria-label={item.alt || ui.openImage}
    >
      {item.type === "video" ? (
        <SmartVideo
          src={item.video}
          poster={item.poster}
          autoPlay
          loop
          flush
          className="absolute inset-0 h-full w-full"
          videoClassName="h-full w-full"
          videoStyle={item.scaleFill ? SCALE_FILL_STYLE : { objectFit: "contain" }}
          controlLabel={ui.playPauseVideo || "Reproducir o pausar video"}
        />
      ) : (
        <img
          src={item.image}
          alt={item.alt || ""}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          className="block h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.015]"
          style={item.scaleFill ? SCALE_FILL_STYLE : undefined}
        />
      )}
      <span className="media-label-chip bottom-3 left-3">{item.category}</span>
      <span className="media-icon-chip absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full transition-all duration-300 group-hover:scale-105">
        {item.type === "video" ? <Play size={12} fill="currentColor" /> : <ArrowUpRight size={13} />}
      </span>
    </motion.div>
  );
}

export default function DesignGallery() {
  const { content: siteContent, ui } = useLanguage();
  const { designGallery } = siteContent;
  const [openId, setOpenId] = useState(null);
  const openItem = designGallery.items.find((item) => item.id === openId);
  const [containerRef, containerWidth] = useElementWidth();

  const rowHeight = Math.max(160, Math.min(320, containerWidth * 0.25));
  const gap = containerWidth < 640 ? 8 : 12;
  const rows = useMemo(
    () => buildJustifiedRows(designGallery.items, containerWidth, rowHeight, gap),
    [designGallery.items, containerWidth, rowHeight, gap],
  );

  const close = () => setOpenId(null);

  useEffect(() => {
    if (!openId) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => event.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [openId]);

  return (
    <section
      id="design-gallery"
      data-testid="section-design-gallery"
      className="relative scroll-mt-32 overflow-hidden border-t border-white/5 py-24 md:py-40"
    >
      <HalftoneDecor variant="design" intensity="strong" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-10">
        <div className="mb-14 flex items-end justify-between gap-4">
          <span className="font-mono-label text-[11px] text-white/40">{designGallery.label}</span>
          <span className="font-mono-label text-[11px] text-white/40">{ui.clickToExpand}</span>
        </div>

        <motion.h2
          {...revealUp()}
          className="mb-14 max-w-3xl font-heading text-4xl uppercase tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
        >
          {designGallery.heading}
        </motion.h2>

        {/* Justified-row gallery — see buildJustifiedRows above. Stagger is
            per-column-within-row (not global index) so every row's cascade
            restarts left-to-right instead of drifting later with each row. */}
        <div ref={containerRef} className="justified-gallery" style={{ gap }}>
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="justified-row" style={{ gap, height: row.height }}>
              {row.cards.map(({ item, width }, colIndex) => (
                <div key={item.id} style={{ width, height: row.height, flexShrink: 0 }}>
                  <GalleryCard item={item} ui={ui} onOpen={() => setOpenId(item.id)} index={colIndex} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {typeof document !== "undefined" && openId && openItem
        ? createPortal(
            <AnimatePresence>
              <motion.div
                key="design-lightbox-root"
                data-testid="lightbox"
                role="dialog"
                aria-modal="true"
                className="media-lightbox design-lightbox"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={close}
              >
                <button
                  type="button"
                  data-testid="lightbox-close"
                  onClick={(event) => { event.stopPropagation(); close(); }}
                  aria-label={ui.close}
                  className="media-lightbox__close"
                >
                  <X size={16} />
                </button>
                {openItem.type === "video" ? (
                  <motion.div
                    className="media-lightbox__content media-glass"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <SmartVideo
                      src={openItem.video}
                      poster={openItem.poster}
                      active={!!openId}
                      autoPlay
                      loop
                      className="media-lightbox__video-wrap"
                      videoClassName="media-lightbox__video"
                      controlLabel={ui.playPauseVideo || "Reproducir o pausar video"}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    className="media-lightbox__content media-lightbox__content--image"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <img src={openItem.image} alt={openItem.alt || ""} decoding="async" className="media-lightbox__image" />
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>,
            document.body,
          )
        : null}
    </section>
  );
}
