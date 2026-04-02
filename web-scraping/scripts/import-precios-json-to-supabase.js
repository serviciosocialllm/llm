import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { supabase } from "../src/lib/supabaseClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PKG_ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(PKG_ROOT, "data");
const CHUNK_SIZE = 500;

function convertirFecha(ddmmyyyy) {
  if (!ddmmyyyy) return null;
  const parts = String(ddmmyyyy).trim().split("/");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function parsePrecio(val) {
  if (val == null || val === "") return null;
  const n = parseFloat(String(val).replace(",", "").trim());
  return Number.isNaN(n) ? null : n;
}

/**
 * Convierte un objeto del JSON SNIIM en una fila para la tabla precios_sniim.
 * Campos del JSON: Fecha, Presentación, Origen, Destino, Precio Mín, Precio Max, Precio Frec, Obs.
 */
function mapRecord(obj, productoNombre) {
  return {
    producto: productoNombre,
    fecha: convertirFecha(obj["Fecha"]),
    presentacion: obj["Presentación"] ?? obj["Presentacion"] ?? null,
    origen: obj["Origen"] ?? null,
    destino: obj["Destino"] ?? null,
    precio_min: parsePrecio(obj["Precio Mín"]),
    precio_max: parsePrecio(obj["Precio Max"]),
    precio_frec: parsePrecio(obj["Precio Frec"]),
    obs: obj["Obs."] ?? obj["Obs"] ?? null,
  };
}

async function importarArchivo(file) {
  const fullPath = path.join(DATA_DIR, file);
  const contenido = fs.readFileSync(fullPath, "utf-8");
  const registros = JSON.parse(contenido);

  if (!Array.isArray(registros)) {
    throw new Error(`${file}: el JSON no es un array`);
  }

  const productoNombre = path.basename(file, path.extname(file));
  const filas = registros.map((obj) => mapRecord(obj, productoNombre));

  for (let i = 0; i < filas.length; i += CHUNK_SIZE) {
    const chunk = filas.slice(i, i + CHUNK_SIZE);
    const { error } = await supabase.from("precios_sniim").insert(chunk);
    if (error) {
      console.error(
        `Error insertando en ${file} (lote ${i / CHUNK_SIZE + 1}):`,
        error.message
      );
      throw error;
    }
  }

  return filas.length;
}

async function main() {
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.toLowerCase().endsWith(".json"));

  if (files.length === 0) {
    console.log("No hay archivos .json en data/");
    return;
  }

  console.log(`Encontrados ${files.length} archivos JSON en data/\n`);

  let totalFilas = 0;
  let ok = 0;
  let fail = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const count = await importarArchivo(file);
      totalFilas += count;
      ok++;
      console.log(`[${i + 1}/${files.length}] ✔ ${file}: ${count} filas`);
    } catch (err) {
      fail++;
      console.error(`[${i + 1}/${files.length}] ✗ ${file}:`, err.message);
    }
  }

  console.log(
    `\n✅ Listo: ${ok} archivos importados (${totalFilas} filas), ${fail} fallos.`
  );
}

main().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
