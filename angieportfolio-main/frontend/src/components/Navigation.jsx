import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Moon, Sun } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";
import { useTheme } from "../hooks/useTheme";

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (!el) return;

  const navBarOffset = 80;
  const elementPosition = el.getBoundingClientRect().top + window.scrollY - navBarOffset;

  window.scrollTo({
    top: elementPosition,
    behavior: "smooth",
  });
};

function LanguageSwitch({ language, setLanguage, label }) {
  return (
    <div
      className="language-switch flex items-center rounded-full border border-white/12 bg-white/[0.03] p-0.5"
      role="group"
      aria-label={label}
    >
      {[
        { code: "es", label: "ES" },
        { code: "en", label: "EN" },
      ].map((option) => {
        const active = language === option.code;
        return (
          <button
            key={option.code}
            type="button"
            onClick={() => setLanguage(option.code)}
            aria-pressed={active}
            className={`language-switch__option rounded-full px-2.5 py-1 font-mono-label text-[9px] transition-all duration-300 md:text-[10px] ${
              active
                ? "language-switch__option--active bg-white text-black shadow-[0_0_18px_rgba(255,255,255,0.16)]"
                : "text-white/45 hover:text-white"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function ThemeSwitch({ theme, toggleTheme, language }) {
  const isDark = theme === "dark";
  const label =
    language === "es"
      ? isDark
        ? "Cambiar a modo claro"
        : "Cambiar a modo oscuro"
      : isDark
        ? "Switch to light mode"
        : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="theme-switch glow-hover relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/12 bg-white/[0.03] text-white/70 transition-all duration-300 hover:border-white/30 hover:text-white"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -55, scale: 0.65 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 55, scale: 0.65 }}
          transition={{ duration: 0.25 }}
        >
          {isDark ? <Sun size={15} /> : <Moon size={14} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export default function Navigation({ ready }) {
  const [open, setOpen] = useState(false);
  const { content: siteContent, ui, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { nav, meta } = siteContent;

  return (
    <>
      <motion.header
        className="fixed left-0 right-0 top-0 z-50 px-5 pt-5 md:px-10 md:pt-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : -20 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="nav-shell mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full border border-white/10 bg-black/60 px-4 py-2.5 backdrop-blur-xl md:px-6">
          <button
            data-testid="nav-logo"
            onClick={() => scrollTo("hero")}
            className="glow-hover flex shrink-0 items-center justify-center"
            aria-label={ui.home}
          >
            <img
              src={meta.logoPath}
              alt="Angélica Jiménez"
              className="theme-logo h-7 w-9 object-contain md:h-8 md:w-11"
            />
          </button>

          <nav
            className="hidden flex-1 items-center justify-end gap-8 md:flex"
            aria-label={ui.primaryNavigation}
          >
            {nav.map((n) => (
              <button
                key={n.id}
                data-testid={`nav-${n.id}-link`}
                onClick={() => scrollTo(n.id)}
                className="glow-hover font-mono-label text-[11px] text-white/70 hover:text-white"
              >
                {n.label}
              </button>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitch
              language={language}
              setLanguage={setLanguage}
              label={ui.languageLabel}
            />
            <ThemeSwitch
              theme={theme}
              toggleTheme={toggleTheme}
              language={language}
            />
            <button
              data-testid="nav-mobile-toggle"
              className="text-white/80 md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={ui.toggleNavigation}
              aria-expanded={open}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="nav-mobile-panel"
            className="mobile-menu fixed inset-0 z-40 flex flex-col items-start justify-center gap-8 bg-[#050505]/95 px-8 pt-24 backdrop-blur-xl md:hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
          >
            {nav.map((n, i) => (
              <motion.button
                key={n.id}
                data-testid={`nav-mobile-${n.id}`}
                onClick={() => {
                  setOpen(false);
                  setTimeout(() => scrollTo(n.id), 200);
                }}
                className="font-heading text-4xl uppercase tracking-tight text-white"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.4 }}
              >
                <span className="mr-3 font-mono-label text-xs text-white/40">
                  0{i + 1}
                </span>
                {n.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
