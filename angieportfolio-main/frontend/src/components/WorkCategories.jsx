import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";
import HalftoneDecor from "./HalftoneDecor";
import CyberDecor from "./CyberDecor";

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

export default function WorkCategories() {
  const { content: siteContent, ui } = useLanguage();
  const { workCategories } = siteContent;
  const [active, setActive] = useState(null);

  return (
    <section
      id="work"
      data-testid="section-work"
      className="work-overview relative scroll-mt-32 overflow-hidden border-t border-white/5 pb-24 pt-20 md:pb-28 md:pt-24"
    >
      <HalftoneDecor variant="work" intensity="strong" />
      <CyberDecor variant="work" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-10">
        <div className="mb-14 flex items-end justify-between">
          <span className="font-mono-label text-[11px] text-white/40">
            {workCategories.label}
          </span>
          <span className="font-mono-label text-[11px] text-white/40">
            {ui.chooseLane}
          </span>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease: [0.7, 0, 0.2, 1] }}
          className="mb-10 max-w-3xl font-heading text-4xl uppercase tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
        >
          {workCategories.heading}
        </motion.h2>

        {/* Desktop expandable panels */}
        <div id="work-cards" className="hidden gap-3 md:flex md:h-[min(520px,58vh)] md:min-h-[430px]">
          {workCategories.items.map((c) => {
            const isActive = active === c.id;
            const noneActive = active === null;
            return (
              <motion.button
                key={c.id}
                data-testid={`work-cat-${c.id}`}
                onMouseEnter={() => setActive(c.id)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(c.id)}
                onBlur={() => setActive(null)}
                onClick={() => scrollTo(c.id)}
                className="media-glass relative flex-1 overflow-hidden border border-white/10 text-left"
                animate={{
                  flex: noneActive ? 1 : isActive ? 2.2 : 0.7,
                }}
                transition={{ duration: 0.7, ease: [0.7, 0, 0.2, 1] }}
              >
                {/* Background */}
                <motion.div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${c.image})` }}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    opacity: isActive ? 0.6 : 0.25,
                  }}
                  transition={{ duration: 0.9 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
                <div className="absolute inset-0 halftone opacity-25 mix-blend-overlay" />

                {/* Content */}
                <div className="relative flex h-full flex-col justify-between p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-label text-[10px] text-white/60">
                      {c.n}
                    </span>
                    <span
                      className={`media-icon-chip grid h-8 w-8 place-items-center rounded-full transition-all ${
                        isActive
                          ? "translate-x-0 translate-y-0 opacity-100"
                          : "-translate-x-1 translate-y-1 opacity-60"
                      }`}
                    >
                      <ArrowUpRight size={15} />
                    </span>
                  </div>
                  <div>
                    <h3 className="work-card-title font-heading uppercase tracking-tight text-white">
                      {c.title}
                    </h3>
                    <p className="mt-2 font-mono-label text-[10px] text-white/60">
                      {c.subtitle}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Mobile stacked cards */}
        <div className="flex flex-col gap-4 md:hidden">
          {workCategories.items.map((c) => (
            <button
              key={c.id}
              data-testid={`work-cat-mobile-${c.id}`}
              onClick={() => scrollTo(c.id)}
              className="media-glass relative h-56 overflow-hidden border border-white/10 text-left"
            >
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{ backgroundImage: `url(${c.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
              <div className="relative flex h-full flex-col justify-between p-5">
                <span className="font-mono-label text-[10px] text-white/60">
                  {c.n}
                </span>
                <div>
                  <h3 className="work-card-title font-heading uppercase tracking-tight text-white">
                    {c.title}
                  </h3>
                  <p className="mt-1 font-mono-label text-[10px] text-white/60">
                    {c.subtitle}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
