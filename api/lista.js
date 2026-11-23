/* ==========================================================================
   POST /api/lista
   Devuelve las propuestas publicadas (para el selector "Editar" de /nueva).
   Pide la misma contraseña que publicar, para no exponer nombres de clientes.
   ========================================================================== */
const crypto = require("crypto");

const REPO = process.env.GITHUB_REPO || "whitepapermkt/propuestas";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const RESERVADOS = new Set(["index", "nueva", "_plantilla", "readme"]);

const gh = (path, accept) =>
  fetch(`https://api.github.com/repos/${REPO}${path}`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: accept || "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "propuestas-4s"
    }
  });

const mismoTexto = (a, b) => {
  const h = (x) => crypto.createHash("sha256").update(String(x)).digest();
  return crypto.timingSafeEqual(h(a), h(b));
};

const campo = (txt, k) => {
  const m = txt.match(new RegExp(`"${k}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
  if (!m) return "";
  try { return JSON.parse(`"${m[1]}"`); } catch (_) { return m[1]; }
};

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
    if (!process.env.GITHUB_TOKEN || !process.env.ADMIN_PASSWORD)
      return res.status(500).json({ error: "Faltan las variables GITHUB_TOKEN y/o ADMIN_PASSWORD en Vercel." });
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    if (!mismoTexto(body.password || "", process.env.ADMIN_PASSWORD))
      return res.status(401).json({ error: "Contraseña incorrecta." });

    const r = await gh(`/contents/?ref=${BRANCH}`);
    if (!r.ok) throw new Error(`GitHub ${r.status}`);
    const archivos = (await r.json()).filter((f) => f.type === "file" && /^[a-z0-9-]+\.html$/.test(f.name) && !RESERVADOS.has(f.name.slice(0, -5)));

    const propuestas = await Promise.all(archivos.map(async (f) => {
      const slug = f.name.slice(0, -5);
      try {
        const t = await (await gh(`/contents/${f.name}?ref=${BRANCH}`, "application/vnd.github.raw")).text();
        const datos = (t.match(/<script id="datos-propuesta">([\s\S]*?)<\/script>/) || [])[1] || "";
        return { slug, cliente: campo(datos, "cliente"), proyecto: campo(datos, "proyecto") };
      } catch (_) { return { slug, cliente: "", proyecto: "" }; }
    }));
    propuestas.sort((a, b) => (a.cliente || a.slug).localeCompare(b.cliente || b.slug, "es"));
    return res.status(200).json({ propuestas });
  } catch (err) {
    return res.status(500).json({ error: "No pude leer la lista: " + err.message });
  }
};
