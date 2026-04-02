# Web scraping SNIIM → Supabase → pgvector

Herramientas Node para extraer precios del SNIIM, guardarlos en JSON, cargarlos a Supabase y generar embeddings para RAG (LangChain).

## Estructura

| Ruta | Uso |
|------|-----|
| `src/scraper/ScraperSNIIM.js` | Playwright: consulta la tabla de resultados |
| `src/lib/saveToJson.js` | Guarda arrays en `data/*.json` |
| `src/lib/supabaseClient.js` | Cliente Supabase (service role, solo backend) |
| `src/config/productos.js` | Catálogo id + nombre de archivo |
| `scripts/scrape-all-products.js` | Scrape masivo → `data/` |
| `scripts/import-precios-json-to-supabase.js` | `data/*.json` → tabla `precios_sniim` |
| `scripts/embed-precios-to-pgvector.js` | `precios_sniim` → `sniim_documents` (vectores) |
| `supabase/*.sql` | DDL para crear tablas y función RPC |

## Configuración

1. Copia `.env.example` a `.env` (sin subir `.env` a git).
2. Instala dependencias: `pnpm install`
3. Navegadores Playwright si aplica: `pnpm exec playwright install chromium`

## Comandos

```bash
pnpm scrape              # JSON en data/
pnpm import:supabase     # requiere .env con Supabase
pnpm embed:pgvector      # requiere OPENAI_API_KEY + SQL pgvector aplicado
```

Variable opcional: `SOURCE_LIMIT` al embebido (ej. prueba con `SOURCE_LIMIT=200`).

## Antes de GitHub

No commits de `data/`, `.env` ni `node_modules`. Usa solo `.env.example`.
