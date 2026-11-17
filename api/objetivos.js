/* ==========================================================================
   POST /api/objetivos
   Sugiere los objetivos de la propuesta con Claude, a partir del contexto
   que escribe el socio (resumen, cliente, ciudad, giros) y de los servicios
   y alcances elegidos en el formulario.

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

  const contexto = [
    `Cliente: ${p.cliente || "—"}`,
    `Proyecto: ${p.proyecto || "—"}`,
    `Ciudad: ${p.ciudad || "—"}`,
    `Giros / usos: ${(p.giros || []).join(", ") || "—"}`,
    `Contexto escrito por el socio:\n${String(p.resumen || "").slice(0, 4000) || "—"}`,
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
      system: SISTEMA,
      messages: [{ role: "user", content: contexto }]
    });
    if (r.stop_reason === "refusal") return res.status(422).json({ error: "No pude generar objetivos con ese contexto." });

    const texto = r.content.filter((b) => b.type === "text").map((b) => b.text).join("");
    const json = JSON.parse(texto.slice(texto.indexOf("{"), texto.lastIndexOf("}") + 1));
    const objetivos = (json.objetivos || []).map((o) => String(o).trim()).filter(Boolean).slice(0, 6);
    if (!objetivos.length) throw new Error("Respuesta vacía");
    return res.status(200).json({ objetivos });
  } catch (e) {
    const status = e.status === 429 ? 429 : 500;
    return res.status(status).json({ error: status === 429 ? "Demasiadas solicitudes; intenta en un minuto." : "No pude generar los objetivos; intenta de nuevo." });
  }
};
