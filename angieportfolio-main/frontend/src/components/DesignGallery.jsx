import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowUpRight } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";
import HalftoneDecor from "./HalftoneDecor";
import CyberDecor from "./CyberDecor";

// v27 — manual, hand-placed composition (not a generic repeating pattern).
// Each span is chosen from the real dimensions of the file it sits on top
// of, in the exact order the pieces are listed in siteContent.js, so the
// column/row footprint roughly matches each piece's own aspect ratio:
//   - wide banners (4:1 / 2:1 / ~1.8:1) get a full-width or half-width,
//     short band.
//   - tall portrait posters/invitations get a narrow, tall cell.
//   - the square tote mockup gets a square cell.
// Combined with [grid-auto-flow:dense] this keeps the irregular editorial
// masonry rhythm while avoiding large empty cells, and — together with the
// object-fit fix in index.css — the adaptive blurred background only has
// to bridge a small gap instead of covering most of the cell.
const COLLAGE_LAYOUT = [
  "col-span-4 row-span-1 lg:col-span-12 lg:row-span-2",  // d15 banner-personal (4:1 wide)
  "col-span-2 row-span-3 lg:col-span-3 lg:row-span-4",   // d2  poster-detras-colores (tall)
  "col-span-2 row-span-3 lg:col-span-3 lg:row-span-4",   // d3  poster-bashequen (tall)
  "col-span-2 row-span-2 lg:col-span-3 lg:row-span-3",   // d4  tote-bag-mockup (square)
  "col-span-4 row-span-2 lg:col-span-6 lg:row-span-3",   // d16 banner-videomapping (2:1)
  "col-span-2 row-span-3 lg:col-span-3 lg:row-span-4",   // d6  invitation-erika-andres (tall)
  "col-span-2 row-span-3 lg:col-span-3 lg:row-span-4",   // d7  invitation-wendy-beth (tall)
  "col-span-2 row-span-3 lg:col-span-2 lg:row-span-3",   // d8  menu-sweet-angel (very tall/narrow)
  "col-span-4 row-span-2 lg:col-span-6 lg:row-span-4",   // d1  tote-bags-lifestyle (landscape)
  "col-span-2 row-span-2 lg:col-span-3 lg:row-span-3",   // d9  poster-dia-mariachi
  "col-span-2 row-span-2 lg:col-span-3 lg:row-span-3",   // d10 poster-inah
  "col-span-2 row-span-2 lg:col-span-3 lg:row-span-3",   // d11 poster-aviso-aspirantes
  "col-span-4 row-span-2 lg:col-span-6 lg:row-span-3",   // d17 banner-character (~1.8:1)
  "col-span-2 row-span-2 lg:col-span-3 lg:row-span-3",   // d12 poster-feliz-cumple
  "col-span-2 row-span-2 lg:col-span-3 lg:row-span-3",   // d13 poster-ventajas-unach
  "col-span-2 row-span-2 lg:col-span-3 lg:row-span-3",   // d14 poster-posadas
  "col-span-4 row-span-2 lg:col-span-12 lg:row-span-3",  // d5  quote-chulel (closing wide band)
];

export default function DesignGallery() {
  const { content: siteContent, ui } = useLanguage();
  const { designGallery } = siteContent;
  const [openId, setOpenId] = useState(null);
  const openItem = designGallery.items.find((item) => item.id === openId);

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
      className="relative overflow-hidden border-t border-white/5 py-24 md:py-40"
    >
      <HalftoneDecor variant="design" intensity="strong" />
      <CyberDecor variant="design" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-10">
        <div className="mb-14 flex items-end justify-between gap-4">
          <span className="font-mono-label text-[11px] text-white/40">{designGallery.label}</span>
          <span className="font-mono-label text-[11px] text-white/40">{ui.clickToExpand}</span>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease: [0.7, 0, 0.2, 1] }}
          className="mb-14 max-w-3xl font-heading text-4xl uppercase tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
        >
          {designGallery.heading}
        </motion.h2>

        <div className="design-collage-grid grid auto-rows-[72px] grid-cols-4 gap-2 [grid-auto-flow:dense] sm:auto-rows-[84px] md:gap-3 lg:auto-rows-[94px] lg:grid-cols-12">
          {designGallery.items.map((item, index) => (
            <motion.button
              key={item.id}
              data-testid={`design-item-${item.id}`}
              onClick={() => setOpenId(item.id)}
              className={`deferred-paint-item media-glass group relative min-h-0 min-w-0 overflow-hidden border border-white/10 text-left ${COLLAGE_LAYOUT[index] || "col-span-2 row-span-2 lg:col-span-4 lg:row-span-2"}`}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.58, delay: (index % 4) * 0.045, ease: [0.7, 0, 0.2, 1] }}
              aria-label={`${ui.openImage} ${index + 1}`}
            >
              <div className="adaptive-media-frame absolute inset-0">
                <img
                  src={item.image}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="adaptive-media-frame__backdrop"
                />
                <img
                  src={item.image}
                  alt={item.alt || ""}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  style={{ objectFit: item.fit || "contain" }}
                  className="adaptive-media-frame__content transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                />
                <div className="pointer-events-none absolute inset-0 halftone opacity-[0.09] mix-blend-overlay" />
                <span className="media-icon-chip absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full transition-all duration-300 group-hover:scale-105">
                  <ArrowUpRight size={13} />
                </span>
              </div>
            </motion.button>
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
                <motion.div
                  className="media-lightbox__content media-lightbox__content--image"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  onClick={(event) => event.stopPropagation()}
                >
                  <img src={openItem.image} alt={openItem.alt || ""} decoding="async" className="media-lightbox__image" />
                </motion.div>
              </motion.div>
            </AnimatePresence>,
            document.body,
          )
        : null}
    </section>
  );
}
