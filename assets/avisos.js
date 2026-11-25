(() => {
  "use strict";

  // Inclua somente avisos confirmados no informativo oficial.
  // { data: "AAAA-MM-DD", titulo: "Título", texto: "Descrição", linhas: ["214"] }
  const avisos = [];
  window.riopretransAvisos = avisos;

  const dateLabel = (date) => date.split("-").reverse().join("/");
  const order = (items) => [...items].sort((a, b) => b.data.localeCompare(a.data));
  const current = () => order(window.riopretransAvisos);
  const message = (tag, value) => {
    const element = document.createElement(tag);
    element.textContent = value;
    return element;
  };
  function renderNotice(item, titleTag = "h3") {
    const entry = document.createElement("article");
    entry.className = "notice-card";
    const date = message("time", dateLabel(item.data));
    date.dateTime = item.data;
    date.className = "notice-date";
    const text = document.createElement("div");
    text.append(message(titleTag, item.titulo), message("p", item.texto));
    if (item.linhas?.length) text.append(message("p", "Linhas: " + item.linhas.join(", ")));
    entry.append(date, text);
    return entry;
  }

  window.RioPretransAvisos = {
    render() {
      const list = document.querySelector("#avisos-lista");
      const summary = document.querySelector("#avisos-resumo");
      const items = current();
      if (summary) summary.textContent = items[0]?.titulo || "Nenhum aviso no momento.";
      if (list) list.replaceChildren(...(items.length ? items.map((item) => renderNotice(item)) :
        [message("p", "Nenhum aviso no momento.")]));
    },
    renderLine(section, number) {
      const items = current().filter((item) => item.linhas?.includes(String(number)));
      if (!items.length) return;
      const group = document.createElement("section");
      group.className = "rp-line-notices notice-list";
      group.setAttribute("aria-label", "Avisos da linha " + number);
      group.append(message("h3", "Avisos da linha"), ...items.map((item) => renderNotice(item, "h4")));
      section.prepend(group);
    },
  };
  window.RioPretransAvisos.render();
})();
