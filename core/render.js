/* ==========================================================================
   4S REAL ESTATE · Motor de la landing de propuestas
   Lee window.BASE_4S (institucional) + window.PROPUESTA (cliente) y arma
   la página completa. No es necesario editar este archivo por propuesta.
   ========================================================================== */
(function () {
  const B = window.BASE_4S;
  const P = window.PROPUESTA;
  const app = document.getElementById("app");

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const mxn = (n) => "$" + Number(n).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const mxnCorto = (n) => "$" + Number(n).toLocaleString("es-MX");
  const list = (arr, fn) => (arr || []).map(fn).join("");

  // Servicios de la propuesta enriquecidos con el catálogo
  const servicios = P.servicios.map((s, i) => ({ ...B.servicios[s.id], ...s, num: i + 1 }));
  const total = servicios.reduce((a, s) => a + s.inversion, 0);
  const semanasTotales = P.cronograma
    ? Math.max(...P.cronograma.filas.map((f) => f.hasta)) - Math.min(...P.cronograma.filas.map((f) => f.desde)) + 1
    : servicios.reduce((a, s) => a + s.semanas, 0);
  const idsIncluidos = new Set(servicios.map((s) => s.id));

  const asesor = P.asesor || {};
  const wa = asesor.whatsapp || B.contactoGeneral.whatsapp;
  const waLink = (msg) => `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`;
  const msgAceptar = `Hola, somos ${P.cliente}. Queremos avanzar con la propuesta "${P.proyecto}" (${mxnCorto(total)} MXN + IVA).`;
  const msgDudas = `Hola, somos ${P.cliente}. Tenemos algunas preguntas sobre la propuesta "${P.proyecto}".`;

  document.title = `Propuesta Estratégica · ${P.cliente} · ${P.proyecto} · 4S Real Estate`;

  /* ---------------- Secciones ---------------- */
  const TABS = [
    { id: "propuesta", nombre: "Propuesta", desc: "Proyecto, servicios e inversión" },
    { id: "tiempos", nombre: "Tiempos y pagos", desc: "Ruta crítica, orden de trabajo y siguientes pasos" },
    { id: "nosotros", nombre: "Por qué 4S", desc: "Quiénes somos, expertise, clientes, premios y oficinas" }
  ];
  const nav = `
  <header class="nav" id="nav">
    <a href="#propuesta" class="nav__logo"><img src="assets/brand/logo-4s-trim-white.png" alt="4S Real Estate"></a>
    <nav class="tabs" role="tablist">
      ${list(TABS, (t) => `<a href="#${t.id}" class="tab" role="tab" data-tab="${t.id}">${esc(t.nombre)}</a>`)}
    </nav>
    <a href="#siguientes-pasos" class="btn btn--red btn--sm nav__cta">Aceptar propuesta</a>
  </header>
  <div class="mbar" id="mbar">
    <div class="mbar__info"><small>Inversión total</small><b>${mxnCorto(total)} <span>MXN</span></b></div>
    <a class="mbar__wa" href="${waLink(msgDudas)}" target="_blank" rel="noopener" aria-label="Preguntas por WhatsApp">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>
    </a>
    <a class="btn btn--red mbar__cta" href="#siguientes-pasos">Aceptar</a>
  </div>
  <div class="progress" id="progress"></div>`;

  const hero = `
  <section class="hero" id="inicio">
    <div class="hero__bg" style="background-image:url('${P.mapas?.[0]?.img || "assets/deck/s01-portada-fondo-gradiente-oscuro.jpg"}')"></div>
    <div class="hero__inner wrap">
      <p class="eyebrow">Propuesta estratégica · ${esc(P.fecha)}</p>
      <h1 class="hero__title"><span class="outline">Preparada para</span><br>${esc(P.cliente)}</h1>
      <p class="hero__project">${esc(P.proyecto)} <span>·</span> ${esc(P.ciudad)}</p>
      <div class="hero__kpis">
        <div><b>${servicios.length}</b><span>Servicio${servicios.length > 1 ? "s" : ""}</span></div>
        <div><b>${semanasTotales}</b><span>Semanas</span></div>
        <div><b>${mxnCorto(total)}</b><span>Inversión MXN</span></div>
      </div>
      <div class="hero__cta">
        <a href="#proyecto" class="btn btn--light">Ver propuesta</a>
        <button class="btn btn--ghost" onclick="window.print()">Descargar PDF</button>
      </div>
    </div>
    <a href="#proyecto" class="hero__scroll" aria-label="Bajar">↓</a>
  </section>`;

  const proyecto = `
  <section class="sec sec--light" id="proyecto">
    <div class="wrap">
      <div class="sec__head">
        <p class="eyebrow eyebrow--red">01 · Tu proyecto</p>
        <h2 class="h2"><span class="outline">${esc(P.proyecto)}</span> ${esc(P.ciudad)}</h2>
      </div>
      <div class="grid-2 proyecto">
        <div>
          <p class="lead">${esc(P.resumen)}</p>
          ${P.objetivos ? `<h3 class="h4">Lo que vamos a resolver</h3><ul class="checks">${list(P.objetivos, (o) => `<li>${esc(o)}</li>`)}</ul>` : ""}
          ${P.giros ? `<div class="tags">${list(P.giros, (g) => `<span class="tag">${esc(g)}</span>`)}</div>` : ""}
        </div>
        <div class="mapas">
          ${list(P.mapas, (m) => `
            <figure class="mapa" data-zoom="${esc(m.img)}">
              <img src="${esc(m.img)}" alt="${esc(m.titulo)}" loading="lazy">
              <figcaption><b>${esc(m.titulo)}</b>${m.pie ? ` · ${esc(m.pie)}` : ""}</figcaption>
            </figure>`)}
        </div>
      </div>
    </div>
  </section>`;

  const cadena = `
  <section class="sec sec--dark cadena" id="cadena" style="background-image:linear-gradient(rgba(15,16,17,.88),rgba(15,16,17,.94)),url('assets/deck/s10-nuevos-proyectos-fondo-skyline-niebla.jpg')">
    <div class="wrap">
      <div class="sec__head">
        <p class="eyebrow eyebrow--red">02 · Dónde entramos</p>
        <h2 class="h2"><span class="outline">Ciclo de</span> nuevos proyectos</h2>
        <p class="sub">Del terreno a la venta. Resaltamos en rojo las etapas que incluye esta propuesta.</p>
      </div>
      <div class="cadena__grid">
        ${list(B.cadenaValor, (e) => `
          <div class="cadena__col">
            <p class="cadena__etapa">${esc(e.etapa)}</p>
            ${list(e.pasos, (p) => `
              <div class="paso ${idsIncluidos.has(p.id) ? "paso--on" : ""}">
                <span class="paso__n">${p.n}</span>
                <div><b>${esc(p.nombre)}</b><small>${esc(p.sub)}</small></div>
                ${idsIncluidos.has(p.id) ? `<span class="paso__badge">Incluido</span>` : ""}
              </div>`)}
          </div>`)}
      </div>
      <p class="cadena__plus"><b>Complementos:</b> ${B.complementos.map(esc).join(" · ")}</p>
    </div>
  </section>`;

  const alcanceHTML = (a) => `
    <details class="acc">
      <summary><span>${esc(a.titulo)}</span><span class="pill">Entregable: ${esc(a.entregable)}</span></summary>
      <div class="acc__body">
        ${a.nota ? `<p class="muted">${esc(a.nota)}</p>` : ""}
        <div class="acc__grid">
          ${list(a.grupos, (g) => `<div><h5>${esc(g.titulo)}</h5><ul>${list(g.items, (i) => `<li>${esc(i)}</li>`)}</ul></div>`)}
        </div>
      </div>
    </details>`;

  const servicioHTML = (s) => `
    <article class="srv" id="srv-${s.id}">
      <div class="srv__top">
        <div class="srv__num">${s.num}</div>
        <div>
          <p class="eyebrow">${esc(s.area)}</p>
          <h3 class="h3">${esc(s.nombreLargo)}</h3>
        </div>
        <div class="srv__meta">
          <div><span>Duración</span><b>${s.semanas} semanas</b></div>
          <div><span>Inversión</span><b>${mxnCorto(s.inversion)}</b></div>
        </div>
      </div>

      <div class="grid-2 srv__intro">
        <div>
          <p class="lead">${esc(s.lead)}</p>
          <p>${esc(s.intro)}</p>
          ${s.objetivo ? `<div class="callout"><b>Objetivo del servicio</b><p>${esc(s.objetivo)}</p></div>` : ""}
        </div>
        <div class="srv__img ${s.imgContain ? "srv__img--contain" : ""}"><img src="${esc(s.img)}" alt="" loading="lazy"></div>
      </div>

      ${s.pilares ? `<div class="pilares swipe">${list(s.pilares, (p, i) => `<div class="pilar"><span>0${i + 1}</span><h4>${esc(p.titulo)}</h4><p>${esc(p.texto)}</p></div>`)}</div>` : ""}

      ${list(s.bloques, (b) => `
        <div class="bloque">
          <h4 class="h4">${esc(b.titulo)}</h4>
          <p>${esc(b.texto)}</p>
          <div class="iconos swipe">${list(b.items, (it) => `<div class="icono"><img src="${esc(it.icono)}" alt=""><h5>${esc(it.titulo)}</h5><p>${esc(it.texto)}</p></div>`)}</div>
        </div>`)}

      ${s.proceso ? `
        <div class="bloque">
          <h4 class="h4">Proceso · el camino hacia proyectos únicos</h4>
          <ol class="proceso swipe">${list(s.proceso, (p) => `<li><img src="${esc(p.icono)}" alt=""><h5>${esc(p.titulo)}</h5><p>${esc(p.texto)}</p></li>`)}</ol>
        </div>` : ""}

      <div class="bloque">
        <h4 class="h4">Alcances y entregables</h4>
        <div class="espec"><b>Para ${esc(P.cliente)}:</b><ul>${list(s.especificaciones, (e) => `<li>${esc(e)}</li>`)}</ul></div>
        ${list(s.alcances?.[s.variante], alcanceHTML)}
        ${s.requerimientos?.length ? `<div class="req"><b>Requerimientos para iniciar</b><ul>${list(s.requerimientos, (r) => `<li>${esc(r)}</li>`)}</ul></div>` : ""}
      </div>
    </article>`;

  const serviciosSec = `
  <section class="sec sec--light" id="servicios">
    <div class="wrap">
      <div class="sec__head">
        <p class="eyebrow eyebrow--red">03 · Servicios propuestos</p>
        <h2 class="h2"><span class="outline">Nuestra</span> propuesta</h2>
        <div class="srv__tabs">${list(servicios, (s) => `<a href="#srv-${s.id}" class="chip"><b>${s.num}</b> ${esc(s.nombre)}</a>`)}</div>
      </div>
      ${list(servicios, servicioHTML)}
    </div>
  </section>`;

  const inversion = `
  <section class="sec sec--cream" id="inversion">
    <div class="wrap">
      <div class="sec__head">
        <p class="eyebrow eyebrow--red">04 · Inversión</p>
        <h2 class="h2"><span class="outline">Propuesta de</span> servicios</h2>
        <p class="sub">${esc(P.cliente)} · ${esc(P.proyecto)}, ${esc(P.ciudad)}</p>
      </div>
      <div class="tabla">
        <div class="tabla__row tabla__row--head"><span>#</span><span>Servicio</span><span>Entrega</span><span>Especificaciones</span><span>Inversión MXN</span></div>
        ${list(servicios, (s) => `
          <div class="tabla__row">
            <span class="tabla__n">${s.num}</span>
            <span><b>${esc(s.nombreLargo)}</b></span>
            <span>${s.semanas} semanas</span>
            <span><ul>${list(s.especificaciones, (e) => `<li>${esc(e)}</li>`)}</ul></span>
            <span class="tabla__monto">${mxn(s.inversion)}</span>
          </div>`)}
        <div class="tabla__total"><span>Total</span><span>${mxn(total)}</span></div>
      </div>
      <p class="fine">${esc(P.notaPagos)}</p>
    </div>
  </section>`;

  const crono = P.cronograma;
  const totalSemanas = crono.meses.reduce((a, m) => a + m.semanas, 0);
  const semLabel = (idx) => {
    for (const m of crono.meses) { if (idx < m.semanas) return `${m.nombre.slice(0, 3)} S${idx + 1}`; idx -= m.semanas; }
    return "";
  };
  const cronograma = `
  <section class="sec sec--light" id="cronograma">
    <div class="wrap">
      <div class="sec__head">
        <p class="eyebrow eyebrow--red">Tiempos estimados</p>
        <h2 class="h2"><span class="outline">Ruta</span> crítica</h2>
      </div>
      <div class="gantt" style="--cols:${totalSemanas}">
        <div class="gantt__label"></div>
        ${list(crono.meses, (m) => `<div class="gantt__mes" style="grid-column:span ${m.semanas}">${esc(m.nombre)}</div>`)}
        <div class="gantt__label"></div>
        ${list(crono.meses, (m) => Array.from({ length: m.semanas }, (_, i) => `<div class="gantt__sem">S${i + 1}</div>`).join(""))}
        ${list(crono.filas, (f) => `
          <div class="gantt__label"><b>${f.n}</b>${esc(f.nombre)}</div>
          <div class="gantt__track">
            <div class="gantt__bar gantt__bar--${f.tipo}" style="grid-column:${f.desde + 1} / ${f.hasta + 2}">${f.tipo === "hito" ? "★" : ""}</div>
          </div>`)}
      </div>
      <ol class="crono-m">
        ${list(crono.filas, (f) => `
          <li class="crono-m__item crono-m__item--${f.tipo}">
            <div class="crono-m__head"><b>${f.n}</b><span>${esc(f.nombre)}</span></div>
            <p>${f.desde === f.hasta ? semLabel(f.desde) : `${semLabel(f.desde)} → ${semLabel(f.hasta)} · ${f.hasta - f.desde + 1} sem`}</p>
            <div class="crono-m__bar"><i style="left:${(f.desde / totalSemanas) * 100}%;width:${((f.hasta - f.desde + 1) / totalSemanas) * 100}%"></i></div>
          </li>`)}
        <li class="crono-m__meses">${list(crono.meses, (m) => `<span style="flex:${m.semanas}">${esc(m.nombre.slice(0, 3))}</span>`)}</li>
      </ol>
      <div class="gantt__legend"><span><i class="lg lg--trabajo"></i>Trabajo</span><span><i class="lg lg--hito"></i>Presentación de resultados</span></div>
      <p class="fine">${esc(crono.nota)}</p>

      <div class="sec__head sec__head--sub">
        <p class="eyebrow eyebrow--red">Forma de pago</p>
        <h3 class="h3">Orden de trabajo</h3>
      </div>
      <div class="pagos">
        ${list(P.pagos, (p, i) => `
          <div class="pago">
            <span class="pago__n">${i + 1}</span>
            <div><b>${esc(p.servicio)}</b><small>${esc(p.concepto)} · ${esc(p.fecha)}</small></div>
            <span class="pago__monto">${mxn(p.monto)}</span>
          </div>`)}
        <div class="tabla__total"><span>Total</span><span>${mxn(P.pagos.reduce((a, p) => a + p.monto, 0))}</span></div>
      </div>
      <p class="fine">${esc(P.notaPagos)}</p>
    </div>
  </section>`;

  const nosotros = `
  <section class="sec sec--dark" id="nosotros">
    <div class="wrap">
      <div class="sec__head">
        <p class="eyebrow eyebrow--red">Por qué 4S</p>
        <h2 class="h2"><span class="outline">Real Estate</span> Foresight</h2>
      </div>
      <div class="grid-2">
        <div><p class="lead lead--light">${esc(B.marca.intro)}</p><p class="muted-light">${esc(B.marca.vision)}</p></div>
        <div class="modelo">
          ${list(B.modeloNegocio, (m) => `<div class="modelo__item"><span>${m.letra}</span><div><small>${esc(m.pregunta)}</small><b>${esc(m.nombre)}</b><p>${esc(m.desc)}</p></div></div>`)}
          <p class="modelo__prop"><b>Propósito:</b> ${esc(B.marca.proposito)}</p>
        </div>
      </div>
      <div class="cifras">
        ${list(B.cifras, (c) => `<div class="cifra"><b data-count="${c.valor}" data-prefix="${c.prefijo}">${c.prefijo}${c.valor.toLocaleString("es-MX")}</b><span>${esc(c.etiqueta)}</span></div>`)}
      </div>
    </div>
  </section>

  <section class="sec sec--black" id="expertise">
    <div class="wrap">
      <div class="sec__head"><h2 class="h2"><span class="outline">Our</span> Expertise</h2></div>
      <div class="expertise">
        ${list(B.expertise, (e) => `<figure><img src="${esc(e.img)}" alt="${esc(e.nombre)}" loading="lazy"><figcaption>${esc(e.nombre)}</figcaption></figure>`)}
      </div>
    </div>
  </section>

  <section class="sec sec--light" id="clientes">
    <div class="wrap">
      <div class="sec__head"><h2 class="h2"><span class="outline">Our</span> Clients</h2><p class="sub">Desarrolladores e inversionistas que han confiado en nuestra metodología.</p></div>
      <div class="marquee"><div class="marquee__track">${(() => { const all = Object.values(B.clientes).flat(); return [...all, ...all].map((c) => `<span>${esc(c)}</span>`).join(""); })()}</div></div>
      <details class="acc acc--clientes">
        <summary><span>Ver lista completa por región</span></summary>
        <div class="acc__body"><div class="clientes">${list(Object.entries(B.clientes), ([reg, arr]) => `<div><h5>${esc(reg)}</h5><p>${arr.map(esc).join(" · ")}</p></div>`)}</div></div>
      </details>

      <div class="sec__head sec__head--sub"><h2 class="h2"><span class="outline">Real Estate</span> Awards</h2></div>
      <div class="premios swipe">
        ${list(B.premios, (p) => `<div class="premio"><img src="${esc(p.logo)}" alt="" loading="lazy"><b>${esc(p.titulo)}</b><small>${esc(p.detalle)}</small></div>`)}
      </div>
    </div>
  </section>

  <section class="sec sec--dark oficinas" id="oficinas">
    <div class="oficinas__img"><img src="assets/deck/s25-venues-edificio-oficinas-bn.jpg" alt="" loading="lazy"></div>
    <div class="oficinas__txt">
      <h2 class="h2"><span class="outline">Our</span> Venues</h2>
      ${list(Object.entries(B.oficinas), ([t, arr]) => `<h5>${esc(t)}</h5><p>${arr.map(esc).join(" · ")}</p>`)}
    </div>
  </section>`;

  const siguiente = (actual) => `
  <section class="sec sec--cream siguiente">
    <div class="wrap">
      <p class="eyebrow eyebrow--red">Sigue revisando</p>
      <div class="siguiente__grid">
        ${list(TABS.filter((t) => t.id !== actual), (t) => `
          <a href="#${t.id}" class="siguiente__card">
            <span class="siguiente__nombre">${esc(t.nombre)}</span>
            <span class="siguiente__desc">${esc(t.desc)}</span>
            <span class="siguiente__arrow">→</span>
          </a>`)}
      </div>
    </div>
  </section>`;

  const cierre = `
  <section class="sec cierre" id="siguientes-pasos">
    <div class="cierre__bg"><img src="assets/deck/s26-cierre-bandera-foresight-for-the-future.jpg" alt=""></div>
    <div class="wrap cierre__inner">
      <p class="eyebrow eyebrow--red">Siguientes pasos</p>
      <h2 class="h2"><span class="outline">Empecemos</span> ${esc(P.proyecto)}</h2>
      <ol class="pasos">
        <li><b>Confirma la propuesta</b><span>Responde por WhatsApp o correo para aceptar.</span></li>
        <li><b>Orden de trabajo y anticipo</b><span>Te enviamos la orden y la factura del anticipo.</span></li>
        <li><b>Kick-off</b><span>Arrancamos con una sesión de arranque con tu equipo.</span></li>
      </ol>
      <div class="hero__cta">
        <a class="btn btn--red" href="${waLink(msgAceptar)}" target="_blank" rel="noopener">Aceptar propuesta</a>
        <a class="btn btn--ghost" href="${waLink(msgDudas)}" target="_blank" rel="noopener">Tengo preguntas</a>
        <button class="btn btn--ghost" onclick="window.print()">Descargar PDF</button>
      </div>
      ${asesor.nombre ? `
        <div class="asesor">
          <img src="assets/brand/isotipo-4s-trim-white.png" alt="">
          <div><b>${esc(asesor.nombre)}</b><small>${esc(asesor.puesto)}</small>
          <p>${asesor.email ? `<a href="mailto:${esc(asesor.email)}">${esc(asesor.email)}</a>` : ""}${asesor.telefono ? ` · ${esc(asesor.telefono)}` : ""}</p></div>
        </div>` : ""}
      <p class="fine fine--light">Propuesta confidencial preparada para ${esc(P.cliente)}. Vigencia: ${esc(P.vigencia)}.</p>
    </div>
  </section>`;

  const footer = `
  <footer class="footer">
    <img src="assets/brand/logo-4s-trim-white.png" alt="4S Real Estate">
    <p>${esc(B.contactoGeneral.direccion)}<br>${esc(B.contactoGeneral.telefono)} · <a href="https://${B.marca.web}" target="_blank" rel="noopener">${B.marca.web.toUpperCase()}</a></p>
    <p class="footer__tag">We are foresight.</p>
  </footer>

  <div class="lightbox" id="lightbox"><img alt=""></div>`;

  app.innerHTML =
    nav +
    `<main>
      <div class="view" id="propuesta" data-view="propuesta">${hero + proyecto + cadena + serviciosSec + inversion + siguiente("propuesta")}</div>
      <div class="view view--sub" id="tiempos" data-view="tiempos" hidden>${cronograma + cierre + siguiente("tiempos")}</div>
      <div class="view view--sub" id="nosotros-tab" data-view="nosotros" hidden>${nosotros + siguiente("nosotros")}</div>
    </main>` +
    footer;

  /* ---------------- Interacciones ---------------- */
  const navEl = document.getElementById("nav");
  let vistaActual = "propuesta";
  const prog = document.getElementById("progress");
  const onScroll = () => {
    navEl.classList.toggle("nav--solid", scrollY > 40 || vistaActual !== "propuesta");
    const h = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Barra inferior: visible después del hero y oculta en el cierre
  const mbar = document.getElementById("mbar");
  const heroEl = document.getElementById("inicio");
  const cierreEl = document.getElementById("siguientes-pasos");
  const updBar = () => {
    const pasado = heroEl.getBoundingClientRect().bottom < 90;
    const enCierre = vistaActual === "tiempos" && cierreEl.getBoundingClientRect().top < innerHeight * 0.8 && cierreEl.getBoundingClientRect().bottom > 0;
    mbar.classList.toggle("show", pasado && !enCierre);
  };
  addEventListener("scroll", updBar, { passive: true });

  // Aparición al hacer scroll + contadores
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      e.target.querySelectorAll("[data-count]").forEach((el) => {
        const end = +el.dataset.count, pre = el.dataset.prefix || "", t0 = performance.now();
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const tick = (t) => {
          const k = Math.min(1, (t - t0) / 1400);
          el.textContent = pre + Math.round(end * (1 - Math.pow(1 - k, 3))).toLocaleString("es-MX");
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".sec__head, .srv, .cifras, .tabla, .gantt, .pagos, .expertise, .premios, .cadena__grid").forEach((el) => {
    el.classList.add("reveal");
    io.observe(el);
  });

  // Zoom de mapas
  const lb = document.getElementById("lightbox");
  document.querySelectorAll("[data-zoom]").forEach((el) =>
    el.addEventListener("click", () => { lb.querySelector("img").src = el.dataset.zoom; lb.classList.add("open"); })
  );
  lb.addEventListener("click", () => lb.classList.remove("open"));
  addEventListener("keydown", (e) => e.key === "Escape" && lb.classList.remove("open"));

  // Pestañas: cada #hash abre la pestaña que contiene ese elemento
  const vistas = [...document.querySelectorAll(".view")];
  const ir = (hash, suave) => {
    const id = decodeURIComponent((hash || "").replace(/^#/, "")) || "propuesta";
    const destino = TABS.some((t) => t.id === id)
      ? document.querySelector(`.view[data-view="${id}"]`)
      : document.getElementById(id);
    if (!destino) return;
    const vista = destino.closest(".view");
    const cambia = vista.dataset.view !== vistaActual;
    vistas.forEach((v) => (v.hidden = v !== vista));
    vistaActual = vista.dataset.view;
    document.querySelectorAll(".tab").forEach((t) => {
      const on = t.dataset.tab === vistaActual;
      t.classList.toggle("tab--on", on);
      t.setAttribute("aria-selected", on);
    });
    if (destino === vista) scrollTo({ top: 0, behavior: cambia ? "instant" : suave ? "smooth" : "instant" });
    else destino.scrollIntoView({ behavior: cambia || !suave ? "instant" : "smooth", block: "start" });
    onScroll();
    updBar();
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    try { history.pushState(null, "", a.getAttribute("href")); } catch (_) { /* vista previa (srcdoc) */ }
    ir(a.getAttribute("href"), true);
  });
  addEventListener("popstate", () => ir(location.hash, false));
  ir(location.hash, false);

  // Al imprimir: abrir todos los acordeones
  addEventListener("beforeprint", () => {
    document.querySelectorAll("details").forEach((d) => (d.open = true));
    vistas.forEach((v) => (v.hidden = false));
  });
  addEventListener("afterprint", () => ir(location.hash, false));
})();
