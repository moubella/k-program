// Runs the real sw.js in a Node vm with a fake Cache Storage and a controllable
// network, then dispatches install and fetch events like a browser would.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const BASE = "https://example.github.io/k-program/";
const SW_SOURCE = fs.readFileSync(new URL("../sw.js", import.meta.url), "utf8");
const VALID_PROGRAM = fs.readFileSync(new URL("../program.json", import.meta.url), "utf8");

const absolute = (input) => new URL(typeof input === "string" ? input : input.url, BASE).href;
const withoutSearch = (url) => {
  const u = new URL(url);
  u.search = "";
  return u.href;
};

class FakeCache {
  constructor(network) {
    this.network = network;
    this.entries = new Map();
  }
  async match(input, options = {}) {
    const url = absolute(input);
    for (const [key, response] of this.entries) {
      if (key === url || (options.ignoreSearch && withoutSearch(key) === withoutSearch(url))) return response.clone();
    }
    return undefined;
  }
  async put(input, response) {
    this.entries.set(absolute(input), response.clone());
  }
  async addAll(requests) {
    for (const request of requests) {
      const response = await this.network.fetch(request);
      if (!response.ok) throw new TypeError(`addAll: ${response.status} for ${absolute(request)}`);
      await this.put(request, response);
    }
  }
}

class FakeCacheStorage {
  constructor(network) {
    this.network = network;
    this.stores = new Map();
  }
  async open(name) {
    if (!this.stores.has(name)) this.stores.set(name, new FakeCache(this.network));
    return this.stores.get(name);
  }
  async match(input, options) {
    for (const cache of this.stores.values()) {
      const hit = await cache.match(input, options);
      if (hit) return hit;
    }
    return undefined;
  }
  async keys() {
    return [...this.stores.keys()];
  }
  async delete(name) {
    return this.stores.delete(name);
  }
}

// network.respond(url) decides what each request gets: a Response, a thrown
// error (offline), or a promise that never settles (one bar of signal).
function startWorker() {
  const network = {
    respond: (url) => new Response(`network:${new URL(url).pathname}`),
    fetch: async (input) => network.respond(absolute(input)),
  };
  const listeners = {};
  const caches = new FakeCacheStorage(network);
  class RelativeRequest extends Request {
    constructor(input, init) {
      super(typeof input === "string" ? absolute(input) : input, init);
    }
  }
  const context = {
    self: {
      location: new URL("sw.js", BASE),
      addEventListener: (type, fn) => (listeners[type] = fn),
      skipWaiting: async () => {},
      clients: { claim: async () => {} },
    },
    caches,
    fetch: (input) => network.fetch(input),
    Request: RelativeRequest,
    Response,
    URL,
    setTimeout,
    clearTimeout,
  };
  vm.createContext(context);
  vm.runInContext(SW_SOURCE, context);

  const install = async () => {
    network.respond = (url) =>
      url.endsWith("/program.json") ? new Response(VALID_PROGRAM) : new Response(`cached:${new URL(url).pathname}`);
    let done;
    listeners.install({ waitUntil: (p) => (done = p) });
    await done;
  };
  const dispatchFetch = (url, mode = "cors") => {
    let response;
    listeners.fetch({ request: { url: absolute(url), method: "GET", mode }, respondWith: (p) => (response = p) });
    return response;
  };
  return { network, caches, install, dispatchFetch };
}

const within = (promise, ms) =>
  Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error(`no response within ${ms} ms`)), ms))]);

test("a page load is served from the cache without waiting for a stalled network", async () => {
  const sw = startWorker();
  await sw.install();
  sw.network.respond = () => new Promise(() => {});
  const response = await within(sw.dispatchFetch(`${BASE}?today=2026-12-07`, "navigate"), 200);
  assert.equal(await response.text(), "cached:/k-program/");
});

test("an offline page load serves the cached ./ entry, not ./index.html (which a host may have redirected)", async () => {
  const sw = startWorker();
  await sw.install();
  sw.network.respond = () => {
    throw new TypeError("offline");
  };
  const response = await sw.dispatchFetch(`${BASE}index.html`, "navigate");
  assert.equal(await response.text(), "cached:/k-program/");
});

test("a broken program.json from the network does not replace the cached program", async () => {
  const sw = startWorker();
  await sw.install();
  sw.network.respond = () => new Response("{ broken", { status: 200 });
  const response = await sw.dispatchFetch(`${BASE}program.json`);
  assert.ok((await response.text()) === VALID_PROGRAM, "served the broken program");
  const cached = await sw.caches.match(`${BASE}program.json`);
  assert.ok((await cached.text()) === VALID_PROGRAM, "cached the broken program");
});

test("a program.json without sessions or phases does not replace the cached program", async () => {
  const sw = startWorker();
  await sw.install();
  sw.network.respond = () => new Response('<!doctype html><title>Not found</title>', { status: 200 });
  assert.ok((await (await sw.dispatchFetch(`${BASE}program.json`)).text()) === VALID_PROGRAM, "served an HTML page as the program");
  sw.network.respond = () => new Response('{"sessions":[],"phases":[]}', { status: 200 });
  assert.ok((await (await sw.dispatchFetch(`${BASE}program.json`)).text()) === VALID_PROGRAM, "served an empty program");
});

test("a valid updated program.json is served and cached", async () => {
  const sw = startWorker();
  await sw.install();
  const updated = VALID_PROGRAM.replace('"20–30 s"', '"30–40 s"');
  sw.network.respond = () => new Response(updated, { status: 200 });
  assert.ok((await (await sw.dispatchFetch(`${BASE}program.json`)).text()) === updated, "did not serve the update");
  assert.ok((await (await sw.caches.match(`${BASE}program.json`)).text()) === updated, "did not cache the update");
});
