// Offline support. Bump CACHE whenever any file below changes, except
// program.json (it is fetched network-first, so edits arrive on their own).
const CACHE = "kprogram-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./program.json",
  "./manifest.webmanifest",
  "./js/app.js",
  "./js/render.js",
  "./js/schedule.js",
  "./js/storage.js",
  "./icons/apple-touch-icon.png",
  "./icons/icon-512.png",
];

const PROGRAM_TIMEOUT_MS = 3000;

self.addEventListener("install", (event) => {
  // cache: "reload" skips the browser's HTTP cache so a version bump gets fresh files.
  const requests = ASSETS.map((url) => new Request(url, { cache: "reload" }));
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(requests)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

// program.json: try the network for a few seconds (fresh program), else the cache.
async function programNetworkFirst(request) {
  const cache = await caches.open(CACHE);
  // cache: "no-cache" revalidates with the server instead of trusting the HTTP cache.
  const fromNetwork = fetch(request.url, { cache: "no-cache" }).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  });
  fromNetwork.catch(() => {}); // a late failure after the timeout is not an error
  const timeout = new Promise((resolve) => setTimeout(resolve, PROGRAM_TIMEOUT_MS));
  try {
    const response = await Promise.race([fromNetwork, timeout]);
    if (response && response.ok) return response;
  } catch {
    // Offline: fall through to the cache.
  }
  return (await cache.match(request)) || fromNetwork;
}

// Page loads (including ?today=… test URLs) fall back to the cached page offline.
async function navigation(request) {
  try {
    return await fetch(request);
  } catch {
    return caches.match("./index.html", { ignoreSearch: true });
  }
}

async function cacheFirst(request) {
  return (await caches.match(request)) || fetch(request);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(navigation(request));
  } else if (new URL(request.url).pathname.endsWith("/program.json")) {
    event.respondWith(programNetworkFirst(request));
  } else {
    event.respondWith(cacheFirst(request));
  }
});
