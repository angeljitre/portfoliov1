import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "../hooks/useLanguage";

export default function Loader({ ready, error = false }) {
  const { ui, language, content: siteContent } = useLanguage();
  const { meta } = siteContent;
  return (
    <AnimatePresence>
      {!ready && (
        <motion.div
          data-testid="loader-overlay"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505]"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.9, ease: [0.7, 0, 0.2, 1] },
          }}
        >
          <div className="absolute inset-0 halftone-lg opacity-30" />
          <div className="relative z-10 flex flex-col items-center gap-6">
            <motion.img
              src={meta.logoPath}
              alt="Angélica Jiménez"
              className="theme-logo h-16 w-20 object-contain"
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6 }}
            />

            <div className="relative h-[2px] w-56 overflow-hidden bg-white/10">
              <motion.div
                className="absolute inset-y-0 left-0 w-[42%] bg-white"
                initial={{ x: "-120%" }}
                animate={{ x: ["-120%", "280%"] }}
                transition={{ duration: 1.45, repeat: Infinity, ease: [0.7, 0, 0.2, 1] }}
              />
            </div>

            <motion.div
              className="font-mono-label text-[10px] text-white/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {error
                ? language === "es"
                  ? "NO SE PUDO CARGAR EL MODELO 3D"
                  : "THE 3D MODEL COULD NOT LOAD"
                : ui.loading}
            </motion.div>

            {error && (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-full border border-white/30 px-5 py-2 font-mono-label text-[10px] text-white transition-colors hover:border-white"
              >
                {language === "es" ? "REINTENTAR" : "RETRY"}
              </button>
            )}
          </div>

          {/* Decorative sparkles */}
          <div className="pointer-events-none absolute inset-0">
            <span className="sparkle absolute left-[18%] top-[22%] text-white/60">
              +
            </span>
            <span
              className="sparkle absolute right-[22%] top-[30%] text-white/40"
              style={{ animationDelay: "1.2s" }}
            >
              +
            </span>
            <span
              className="sparkle absolute left-[30%] bottom-[24%] text-white/50"
              style={{ animationDelay: "2s" }}
            >
              +
            </span>
            <span
              className="sparkle absolute right-[18%] bottom-[18%] text-white/60"
              style={{ animationDelay: "0.6s" }}
            >
              +
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
