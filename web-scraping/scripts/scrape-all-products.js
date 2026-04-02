import { ScraperSNIIM } from "../src/scraper/ScraperSNIIM.js";
import { saveToJson } from "../src/lib/saveToJson.js";
import { productos } from "../src/config/productos.js";

const START_DATE = "01/01/2025";
const END_DATE = "01/01/2026";
const LIMIT = 6000;

/** Pausa entre productos (ms) para no saturar el servidor */
const DELAY_MS = 2000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  const total = productos.length;
  let ok = 0;
  let fail = 0;

  for (let i = 0; i < total; i++) {
    const { id, nombre } = productos[i];
    const filename = `${nombre}.json`;

    try {
      const scraper = new ScraperSNIIM({
        startDate: START_DATE,
        endDate: END_DATE,
        productId: id,
        limit: LIMIT,
      });

      const results = await scraper.scrape();
      const filepath = saveToJson(results, filename);
      ok++;
      console.log(
        `[${i + 1}/${total}] ${nombre}: ${results.length} registros → ${filepath}`
      );
    } catch (err) {
      fail++;
      console.error(`[${i + 1}/${total}] ${nombre}: ERROR`, err.message);
    }

    if (i < total - 1) await sleep(DELAY_MS);
  }

  console.log(`\nListo: ${ok} guardados, ${fail} fallos.`);
})();
