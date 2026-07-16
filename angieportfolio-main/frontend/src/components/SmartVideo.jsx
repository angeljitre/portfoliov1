import { Pause, Play } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const SmartVideo = forwardRef(function SmartVideo(
  {
    src,
    poster,
    className = "",
    videoClassName = "",
    videoStyle,
    active = true,
    autoPlay = true,
    loop = false,
    muted = true,
    onEnded,
    preload = "auto",
    controlLabel = "Reproducir o pausar video",
  },
  forwardedRef,
) {
  const hostRef = useRef(null);
  const videoRef = useRef(null);
  const frameRequestRef = useRef(null);
  const lastPaintRef = useRef(0);
  const lastTimeRef = useRef(0);
  const recoveringRef = useRef(false);
  const [inView, setInView] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useImperativeHandle(forwardedRef, () => videoRef.current);

  useEffect(() => {
    const node = hostRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setInView(visible);
        if (visible) setShouldLoad(true);
      },
      { threshold: 0.04, rootMargin: "240px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const stopFrameLoop = useCallback(() => {
    const video = videoRef.current;
    if (
      video &&
      frameRequestRef.current != null &&
      typeof video.cancelVideoFrameCallback === "function"
    ) {
      video.cancelVideoFrameCallback(frameRequestRef.current);
    }
    frameRequestRef.current = null;
  }, []);

  const startFrameLoop = useCallback(() => {
    const video = videoRef.current;
    if (!video || frameRequestRef.current != null) return;

    if (typeof video.requestVideoFrameCallback !== "function") {
      setReady(true);
      return;
    }

    const onFrame = (_now, metadata) => {
      lastPaintRef.current = performance.now();
      const mediaTime = Number(metadata?.mediaTime ?? video.currentTime ?? 0);
      lastTimeRef.current = mediaTime;
      setReady(true);
      setProgress(video.duration ? Math.min(1, mediaTime / video.duration) : 0);

      if (!video.paused && !video.ended) {
        frameRequestRef.current = video.requestVideoFrameCallback(onFrame);
      } else {
        frameRequestRef.current = null;
      }
    };

    frameRequestRef.current = video.requestVideoFrameCallback(onFrame);
  }, []);

  const attemptPlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;
    try {
      if (video.ended && Number.isFinite(video.duration)) video.currentTime = 0;
      await video.play();
    } catch (_error) {
      setPlaying(false);
    }
  }, [shouldLoad]);

  const syncPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;
    const shouldPlay =
      active && inView && autoPlay && document.visibilityState === "visible";

    if (shouldPlay) attemptPlay();
    else video.pause();
  }, [active, attemptPlay, autoPlay, inView, shouldLoad]);

  useEffect(() => {
    setReady(false);
    setProgress(0);
    lastPaintRef.current = 0;
    lastTimeRef.current = 0;
    stopFrameLoop();
  }, [src, stopFrameLoop]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;
    video.load();
  }, [src, shouldLoad]);

  useEffect(() => {
    syncPlayback();
  }, [syncPlayback]);

  useEffect(() => {
    document.addEventListener("visibilitychange", syncPlayback);
    return () => document.removeEventListener("visibilitychange", syncPlayback);
  }, [syncPlayback]);

  useEffect(() => {
    if (!playing) {
      stopFrameLoop();
      return undefined;
    }
    startFrameLoop();
    return stopFrameLoop;
  }, [playing, startFrameLoop, stopFrameLoop]);

  // Chrome can occasionally advance media time while failing to paint new
  // frames on transformed cards. Recover only after confirming that playback
  // time moved without a presented frame for a sustained interval.
  // v27: tightened from 1600ms/0.35s so the freeze is caught and fixed
  // roughly a second sooner, on top of the CSS compositor-layer fix in
  // index.css (which prevents most freezes from happening in the first
  // place).
  useEffect(() => {
    if (!playing || !active || !inView) return undefined;
    const timer = window.setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended || recoveringRef.current) return;
      const now = performance.now();
      const noPaintFor = now - (lastPaintRef.current || now);
      const timeAdvanced = video.currentTime - lastTimeRef.current > 0.2;
      if (noPaintFor < 900 || !timeAdvanced) return;

      recoveringRef.current = true;
      try {
        video.pause();
        const safeTime = Number.isFinite(video.duration)
          ? Math.min(video.currentTime + 0.015, Math.max(0, video.duration - 0.05))
          : video.currentTime;
        video.currentTime = safeTime;
        await video.play();
        lastPaintRef.current = performance.now();
        startFrameLoop();
      } catch (_error) {
        setPlaying(false);
      } finally {
        recoveringRef.current = false;
      }
    }, 900);
    return () => window.clearInterval(timer);
  }, [active, inView, playing, startFrameLoop]);

  useEffect(() => () => stopFrameLoop(), [stopFrameLoop]);

  const togglePlayback = async (event) => {
    event?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (!shouldLoad) {
      setShouldLoad(true);
      return;
    }
    if (video.paused) await attemptPlay();
    else video.pause();
  };

  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div ref={hostRef} className={`smart-video ${className}`}>
      {poster && (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className="smart-video__backdrop"
        />
      )}
      {poster && (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className={`smart-video__poster ${ready ? "smart-video__poster--hidden" : ""}`}
          style={videoStyle}
        />
      )}
      <video
        ref={videoRef}
        src={shouldLoad ? src : undefined}
        poster={poster}
        muted={muted}
        playsInline
        preload={shouldLoad ? preload : "none"}
        loop={loop}
        disablePictureInPicture
        className={`${videoClassName} ${ready ? "smart-video__video--ready" : "smart-video__video--loading"}`}
        style={videoStyle}
        onCanPlay={syncPlayback}
        onPlaying={() => {
          setPlaying(true);
          lastPaintRef.current = performance.now();
          startFrameLoop();
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onWaiting={() => {
          // Keep the last painted frame visible while buffering.
          window.setTimeout(syncPlayback, 120);
        }}
        onStalled={() => window.setTimeout(syncPlayback, 120)}
        onTimeUpdate={(event) => {
          // Fallback for browsers without requestVideoFrameCallback.
          const video = event.currentTarget;
          if (typeof video.requestVideoFrameCallback === "function") return;
          setProgress(video.duration ? video.currentTime / video.duration : 0);
        }}
        onEnded={(event) => {
          setPlaying(false);
          setProgress(1);
          onEnded?.(event);
        }}
      />
      <button
        type="button"
        className="smart-video__control"
        onClick={togglePlayback}
        aria-label={controlLabel}
      >
        <svg viewBox="0 0 36 36" aria-hidden="true">
          <circle className="smart-video__track" cx="18" cy="18" r={radius} />
          <circle
            className="smart-video__progress"
            cx="18"
            cy="18"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <span>
          {playing ? (
            <Pause size={12} fill="currentColor" />
          ) : (
            <Play size={12} fill="currentColor" />
          )}
        </span>
      </button>
    </div>
  );
});

export default SmartVideo;
