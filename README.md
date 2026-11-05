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

1. Llena cliente, proyecto, contexto, mapas, servicios (semanas, inicio, inversión), calendario y asesor.
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
