import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Raíz del paquete web-scraping (donde están data/, scripts/, etc.) */
const PKG_ROOT = path.join(__dirname, "..", "..");

/** Carpeta donde se guardan los JSON */
const OUTPUT_FOLDER = "data";

/**
 * Guarda un array de objetos en un archivo JSON dentro de la carpeta data.
 *
 * @param {Object[]} data - Array de objetos (ej. resultados del scraper)
 * @param {string} [filename="platano-tabasco.json"] - Nombre del archivo
 * @returns {string} Ruta absoluta del archivo escrito
 */
export function saveToJson(data, filename = "platano-tabasco.json") {
  const outputDir = path.join(PKG_ROOT, OUTPUT_FOLDER);
  fs.mkdirSync(outputDir, { recursive: true });

  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf-8");

  return filepath;
}
