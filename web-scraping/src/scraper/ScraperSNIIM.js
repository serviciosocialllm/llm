import { chromium } from "playwright";

export class ScraperSNIIM {
  /**
   * make a new instance of ScraperSNIIM with the given parameters. All parameters are required.
   *
   * @param {Object} params
   * @param {string} params.startDate - DD/MM/YYYY (ej: "01/01/2025")
   * @param {string} params.endDate - DD/MM/YYYY (ej: "31/12/2025")
   * @param {number} params.productId - id from the SNIIM product catalog
   * @param {number} params.limit - number of records to fetch from all pages, (example: 500 per page, if limit is 1000, it will fetch 2 pages, if limit is 1500, it will fetch 3 pages, etc)
   *
   * @throws {Error} if any of the required parameters is missing
   */
  constructor({ startDate, endDate, productId, limit }) {
    if (!startDate || !endDate || !productId || !limit) {
      throw new Error(
        "startDate, endDate, productId y limit are required parameters."
      );
    }

    this.startDate = startDate;
    this.endDate = endDate;
    this.productId = productId;
    this.limit = limit;

    // fixed parameters for the URL
    this.origenId = -1;
    this.destinoId = -1;
    this.preciosPorId = 1;
  }

  buildUrl() {
    return `https://www.economia-sniim.gob.mx/Nuevo/Consultas/MercadosNacionales/PreciosDeMercado/Agricolas/ResultadosConsultaFechaFrutasYHortalizas.aspx?fechaInicio=${this.startDate}&fechaFinal=${this.endDate}&ProductoId=${this.productId}&OrigenId=${this.origenId}&Origen=Todos&DestinoId=${this.destinoId}&Destino=Todos&PreciosPorId=${this.preciosPorId}&RegistrosPorPagina=${this.limit}`;
  }

  async scrape() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(this.buildUrl(), { waitUntil: "networkidle" });
    await page.waitForSelector("#tblResultados");

    const data = await page.evaluate(() => {
      const table = document.querySelector("#tblResultados");
      if (!table) return [];

      const rows = Array.from(table.querySelectorAll("tr"));
      if (rows.length === 0) return [];

      // header row is the first one
      const headers = Array.from(rows[0].querySelectorAll("th, td")).map(
        (cell) => cell.innerText.trim()
      );

      // data rows start from the third row (index 2)
      const dataRows = rows.slice(2);

      return dataRows.map((row) => {
        const cells = Array.from(row.querySelectorAll("td")).map((td) =>
          td.innerText.trim()
        );

        const obj = {};
        headers.forEach((header, i) => {
          obj[header] = cells[i] ?? null;
        });

        return obj;
      });
    });

    await browser.close();
    return data;
  }
}
