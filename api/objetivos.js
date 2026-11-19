/* ==========================================================================
   POST /api/objetivos
   Sugiere los objetivos de la propuesta con Claude, a partir del contexto
   que escribe el socio (notas, resumen, cliente, ciudad, giros) y de los
   servicios y alcances elegidos en el formulario.
   modo: "resumen" → redacta también el resumen a partir de las notas de Carlos.

   Variables de entorno (Vercel → Settings → Environment Variables):
     ANTHROPIC_API_KEY  llave de la API de Anthropic (console.anthropic.com)
     ADMIN_PASSWORD     la misma contraseña que se usa para publicar
   ========================================================================== */
const { Anthropic } = require("@anthropic-ai/sdk");

const SISTEMA = `Eres consultor senior de 4S Real Estate, consultora de desarrollo inmobiliario en Latinoamérica.
Redactas la sección "Lo que vamos a resolver" de una propuesta comercial para un desarrollador.

Escribe entre 3 y 5 objetivos que:
- Partan del contexto del proyecto (lo que busca el cliente, el giro, la ciudad).
- Estén cubiertos por los servicios y alcances contratados; no prometas nada que esos servicios no entreguen.
- Empiecen con un verbo en infinitivo (Dimensionar, Definir, Validar, Identificar…).
- Sean concretos y cortos: una línea cada uno, máximo 22 palabras, sin cifras inventadas.
- Usen español de México, tono profesional y directo.

Responde solo con JSON: {"objetivos": ["...", "..."]}`;

const SISTEMA_RESUMEN = `Eres consultor senior de 4S Real Estate, consultora de desarrollo inmobiliario en Latinoamérica.
Con las notas que tomó el socio (Carlos del Valle) al platicar con el cliente, redactas dos partes de una propuesta comercial:

1. "resumen": un solo párrafo de 45 a 90 palabras, dirigido al cliente. Primero, qué busca el cliente y en dónde
   (su proyecto, su terreno, su reto). Después, cómo lo resuelve 4S con los servicios contratados, en orden.
   Ejemplo del tono: "Grupo México busca definir el producto óptimo para un desarrollo comercial en su terreno de San Luis Potosí.
   Proponemos un proceso de dos etapas: primero entender a fondo la oferta y la demanda de la zona y después convertir esos
   hallazgos en una mezcla de producto, concepto y anclajes que maximicen el valor del proyecto."
2. "objetivos": entre 3 y 5 objetivos que
   - partan de lo que dicen las notas (lo que busca el cliente, el giro, la ciudad);
   - estén cubiertos por los servicios y alcances contratados; no prometas nada que esos servicios no entreguen;
   - empiecen con un verbo en infinitivo (Dimensionar, Definir, Validar, Identificar…);
   - sean concretos y cortos: una línea cada uno, máximo 22 palabras.

Reglas:
- Usa solo datos que estén en las notas o en los datos de la propuesta. No inventes cifras, superficies, precios ni fechas.
- Las notas son informales e internas: no copies frases internas, opiniones sobre el cliente, presupuestos ni comentarios de negociación.
- Español de México, tono profesional, directo y cálido. Sin títulos ni viñetas dentro del resumen.

Responde solo con JSON: {"resumen": "...", "objetivos": ["...", "..."]}`;

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(501).json({ error: "Falta configurar ANTHROPIC_API_KEY en Vercel." });

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  if (!process.env.ADMIN_PASSWORD || body.password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Contraseña incorrecta." });
  }

  const p = body.propuesta || {};
  const servicios = (p.servicios || []).slice(0, 20).map((s) => {
    const alc = (s.alcances || []).map((a) => `  - ${a.titulo}: ${(a.grupos || []).map((g) => g.titulo).join(", ")}`).join("\n");
    return `• ${s.nombre}${alc ? `\n${alc}` : ""}`;
  }).join("\n");
  if (!servicios) return res.status(400).json({ error: "Marca al menos un servicio." });
  const conResumen = body.modo === "resumen";
  if (conResumen && !String(p.notas || "").trim()) return res.status(400).json({ error: "Escribe primero las notas de Carlos." });

  const contexto = [
    `Cliente: ${p.cliente || "—"}`,
    `Proyecto: ${p.proyecto || "—"}`,
    `Ciudad: ${p.ciudad || "—"}`,
    `Giros / usos: ${(p.giros || []).join(", ") || "—"}`,
    `Notas de Carlos (internas):\n${String(p.notas || "").slice(0, 6000) || "—"}`,
    `Resumen escrito en el formulario:\n${String(p.resumen || "").slice(0, 4000) || "—"}`,
    `Servicios y alcances contratados:\n${servicios}`
  ].join("\n\n");

  try {
    const client = new Anthropic();
    const r = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 2000,
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: conResumen ? SISTEMA_RESUMEN : SISTEMA,
      messages: [{ role: "user", content: contexto }]
    });
    if (r.stop_reason === "refusal") return res.status(422).json({ error: "No pude generar objetivos con ese contexto." });

    const texto = r.content.filter((b) => b.type === "text").map((b) => b.text).join("");
    const json = JSON.parse(texto.slice(texto.indexOf("{"), texto.lastIndexOf("}") + 1));
    const objetivos = (json.objetivos || []).map((o) => String(o).trim()).filter(Boolean).slice(0, 6);
    if (!objetivos.length) throw new Error("Respuesta vacía");
    if (conResumen) {
      const resumen = String(json.resumen || "").trim();
      if (!resumen) throw new Error("Respuesta vacía");
      return res.status(200).json({ resumen, objetivos });
    }
    return res.status(200).json({ objetivos });
  } catch (e) {
    const status = e.status === 429 ? 429 : 500;
    return res.status(status).json({ error: status === 429 ? "Demasiadas solicitudes; intenta en un minuto." : "No pude generar los objetivos; intenta de nuevo." });
  }
};
