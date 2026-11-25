(() => {
  "use strict";

  const RP = window.RP = {};
  const holidays = ["01-01", "04-21", "05-01", "09-07", "10-12", "11-02", "11-15", "11-20", "12-25"];
  // Incluir datas municipais depois de confirmar com a Prefeitura.
  const municipal = [];
  const prefix = /^(av avenida|estrada municipal|estrada vicinal|avenida|rodovia|travessa|alameda|estrada|praca|rua|av|rod|pca|tv|al|r)\s+/;
  const plain = (value) => value.normalize("NFD").replace(/\p{M}/gu, "")
    .toLowerCase().replace(/[().]/g, " ").replace(/\s+/g, " ").trim();

  RP.consertarAcentos = (value) => {
    let text = value.replace(/(\p{Ll})([ÀÁÂÃÄÇÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜ])+/gu,
      (chunk) => chunk.toLowerCase());
    return text.replace(/(?<=\p{L}\s)(De|Do|Da|Dos|Das|E)(?=\s\p{L})/gu, (word) => word.toLowerCase());
  };
  RP.normalizar = (text) => plain(RP.consertarAcentos(text));
  RP.chaveVia = (text) => RP.normalizar(text).replace(prefix, "");
  RP.escape = (text) => String(text ?? "").replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  RP.itinerario = (line) => (line?.path || "").split(",").map((item) => item.trim()).filter(Boolean)
    .map((item) => {
      const bairro = /^\(.*\)$/.test(item);
      const label = RP.consertarAcentos(bairro ? item.slice(1, -1).trim() : item);
      return { key: RP.chaveVia(item), label: label.charAt(0).toUpperCase() + label.slice(1), bairro };
    });
  RP.parametros = () => {
    const params = new URLSearchParams(location.search);
    return { simular: new Set((params.get("simular") || "").split(",").filter(Boolean)),
      demo: ["passos", "hora", "simular"].some((key) => params.has(key)),
      passos: params.get("passos") === "1", hora: params.get("hora") };
  };
  RP.comParametros = (href) => {
    const url = new URL(href, location.href);
    const params = new URLSearchParams(location.search);
    for (const key of ["simular", "passos", "hora"]) {
      if (params.has(key)) url.searchParams.set(key, params.get(key));
    }
    return url.pathname.split("/").pop() + url.search + url.hash;
  };
  RP.agora = () => {
    const date = new Date();
    const override = RP.parametros().hora;
    if (/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(override || "")) {
      const [hours, minutes] = override.split(":").map(Number);
      date.setHours(hours, minutes, 0, 0);
    }
    return date;
  };
  RP.tipoDeDia = (date, referencia = RP.agora()) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const md = month + "-" + day;
    const mesmoDia = date.getFullYear() === referencia.getFullYear() &&
      date.getMonth() === referencia.getMonth() && date.getDate() === referencia.getDate();
    const simulado = mesmoDia && RP.parametros().simular.has("feriado");
    const feriado = holidays.includes(md) || municipal.includes(md) ||
      municipal.includes(date.getFullYear() + "-" + md) || simulado;
    return { tipo: feriado || date.getDay() === 0 ? "dom" : date.getDay() === 6 ? "sab" : "util", feriado };
  };
  RP.juntarPeriodos = (periods = []) => {
    const days = { util: [], sab: [], dom: [] };
    for (const { label, times } of periods) {
      const key = RP.normalizar(label);
      const type = /doming|feriad/.test(key) ? "dom" : /sab/.test(key) ? "sab" : /seg/.test(key) ? "util" : null;
      if (!type) continue;
      for (const time of times) {
        const match = /^(\d{2}:\d{2})(?:\s*\((\d+)\))?$/.exec(time.trim());
        if (match) days[type].push({ hora: match[1], grupo: match[2] || null });
      }
    }
    for (const key of Object.keys(days)) {
      const hasGroups = days[key].some(({ grupo }) => grupo);
      const entries = days[key].filter(({ grupo }) => Boolean(grupo) === hasGroups);
      days[key] = [...new Map(entries.map((entry) => [entry.hora + "|" + entry.grupo, entry])).values()]
        .sort((a, b) => a.hora.localeCompare(b.hora) || Number(a.grupo) - Number(b.grupo));
    }
    return days;
  };
  RP.minutosDoDia = (time) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
  RP.gruposDistintos = (list) => new Set(list.map(({ grupo }) => grupo).filter(Boolean)).size;
  RP.proximosHorarios = (line, date, count = 3) => {
    const days = RP.juntarPeriodos(line?.periods);
    const { tipo, feriado } = RP.tipoDeDia(date, date);
    const now = date.getHours() * 60 + date.getMinutes();
    const today = days[tipo];
    const proximos = today.filter(({ hora }) => RP.minutosDoDia(hora) >= now).slice(0, count)
      .map((entry) => ({ ...entry, minutos: RP.minutosDoDia(entry.hora) - now }));
    let futuro = null;
    for (let offset = 1; !proximos.length && offset <= 7; offset += 1) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + offset);
      const entry = days[RP.tipoDeDia(nextDay, date).tipo][0];
      if (entry) { futuro = { ...entry, offset, date: nextDay }; break; }
    }
    return { tipo, feriado, hoje: today, proximos, futuro };
  };
  RP.horaComGrupo = ({ hora, grupo }, show) => show && grupo ? hora + " (" + grupo + ")" : hora;
  RP.textoEspera = (min) => min === 0 ? "agora" : min < 60 ? "em " + min + " min" : "";
  RP.descreverProximos = (result, prefix = "Próximos horários: ") => {
    const grouped = RP.gruposDistintos(result.hoje) > 1;
    if (result.proximos.length) {
      const wait = RP.textoEspera(result.proximos[0].minutos);
      return prefix + result.proximos.map((entry, index) =>
        RP.horaComGrupo(entry, grouped) + (!index && wait ? " (" + wait + ")" : "")).join(" · ");
    }
    const start = result.hoje.length ? "Não há mais ônibus hoje." : "Esta linha não tem horário hoje.";
    if (!result.futuro) return start;
    const day = result.futuro.offset === 1 ? "amanhã" :
      result.futuro.date.toLocaleDateString("pt-BR", { weekday: "long" });
    return start + " O primeiro de " + day + " sai às " + result.futuro.hora + ".";
  };
  RP.lerJSON = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  };
  RP.gravarJSON = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  };
  RP.listaLocal = (key) => {
    const value = RP.lerJSON(key, []);
    return Array.isArray(value) ? value.filter((item) => item && typeof item === "object") : [];
  };
  RP.DADOS = "Dados do portal RioPretrans capturados em 15/10/2026. Os horários podem sofrer alterações.";
  RP.FERIADO = "Hoje é feriado: valem os horários de domingo e feriado.";
  RP.LEGENDA_GRUPOS = "O número entre parênteses vem do quadro oficial e separa grupos de horários desta linha. O quadro não explica o que cada grupo significa. Confirme no atendimento: (17) 3353-8322.";
})();
