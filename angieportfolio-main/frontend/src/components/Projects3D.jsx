import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "../hooks/useLanguage";
import { getSoftwareLogo } from "../lib/logoAssets";
import HalftoneDecor from "./HalftoneDecor";
import StackCarousel from "./StackCarousel";
import SmartVideo from "./SmartVideo";
import { revealUp, cardReveal } from "../lib/motion";

// Monogram lookup — keep tool badges consistent with About toolkit
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

function ProcessTicker({ steps }) {
  const numbered = steps.map((s, i) => `${i + 1}. ${s}`);
  const seq = [...numbered, ...numbered];
  return (
    <div className="relative w-full max-w-full overflow-hidden">
      <div className="process-fade process-fade--left" />
      <div className="process-fade process-fade--right" />
      <div className="marquee-track flex whitespace-nowrap py-2 w-max">
        {seq.map((s, idx) => (
          <span
            key={idx}
            className="flex items-center gap-4 pr-8 font-mono-label text-[11px] uppercase tracking-[0.25em] text-white/70"
          >
            <span className="inline-block h-1 w-1 rounded-full bg-white/40" />
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

function AnimationTest({ test, projectId }) {
  const { ui } = useLanguage();
  const src =
    test.src && !test.src.startsWith("INSERT_") ? test.src : test.fallback;
  return (
    <motion.section
      data-testid={`animation-test-${projectId}`}
      {...revealUp()}
      className="mx-auto w-full max-w-5xl border-t border-white/10 pb-16 pt-10 md:pb-24 md:pt-14"
    >
      <div className="mb-6 flex items-end justify-between">
        <div>
          <span className="font-mono-label text-[10px] text-white/40">
            / {test.label}
          </span>
          <h4 className="mt-2 font-heading text-[clamp(2rem,4.4vw,4rem)] font-black uppercase leading-[0.95] tracking-tight text-white">
            {test.label}
          </h4>
        </div>
        <span className="font-mono-label text-[10px] text-white/40">
          {ui.rigMotion}
        </span>
      </div>

      <div className="media-glass relative aspect-video w-full overflow-hidden border border-white/10">
        <SmartVideo
          src={src}
          poster={test.poster}
          autoPlay
          loop
          className="h-full w-full"
          videoClassName="h-full w-full object-cover"
          controlLabel={ui.playPauseVideo || "Reproducir o pausar video"}
        />
        <div className="pointer-events-none absolute inset-0 halftone opacity-20 mix-blend-overlay" />
      </div>
    </motion.section>
  );
}

function ProjectRow({ p, i }) {
  const { ui } = useLanguage();
  const flip = i % 2 === 1;
  const gallery = p.gallery && p.gallery.length
    ? p.gallery
    : [{ type: "image", src: p.image }];

  return (
    <motion.article
      data-testid={`project-3d-${p.id}`}
      {...revealUp(0, { y: 60 })}
      className="project-row relative grid grid-cols-12 gap-8 overflow-visible border-t border-white/10 py-14 md:gap-12 md:py-24"
    >
      <div className={`relative z-10 col-span-12 md:col-span-6 ${flip ? "md:order-2" : ""}`}>
        <StackCarousel
          gallery={gallery}
          project={p}
          projectNumber={i + 1}
        />
      </div>

      <div className={`relative z-10 col-span-12 min-w-0 md:col-span-6 ${flip ? "md:order-1" : ""}`}>
        <div className="flex h-full flex-col justify-center gap-5">
          <div>
            <span className="font-mono-label text-white/45">{p.category}</span>
            <h3 className="mt-2 font-heading text-[clamp(2rem,4.4vw,4rem)] font-black uppercase leading-[0.95] tracking-tight text-white">
              {p.title}
            </h3>
            <p className="mt-3 max-w-lg font-body text-base leading-relaxed text-white/65 md:text-lg">
              {p.description}
            </p>
          </div>

          <div className="grid gap-5 border-t border-white/10 pt-5">
            <div className="min-w-0">
              <dt className="font-mono-label text-white/45">{ui.tools}</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {p.tools.map((t) => (
                  <ToolBadge key={t} name={t} />
                ))}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="font-mono-label text-white/45">{ui.process}</dt>
              <dd className="mt-2 min-w-0">
                <ProcessTicker steps={p.processSteps || []} />
              </dd>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {p.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/15 px-3 py-1 font-mono-label text-white/65"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function EnvironmentProject({ p, i }) {
  const { ui } = useLanguage();
  const src =
    p.video.src && !p.video.src.startsWith("INSERT_")
      ? p.video.src
      : p.video.fallback;
  return (
    <motion.article
      data-testid={`environment-${p.id}`}
      {...revealUp(0, { y: 60 })}
      className="relative overflow-visible border-t border-white/10 py-16 md:py-24"
    >
      {/* Centered header */}
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <span className="font-mono-label text-[10px] text-white/40">
          ENV / 0{i + 1}
        </span>
        <h3 className="mt-3 font-heading text-[clamp(2rem,4.4vw,4rem)] font-black uppercase leading-[0.95] tracking-tight text-white">
          {p.title}
        </h3>
        <p className="mx-auto mt-5 max-w-xl font-body text-base leading-relaxed text-white/60 md:text-lg">
          {p.description}
        </p>

        <div className="mt-8 flex flex-col items-center gap-4">
          <span className="font-mono-label text-[10px] text-white/40">
            {ui.tools}
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {p.tools.map((t) => (
              <ToolBadge key={t} name={t} />
            ))}
          </div>
        </div>

        <div className="mt-8">
          <span className="font-mono-label text-[10px] text-white/40">
            {ui.process}
          </span>
          <div className="mt-3">
            <ProcessTicker steps={p.processSteps || []} />
          </div>
        </div>
      </div>

      {/* Large looping video */}
      <div className="media-glass relative z-10 mx-auto mt-14 aspect-video w-full max-w-6xl overflow-hidden border border-white/10">
        <SmartVideo
          src={src}
          poster={p.video.poster}
          autoPlay
          loop
          className="h-full w-full"
          videoClassName="h-full w-full object-cover"
          controlLabel={ui.playPauseVideo || "Reproducir o pausar video"}
        />
        <div className="pointer-events-none absolute inset-0 halftone opacity-15 mix-blend-overlay" />
      </div>

      {/* Three frames */}
      <div className="relative z-10 mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-3">
        {["maya", "untextured", "final"].map((k, ki) => {
          const f = p.frames[k];
          return (
            <motion.div
              key={k}
              className="media-glass relative aspect-[4/3] overflow-hidden border border-white/10"
              {...cardReveal(ki, { y: 24 })}
            >
              <img
                src={f.image}
                alt={f.label}
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                className="h-full w-full object-cover transition-all duration-700 hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 halftone opacity-20 mix-blend-overlay" />
              <span className="media-label-chip bottom-2 left-2">
                0{ki + 1} · {f.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.article>
  );
}

export default function Projects3D() {
  const { content: siteContent, ui } = useLanguage();
  const { projects3D } = siteContent;
  const environments = projects3D.environments;
  const sectionRef = useRef(null);
  const isVisible = useInView(sectionRef, { amount: 0.02, margin: "180px 0px" });
  return (
    <section
      ref={sectionRef}
      id="projects-3d"
      data-testid="section-projects-3d"
      className={`relative scroll-mt-32 overflow-hidden border-t border-white/5 py-24 md:py-40 ${isVisible ? "viewport-active" : "viewport-paused"}`}
    >
      <HalftoneDecor variant="projects" intensity="strong" />
      <div
        aria-hidden="true"
        className="sculpt-star-field pointer-events-none absolute inset-0 z-[2] overflow-hidden"
      >
        <span className="sculpt-star sculpt-star--1" />
        <span className="sculpt-star sculpt-star--2" />
        <span className="sculpt-star sculpt-star--3" />
        <span className="sculpt-star sculpt-star--4" />
        <span className="sculpt-star sculpt-star--5" />
        <span className="sculpt-star sculpt-star--6" />
        <span className="sculpt-star sculpt-star--7" />
        <span className="sculpt-star sculpt-star--8" />
        <span className="sculpt-star sculpt-star--9" />
        <span className="sculpt-star sculpt-star--10" />
        <span className="sculpt-star sculpt-star--11" />
        <span className="sculpt-star sculpt-star--12" />
        <span className="sculpt-star sculpt-star--13" />
        <span className="sculpt-star sculpt-star--14" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-10">
        <div className="mb-14 flex items-end justify-between">
          <span className="font-mono-label text-[11px] text-white/40">
            {projects3D.label}
          </span>
          <span className="font-mono-label text-[11px] text-white/40">
            {ui.sculptedWorks}
          </span>
        </div>

        <motion.h2
          {...revealUp()}
          className="section-title mb-8 max-w-4xl font-heading uppercase tracking-tight text-white"
        >
          {projects3D.heading}
        </motion.h2>

        <div>
          {projects3D.items.map((p, i) => (
            <div key={p.id}>
              <ProjectRow p={p} i={i} />
              {p.animationTest && (
                <AnimationTest test={p.animationTest} projectId={p.id} />
              )}
            </div>
          ))}
        </div>

        {/* 3D Environments subsection */}
        {environments && (
          <div data-testid="environments-subsection" className="mt-20 md:mt-32">
            <div className="mb-10 flex items-end justify-between border-t border-white/10 pt-10">
              <span className="font-mono-label text-[11px] text-white/40">
                / {environments.label}
              </span>
              <span className="font-mono-label text-[11px] text-white/40">
                {ui.spacesSets}
              </span>
            </div>
            <motion.h3
              {...revealUp()}
              className="mb-6 font-heading text-3xl uppercase tracking-tight text-white sm:text-4xl md:text-5xl"
            >
              {environments.heading}
            </motion.h3>

            {environments.items.map((env, ei) => (
              <EnvironmentProject key={env.id} p={env} i={ei} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
