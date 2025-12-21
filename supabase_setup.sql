-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your documents
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  content text,
  embedding vector(1536), -- 1536 is the dimension for OpenAI text-embedding-3-small
  repo text,
  path text,
  url text,
  type text,
  chunk_index integer,
  created_at timestamptz default now(),
  
  -- Prevent duplicate chunks for the same file
  unique(repo, path, chunk_index)
);

-- Create a function to search for documents
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_repo text default null
) returns table (
  id uuid,
  content text,
  repo text,
  path text,
  url text,
  type text,
  similarity float
) language plpgsql as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.repo,
    documents.path,
    documents.url,
    documents.type,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  and (filter_repo is null or documents.repo = filter_repo)
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
