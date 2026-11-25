"use strict";

// Troque a versão a cada publicação que alterar os arquivos locais.
const prefix = "riopretrans-fluxo-";
const version = prefix + "v3";
const assets = [
  "./", "index.html", "ajuda.html", "empresas.html", "estudante.html",
  "formulario-frequencia.html", "frota.html", "horarios.html", "informativo.html",
  "integracao.html", "linhas.html", "minhas-rotas.html", "planejar.html",
  "portal-info.html", "privacidade.html", "recarga.html", "servicos.html",
  "styles.css", "inner-pages.css", "app.js", "site.js", "portal-info.js",
  "assets/logo.png", "assets/riopretrans-bus-hero.jpg", "assets/riopretrans-bus-hero.webp",
  "assets/avisos.js", "assets/busca-destino.js", "assets/dados-util.js",
  "assets/lugares.js", "assets/official-integration.js", "assets/official-lines.js",
  "assets/official-schedules.js", "assets/planejar.js",
];

const scope = self.registration.scope;
const pages = new Set(assets.filter((asset) => asset === "./" || asset.endsWith(".html"))
  .map((asset) => new URL(asset, scope).pathname));

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(version);
    await cache.addAll(assets);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith(prefix) &&
      key !== version).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || !request.url.startsWith(scope)) return;
  const url = new URL(request.url);
  const page = request.mode === "navigate" && pages.has(url.pathname);
  const key = page ? new URL(url.pathname, url.origin).href : request;

  event.respondWith((async () => {
    const cache = await caches.open(version);
    const stored = await cache.match(key);
    if (stored) return stored;
    const response = await fetch(request);
    if (response.ok && response.type === "basic" && !url.search) {
      await cache.put(key, response.clone()).catch(() => {});
    }
    return response;
  })());
});
