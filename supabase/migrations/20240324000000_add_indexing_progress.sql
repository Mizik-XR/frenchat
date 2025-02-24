
create table if not exists public.indexing_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  total_files int default 0,
  processed_files int default 0,
  current_folder text,
  status text not null default 'running',
  error text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ajouter les politiques RLS
alter table public.indexing_progress enable row level security;

create policy "Les utilisateurs peuvent voir leur progression"
  on public.indexing_progress for select
  using (auth.uid() = user_id);

create policy "Les utilisateurs peuvent mettre à jour leur progression"
  on public.indexing_progress for insert
  with check (auth.uid() = user_id);

create policy "Les utilisateurs peuvent modifier leur progression"
  on public.indexing_progress for update
  using (auth.uid() = user_id);

-- Trigger pour mettre à jour updated_at
create trigger set_timestamp
  before update on public.indexing_progress
  for each row
  execute procedure handle_updated_at();
