(() => {
  "use strict";

  const RP = window.RP;
  const esc = RP.escape;
  const main = document.querySelector("#rp-planner");
  const saved = document.querySelector("#rp-saved");
  const savedKey = "riopretrans-minhas-rotas";
  const locationKey = "minha-localizacao";
  const params = new URLSearchParams(location.search);
  const demo = RP.parametros();
  const routesHref = esc(RP.comParametros("minhas-rotas.html"));
  const planHref = esc(RP.comParametros("planejar.html"));
  const linkToRoute = ({ destinoChave, origem, linha }) => RP.comParametros("planejar.html?" +
    new URLSearchParams({ destino: destinoChave, origem, linha, salva: "1" }));
  const button = (action, label, primary = false) =>
    `<button type="button" class="button ${primary ? "button-dark" : "button-outline"}" data-action="${action}">${label}</button>`;
  const demoLabel = (step) => demo.passos ? `<p class="rp-meta">Modo apresentação · ${step}</p>` : "";

  if (saved) {
    const feedback = document.querySelector("#rp-feedback");
    const drawSaved = () => {
      const items = RP.listaLocal(savedKey);
      saved.innerHTML = items.length ? items.map((item) => `
        <article class="rp-option">
          <h2>${esc(item.destino)}</h2>
          <p>Linha ${esc(item.linha)} · Embarque: ${esc(item.embarque || item.origemRotulo)}</p>
          <a class="button button-dark" href="${esc(linkToRoute(item))}">Abrir</a>
          <button class="button button-outline" type="button" data-remove="${esc(item.id)}">Remover</button>
        </article>`).join("") : `<p>Nenhuma rota salva ainda.</p><a class="button button-dark" href="${planHref}">Planejar uma viagem</a>`;
    };
    saved.addEventListener("click", (event) => {
      const remove = event.target.closest("[data-remove]");
      if (!remove) return;
      if (RP.gravarJSON(savedKey, RP.listaLocal(savedKey).filter((item) => item.id !== remove.dataset.remove))) {
        drawSaved();
        feedback.textContent = "Rota removida.";
        (saved.querySelector("a") || document.querySelector("h1")).focus();
      } else feedback.textContent = "Não foi possível remover neste navegador.";
    });
    document.querySelector("#rp-saved-step").innerHTML = demoLabel("Passo 17");
    drawSaved();
  }
  if (!main) return;
  const feedback = document.querySelector("#rp-feedback");
  const initialText = params.get("destino") || "";
  let destination = RP.local(initialText);
  let destText = destination?.label || initialText;
  let originText = RP.local(params.get("origem"))?.label || "";
  let origin = RP.local(params.get("origem"))?.key || locationKey;
  let manual = origin !== locationKey;
  let view = "destino";
  let candidates = [];
  let chosen = null;
  let networkErrorShown = false;
  let task = 0;
  let sequence = 0;
  const snapshots = new Map();
  const snapshot = () => ({ destination, destText, originText, origin, manual, candidates, chosen });
  function remember() {
    if (history.state?.rpId !== undefined) snapshots.set(history.state.rpId, snapshot());
  }
  const originLabel = () => origin === locationKey ? "Terminal Central" : RP.local(origin)?.label || originText;
  const announce = (text = "") => { feedback.textContent = text; };
  const actions = (...content) => '<div class="rp-actions">' + content.join("") + "</div>";

  function draw(next, historyMode = "push") {
    view = next;

    if (historyMode === "push" || historyMode === "replace") {
      const rpId = ++sequence;
      snapshots.set(rpId, snapshot());
      if (historyMode === "push") history.pushState({ rpView: next, rpId }, "");
      else history.replaceState({ rpView: next, rpId }, "");
    }
    const screens = {
      destino: ["Para onde você vai?", "Passos 4 a 7"],
      origem: ["De onde você sai?", manual ? "Passo 9a" : "Passos 8 e 9"],
      busca: ["Buscando linhas…", "Passos 10 e 11"],
      erro: ["Sem conexão agora.", "Passos 11a a 11d"],
      nenhuma: ["Nenhuma linha passa aí.", "Passos 12a a 12c"],
      pronta: ["Rota pronta", "Passos 13 a 15"],
      opcoes: ["Outras opções", "Passos 14a e 14b"],
    };
    const [title, step] = screens[next];
    main.innerHTML = demoLabel(step) + `
      <div class="rp-top">
        ${next === "destino" ? `<a href="${esc(RP.comParametros("index.html"))}">← Voltar</a>` : button("back", "← Voltar")}
        ${button("cancel", "Cancelar")}
      </div>
      <h1 tabindex="-1">${title}</h1>
      <div id="rp-screen"${next === "busca" ? ' aria-busy="true"' : ""}></div>`;
    const panel = main.querySelector("#rp-screen");
    if (next === "destino") drawDestination(panel);
    if (next === "origem") drawOrigin(panel);
    if (next === "busca") panel.innerHTML = '<span class="rp-spinner" aria-hidden="true"></span>';
    if (next === "erro") panel.innerHTML = '<p>Seu destino fica guardado. Tente de novo quando a internet voltar.</p>' +
      actions(button("search", "Tentar de novo", true));
    if (next === "nenhuma") drawNoRoute(panel);
    if (next === "pronta") drawRoute(panel);
    if (next === "opcoes") drawOptions(panel);
    announce(next === "busca" || next === "pronta" || next === "erro" || next === "nenhuma" ? title : "");
    main.querySelector("h1").focus();
  }

  function chooseDestination(entry) {
    if (!entry) return;
    remember();
    destination = entry;
    destText = entry.label;
    RP.guardarDestino(entry.label, entry.key);
    draw("origem");
  }

  function drawDestination(panel) {
    const recent = RP.listaLocal(RP.recentesKey);
    panel.innerHTML = '<form class="rp-form">' + RP.entradaBusca("rp-destination", "Digite a rua, o bairro ou o lugar", destText) +
      '<button class="button button-dark" type="submit">Buscar</button><div class="rp-results"></div></form>' +
      (recent.length ? '<h2>Recentes</h2><div class="rp-actions">' + recent.map((item) =>
        `<button type="button" class="button button-outline" data-recent="${esc(item.key)}">${esc(item.label)}</button>`).join("") + "</div>" : "");
    const input = panel.querySelector("input");
    RP.conectarBusca(input, panel.querySelector(".rp-results"), {
      choose: chooseDestination, lines: true, change: (value) => { destText = value; remember(); },
    });
    panel.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      const exact = RP.local(input.value);
      if (exact) chooseDestination(exact);
      else panel.querySelector(".rp-results button, .rp-results a")?.focus();
    });
    panel.querySelectorAll("[data-recent]").forEach((item) => item.addEventListener("click", () => {
      const exact = RP.local(item.dataset.recent);
      if (exact) chooseDestination(exact);
      else {
        input.value = destText = item.dataset.recent;
        input.dispatchEvent(new Event("input"));
        input.focus();
      }
    }));
  }

  function drawOrigin(panel) {
    panel.innerHTML = `
      <p class="rp-meta">Destino: ${esc(destination.label)}</p>
      <fieldset class="rp-origins">
        <legend>Escolha o ponto de partida</legend>
        <label><input type="radio" name="origem" value="automatic" ${manual ? "" : "checked"}>
          <span>Minha localização <small>Neste protótipo, sua localização é simulada: Terminal Central.</small></span>
        </label>
        <label><input type="radio" name="origem" value="manual" ${manual ? "checked" : ""}>
          <span>Digitar de onde saio</span>
        </label>
      </fieldset>
      <div class="rp-form" id="rp-origin-group" ${manual ? "" : "hidden"}>
        ${RP.entradaBusca("rp-origin", "Digite a rua ou o bairro de onde você sai", originText)}
        <div class="rp-results"></div>
      </div>
      <p id="rp-origin-choice" role="status"></p>
      ${actions(button("search", "Buscar linhas", true), button("change", "Mudar o destino"))}`;
    const group = panel.querySelector("#rp-origin-group");
    const choice = panel.querySelector("#rp-origin-choice");
    const input = group.querySelector("input");
    const submit = panel.querySelector('[data-action="search"]');
    const sync = () => {
      submit.disabled = !origin;
      choice.textContent = manual && origin ? "Origem escolhida: " + originLabel() : "";
    };
    const choose = (entry) => {
      origin = entry.key;
      originText = input.value = entry.label;
      group.querySelector(".rp-results").innerHTML = "";
      sync();
      submit.focus();
    };
    RP.conectarBusca(input, group.querySelector(".rp-results"), {
      choose, change: (value) => { originText = value; origin = null; sync(); },
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        const entry = RP.local(input.value);
        if (entry) choose(entry);
      }
    });
    panel.querySelectorAll('[name="origem"]').forEach((radio) => radio.addEventListener("change", () => {
      manual = radio.value === "manual";
      origin = manual ? RP.local(originText)?.key || null : locationKey;
      group.hidden = !manual;
      sync();
      remember();
      if (manual) input.focus();
    }));
    sync();
  }

  function drawNoRoute(panel) {
    const near = RP.parecidos(destination.label).filter((entry) => entry.key !== destination.key &&
      entry.key !== destination.routeKey);
    panel.innerHTML = `<p>Não encontramos linha que vá de ${esc(originLabel())} até ${esc(destination.label)}.</p>` +
      (near.length ? '<p>Ruas com nome parecido:</p><div class="rp-results">' + RP.listaResultados(near) + "</div>" : "") +
      actions(button("change", "Mudar o destino", true),
        '<a class="button button-outline" href="tel:1733538322">Ligar para o atendimento</a>') +
      "<p>(17) 3353-8322 · de segunda a sexta, das 8h às 18h</p>";
    panel.querySelectorAll("[data-place]").forEach((node) => node.addEventListener("click", () =>
      chooseDestination(RP.local(node.dataset.place))));
  }

  function boarding(line) {
    if (origin !== locationKey) return originLabel();
    return "Terminal Central" + (line.platform ? ", plataforma " + line.platform : ", plataforma não informada no quadro oficial");
  }

  function drawRoute(panel) {
    const { line, times } = chosen;
    const departures = RP.descreverProximos(times);
    const boards = boarding(line);
    const share = "Rota RioPretrans: linha " + line.number + " (" + line.name + "). Embarque: " + boards +
      ". " + departures + ". Onde descer: " + destination.label + ". (Protótipo acadêmico, horários de 15/10/2026.)";
    const start = line.stops.findIndex(({ key }) => key === (origin === locationKey ? "terminal central" : origin));
    const end = line.stops.findIndex(({ key }, i) => i > start && key === (destination.routeKey || destination.key));
    panel.innerHTML = `
      <div class="rp-ticket">
        <p class="rp-line"><span class="result-num">${esc(line.number)}</span><strong>${esc(line.name)}</strong></p>
        <p><strong>Embarque:</strong> ${esc(boards)}</p>
        <p><strong>Onde descer:</strong> ${esc(destination.label)}</p>
        <p>${esc(departures)}</p>
        ${origin !== locationKey ? "<p>O quadro oficial não informa o ponto exato nem o horário em que o ônibus passa ali. Os horários acima são os da linha.</p>" : ""}
        ${times.feriado ? "<p><strong>" + RP.FERIADO + "</strong></p>" : ""}
      </div>
      ${actions(button("save", "Salvar", true),
        `<a class="button button-outline" href="https://wa.me/?text=${esc(encodeURIComponent(share))}" target="_blank" rel="noreferrer">Enviar pelo WhatsApp</a>`,
        button("notify", "Avisar onde descer"))}
      <div id="rp-route-status" role="status"></div>
      ${actions(candidates.length > 1 ? button("options", "Outras opções") : "", button("new", "Nova busca"))}
      <details class="rp-itinerary">
        <summary>Ver o caminho da linha (${line.stops.length} ruas)</summary>
        <ol>${line.stops.map(({ label, bairro }, i) =>
          "<li>" + (i === end ? "<mark>" + esc(label) + " · desça aqui</mark>" : esc(label)) +
          (i === start ? " · embarque" : "") + (bairro ? " · bairro" : "") + "</li>").join("")}</ol>
      </details>
      ${RP.gruposDistintos(times.hoje) > 1 ? '<p class="rp-meta">' + RP.LEGENDA_GRUPOS + "</p>" : ""}
      <p class="rp-meta">${RP.DADOS}</p>`;
  }

  function drawOptions(panel) {
    const other = candidates.filter((entry) => entry !== chosen).slice(0, 3);
    panel.innerHTML = "<p>Até 3 linhas, da que sai antes.</p>" +
      (other.length ? other.map(({ line, times }) => `
        <article class="rp-option">
          <h2>Linha ${esc(line.number)} · ${esc(line.name)}</h2>
          <p>${esc(RP.descreverProximos(times, "Próximo: "))}</p>
          <p>${line.platform ? "Plataforma " + esc(line.platform) : "Plataforma não informada no quadro oficial"}</p>
          <button type="button" class="button button-dark" data-line="${esc(line.number)}">Escolher</button>
        </article>`).join("") : "<p>Só esta linha passa aí.</p>") + '<p class="rp-meta">' + RP.DADOS + "</p>";
  }

  async function search(preferred) {
    const originKey = origin === locationKey ? "terminal central" : origin;
    if (!origin || !destination) return;
    if (originKey === (destination.routeKey || destination.key)) {
      announce("O destino é o mesmo lugar de onde você sai.");
      return;
    }
    remember();
    const current = ++task;
    draw("busca", history.state?.rpView === "erro" ? "replace" : "push");
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (current !== task || view !== "busca") return;
    const simulatedError = demo.simular.has("sem-conexao") && !networkErrorShown;
    if ((navigator.onLine === false && params.get("salva") !== "1") || simulatedError) {
      networkErrorShown = true;
      draw("erro", "replace");
      return;
    }
    candidates = demo.simular.has("sem-linha") ? [] : RP.candidatas(destination, origin, RP.agora());
    chosen = candidates.find(({ line }) => line.number === preferred) || candidates[0];
    draw(chosen ? "pronta" : "nenhuma", "replace");
  }

  function saveRoute() {
    const { line } = chosen;
    const item = {
      id: JSON.stringify([destination.key, origin, line.number]),
      destino: destination.label, destinoChave: destination.key, origem: origin, origemRotulo: originLabel(),
      linha: line.number, nome: line.name, plataforma: line.platform, embarque: boarding(line),
      salvaEm: new Date().toISOString(),
    };
    const items = RP.listaLocal(savedKey).filter((route) => route.id !== item.id);
    const ok = RP.gravarJSON(savedKey, [item, ...items]);
    const message = ok ? navigator.serviceWorker?.controller ?
      "Rota salva. Abre sem internet em Minhas rotas." : "Rota salva em Minhas rotas." :
      "Não foi possível salvar neste navegador.";
    main.querySelector("#rp-route-status").innerHTML = demoLabel("Passos 16 e 17") +
      `<p>${message} <a href="${routesHref}">Ver Minhas rotas</a></p>`;
  }

  function back() {
    task += 1;
    if (view !== "destino") { remember(); history.back(); }
  }

  main.addEventListener("click", (event) => {
    const other = event.target.closest("[data-line]");
    if (other) {
      chosen = candidates.find(({ line }) => line.number === other.dataset.line);
      draw("pronta", "replace");
      return;
    }
    switch (event.target.closest("[data-action]")?.dataset.action) {
      case "back": back(); break;
      case "cancel":
        RP.guardarDestino(view === "destino" ? destText : destination?.label, view === "destino" ? null : destination?.key);
        location.href = RP.comParametros("index.html");
        break;
      case "change":
        draw("destino");
        main.querySelector("#rp-destination").focus();
        break;
      case "new": destination = null; destText = ""; originText = ""; origin = locationKey; manual = false; draw("destino"); break;
      case "search": search(); break;
      case "save": saveRoute(); break;
      case "notify":
        main.querySelector("#rp-route-status").textContent =
          "Aviso ativado (simulação): o app avisaria quando o ônibus estivesse chegando a " + destination.label + ".";
        break;
      case "options": draw("opcoes"); break;
    }
  });
  window.addEventListener("popstate", (event) => {
    task += 1;
    const next = event.state?.rpView || "destino";
    const state = snapshots.get(event.state?.rpId);
    if (state) ({ destination, destText, originText, origin, manual, candidates, chosen } = state);
    if (next === "busca") { search(); return; }
    draw((next === "pronta" || next === "opcoes") && !chosen ? "origem" : next, "none");
  });

  draw("destino", "replace");
  if (destination) {
    remember();
    RP.guardarDestino(destination.label, destination.key);
    draw("origem");
    if (params.has("origem") && (params.get("origem") === locationKey || manual)) search(params.get("linha"));
  }
})();
