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
  // Láminas de introducción de cada servicio (s4s-pNN = página NN del catálogo SERVICIOS 4S 2025).
  //   "nombre"                      → lámina fija
  //   { estudio: "oferta" }         → lámina generada con el giro del estudio (si ese alcance va incluido)
  //   { si: "bloque", img: [...] }  → solo si ese bloque de alcance va incluido
  //   { variante: "x", img: [...] } → solo para esa variante (ej. tipo de sitio web)
  const INTRO_SERVICIO = {
    "estudio-mercado": ["11-estudio-mercado-portada", "12-estudio-mercado-pilares", { estudio: "oferta" }, { estudio: "demanda" }],
    "definicion-producto": ["17-definicion-producto-portada", "18-definicion-producto-diagrama", "19-definicion-producto-proceso"],
    "modelo-financiero": ["s4s-p21", "s4s-p22", "s4s-p23"],
    "preventa-simulada": ["s4s-p16", "s4s-p17", { si: "presencial", img: ["s4s-p18"] }, { si: "digital", img: ["s4s-p19"] }, "s4s-p20"],
    "concepto-creativo": ["s4s-p24", "s4s-p25", "s4s-p26", "s4s-p27"],
    "aplicaciones-marketing": ["s4s-p34", "s4s-p35", "s4s-p36",
      { si: "presentacion", img: ["s4s-p37", "s4s-p38"] }, { si: "brochure", img: ["s4s-p40", "s4s-p41"] },
      { si: "modulo", img: ["s4s-p44", "s4s-p45"] }, { si: "video", img: ["s4s-p48", "s4s-p49"] }],
    "lanzamiento-comercial": ["s4s-p30", "s4s-p31", "s4s-p32"],
    "web-setup": ["s4s-p51", "s4s-p53", "s4s-p54", { variante: "minisite", img: ["s4s-p55"] }, { variante: "multipager", img: ["s4s-p56"] }, { variante: "corporate", img: ["s4s-p57"] }],
    "digital-concierge": ["s4s-p59", "s4s-p60", "s4s-p61", "s4s-p62", "s4s-p63"],
    "lead-generation": ["s4s-p64", "s4s-p65"],
    "direccion-digital": ["s4s-p66", "s4s-p67", "s4s-p68"],
    "diagnostico-comercial": ["s4s-p70", "s4s-p71", "s4s-p72", "s4s-p73", "s4s-p74"],
    "direccion-comercial": ["s4s-p75", "s4s-p76", "s4s-p77", "s4s-p78", "s4s-p79", "s4s-p80"],
    "gerencia-comercial": ["s4s-p81", "s4s-p82", "s4s-p83", "s4s-p84", "s4s-p85"]
  };
  const intro = (s) => list(INTRO_SERVICIO[s.id], (x) => {
    if (typeof x === "string") return fija(x);
    if (x.estudio) return s.alcanceIds.has(x.estudio) ? estudioLamina(s, x.estudio) : "";
    if (x.si) return s.alcanceIds.has(x.si) ? list(x.img, fija) : "";
    if (x.variante) return s.variante === x.variante ? list(x.img, fija) : "";
    return "";
  });

  // Duración y precio según el tipo de cobro (único, mensual o comisión)
  const duracion = (s) => (s.cobro === "mensual" || s.cobro === "comision" ? `${s.meses} ${s.meses === 1 ? "Mes" : "Meses"}` : `${s.semanas} Semanas`);
  const precio = (s) => (s.cobro === "comision" ? `<span class="d-mxn__txt">${esc(s.inversionTexto)}</span>`
    : s.cobro === "mensual" ? `${mxn(s.inversion)}<span class="d-mxn__txt d-mxn__txt--mes">${mxn(s.mensual)} × ${s.meses} meses</span>` : mxn(s.inversion));

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

  // 13/14 · Estudio de Oferta / Demanda con los giros, la medición de demanda y los puntos elegidos
  const ICONOS = { "validación de zona": "s13-validacion-zona-mapa", "unidades": "s13-unidades-m2-ocupacion", "precios de referencia": "s13-precios-referencia",
    "segmentación": "s14-segmentacion-mercado", "preferencias": "s14-preferencias-mercado", "capacidad": "s14-capacidad-mercado" };
  function estudioLamina(s, id) {
    const g = s.giro || {};
    // Giros con alcances detallados (Comercial): la lámina muestra la plantilla completa; el resto, lo elegido en el formulario
    const fuente = g.detalle || !s.giro ? B.alcanceGenerico(s.variante || "comercial") : s.alcances;
    const a = (fuente || []).find((x) => x.id === id);
    if (!a) return "";
    const oferta = id === "oferta";
    const principal = oferta ? "Análisis de oferta" : "Análisis de demanda", lateral = oferta ? "Benchmark" : "Mercado meta";
    const grupos = a.grupos || [];
    const tarjetasE = grupos.filter((x) => x.titulo !== lateral).flatMap((x) => x.items);
    const der = (grupos.find((x) => x.titulo === lateral)?.items || []).map((t) => {
      const k = t.indexOf(": ");
      const [tit, txt] = k > 0 ? [t.slice(0, k), t.slice(k + 2)] : ["", t];
      const ico = Object.entries(ICONOS).find(([p]) => tit.toLowerCase().startsWith(p));
      return `<div class="d-est__ico">${ico ? `<img src="assets/deck/icons/${ico[1]}.png" alt="">` : "<i></i>"}<div>${tit ? `<h5>${esc(tit)}</h5>` : ""}<p>${esc(txt.charAt(0).toUpperCase() + txt.slice(1))}</p></div></div>`;
    });
    const giros = (P.giros || []).length ? `<h4>Giros</h4><p class="d-est__giros">${list(P.giros, (x) => `${esc(x)}<br>`)}</p>` : "";
    const medio = oferta
      ? `${giros}<h4>Benchmark</h4><p>Determinar las condiciones generales de la oferta directa e indirecta del producto en cuestión a analizar.</p><p>El análisis se complementa con Big Data (reventa y producto informal) de los giros anteriormente señalados.</p>`
      : `${list(g.demanda || [], (t) => `<p>${esc(t)}</p>`)}${giros}`;
    const intro = oferta
      ? `Análisis de <b>Oferta Formal e Informal</b> de la zona en análisis, con el fin de identificar los principales indicadores del mercado: ${esc(g.ofertaIntro || "precios por m² en renta/venta, ocupación, estacionamientos y giros presentes, entre otros")}.`
      : "Análisis cuantitativo de respuestas a compradores y/o inversionistas de la zona para conocer sus preferencias de mercado y disposición de compra del producto en el terreno en análisis.";
    return lamina("d-est", `
      <div class="d-est__top">
        <div><p class="d-est__sup">${oferta ? "Competencia" : "Mercado meta"}</p>
          <h2 class="d-tit d-est__tit"><span class="d-out">Estudio de</span> ${oferta ? "Oferta" : "Demanda"}</h2></div>
        <p class="d-est__intro">${intro}</p>
      </div>
      <div class="d-est__cols">
        <div><h4>${principal}</h4><div class="d-est__cards">${list(tarjetasE, (t) => `<div class="d-card">${esc(t.replace(/\.$/, ""))}</div>`)}</div></div>
        <div class="d-est__medio">${medio}</div>
        <div class="d-est__der">${der.join("")}</div>
      </div>
      ${pie}`);
  }

  // 10 · Nuevos proyectos (cadena de valor): resalta en rojo los pasos y complementos incluidos
  const ids = new Set(servicios.map((s) => s.id));
  const PASOS = [ // posición de cada columna / círculo en la lámina (px de 1280 × 720)
    { ids: ["estudio-mercado"], x: 137, w: 122 }, { ids: ["definicion-producto"], x: 265, w: 121 }, { ids: ["modelo-financiero"], x: 391, w: 122 },
    { ids: ["concepto-creativo"], x: 565, w: 121, gris: 1 }, { ids: ["lanzamiento-comercial"], x: 691, w: 122, gris: 1 },
    { ids: ["web-setup", "digital-concierge", "lead-generation", "direccion-digital"], x: 818, w: 121, gris: 1 },
    { ids: ["direccion-comercial", "gerencia-comercial"], x: 988, w: 122, y: 285, h: 294 }
  ];
  const CIRCULOS = [{ id: "preventa-simulada", x: 388, y: 569 }, { id: "aplicaciones-marketing", x: 689, y: 569 }, { id: "diagnostico-comercial", x: 1131, y: 580 }];
  function cadena() {
    const cols = PASOS.filter((p) => p.ids.some((id) => ids.has(id)))
      .map((p) => `<i class="d-cad__col${p.gris ? " d-cad__col--gris" : ""}" style="left:${p.x}px;width:${p.w}px;top:${p.y || 203}px;height:${p.h || 376}px"></i>`);
    const circ = CIRCULOS.filter((c) => ids.has(c.id)).map((c) => `<i class="d-cad__circ" style="left:${c.x}px;top:${c.y}px"></i>`);
    return lamina("d-img d-cad", `<img src="${img("s4s-p08")}" alt="">${cols.join("")}${circ.join("")}`);
  }

  // Grupos de alcance en tarjetas (con 3+ grupos la última lleva filete rojo, como el deck)
  const tarjetas = (grupos) => `
    <div class="d-cards${grupos.length > 2 ? " d-cards--rojo" : ""}" style="--cols:${grupos.length === 4 ? 2 : Math.min(grupos.length, 3)}">
      ${list(grupos, (g) => `<div class="d-card"><h4>${esc(g.titulo)}</h4><ul>${list(g.items, (i) => `<li>${esc(i)}</li>`)}</ul></div>`)}
    </div>`;

  function alcances(s) {
    if (s.giro && !s.giro.detalle) return [];
    const lista = s.alcances || [];
    const tituloSrv = s.pdf?.titulo || s.nombreLargo || s.nombre;
    return lista.map((a, k) => {
      const [nombre, sufijo] = a.titulo.split(" · ");
      const pill = a.entregable ? `<span class="d-pill">Entregable: ${esc(a.entregable)}</span>` : "";
      const cuerpo = a.plano
        ? `<div class="d-cards d-cards--lista"><div class="d-card"><ul>${list((a.grupos || []).flatMap((g) => g.items), (i) => `<li>${esc(i)}</li>`)}</ul></div></div>`
        : tarjetas(a.grupos || []);

      // Servicios con ficha (objetivo, antecesor…), como "2. Definición e Innovación de Producto"
      if (s.objetivo) {
        const ficha = [
          ["Servicio 4S", s.nombreLargo],
          ["Área de operación 4S", s.area],
          ["Servicio antecesor 4S", s.antecesor],
          ["Duración", s.semanas ? duracion(s).toLowerCase() : ""]
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
      // Estudio de mercado: giros analizados + especificaciones extra ("Se considera:")
      if (s.pdf?.especGiros && P.giros?.length) {
        const extras = B.especExtras(s, P.ciudad);
        return `<p>${esc(s.pdf.especIntro)}</p><ul>${list(P.giros, (e) => `<li>${esc(e)}</li>`)}</ul>` +
          (extras.length ? `<p class="d-esp__sub">Se considera:</p><ul>${list(extras, (e) => `<li>${esc(e)}</li>`)}</ul>` : "");
      }
      const items = s.especificaciones || [];
      const intro = s.pdf?.especIntro;
      if (!items.length) return "";
      if (!intro && items.length === 1) return `<p>${esc(items[0])}</p>`;
      return `${intro ? `<p>${esc(intro)}</p>` : ""}<ul>${list(items, (e) => `<li>${esc(e)}</li>`)}</ul>`;
    };
    // Varias láminas si no caben: alto estimado por fila según sus líneas de especificaciones (el total va en la última)
    const lineas = (s) => (s.pdf?.especGiros && P.giros?.length ? P.giros.length + B.especExtras(s, P.ciudad).length + 2 : (s.especificaciones || []).length + 1);
    const paginas = trozos(servicios, (s) => Math.max(72, 26 + lineas(s) * 16), 470);
    return paginas.map((filas, k) => lamina("d-tabla", `
      <div class="d-head">${titulo("Propuesta de", "Servicios")}${cliente}</div>
      <table class="d-tb">
        <thead><tr><th>#</th><th>Servicio</th><th>Entrega</th><th>Especificaciones generales</th><th class="r">Inversión MXN</th></tr></thead>
        <tbody>${list(filas, (s) => `
          <tr><td class="d-num">#${s.num}</td><td class="d-srv">${esc(s.pdf?.titulo || s.nombreLargo || s.nombre)}</td><td>${duracion(s)}</td><td class="d-esp">${espec(s)}</td><td class="d-mxn">${precio(s)}</td></tr>`)}
        </tbody>
      </table>
      ${k === paginas.length - 1 ? `<div class="d-total"><span>Total</span><b>${mxn(total)}</b></div>` : `<p class="d-sigue">Continúa en la siguiente lámina →</p>`}
      ${pie}`)).join("");
  }

  // Reparte filas en láminas según un alto estimado por fila
  function trozos(filas, alto, max) {
    const out = [[]]; let h = 0;
    filas.forEach((f) => {
      const a = alto(f);
      if (h + a > max && out[out.length - 1].length) { out.push([]); h = 0; }
      out[out.length - 1].push(f); h += a;
    });
    return out;
  }

  // 23 · Tiempos estimados (con muchas filas se reparte en varias láminas; con muchas semanas solo se muestran los meses)
  function tiempos() {
    const c = P.cronograma;
    if (!c?.filas?.length || !c.meses?.length) return "";
    const nSem = c.meses.reduce((a, m) => a + m.semanas, 0);
    const porLamina = 16, paginas = [];
    for (let i = 0; i < c.filas.length; i += porLamina) paginas.push(c.filas.slice(i, i + porLamina));
    const anchoSem = 770 / nSem, conSemanas = anchoSem >= 22;
    const mes = (m) => (m.semanas * anchoSem >= 90 ? m.nombre : m.semanas * anchoSem >= 34 ? m.nombre.slice(0, 3) : m.nombre.slice(0, 1));
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
    return paginas.map((filas) => {
      const alto = Math.min(68, Math.floor((conSemanas ? 330 : 360) / filas.length));
      return lamina("d-tiempos", `
      <div class="d-head">${titulo("Estimados", "Tiempos", true)}${cliente}</div>
      <table class="d-gantt${filas.length > 9 ? " d-gantt--compacto" : ""}" style="--alto:${alto}px">
        <thead>
          <tr><th class="d-gantt__lbl"></th>${list(c.meses, (m) => `<th class="d-mes${conSemanas ? "" : " d-mes--corto"}" colspan="${m.semanas}">${esc(mes(m))}</th>`)}</tr>
          ${conSemanas ? `<tr><th class="d-gantt__lbl"></th>${list(c.meses, (m) => Array.from({ length: m.semanas }, (_, i) => `<th class="d-sem">S${i + 1}</th>`).join(""))}</tr>` : ""}
        </thead>
        <tbody>${list(filas, (f) => `<tr><th class="d-gantt__lbl"><div><em>${esc(f.n)}</em><span>${esc(f.nombre)}</span></div></th>${celdas(f)}</tr>`)}</tbody>
      </table>
      <p class="d-txt">Desglose de tiempos para el proyecto. La información presentada en la siguiente tabla es estimada y puede llegar a cambiar. <b>4S Real Estate</b> vigila la ruta crítica y notifica por escrito sobre cambios que afecten la relación de tiempos en variables entregables.</p>
      ${pie}`);
    }).join("");
  }

  // 24 · Orden de trabajo (mensualidades agrupadas; más de 12 filas → varias láminas)
  function ordenTrabajo() {
    if (!P.pagos?.length) return "";
    const pagos = B.agruparPagos(P.pagos), porLamina = 12, paginas = [];
    for (let i = 0; i < pagos.length; i += porLamina) paginas.push(pagos.slice(i, i + porLamina));
    return paginas.map((filas, k) => lamina("d-tabla", `
      <div class="d-head">${titulo("De trabajo", "Orden", true)}${cliente}</div>
      <table class="d-tb d-tb--pagos${filas.length > 4 ? " d-tb--muchos" : ""}${filas.length > 7 ? " d-tb--mas" : ""}">
        <thead><tr><th>#</th><th>Servicio</th><th>Concepto</th><th>Fechas</th><th class="r">Inversión MXN</th></tr></thead>
        <tbody>${list(filas, (p, i) => `
          <tr><td class="d-num">#${k * porLamina + i + 1}</td><td class="d-srv">${esc(p.servicio)}</td><td>${esc(p.concepto)}</td><td>${esc(p.fecha)}</td><td class="d-mxn">${p.montoTexto ? `<span class="d-mxn__txt">${esc(p.montoTexto)}</span>` : mxn(p.monto)}</td></tr>`)}
        </tbody>
      </table>
      ${k === paginas.length - 1 ? `<div class="d-total"><span>Total</span><b>${mxn(pagos.reduce((a, p) => a + p.monto, 0))}</b></div>
      ${P.notaPagos ? `<p class="d-legal">${esc(P.notaPagos)}</p>` : ""}` : `<p class="d-sigue">Continúa en la siguiente lámina →</p>`}
      ${pie}`)).join("");
  }

  function armar() {
    if (document.getElementById("deck")) return document.getElementById("deck");
    const porServicio = servicios.map((s) => intro(s) + alcances(s).join("")).join("");
    const deck = document.createElement("div");
    deck.id = "deck";
    deck.innerHTML =
      list(INSTITUCIONAL, fija) +
      portada() +
      cadena() +
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
    // Parte de cero en cada llamada (p. ej. si la primera fue antes de cargar las fuentes)
    deck.querySelectorAll(".d-card, .d-esp, .d-tb, .d-tb td").forEach((el) => { el.style.fontSize = el.style.borderSpacing = el.style.paddingTop = el.style.paddingBottom = ""; });
    deck.querySelectorAll(".d-est").forEach((sl) => sl.style.removeProperty("--fs"));
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
    // Propuesta de servicios con muchas especificaciones: compacta filas y texto hasta que el total quede sobre el pie
    deck.querySelectorAll(".d-tabla").forEach((sl) => {
      const tb = sl.querySelector(".d-tb:not(.d-tb--pagos)"), tot = sl.querySelector(".d-total") || sl.querySelector(".d-sigue");
      if (!tb || !tot) return;
      const tope = sl.getBoundingClientRect().top + 720 - 58;
      const pasa = () => tot.getBoundingClientRect().bottom > tope;
      if (pasa()) {
        tb.style.borderSpacing = "0 6px";
        tb.querySelectorAll("td").forEach((td) => { td.style.paddingTop = td.style.paddingBottom = "8px"; });
      }
      let fs = 16.4;
      while (pasa() && fs > 10.5) {
        fs -= 0.25;
        tb.querySelectorAll(".d-esp").forEach((td) => { td.style.fontSize = fs + "px"; });
      }
    });
    deck.querySelectorAll(".d-est").forEach((sl) => {
      const tope = sl.getBoundingClientRect().top + 720 - 58;
      const cols = [...sl.querySelectorAll(".d-est__cols > div")];
      let fs = 16.5;
      while (cols.some((c) => c.getBoundingClientRect().bottom > tope) && fs > 11) {
        fs -= 0.5;
        sl.style.setProperty("--fs", fs + "px");
      }
    });
    deck.style.cssText = antes;
  }

  const fuentes = () => (document.fonts
    ? ['400 16px "Futura 4S"', '700 16px "Futura 4S"', '400 16px "Jost 4S"', '600 16px "Jost 4S"', '700 16px "Bebas Neue"']
        .map((f) => document.fonts.load(f).catch(() => null))
        .concat(document.fonts.ready)
    : []);
  const cargadas = (deck) =>
    Promise.all(
      [...deck.querySelectorAll("img")].map((im) =>
        im.complete ? null : new Promise((r) => { im.onload = im.onerror = r; })
      ).concat(fuentes())
    );
  // Precarga las fuentes del deck para que Cmd+P (sin el botón) también mida el texto con la fuente final
  if (document.readyState === "complete") fuentes(); else addEventListener("load", fuentes);

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
