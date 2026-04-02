-- Ejecuta este SQL en Supabase (Dashboard → SQL Editor) antes de importar.

create table if not exists public.precios_sniim (
  id bigint generated always as identity primary key,
  producto text not null,
  fecha date,
  presentacion text,
  origen text,
  destino text,
  precio_min numeric,
  precio_max numeric,
  precio_frec numeric,
  obs text,
  created_at timestamptz default now()
);

-- Índices útiles para consultas y futura búsqueda vectorial
create index if not exists idx_precios_sniim_producto on public.precios_sniim (producto);
create index if not exists idx_precios_sniim_fecha on public.precios_sniim (fecha);
create index if not exists idx_precios_sniim_origen on public.precios_sniim (origen);
