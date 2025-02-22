
create table public.shared_conversations (
  id uuid default gen_random_uuid() primary key,
  title text,
  messages jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null,
  views_count integer default 0
);

-- Index pour nettoyer les conversations expirées
create index idx_shared_conversations_expires_at on public.shared_conversations(expires_at);

-- Fonction pour nettoyer les conversations expirées
create or replace function cleanup_expired_conversations()
returns void
language plpgsql
as $$
begin
  delete from public.shared_conversations
  where expires_at < now();
end;
$$;

-- Trigger pour nettoyer automatiquement
create trigger cleanup_expired_conversations_trigger
  after insert or update
  on public.shared_conversations
  execute procedure cleanup_expired_conversations();

-- RLS policies
alter table public.shared_conversations enable row level security;

create policy "Conversations publiques en lecture seule"
  on public.shared_conversations
  for select
  to anon
  using (expires_at > now());

create policy "Les utilisateurs authentifiés peuvent créer des conversations partagées"
  on public.shared_conversations
  for insert
  to authenticated
  with check (true);
