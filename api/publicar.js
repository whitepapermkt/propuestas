/* ==========================================================================
   POST /api/publicar
   Recibe los datos del formulario (/nueva), arma el HTML a partir de
   _plantilla.html y hace UN commit en GitHub con la propuesta + sus imágenes.
   Vercel detecta el commit y publica el link en ~1 minuto.

   Variables de entorno (Vercel → Settings → Environment Variables):
     GITHUB_TOKEN    token fine-grained con permiso "Contents: Read and write"
                     sobre el repo de propuestas
     ADMIN_PASSWORD  contraseña que se pide en el formulario para publicar
     GITHUB_REPO     opcional, por defecto "whitepapermkt/propuestas"
     GITHUB_BRANCH   opcional, por defecto "main"
   ========================================================================== */
const crypto = require("crypto");

const REPO = process.env.GITHUB_REPO || "whitepapermkt/propuestas";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const RESERVADOS = new Set(["index", "nueva", "_plantilla", "api", "core", "assets", "readme"]);
const MAX_BYTES = 4 * 1024 * 1024; // límite de body de Vercel ≈ 4.5 MB

const gh = (path, opts = {}) =>
  fetch(`https://api.github.com/repos/${REPO}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "propuestas-4s",
      ...(opts.headers || {})
    }
  });

const ghJson = async (path, opts) => {
  const r = await gh(path, opts);
  const t = await r.text();
  if (!r.ok) throw new Error(`GitHub ${r.status}: ${t.slice(0, 200)}`);
  return t ? JSON.parse(t) : {};
};

const post = (path, body) => ghJson(path, { method: "POST", body: JSON.stringify(body) });

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const mismoTexto = (a, b) => {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
};

function armarHTML(plantilla, data) {
  const re = /<script id="datos-propuesta">[\s\S]*?<\/script>/;
  if (!re.test(plantilla)) throw new Error("La plantilla no tiene el bloque datos-propuesta");
  const json = JSON.stringify(data, null, 2).replace(/</g, "\\u003c").replace(/\n/g, "\n  ");
  const bloque = `<script id="datos-propuesta">\n  window.PROPUESTA = ${json};\n  </script>`;
  return plantilla
    .replace(re, () => bloque)
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>Propuesta Estratégica · ${esc(data.cliente)} · 4S Real Estate</title>`);
}

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
    if (!process.env.GITHUB_TOKEN || !process.env.ADMIN_PASSWORD)
      return res.status(500).json({ error: "Faltan las variables GITHUB_TOKEN y/o ADMIN_PASSWORD en Vercel." });

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { password, slug, sobrescribir, data, archivos = [] } = body;

    if (!mismoTexto(password || "", process.env.ADMIN_PASSWORD))
      return res.status(401).json({ error: "Contraseña incorrecta." });
    if (typeof slug !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 80 || RESERVADOS.has(slug))
      return res.status(400).json({ error: "El nombre del link solo puede tener minúsculas, números y guiones." });
    if (!data || typeof data !== "object" || !data.cliente || !Array.isArray(data.servicios) || !data.servicios.length)
      return res.status(400).json({ error: "Faltan datos: cliente y al menos un servicio." });
    if (!Array.isArray(archivos) || archivos.length > 12)
      return res.status(400).json({ error: "Demasiadas imágenes (máximo 12)." });

    const rutaImg = new RegExp(`^assets/clientes/${slug}/[a-z0-9-]+\\.jpg$`);
    let bytes = 0;
    for (const a of archivos) {
      if (!a || typeof a.ruta !== "string" || !rutaImg.test(a.ruta) || typeof a.base64 !== "string" || !/^[A-Za-z0-9+/=]+$/.test(a.base64))
        return res.status(400).json({ error: "Imagen inválida." });
      bytes += a.base64.length * 0.75;
    }
    if (bytes > MAX_BYTES) return res.status(413).json({ error: "Las imágenes pesan demasiado; usa menos o más ligeras." });

    const ruta = `${slug}.html`;
    const existe = await gh(`/contents/${ruta}?ref=${BRANCH}`);
    if (existe.status === 200 && !sobrescribir)
      return res.status(409).json({ error: `Ya existe una propuesta con el link "${slug}". Marca "Sobrescribir" para reemplazarla.` });

    const tr = await gh(`/contents/_plantilla.html?ref=${BRANCH}`, { headers: { Accept: "application/vnd.github.raw" } });
    if (!tr.ok) throw new Error(`No se pudo leer _plantilla.html (${tr.status})`);
    const html = armarHTML(await tr.text(), data);

    // Un solo commit con todos los archivos (Git Data API)
    const ref = await ghJson(`/git/ref/heads/${BRANCH}`);
    const base = ref.object.sha;
    const baseCommit = await ghJson(`/git/commits/${base}`);
    const archivosCommit = [{ path: ruta, content: Buffer.from(html, "utf8").toString("base64") }, ...archivos.map((a) => ({ path: a.ruta, content: a.base64 }))];
    const blobs = [];
    for (const f of archivosCommit) {
      const b = await post(`/git/blobs`, { content: f.content, encoding: "base64" });
      blobs.push({ path: f.path, mode: "100644", type: "blob", sha: b.sha });
    }
    const tree = await post(`/git/trees`, { base_tree: baseCommit.tree.sha, tree: blobs });
    const commit = await post(`/git/commits`, {
      message: `${existe.status === 200 ? "Actualizar" : "Nueva"} propuesta: ${data.cliente} · ${data.proyecto || slug}`,
      tree: tree.sha,
      parents: [base]
    });
    await ghJson(`/git/refs/heads/${BRANCH}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha }) });

    return res.status(200).json({ ok: true, ruta: `/${slug}`, commit: commit.sha.slice(0, 7), actualizada: existe.status === 200 });
  } catch (err) {
    return res.status(500).json({ error: "No se pudo publicar: " + err.message });
  }
};
