"use strict";

// Troque a versão a cada publicação que alterar os arquivos locais.
const cacheName = "riopretrans-fluxo-v1";
const assets = [
  "./", "index.html", "planejar.html", "minhas-rotas.html", "linhas.html",
  "horarios.html", "recarga.html", "styles.css", "inner-pages.css", "site.js",
  "app.js", "assets/logo.png", "assets/official-lines.js",
  "assets/official-schedules.js", "assets/lugares.js", "assets/dados-util.js",
  "assets/busca-destino.js", "assets/planejar.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(assets)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith("riopretrans-fluxo-") &&
      key !== cacheName).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    const options = request.mode === "navigate" ? { ignoreSearch: true } : {};
    const stored = await cache.match(request, options);
    if (stored) return stored;
    return fetch(request);
  })());
});
