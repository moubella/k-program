// Offline support. Bump CACHE whenever any file below changes, except
// program.json (it is fetched network-first, so edits arrive on their own).
const CACHE = "kprogram-v3";

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./program.json",
  "./manifest.webmanifest",
  "./js/app.js",
  "./js/program.js",
  "./js/render.js",
  "./js/schedule.js",
  "./js/storage.js",
  "./icons/apple-touch-icon.png",
  "./icons/icon-512.png",
  "./images/back-extension-0.jpg",
  "./images/back-extension-1.jpg",
  "./images/cable-kickback-0.jpg",
  "./images/cable-kickback-1.jpg",
  "./images/chest-press-0.jpg",
  "./images/chest-press-1.jpg",
  "./images/goblet-squat-0.jpg",
  "./images/goblet-squat-1.jpg",
  "./images/hip-abduction-0.jpg",
  "./images/hip-abduction-1.jpg",
  "./images/hip-thrust-0.jpg",
  "./images/hip-thrust-1.jpg",
  "./images/lat-pulldown-0.jpg",
  "./images/lat-pulldown-1.jpg",
  "./images/leg-press-0.jpg",
  "./images/leg-press-1.jpg",
  "./images/plank-0.jpg",
  "./images/reverse-lunge-0.jpg",
  "./images/reverse-lunge-1.jpg",
  "./images/romanian-deadlift-0.jpg",
  "./images/romanian-deadlift-1.jpg",
  "./images/seated-cable-row-0.jpg",
  "./images/seated-cable-row-1.jpg",
  "./images/seated-leg-curl-0.jpg",
  "./images/seated-leg-curl-1.jpg",
  "./images/shoulder-press-0.jpg",
  "./images/shoulder-press-1.jpg",
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

const looksLikeProgram = (data) =>
  Array.isArray(data?.sessions) && data.sessions.length > 0 && Array.isArray(data?.phases) && data.phases.length > 0;

// Fetches program.json and caches it only if it is a usable program, so a broken
// edit (or a host's HTML error page served with status 200) never replaces the
// last good copy. cache: "no-cache" revalidates instead of trusting the HTTP cache.
async function fetchGoodProgram(request, cache) {
  const response = await fetch(request.url, { cache: "no-cache" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (!looksLikeProgram(await response.clone().json())) throw new Error("not a program");
  await cache.put(request, response.clone());
  return response;
}

// program.json: try the network for a few seconds (fresh program), else the cache.
async function programNetworkFirst(request) {
  const cache = await caches.open(CACHE);
  const fromNetwork = fetchGoodProgram(request, cache);
  fromNetwork.catch(() => {}); // a late failure after the timeout is not an error
  let timer;
  const timeout = new Promise((resolve) => (timer = setTimeout(resolve, PROGRAM_TIMEOUT_MS)));
  try {
    const response = await Promise.race([fromNetwork, timeout]);
    if (response) return response;
  } catch {
    // Offline, or the server's program is broken: use the last good copy.
  } finally {
    clearTimeout(timer);
  }
  return (await cache.match(request)) || fetch(request.url, { cache: "no-cache" });
}

// Page loads (including ?today=… test URLs) come straight from the cache, so the
// app opens instantly even with one bar of signal; code updates arrive through a
// CACHE bump. "./" is used, never "./index.html": some hosts redirect /index.html
// to /, and a redirected response cannot be used for a page load.
async function navigation(request) {
  return (await caches.match("./", { ignoreSearch: true })) || fetch(request);
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
