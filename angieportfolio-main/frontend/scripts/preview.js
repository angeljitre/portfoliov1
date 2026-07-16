const http = require("http");
const fs = require("fs");
const path = require("path");

const buildDir = path.resolve(__dirname, "..", "build");
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
  ".ico": "image/x-icon",
};

if (!fs.existsSync(path.join(buildDir, "index.html"))) {
  console.error("No existe la carpeta build. Ejecuta primero: npm run build");
  process.exit(1);
}

function sendFile(req, res, filePath) {
  const stat = fs.statSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || "application/octet-stream";
  const range = req.headers.range;

  if (range && ext === ".mp4") {
    const [startText, endText] = range.replace(/bytes=/, "").split("-");
    const start = Number(startText);
    const end = endText ? Number(endText) : stat.size - 1;
    if (!Number.isFinite(start) || start < 0 || end >= stat.size || start > end) {
      res.writeHead(416, { "Content-Range": `bytes */${stat.size}` });
      res.end();
      return;
    }
    res.writeHead(206, {
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Content-Range": `bytes ${start}-${end}/${stat.size}`,
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
    return;
  }

  res.writeHead(200, {
    "Content-Length": stat.size,
    "Content-Type": contentType,
    "Cache-Control": ext === ".html"
      ? "no-cache"
      : filePath.includes(`${path.sep}static${path.sep}`)
        ? "public, max-age=31536000, immutable"
        : "public, max-age=2592000, stale-while-revalidate=86400",
  });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  try {
    const requestPath = decodeURIComponent((req.url || "/").split("?")[0]);
    const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
    let filePath = path.join(buildDir, safePath);

    if (requestPath === "/") filePath = path.join(buildDir, "index.html");
    if (!filePath.startsWith(buildDir)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(buildDir, "index.html");
    }
    sendFile(req, res, filePath);
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end("Internal server error");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Vista de producción: http://localhost:${port}`);
  console.log("Presiona Ctrl + C para detenerla.");
});
