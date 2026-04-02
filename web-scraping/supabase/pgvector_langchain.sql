-- Pgvector + embeddings para LangChain + OpenAI (1536 dimensiones).
-- Ejecutar en Supabase → SQL Editor antes de ejecutar scripts/embed-precios-to-pgvector.js
--
-- LangChain: tableName: 'sniim_documents', queryName: 'match_sniim_documents'

create extension if not exists vector with schema extensions;

create table if not exists public.sniim_documents (
  id bigserial primary key,
  content text not null,
  metadata jsonb default '{}'::jsonb,
  embedding extensions.vector(1536) not null
);

create index if not exists sniim_documents_embedding_ivfflat
  on public.sniim_documents
  using ivfflat (embedding extensions.vector_cosine_ops)
  with (lists = 100);

create or replace function public.match_sniim_documents (
  query_embedding extensions.vector(1536),
  match_count int default 10,
  filter jsonb default '{}'::jsonb
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select
    d.id,
    d.content,
    d.metadata,
    (1 - (d.embedding <=> query_embedding))::float as similarity
  from public.sniim_documents d
  where d.metadata @> filter
  order by d.embedding <=> query_embedding
  limit match_count;
end;
$$;
