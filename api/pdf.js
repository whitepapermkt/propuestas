/* ==========================================================================
   GET /api/pdf?p=<slug>
   Genera el PDF de la propuesta en el servidor (Chromium headless) con el
   mismo formato del deck (16:9, 13.333 × 7.5 in). Se usa en celulares, donde
   Safari/Chrome móvil ignoran el tamaño de página e imprimen en carta vertical.
   ========================================================================== */
const RESERVADOS = new Set(["index", "nueva", "_plantilla", "api", "core", "assets", "readme"]);

module.exports = async (req, res) => {
  const slug = String((req.query && req.query.p) || "");
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 80 || RESERVADOS.has(slug))
    return res.status(400).send("Propuesta inválida.");

  let browser;
  try {
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteer = (await import("puppeteer-core")).default;
    chromium.setGraphicsMode = false;
    browser = await puppeteer.launch({
      args: await puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
      defaultViewport: { width: 1280, height: 720, deviceScaleFactor: 1 },
      executablePath: await chromium.executablePath(),
      headless: "shell"
    });
    const page = await browser.newPage();
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const r = await page.goto(`https://${host}/${slug}`, { waitUntil: "networkidle0", timeout: 30000 });
    if (!r || r.status() !== 200) return res.status(404).send("No encontré esa propuesta.");

    const titulo = await page.evaluate(async () => {
      if (typeof window.prepararDeck !== "function") throw new Error("La página no tiene deck PDF.");
      await window.prepararDeck();
      return document.querySelector("#deck") ? `Propuesta ${window.PROPUESTA.proyecto} – ${window.PROPUESTA.cliente}` : "";
    });
    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true, timeout: 45000 });

    const nombre = `${(titulo || "Propuesta 4S").replace(/[\\/:*?"<>|]+/g, " ").trim()}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="propuesta-${slug}.pdf"; filename*=UTF-8''${encodeURIComponent(nombre)}`);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(Buffer.from(pdf));
  } catch (err) {
    return res.status(500).send("No se pudo generar el PDF: " + err.message);
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
};
