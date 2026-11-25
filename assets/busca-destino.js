(() => {
  "use strict";

  const RP = window.RP;
  const esc = RP.escape;
  const index = new Map();
  const routes = (window.riopretransSchedules || []).filter((line) => line.ok && line.path)
    .map((line) => ({ ...line, stops: RP.itinerario(line) }));
  for (const line of routes) {
    for (const stop of line.stops) {
      if (!stop.key) continue;
      if (!index.has(stop.key)) index.set(stop.key, { key: stop.key, lines: new Set(), variants: new Map() });
      const entry = index.get(stop.key);
      entry.lines.add(line.number);
      const variant = entry.variants.get(stop.label) || { ...stop, count: 0 };
      variant.count += 1;
      entry.variants.set(stop.label, variant);
    }
  }
  for (const entry of index.values()) {
    const hasPrefix = (option) => Number(RP.normalizar(option.label) !== option.key);
    const [best] = [...entry.variants.values()].sort((a, b) =>
      b.count - a.count || hasPrefix(b) - hasPrefix(a) || a.label.localeCompare(b.label, "pt-BR"));
    entry.label = best.label;
    entry.bairro = best.bairro;
  }

  const places = (window.riopretransLugares || []).flatMap(({ nome, via }) => {
    const entry = index.get(RP.chaveVia(via));
    if (!entry) { console.warn("Via fora do índice:", via); return []; }
    const key = RP.chaveVia(nome);
    return [{ ...entry, key, routeKey: entry.key, label: nome, via: entry.label, bairro: false }];
  });
  RP.local = (text) => {
    const key = RP.chaveVia(text || "");
    return places.find((place) => place.key === key) || index.get(key);
  };
  RP.sugerir = (text, knownPlaces = true) => {
    const key = RP.chaveVia(text);
    if (key.length < 2) return [];
    const words = key.split(" ");
    const matching = [...(knownPlaces ? places : []), ...index.values()]
      .filter((entry) => words.every((word) => entry.key.includes(word)));
    return matching.sort((a, b) => Number(Boolean(b.via)) - Number(Boolean(a.via)) ||
      Number(b.key.startsWith(key)) - Number(a.key.startsWith(key)) ||
      b.lines.size - a.lines.size || a.label.localeCompare(b.label, "pt-BR")).slice(0, 6);
  };
  RP.parecidos = (text) => {
    const key = RP.chaveVia(text);
    const words = key.split(" ").filter((word) => word.length >= 4);
    return [...index.values()].filter((entry) => entry.key !== key && words.some((word) => entry.key.includes(word)))
      .sort((a, b) => b.lines.size - a.lines.size).slice(0, 3);
  };
  RP.candidatas = (destination, origin, date) => {
    const target = destination.routeKey || destination.key;
    const start = origin === "minha-localizacao" ? "terminal central" : origin;
    return routes.filter(({ stops }) => {
      const from = stops.findIndex(({ key }) => key === start);
      return from >= 0 && (origin !== "minha-localizacao" || from === 0) &&
        stops.some(({ key }, index) => index > from && key === target);
    }).map((line) => ({ line, times: RP.proximosHorarios(line, date) }))
      .sort((a, b) => {
        const rank = ({ times }) => times.proximos[0]?.minutos ??
          (times.futuro ? times.futuro.offset * 1440 + RP.minutosDoDia(times.futuro.hora) : Infinity);
        return rank(a) - rank(b);
      });
  };
  RP.recentesKey = "riopretrans-recentes";
  RP.guardarDestino = (label, key) => {
    if (!label?.trim()) return;
    const item = { label: label.trim(), key: key || label.trim() };
    const previous = RP.listaLocal(RP.recentesKey).filter((entry) => RP.chaveVia(entry.key || "") !== RP.chaveVia(item.key));
    RP.gravarJSON(RP.recentesKey, [item, ...previous].slice(0, 5));
  };
  RP.destinoUrl = (text) => RP.comParametros("planejar.html?destino=" + encodeURIComponent(text));
  RP.entradaBusca = (id, label, text = "") => `
    <label for="${id}">${esc(label)}</label>
    <input id="${id}" type="search" autocomplete="off" placeholder="Ex.: Bady Bassitt" value="${esc(text)}">
  `;
  RP.listaResultados = (entries) => entries.map((entry) => `
    <button class="rp-suggestion" type="button" data-place="${esc(entry.key)}">
      <strong>${esc(entry.label)}</strong>
      <span>${entry.via ? "Na " + esc(entry.via) + " · " : ""}
        ${entry.bairro ? "Bairro · " : ""}${entry.lines.size}
        ${entry.lines.size === 1 ? "linha passa aqui" : "linhas passam aqui"}</span>
    </button>`).join("");

  RP.conectarBusca = (input, results, { choose, lines = false, change = () => {}, focus = true }) => {
    const draw = () => {
      const value = input.value.trim();
      const matches = RP.sugerir(value, lines);
      const term = RP.normalizar(value);
      const lineMatches = lines && term.length >= 1 ? (window.riopretransLines || [])
        .filter(([number, name]) => number === term || (term.length >= 2 && RP.normalizar(name).includes(term))).slice(0, 3) : [];
      const similar = !matches.length && !lineMatches.length && value.length >= 3 ? RP.parecidos(value) : [];
      results.innerHTML = RP.listaResultados(matches) + (lineMatches.length ? "<h2>Linhas</h2>" + lineMatches.map(([num, name]) =>
        `<a class="rp-suggestion" href="${esc(RP.comParametros("horarios.html?linha=" + encodeURIComponent(num)))}">Linha ${esc(num)} · ${esc(name)}</a>`).join("") : "") +
        (!matches.length && !lineMatches.length && value.length >= 3 ?
          '<p role="status"><strong>Não achamos esse lugar.</strong> Tente o nome da rua ou do bairro, sem o número.</p>' : "") +
        (similar.length ? "<p>Ruas com nome parecido:</p>" + RP.listaResultados(similar) : "");
    };
    input.addEventListener("input", () => { change(input.value); draw(); });
    input.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" && results.querySelector("button, a")) {
        event.preventDefault();
        results.querySelector("button, a").focus();
      }
    });
    results.addEventListener("click", (event) => {
      const button = event.target.closest("[data-place]");
      if (button) choose(RP.local(button.dataset.place));
    });
    if (focus) draw();
    return draw;
  };

  const home = document.querySelector("#rp-home-form");
  if (!home) return;
  const step = document.querySelector("#rp-home-step");
  if (step) step.hidden = !RP.parametros().passos;
  for (const link of document.querySelectorAll(".rp-primary-links a, .rp-saved-link, .hero-copy a")) {
    link.href = RP.comParametros(link.getAttribute("href"));
  }
  const input = home.querySelector("input");
  const open = (value) => { location.href = RP.destinoUrl(value); };
  RP.conectarBusca(input, home.querySelector(".rp-results"), { choose: (entry) => open(entry.key), lines: true });
  home.addEventListener("submit", (event) => {
    event.preventDefault();
    if (input.value.trim()) open(input.value.trim());
  });
  const recents = document.querySelector("#rp-home-recents");
  const items = RP.listaLocal(RP.recentesKey);
  if (items.length) recents.innerHTML = "<h2>Recentes</h2>" + items.map((item) =>
    `<a href="${esc(RP.destinoUrl(item.key))}">${esc(item.label)}</a>`).join("");
})();
