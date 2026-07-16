import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import "./App.css";
import { useTheme } from "./hooks/useTheme";

import Loader from "./components/Loader";
import GrainOverlay from "./components/GrainOverlay";
import Navigation from "./components/Navigation";
import ScrollProgress from "./components/ScrollProgress";
import Hero from "./components/Hero";
import About from "./components/About";
import WorkCategories from "./components/WorkCategories";
import Projects3D from "./components/Projects3D";
import DesignGallery from "./components/DesignGallery";
import SpecialProjects from "./components/SpecialProjects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

function DeferredSections() {
  return (
    <>
      <About />
      <WorkCategories />
      <Projects3D />
      <DesignGallery />
      <SpecialProjects />
      <Contact />
      <Footer />
    </>
  );
}

function App() {
  const { theme } = useTheme();
  const [introReady, setIntroReady] = useState(false);
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [splineError, setSplineError] = useState(false);
  const [mountDeferred, setMountDeferred] = useState(false);
  const ready = introReady && splineLoaded;

  useEffect(() => {
    const timer = window.setTimeout(() => setIntroReady(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.style.overflow = ready ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [ready]);

  // Pause CSS animations whenever the tab is hidden. This prevents the
  // portfolio from continuing to use CPU/GPU while another app is in use.
  useEffect(() => {
    const updateVisibility = () => {
      document.documentElement.classList.toggle(
        "page-hidden",
        document.visibilityState !== "visible",
      );
    };
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    window.addEventListener("pagehide", updateVisibility);
    window.addEventListener("pageshow", updateVisibility);
    return () => {
      document.removeEventListener("visibilitychange", updateVisibility);
      window.removeEventListener("pagehide", updateVisibility);
      window.removeEventListener("pageshow", updateVisibility);
      document.documentElement.classList.remove("page-hidden");
    };
  }, []);

  useEffect(() => {
    if (!ready) return undefined;
    const mount = () => setMountDeferred(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(mount, { timeout: 900 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(mount, 240);
    return () => window.clearTimeout(timer);
  }, [ready]);

  return (
    <div className="App min-h-screen overflow-x-hidden bg-[#050505] text-white antialiased">
      <GrainOverlay />
      <Loader ready={ready} error={splineError} />
      <Toaster theme={theme} position="bottom-right" />

      <Navigation ready={ready} />
      <ScrollProgress />

      <main aria-hidden={!ready}>
        <Hero
          ready={ready}
          onSplineLoad={() => {
            setSplineError(false);
            setSplineLoaded(true);
          }}
          onSplineError={() => setSplineError(true)}
        />
        {mountDeferred && <DeferredSections />}
      </main>
    </div>
  );
}

export default App;
