/* ==========================================================================
   4S REAL ESTATE · Versión PDF de la propuesta
   Arma, solo al imprimir, un deck horizontal 16:9 con el mismo formato del
   PDF/Keynote de 4S: láminas institucionales (imágenes en assets/pdf/) +
   láminas del proyecto generadas con window.PROPUESTA.
   El botón "Descargar PDF" llama a window.descargarPDF().
   ========================================================================== */
(function () {
  const B = window.BASE_4S;
  const P = window.PROPUESTA;
  if (!B || !P) return;

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const mxn = (n) => "$" + Number(n).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const list = (arr, fn) => (arr || []).map(fn).join("");
  const img = (n) => `assets/pdf/${n}.jpg`;

  // Láminas fijas del deck (exportadas del PDF original)
  const INSTITUCIONAL = ["01-portada", "02-vision", "03-modelo-negocio", "04-expertise", "05-portafolio", "06-clientes-mexico", "07-clientes-internacional", "08-awards"];
  const INTRO_SERVICIO = {
    "estudio-mercado": ["11-estudio-mercado-portada", "12-estudio-mercado-pilares", { oferta: "13-estudio-oferta" }, { demanda: "14-estudio-demanda" }],
    "definicion-producto": ["17-definicion-producto-portada", "18-definicion-producto-diagrama", "19-definicion-producto-proceso"]
  };
  // Láminas de intro del servicio; las ligadas a un alcance (oferta/demanda) solo si ese alcance va incluido
  const intro = (s) => (INTRO_SERVICIO[s.id] || [])
    .map((x) => (typeof x === "string" ? x : s.alcanceIds.has(Object.keys(x)[0]) ? Object.values(x)[0] : ""))
    .filter(Boolean);

  const servicios = P.servicios.map((s, i) => B.resolver(s, i));
  const total = servicios.reduce((a, s) => a + s.inversion, 0);

  const pie = `<p class="d-pie">4SREALESTATE.COM · REAL ESTATE FORESIGHT</p>`;
  const lamina = (cls, html) => `<section class="d-slide ${cls}">${html}</section>`;
  const fija = (n) => lamina("d-img", `<img src="${img(n)}" alt="">`);
  const titulo = (hueco, lleno, invertido) =>
    `<h2 class="d-tit">${invertido ? `${esc(lleno)} <span class="d-out">${esc(hueco)}</span>` : `<span class="d-out">${esc(hueco)}</span> ${esc(lleno)}`}</h2>`;
  const cliente = `<div class="d-cli"><b>${esc(P.cliente)} · ${esc(P.proyecto)}</b><span>${esc(P.ciudad)}</span></div>`;

  // 09 · Portada del proyecto con los mapas
  function portada() {
    const mapas = (P.mapas || []).filter((m) => m.img).slice(0, 2);
    const ciudadCorta = { "San Luis Potosí": "SLP", "Ciudad de México": "CDMX" }[P.ciudad] || P.ciudad;
    return lamina("d-portada", `
      <div class="d-mapas d-mapas--${mapas.length}">
        ${list(mapas, (m) => `<figure><img src="${esc(m.img)}" alt=""><figcaption>${esc(m.titulo)}</figcaption></figure>`)}
      </div>
      <div class="d-portada__txt">
        <h1 class="d-tit d-tit--xl">Propuesta <span class="d-out">Estratégica</span></h1>
        <p><b>${esc(P.cliente)}</b><br>${esc(P.proyecto)} - ${esc(ciudadCorta)} | ${esc(P.fecha)}</p>
      </div>`);
  }

  // Grupos de alcance en tarjetas (con 3+ grupos la última lleva filete rojo, como el deck)
  const tarjetas = (grupos) => `
    <div class="d-cards${grupos.length > 2 ? " d-cards--rojo" : ""}" style="--cols:${grupos.length === 4 ? 2 : Math.min(grupos.length, 3)}">
      ${list(grupos, (g) => `<div class="d-card"><h4>${esc(g.titulo)}</h4><ul>${list(g.items, (i) => `<li>${esc(i)}</li>`)}</ul></div>`)}
    </div>`;

  function alcances(s) {
    const lista = s.alcances || [];
    const tituloSrv = s.pdf?.titulo || s.nombreLargo || s.nombre;
    return lista.map((a, k) => {
      const [nombre, sufijo] = a.titulo.split(" · ");
      const pill = `<span class="d-pill">Entregable: ${esc(a.entregable)}</span>`;
      const cuerpo = a.plano
        ? `<div class="d-cards d-cards--lista"><div class="d-card"><ul>${list((a.grupos || []).flatMap((g) => g.items), (i) => `<li>${esc(i)}</li>`)}</ul></div></div>`
        : tarjetas(a.grupos || []);

      // Servicios con ficha (objetivo, antecesor…), como "2. Definición e Innovación de Producto"
      if (s.objetivo) {
        const ficha = [
          ["Servicio 4S", s.nombreLargo],
          ["Área de operación 4S", s.area],
          ["Servicio antecesor 4S", s.antecesor],
          ["Duración", s.semanas ? `${s.semanas} semanas` : ""]
        ].filter(([, v]) => v);
        const req = s.pdf?.requerimientos || (s.requerimientos || []).join(" ");
        return lamina("d-alc", `
          <p class="d-sup">Descripción de alcances y entregables</p>
          <h2 class="d-tit d-tit--alc">${s.num}. ${esc(tituloSrv)}</h2>
          ${k === 0 ? `
            <div class="d-ficha">
              ${list(ficha, ([l, v]) => `<div><small>${esc(l)}</small><b>${esc(v)}</b></div>`)}
              ${req ? `<div class="d-ficha__req"><small>Requerimientos</small><p>${esc(req)}</p></div>` : ""}
            </div>
            <div class="d-obj"><small>Objetivo general de servicio</small><p>${esc(s.objetivo)}</p></div>` : ""}
          <div class="d-alc__bar${k ? " d-alc__bar--sola" : ""}"><span class="d-lbl">Alcance</span>${pill}</div>
          ${cuerpo}
          ${pie}`);
      }

      const etiqueta = sufijo ? (/^alcance/i.test(sufijo) ? sufijo : `Alcance ${sufijo}`) : "";
      return lamina("d-alc", `
        <p class="d-sup">Descripción de alcances y entregables</p>
        <div class="d-alc__head">
          <h2 class="d-tit d-tit--alc">${s.num}.${k + 1} ${esc(nombre.replace(/^[\d.]+\s*/, ""))}</h2>
          <div class="d-alc__der">${etiqueta ? `<span class="d-lbl">${esc(etiqueta)}</span>` : ""}${pill}</div>
        </div>
        ${a.nota ? `<p class="d-nota">${esc(a.nota)}</p>` : ""}
        ${cuerpo}
        ${pie}`);
    });
  }

  // 22 · Propuesta de servicios
  function propuestaServicios() {
    const espec = (s) => {
      const items = s.pdf?.especGiros && P.giros?.length ? P.giros : s.especificaciones || [];
      const intro = s.pdf?.especIntro;
      if (!items.length) return "";
      if (!intro && items.length === 1) return `<p>${esc(items[0])}</p>`;
      return `${intro ? `<p>${esc(intro)}</p>` : ""}<ul>${list(items, (e) => `<li>${esc(e)}</li>`)}</ul>`;
    };
    return lamina("d-tabla", `
      <div class="d-head">${titulo("Propuesta de", "Servicios")}${cliente}</div>
      <table class="d-tb">
        <thead><tr><th>#</th><th>Servicio</th><th>Entrega</th><th>Especificaciones generales</th><th class="r">Inversión MXN</th></tr></thead>
        <tbody>${list(servicios, (s) => `
          <tr><td class="d-num">#${s.num}</td><td class="d-srv">${esc(s.pdf?.titulo || s.nombreLargo || s.nombre)}</td><td>${s.semanas} Semanas</td><td class="d-esp">${espec(s)}</td><td class="d-mxn">${mxn(s.inversion)}</td></tr>`)}
        </tbody>
      </table>
      <div class="d-total"><span>Total</span><b>${mxn(total)}</b></div>
      ${pie}`);
  }

  // 23 · Tiempos estimados
  function tiempos() {
    const c = P.cronograma;
    if (!c?.filas?.length || !c.meses?.length) return "";
    const nSem = c.meses.reduce((a, m) => a + m.semanas, 0);
    const alto = Math.min(68, Math.floor(330 / c.filas.length));
    const celdas = (f) => {
      let h = "";
      for (let w = 0; w < nSem; ) {
        if (w === f.desde) {
          const span = f.hasta - f.desde + 1;
          h += `<td colspan="${span}"><i class="d-bar d-bar--${f.tipo === "hito" ? "hito" : "trabajo"}"></i></td>`;
          w += span;
        } else { h += "<td></td>"; w++; }
      }
      return h;
    };
    return lamina("d-tiempos", `
      <div class="d-head">${titulo("Estimados", "Tiempos", true)}${cliente}</div>
      <table class="d-gantt" style="--alto:${alto}px">
        <thead>
          <tr><th class="d-gantt__lbl"></th>${list(c.meses, (m) => `<th class="d-mes" colspan="${m.semanas}">${esc(m.nombre)}</th>`)}</tr>
          <tr><th class="d-gantt__lbl"></th>${list(c.meses, (m) => Array.from({ length: m.semanas }, (_, i) => `<th class="d-sem">S${i + 1}</th>`).join(""))}</tr>
        </thead>
        <tbody>${list(c.filas, (f) => `<tr><th class="d-gantt__lbl"><div><em>${esc(f.n)}</em><span>${esc(f.nombre)}</span></div></th>${celdas(f)}</tr>`)}</tbody>
      </table>
      <p class="d-txt">Desglose de tiempos para el proyecto. La información presentada en la siguiente tabla es estimada y puede llegar a cambiar. <b>4S Real Estate</b> vigila la ruta crítica y notifica por escrito sobre cambios que afecten la relación de tiempos en variables entregables.</p>
      ${pie}`);
  }

  // 24 · Orden de trabajo (calendario de pagos)
  function ordenTrabajo() {
    if (!P.pagos?.length) return "";
    return lamina("d-tabla", `
      <div class="d-head">${titulo("De trabajo", "Orden", true)}${cliente}</div>
      <table class="d-tb d-tb--pagos${P.pagos.length > 4 ? " d-tb--muchos" : ""}${P.pagos.length > 7 ? " d-tb--mas" : ""}">
        <thead><tr><th>#</th><th>Servicio</th><th>Concepto</th><th>Fechas</th><th class="r">Inversión MXN</th></tr></thead>
        <tbody>${list(P.pagos, (p, i) => `
          <tr><td class="d-num">#${i + 1}</td><td class="d-srv">${esc(p.servicio)}</td><td>${esc(p.concepto)}</td><td>${esc(p.fecha)}</td><td class="d-mxn">${mxn(p.monto)}</td></tr>`)}
        </tbody>
      </table>
      <div class="d-total"><span>Total</span><b>${mxn(P.pagos.reduce((a, p) => a + p.monto, 0))}</b></div>
      ${P.notaPagos ? `<p class="d-legal">${esc(P.notaPagos)}</p>` : ""}
      ${pie}`);
  }

  function armar() {
    if (document.getElementById("deck")) return document.getElementById("deck");
    const porServicio = servicios.map((s) => list(intro(s), fija) + alcances(s).join("")).join("");
    const deck = document.createElement("div");
    deck.id = "deck";
    deck.innerHTML =
      list(INSTITUCIONAL, fija) +
      portada() +
      fija("10-nuevos-proyectos") +
      porServicio +
      propuestaServicios() +
      tiempos() +
      ordenTrabajo() +
      fija("25-venues") +
      fija("26-cierre");
    document.body.appendChild(deck);
    document.documentElement.classList.add("deck-listo");
    return deck;
  }

  // Si los alcances no caben sobre el pie (p. ej. con puntos propios), reduce el texto de las tarjetas hasta que quepan
  function ajustar(deck) {
    const antes = deck.style.cssText;
    deck.style.cssText = "display:block;position:absolute;left:-20000px;top:0";
    deck.querySelectorAll(".d-alc").forEach((sl) => {
      const cards = sl.querySelector(".d-cards");
      const card = cards && cards.querySelector(".d-card");
      if (!card) return;
      const tope = sl.getBoundingClientRect().top + 720 - 58;
      let fs = parseFloat(getComputedStyle(card).fontSize);
      while (cards.getBoundingClientRect().bottom > tope && fs > 11) {
        fs -= 0.5;
        cards.querySelectorAll(".d-card").forEach((c) => { c.style.fontSize = fs + "px"; });
      }
    });
    deck.style.cssText = antes;
  }

  const cargadas = (deck) =>
    Promise.all(
      [...deck.querySelectorAll("img")].map((im) =>
        im.complete ? null : new Promise((r) => { im.onload = im.onerror = r; })
      ).concat(document.fonts
        ? ['400 16px "Futura 4S"', '700 16px "Futura 4S"', '400 16px "Jost 4S"', '600 16px "Jost 4S"', '700 16px "Bebas Neue"']
            .map((f) => document.fonts.load(f).catch(() => null))
            .concat(document.fonts.ready)
        : [])
    );

  // Nombre del archivo al "Guardar como PDF" (igual que el deck original)
  let tituloWeb = document.title;
  const tituloPDF = `Propuesta ${P.proyecto} – ${P.cliente}`;
  addEventListener("beforeprint", () => { ajustar(armar()); tituloWeb = document.title; document.title = tituloPDF; });
  addEventListener("afterprint", () => { document.title = tituloWeb; });

  window.descargarPDF = async (btn) => {
    const texto = btn && btn.textContent;
    if (btn) { btn.disabled = true; btn.textContent = "Preparando PDF…"; }
    try {
      const deck = armar();
      await cargadas(deck);
      ajustar(deck);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = texto; }
    }
    window.print();
  };
})();
