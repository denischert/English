// Patches the static `expo export --platform web` output with PWA tags
// and stamps the service worker with a fresh cache-busting version.
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");
const indexPath = path.join(distDir, "index.html");
const swPath = path.join(distDir, "sw.js");

if (!fs.existsSync(indexPath)) {
  console.error(`Could not find ${indexPath}. Run "npm run build:web" instead of exporting directly.`);
  process.exit(1);
}

const appJson = JSON.parse(fs.readFileSync(path.join(projectRoot, "app.json"), "utf8"));
const basePath = (appJson.expo?.experiments?.baseUrl ?? "").replace(/\/+$/, "");

const pwaTags = `
    <link rel="manifest" href="${basePath}/manifest.webmanifest" />
    <meta name="theme-color" content="#0f172a" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <link rel="apple-touch-icon" href="${basePath}/icons/apple-touch-icon.png" />
    <script>
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
          navigator.serviceWorker.register("${basePath}/sw.js", { scope: "${basePath}/" }).catch(() => {});
        });
      }
    </script>
  `;

let html = fs.readFileSync(indexPath, "utf8");
if (!html.includes("manifest.webmanifest")) {
  html = html.replace("</head>", `${pwaTags}\n  </head>`);
  fs.writeFileSync(indexPath, html);
  console.log("Injected PWA tags into dist/index.html");
}

if (fs.existsSync(swPath)) {
  const version = String(Date.now());
  const sw = fs.readFileSync(swPath, "utf8").replace("__CACHE_VERSION__", version);
  fs.writeFileSync(swPath, sw);
  console.log(`Stamped service worker with cache version ${version}`);
}
