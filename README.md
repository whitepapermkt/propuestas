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

## Nueva propuesta (formulario online)

Entra a **`tu-dominio/nueva`**:

1. Llena cliente, proyecto, contexto, mapas, servicios (semanas, inicio, inversión), calendario y socio.
   A la derecha ves la propuesta en vivo (escritorio / celular).
2. **Publicar** → pide la contraseña, hace un commit en GitHub con la propuesta y sus imágenes,
   y Vercel la publica en ~1 minuto en `tu-dominio/<link>`.
3. **Cargar existente** → abre una propuesta publicada para editarla, o como base para otro cliente.
4. **Descargar HTML** → bájala sin publicar.

El borrador se guarda solo en el navegador mientras escribes.

### Configuración única en Vercel (Settings → Environment Variables)

| Variable | Valor |
|---|---|
| `GITHUB_TOKEN` | Token *fine-grained* de GitHub con acceso solo a `whitepapermkt/propuestas` y permiso **Contents: Read and write** |
| `ADMIN_PASSWORD` | La contraseña que pedirá el formulario para publicar |

Después de agregarlas, haz *Redeploy* una vez.

### Manual (sin formulario)

Copia `_plantilla.html` → `cliente-proyecto.html`, llena el bloque `datos-propuesta`, pon imágenes en `assets/clientes/<slug>/`, commit y push.

## Qué se calcula solo

- Totales de inversión y pagos, KPIs del hero y semanas totales.
- Esquemas de pago del formulario: 50/50, 70/30 (anticipo al inicio, finiquito en el mes de la presentación), mensual (una mensualidad por mes desde el arranque de cada servicio hasta el mes de su presentación; la última absorbe el redondeo) y 100% anticipo.
- Pasos resaltados en la cadena de valor (según los servicios incluidos).
- Mensajes de WhatsApp de “Aceptar propuesta” / “Tengo preguntas” con cliente, proyecto y monto.
- Versión PDF: botón “Descargar PDF”. Arma un deck horizontal 16:9 (26 láminas para La Minera) con el mismo formato que la propuesta en Keynote: láminas institucionales fijas (`assets/pdf/`, exportadas del PDF original) + portada con mapas, alcances, propuesta de servicios, tiempos y orden de trabajo generados con los datos de la propuesta (`core/pdf.js`, `core/pdf.css`). Los textos del PDF salen de `servicios.<id>.pdf` en `core/4s-base.js`.

## Estudio de Mercado por giro

En **04 Servicios → Estudio de Mercado → Giro del estudio** se elige: Comercial, Oficinas, Vivienda Horizontal,
Vivienda Vertical, Industrial, Hospital u Hotel / Turismo. El giro llena solo:

- **Giros que se analizan** (campo *Giros / usos* de 02 Contexto).
- **Cómo se mide la demanda** (texto de la lámina de Demanda y de la web).
- **Especificaciones extra** (ej. Hotel / Turismo: precio estimado, absorción, tipologías…; Vivienda: análisis histórico).
- Texto de *Unidades / m² totales y ocupación* propio del giro.

Si ya editaste a mano los giros o las especificaciones, cambiar de giro no los sobrescribe.
Los datos de cada giro están en `core/4s-base.js → GIROS_ESTUDIO`.

- **Comercial** tiene alcances detallados (láminas 1.1 y 1.2 en el PDF).
- **Los demás** usan la plantilla de Oferta y Demanda de las propuestas de 4S; sus puntos se eligen en el formulario
  y salen en las láminas *Estudio de Oferta* / *Estudio de Demanda*, que ahora se generan con los datos del giro
  (antes eran imágenes fijas de Comercial).

## Alcances en el formulario

En **04 Servicios**, cada servicio muestra sus alcances por bloque (ej. *1.1 Estudio de Oferta* y *1.2 Estudio de Demanda* por separado):

- Cada bloque es una tarjeta con interruptor; debajo del nombre se ve el resumen ("15 de 16 puntos · 1 propio"). Activarlo o quitarlo ajusta la numeración y el nombre del servicio (ej. “Estudio de Mercado: Oferta”).
- Los grupos vienen cerrados con su contador (3/3). Ábrelos solo si hay que quitar puntos; cada grupo tiene *Quitar todos / Marcar todos*.
- **+ Agregar punto a este grupo** abre un campo para escribir un punto propio (Enter agrega y deja el campo listo para otro). *Alcances adicionales* es para lo que no encaje en ningún grupo.
- Pensado para celular: renglones completos tocables, casillas grandes y texto de 16 px en los campos (iOS no hace zoom).

Lo elegido se guarda en la propuesta (`servicios[].alcances`) y se usa en la web y en el PDF. Las propuestas sin `alcances` muestran el catálogo completo.

## Agregar un servicio al catálogo

En `core/4s-base.js → servicios` copia un servicio existente con el `id` de la cadena de valor
(`modelo-financiero`, `concepto-creativo`, `lanzamiento-comercial`, `servicios-digitales`, `direccion-comercial`).
Los alcances van por variante (`comercial`, `residencial`, …), y cada propuesta elige la suya con `variante`.

## Notas

- Las páginas llevan `noindex`; solo las ve quien tenga el link.
- Tipografía: Bebas Neue (OFL) local + Jost (Google Fonts) como sustituto web de Futura, que no tiene licencia para web.
