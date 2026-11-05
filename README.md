# Propuestas 4S Real Estate · Landing pages

Cada propuesta es **un solo archivo HTML** con los datos del cliente. El diseño, los textos institucionales y el catálogo de servicios se comparten.

```
propuestas/
├── grupo-mexico-la-minera.html   ← propuesta de ejemplo (La Minera SLP)
├── _plantilla.html               ← copia esto para cada nueva propuesta
├── core/
│   ├── 4s-base.js                ← quiénes somos, cifras, clientes, premios, oficinas,
│   │                               cadena de valor y CATÁLOGO DE SERVICIOS
│   ├── render.js                 ← motor que arma la página (no se toca por propuesta)
│   └── styles.css                ← diseño
└── assets/
    ├── brand/                    ← logos 4S (negro y blanco, fondo transparente)
    ├── deck/                     ← imágenes institucionales del deck (expertise, premios, íconos)
    ├── clientes/<slug>/          ← mapas y fotos de cada cliente
    ├── fonts/                    ← Bebas Neue
    └── web/                      ← fotos de 4srealestate.com (sin usar todavía)
```

## Nueva propuesta

1. Copia `_plantilla.html` → `nombre-cliente-proyecto.html`.
2. Llena el bloque `window.PROPUESTA` (cliente, proyecto, ciudad, resumen, servicios, precios, cronograma, pagos, asesor).
3. Pon los mapas en `assets/clientes/<slug>/`.
4. Publica: queda en `tu-dominio/propuestas/nombre-cliente-proyecto.html`.

Con Claude basta con pedir: *“Haz la propuesta para X, proyecto Y en Z, con estudio de mercado (6 semanas, $N) y definición de producto…”*.

## Qué se calcula solo

- Totales de inversión y pagos, KPIs del hero y semanas totales.
- Pasos resaltados en la cadena de valor (según los servicios incluidos).
- Mensajes de WhatsApp de “Aceptar propuesta” / “Tengo preguntas” con cliente, proyecto y monto.
- Versión PDF: botón “Descargar PDF”, que imprime y abre todos los alcances.

## Agregar un servicio al catálogo

En `core/4s-base.js → servicios` copia un servicio existente con el `id` de la cadena de valor
(`modelo-financiero`, `concepto-creativo`, `lanzamiento-comercial`, `servicios-digitales`, `direccion-comercial`).
Los alcances van por variante (`comercial`, `residencial`, …), y cada propuesta elige la suya con `variante`.

## Notas

- Las páginas llevan `noindex`; solo las ve quien tenga el link.
- Tipografía: Bebas Neue (OFL) local + Jost (Google Fonts) como sustituto web de Futura, que no tiene licencia para web.
