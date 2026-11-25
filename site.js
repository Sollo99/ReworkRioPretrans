const logo =
  '<img class="brand-logo-image" src="assets/logo.png" alt="Consórcio RioPretrans" />';

const header = `
  <div class="prototype-notice" role="note">
    Protótipo acadêmico — IHC · FATEC Rio Preto. Não é o site oficial da RioPretrans.
    <a href="https://www.riopretrans.com.br" target="_blank" rel="noreferrer">Ir para o site oficial ↗</a>
  </div>
  <div class="announcement">
    Ouvidoria <a href="tel:08007782345"><b>0800 778-2345</b></a>
    <span class="announcement-divider">•</span>
    Atendimento <a href="tel:1733538322"><b>(17) 3353-8322</b></a>
  </div>
  <header class="site-header">
    <a class="brand" href="index.html" aria-label="RioPretrans, página inicial">${logo}</a>
    <button class="menu-toggle" aria-label="Abrir menu" aria-expanded="false">
      <span></span><span></span>
    </button>
    <nav class="main-nav" aria-label="Navegação principal">
      <details class="nav-dropdown">
        <summary>Sistema de Transporte</summary>
        <div class="dropdown-menu">
          <a href="portal-info.html?page=terminal">Terminal Urbano</a>
          <a href="portal-info.html?page=cartao-cidadao">Cartão Cidadão</a>
          <a href="portal-info.html?page=cartao-vt">Cartão Vale Transporte</a>
          <a href="portal-info.html?page=cartao-estudante">Cartão Estudante</a>
          <a href="portal-info.html?page=cartao-idoso">Cartão Idoso</a>
          <a href="portal-info.html?page=cartao-deficiente">Cartão Deficiente</a>
          <a href="portal-info.html?page=decretos">Decretos</a>
        </div>
      </details>
      <details class="nav-dropdown">
        <summary>Empresa</summary>
        <div class="dropdown-menu">
          <a href="portal-info.html?page=quem-somos">Quem Somos</a>
          <a href="frota.html">Frota</a>
          <a href="portal-info.html?page=trabalhe-conosco">Trabalhe Conosco</a>
        </div>
      </details>
      <details class="nav-dropdown">
        <summary>Serviços</summary>
        <div class="dropdown-menu">
          <a href="horarios.html">Linhas e Horários</a>
          <a href="planejar.html">Planejar viagem</a>
          <a href="minhas-rotas.html">Minhas rotas</a>
          <a href="portal-info.html?page=venda-de-creditos">Venda de Créditos</a>
          <a href="https://ww01.rptrans.com.br/fenix/login.php" target="_blank" rel="noreferrer">Sistema online ↗</a>
          <a href="estudante.html">Área do Estudante</a>
          <a href="integracao.html">Tabela de Integração</a>
          <a href="informativo.html">Informativo</a>
        </div>
      </details>
      <details class="nav-dropdown">
        <summary>Central de Atendimento</summary>
        <div class="dropdown-menu">
          <a href="ajuda.html">Dúvidas Frequentes</a>
          <a href="portal-info.html?page=duvidas-vt">Dúvidas Sistema VT</a>
          <a href="portal-info.html?page=fale-conosco">Fale Conosco</a>
        </div>
      </details>
    </nav>
    <div class="header-actions">
      <div class="rp-text-controls" role="group" aria-label="Tamanho do texto">
        <button type="button" data-text-size="down" aria-label="Diminuir o texto">A−</button>
        <button type="button" data-text-size="up" aria-label="Aumentar o texto">A+</button>
      </div>
      <button class="theme-toggle" type="button" aria-label="Ativar modo escuro" title="Alternar tema">
        <span aria-hidden="true">☾</span>
      </button>
      <a class="header-cta" href="horarios.html">Consultar horários <span aria-hidden="true">↗</span></a>
    </div>
  </header>
`;

const footer = `
  <footer class="site-footer">
    <div class="footer-main">
      <a class="brand brand-footer" href="index.html">${logo}</a>
      <p>Conectando pessoas<br />e caminhos todos os dias.</p>
      <div class="footer-links">
        <div class="footer-link-group">
          <strong>EMPRESA</strong>
          <a href="portal-info.html?page=quem-somos">Quem Somos</a>
          <a href="frota.html">Frota</a>
          <a href="portal-info.html?page=trabalhe-conosco">Trabalhe Conosco</a>
          <a href="privacidade.html">Política de Privacidade</a>
        </div>
        <div class="footer-link-group">
          <strong>SERVIÇOS</strong>
          <a href="horarios.html">Linhas e Horários</a>
          <a href="planejar.html">Planejar viagem</a>
          <a href="minhas-rotas.html">Minhas rotas</a>
          <a href="portal-info.html?page=venda-de-creditos">Venda de Créditos</a>
          <a href="integracao.html">Tabela de Integração</a>
          <a href="estudante.html">Área do Estudante</a>
          <a href="informativo.html">Informativo</a>
          <a href="https://ww01.rptrans.com.br/div/vto.htm?1" target="_blank" rel="noreferrer">GRE ↗</a>
        </div>
        <div class="footer-link-group">
          <strong>SISTEMA DE TRANSPORTE</strong>
          <a href="portal-info.html?page=terminal">Terminal Urbano</a>
          <a href="portal-info.html?page=cartao-cidadao">Cartões</a>
          <a href="portal-info.html?page=decretos">Decretos</a>
          <a href="frota.html">Dados técnicos</a>
        </div>
        <div class="footer-link-group">
          <strong>ATENDIMENTO</strong>
          <a href="ajuda.html">Dúvidas Frequentes</a>
          <a href="portal-info.html?page=duvidas-vt">Dúvidas Sistema VT</a>
          <a href="portal-info.html?page=fale-conosco">Fale Conosco</a>
        </div>
      </div>
      <div class="footer-contact">
        <span>ATENDIMENTO</span>
        <a href="tel:1733538322">(17) 3353-8322</a>
        <small>Seg. a sex. · 8h às 18h</small>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Consórcio RioPretrans</span>
      <span>Mobilidade feita para a nossa cidade <b>✳</b></span>
    </div>
  </footer>
`;

const cookie = `
  <div class="cookie-banner" id="cookie-banner" role="region" aria-label="Aviso sobre cookies">
    <p>Usamos cookies. <a href="privacidade.html">Política de privacidade</a></p>
    <button id="cookie-accept">Aceitar</button>
  </div>
`;

document
  .querySelector("[data-site-header]")
  ?.insertAdjacentHTML("afterend", header);
document
  .querySelector("[data-site-footer]")
  ?.insertAdjacentHTML("beforebegin", footer);
document.body.insertAdjacentHTML("beforeend", cookie);

const currentPage = location.pathname.split("/").pop() || "index.html";
const currentRoute = `${currentPage}${location.search}`;

if (currentPage === "horarios.html") {
  document.querySelector(".header-cta")?.setAttribute("hidden", "");
}

document.querySelectorAll(".main-nav a").forEach((link) => {
  if (
    link.getAttribute("href") === currentRoute ||
    link.getAttribute("href") === currentPage
  ) {
    link.setAttribute("aria-current", "page");
  }
});

document.querySelectorAll(".nav-dropdown").forEach((group) => {
  const containsCurrentPage = [...group.querySelectorAll("a")].some((link) =>
    [currentRoute, currentPage].includes(link.getAttribute("href")),
  );

  if (containsCurrentPage) group.classList.add("current-group");
});

(() => {
  const levels = [100, 112.5, 125, 150, 175, 200];
  const down = document.querySelector('[data-text-size="down"]');
  const up = document.querySelector('[data-text-size="up"]');
  let index = 0;
  try { index = Math.max(0, levels.indexOf(Number(localStorage.getItem("riopretrans-texto")))); }
  catch {}

  function updateSize() {
    document.documentElement.style.fontSize = levels[index] + "%";
    document.documentElement.toggleAttribute("data-large-text", levels[index] >= 125);
    down.disabled = index === 0;
    up.disabled = index === levels.length - 1;
  }
  if (down && up) {
    updateSize();
    for (const [button, delta] of [[down, -1], [up, 1]]) {
      button.addEventListener("click", () => {
        index = Math.min(levels.length - 1, Math.max(0, index + delta));
        try { localStorage.setItem("riopretrans-texto", levels[index]); } catch {}
        updateSize();
        if (button.disabled) (button === down ? up : down).focus();
      });
    }
  }

  const page = location.pathname.split("/").pop();
  if (!page || ["index.html", "horarios.html", "planejar.html", "minhas-rotas.html"].includes(page)) {
    document.querySelector(".header-cta")?.remove();
  }

  document.body.insertAdjacentHTML("beforeend", `
    <dialog class="rp-dialog" aria-labelledby="rp-leave-title">
      <h2 id="rp-leave-title">Você vai sair deste site</h2>
      <p id="rp-leave-description"></p>
      <div class="rp-actions">
        <button type="button" class="button button-outline" autofocus>Voltar</button>
        <a class="button button-dark" target="_blank" rel="noreferrer">Continuar</a>
      </div>
    </dialog>`);
  const dialog = document.querySelector(".rp-dialog");
  const continueLink = dialog.querySelector("a");
  let opener = null;
  dialog.querySelector("button").addEventListener("click", () => dialog.close());
  continueLink.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    if (opener?.getClientRects().length) opener.focus();
    else if (opener) {
      const nav = opener.closest(".main-nav");
      if (nav && !nav.getClientRects().length) document.querySelector(".menu-toggle")?.focus();
      else opener.closest("details")?.querySelector("summary")?.focus();
    }
  });

  const intercept = (event) => {
    if (event.type === "auxclick" && event.button !== 1) return;
    const link = event.target.closest?.("a[href]");
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (url.hostname !== "ww01.rptrans.com.br") return;
    event.preventDefault();
    event.stopPropagation();
    opener = link;
    const name = url.pathname.includes("/fenix/") ? "O sistema do cartão (Fenix)" :
      url.pathname.includes("/portal_estudante/") ? "O portal do estudante" : "Este sistema";
    dialog.querySelector("p").textContent =
      name + " fica em outro site da RioPretrans, com outra aparência: ww01.rptrans.com.br.";
    continueLink.href = url.href;
    if (!dialog.open) dialog.showModal();
  };
  document.addEventListener("click", intercept, true);
  document.addEventListener("auxclick", intercept, true);
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
})();
