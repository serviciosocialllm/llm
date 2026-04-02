import "dotenv/config";
import { OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { Document } from "@langchain/core/documents";
import { supabase } from "../src/lib/supabaseClient.js";

const VECTOR_TABLE = "sniim_documents";
const QUERY_NAME = "match_sniim_documents";

/** Límite de filas leídas de precios_sniim (para pruebas: SOURCE_LIMIT=200) */
const SOURCE_LIMIT = Number(process.env.SOURCE_LIMIT ?? 50000);

function groupKey(r) {
  return `${r.producto}|${r.fecha}|${r.origen}|${r.destino}`;
}

function toContent(g) {
  const lines = g.items
    .map(
      (it) =>
        `- ${it.presentacion}: min=${it.precio_min}, max=${it.precio_max}, frec=${it.precio_frec}${it.obs ? ` (obs: ${it.obs})` : ""}`
    )
    .join("\n");

  return [
    `Producto: ${g.producto}`,
    `Fecha: ${g.fecha}`,
    `Origen: ${g.origen}`,
    `Destino: ${g.destino}`,
    `Precios:`,
    lines,
  ].join("\n");
}

async function main() {
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
  });

  const vectorStore = new SupabaseVectorStore(embeddings, {
    client: supabase,
    tableName: VECTOR_TABLE,
    queryName: QUERY_NAME,
    upsertBatchSize: 100,
  });

  const { data, error } = await supabase
    .from("precios_sniim")
    .select(
      "producto,fecha,presentacion,origen,destino,precio_min,precio_max,precio_frec,obs"
    )
    .limit(SOURCE_LIMIT);

  if (error) throw error;
  if (!data || data.length === 0) {
    console.log("No hay datos en precios_sniim para embebido.");
    return;
  }

  const groups = new Map();
  for (const r of data) {
    const key = groupKey(r);
    if (!groups.has(key)) {
      groups.set(key, {
        producto: r.producto,
        fecha: r.fecha,
        origen: r.origen,
        destino: r.destino,
        items: [],
      });
    }
    groups.get(key).items.push({
      presentacion: r.presentacion,
      precio_min: r.precio_min,
      precio_max: r.precio_max,
      precio_frec: r.precio_frec,
      obs: r.obs,
    });
  }

  const docs = [];
  for (const g of groups.values()) {
    docs.push(
      new Document({
        pageContent: toContent(g),
        metadata: {
          producto: g.producto,
          fecha: g.fecha,
          origen: g.origen,
          destino: g.destino,
        },
      })
    );
  }

  console.log(
    `Embebido de ${docs.length} documentos agrupados (de ${data.length} filas).`
  );

  await vectorStore.addDocuments(docs);

  console.log("✅ Embeddings insertados en sniim_documents.");
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
