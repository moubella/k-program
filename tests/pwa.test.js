import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (file) => fs.readFileSync(new URL(file, root), "utf8");
const exists = (file) => fs.existsSync(new URL(file, root));

function cachedAssets() {
  const sw = read("sw.js");
  const block = /const ASSETS = \[([\s\S]*?)\];/.exec(sw);
  assert.ok(block, "sw.js defines const ASSETS = [...]");
  return [...block[1].matchAll(/"(\.\/[^"]*)"/g)].map((m) => m[1]);
}

test("manifest makes a standalone app rooted at ./", () => {
  const m = JSON.parse(read("manifest.webmanifest"));
  assert.equal(m.name, "K Program");
  assert.equal(m.display, "standalone");
  assert.equal(m.start_url, "./");
  assert.equal(m.scope, "./");
  assert.ok(m.icons.some((i) => i.src === "icons/icon-512.png" && i.sizes === "512x512"));
  for (const icon of m.icons) assert.ok(exists(icon.src), `${icon.src} exists`);
});

test("index.html links the manifest and apple-touch-icon with relative URLs", () => {
  const html = read("index.html");
  assert.ok(html.includes('<link rel="manifest" href="manifest.webmanifest">'));
  assert.ok(html.includes('<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">'));
  assert.ok(!/(href|src)="\//.test(html), "no root-absolute URLs");
});

test("app.js loads the program and service worker with relative URLs", () => {
  const js = read("js/app.js");
  assert.ok(js.includes('fetch("./program.json")'));
  assert.ok(js.includes('register("./sw.js")'));
});

test("every cached asset exists on disk", () => {
  for (const asset of cachedAssets()) {
    const file = asset === "./" ? "./index.html" : asset;
    assert.ok(exists(file), `${asset} listed in sw.js but missing`);
  }
});

test("every file the page needs is cached", () => {
  const assets = cachedAssets();
  const program = JSON.parse(read("program.json"));
  const needed = [
    "./",
    "./index.html",
    "./style.css",
    "./program.json",
    "./manifest.webmanifest",
    "./icons/apple-touch-icon.png",
    "./icons/icon-512.png",
    ...fs.readdirSync(new URL("js/", root)).map((f) => `./js/${f}`),
    ...[...program.sessions.flatMap((s) => s.exercises), ...program.week0.machines]
      .flatMap((item) => item.images ?? [])
      .map((src) => `./${src}`),
  ];
  for (const path of needed) assert.ok(assets.includes(path), `${path} missing from sw.js ASSETS`);
});
