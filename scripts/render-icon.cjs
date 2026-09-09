// Place assets/icon-tile.png (the full-bleed tile from Icon Composer) on Apple's 1024px canvas,
// 824px wide with transparent margins, and write build/icon.png at 2x using Electron's Chromium.
// Run: pnpm exec electron scripts/render-icon.cjs
const { app, BrowserWindow } = require("electron");
const { readFileSync, writeFileSync, mkdirSync, rmSync } = require("node:fs");
const { pathToFileURL } = require("node:url");
const { join } = require("node:path");

const root = join(__dirname, "..");
const tileUrl = pathToFileURL(join(root, "assets/icon-tile.png")).href;
const html = `<!doctype html><html><head><style>
html,body{margin:0;overflow:hidden;background:transparent;width:1024px;height:1024px}
img{position:absolute;left:100px;top:100px;width:824px;height:824px;display:block}
</style></head><body><img src="${tileUrl}"></body></html>`;

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1024,
    height: 1024,
    show: false,
    transparent: true,
    frame: false,
    webPreferences: { offscreen: true },
  });
  mkdirSync(join(root, "build"), { recursive: true });
  const page = join(root, "build/icon-page.html");
  writeFileSync(page, html);
  await win.loadFile(page);
  await new Promise((r) => setTimeout(r, 400));
  const image = await win.webContents.capturePage({ x: 0, y: 0, width: 1024, height: 1024 });
  mkdirSync(join(root, "build"), { recursive: true });
  writeFileSync(join(root, "build/icon.png"), image.toPNG());
  rmSync(page);
  console.log("wrote build/icon.png", image.getSize());
  win.destroy();
  app.exit(0);
});
