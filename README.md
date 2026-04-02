# llm-scraper

Proyecto para extraer precios agrícolas del **SNIIM** (México), guardarlos en JSON, cargarlos a **Supabase** y preparar embeddings con **pgvector** para aplicaciones RAG con LangChain.

## Contenido

- **`web-scraping/`**: aplicación Node (Playwright, Supabase, LangChain). Ver [web-scraping/README.md](web-scraping/README.md) para comandos y estructura de carpetas.

## Inicio rápido (después de clonar)

```bash
cd web-scraping
pnpm install
pnpm exec playwright install chromium
cp .env.example .env
# Edita .env con tus claves
```

Ejecuta SQL en Supabase (`web-scraping/supabase/`) antes de importar o embebidos.

## GitHub

No subas `.env`, `node_modules/` ni la carpeta `web-scraping/data/`. El `.gitignore` en la raíz y el de `web-scraping/` cubren lo habitual.
