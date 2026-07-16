import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

const CHUNK_RELOAD_KEY = "aj-chunk-reload-attempted";

function recoverFromStaleChunk(error) {
  const message = String(error?.message || error || "");
  if (!/ChunkLoadError|Loading chunk .* failed|Failed to fetch dynamically imported module/i.test(message)) {
    return;
  }

  try {
    if (window.sessionStorage.getItem(CHUNK_RELOAD_KEY) === "1") return;
    window.sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
  } catch {
    // A reload is still safe when session storage is unavailable.
  }
  window.location.reload();
}

window.addEventListener("error", (event) => recoverFromStaleChunk(event.error));
window.addEventListener("unhandledrejection", (event) =>
  recoverFromStaleChunk(event.reason),
);

// Clear the one-time recovery flag after a stable load so a future deployment
// can recover from a genuinely stale cached chunk as well.
window.setTimeout(() => {
  try {
    window.sessionStorage.removeItem(CHUNK_RELOAD_KEY);
  } catch {
    // Ignore storage restrictions.
  }
}, 15000);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
