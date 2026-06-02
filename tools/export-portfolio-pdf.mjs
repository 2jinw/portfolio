import path from "path";
import http from "http";
import { promises as fs } from "fs";
import puppeteer from "puppeteer";
import { PDFDocument } from "pdf-lib";

const ROOT = path.resolve(process.cwd());
const OUT_DIR = path.join(ROOT, "out");
const OUTPUT_DEFAULT = path.join(ROOT, "portfolio-web-to-pdf.pdf");

const args = process.argv.slice(2);
const outputIndex = args.indexOf("--output");
const formatIndex = args.indexOf("--format");
const landscape = args.includes("--landscape");
const outputPath =
  outputIndex >= 0 && args[outputIndex + 1]
    ? path.resolve(ROOT, args[outputIndex + 1])
    : OUTPUT_DEFAULT;
const format =
  formatIndex >= 0 && args[formatIndex + 1] ? args[formatIndex + 1] : "A4";

const ROUTES = [
  "/",
  "/projects/imo/",
  "/projects/amr-sim/",
  "/projects/itda/",
  "/projects/movie/",
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".txt": "text/plain; charset=utf-8",
};

async function tryRead(filePath) {
  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) return null;
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}

async function resolveStatic(urlPath) {
  let p = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  if (p.endsWith("/")) p += "index.html";
  const abs = path.join(OUT_DIR, p);
  let body = await tryRead(abs);
  let ext = path.extname(abs);
  if (!body && !ext) {
    body = await tryRead(abs + ".html");
    if (body) ext = ".html";
  }
  if (!body) {
    body = await tryRead(path.join(abs, "index.html"));
    if (body) ext = ".html";
  }
  return body ? { body, type: MIME[ext] ?? "application/octet-stream" } : null;
}

const server = http.createServer(async (req, res) => {
  const hit = await resolveStatic(req.url ?? "/");
  if (!hit) {
    res.writeHead(404);
    res.end("not found");
    return;
  }
  res.writeHead(200, { "Content-Type": hit.type });
  res.end(hit.body);
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
const base = `http://127.0.0.1:${port}`;
console.log(`[pdf] serving ${OUT_DIR} at ${base}`);

const browser = await puppeteer.launch({
  headless: true,
  protocolTimeout: 600_000,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

async function renderRoute(route) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  const url = base + route;
  console.log(`[pdf] rendering ${url}`);
  await page.goto(url, { waitUntil: "networkidle2", timeout: 120_000 });

  try {
    await Promise.race([
      page.evaluate(() => document.fonts?.ready),
      new Promise((r) => setTimeout(r, 3000)),
    ]);
  } catch {}

  await new Promise((r) => setTimeout(r, 800));

  const buf = await page.pdf({
    format,
    landscape,
    printBackground: true,
    margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    preferCSSPageSize: false,
  });
  await page.close();
  return buf;
}

try {
  const merged = await PDFDocument.create();
  for (const route of ROUTES) {
    const buf = await renderRoute(route);
    const src = await PDFDocument.load(buf);
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  const bytes = await merged.save();
  await fs.writeFile(outputPath, bytes);
  console.log(`[pdf] wrote ${outputPath} (${ROUTES.length} routes)`);
} finally {
  await browser.close();
  server.close();
}
