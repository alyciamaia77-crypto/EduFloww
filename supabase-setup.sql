-- Script SQL para Supabase - Copie e cole no SQL Editor
-- https://app.supabase.com/project/[seu-projeto]/sql/new

-- ======================================
-- 1. CRIAR EXTENSÃO UUID
-- ======================================
create extension if not exists "pgcrypto";

-- ======================================
-- 2. TABELA TAREFAS
-- ======================================
drop table if exists public.tarefas cascade;

create table public.tarefas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  titulo text not null,
  descricao text not null,
  disciplina text not null,
  prazo date not null,
  status text not null default 'pendente',
  prioridade text not null default 'media',
  data_criacao date not null default current_date,
  created_at timestamptz not null default now()
);

-- Adicionar constraint de foreign key
alter table public.tarefas 
  add constraint fk_tarefas_user_id 
  foreign key (user_id) references auth.users(id) on delete cascade;

-- Índices para performance
create index idx_tarefas_user_id on public.tarefas(user_id);
create index idx_tarefas_prazo on public.tarefas(prazo);
create index idx_tarefas_status on public.tarefas(status);

-- ======================================
-- 3. TABELA METAS
-- ======================================
drop table if exists public.metas cascade;

create table public.metas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  tipo text not null default 'semanal',
  descricao text not null,
  meta_tarefas integer not null default 5,
  progresso integer not null default 0,
  created_at timestamptz not null default now()
);

-- Adicionar constraint de foreign key
alter table public.metas 
  add constraint fk_metas_user_id 
  foreign key (user_id) references auth.users(id) on delete cascade;

-- Índices para performance
create index idx_metas_user_id on public.metas(user_id);
create index idx_metas_tipo on public.metas(tipo);

-- ======================================
-- 4. HABILITAR ROW LEVEL SECURITY (RLS)
-- ======================================
alter table public.tarefas enable row level security;
alter table public.metas enable row level security;

-- ======================================
-- 5. POLÍTICAS RLS PARA TAREFAS
-- ======================================
-- SELECT: Usuário só vê suas próprias tarefas
create policy "tarefas_select" on public.tarefas
  for select 
  using (user_id = auth.uid()::uuid);

-- INSERT: Usuário só cria tarefas com seu próprio user_id
create policy "tarefas_insert" on public.tarefas
  for insert 
  with check (user_id = auth.uid()::uuid);

-- UPDATE: Usuário só atualiza suas próprias tarefas
create policy "tarefas_update" on public.tarefas
  for update 
  using (user_id = auth.uid()::uuid);

-- DELETE: Usuário só deleta suas próprias tarefas
create policy "tarefas_delete" on public.tarefas
  for delete 
  using (user_id = auth.uid()::uuid);

-- ======================================
-- 6. POLÍTICAS RLS PARA METAS
-- ======================================
-- SELECT: Usuário só vê suas próprias metas
create policy "metas_select" on public.metas
  for select 
  using (user_id = auth.uid()::uuid);

-- INSERT: Usuário só cria metas com seu próprio user_id
create policy "metas_insert" on public.metas
  for insert 
  with check (user_id = auth.uid()::uuid);

-- UPDATE: Usuário só atualiza suas próprias metas
create policy "metas_update" on public.metas
  for update 
  using (user_id = auth.uid()::uuid);

-- DELETE: Usuário só deleta suas próprias metas
create policy "metas_delete" on public.metas
  for delete 
  using (user_id = auth.uid()::uuid);

-- ======================================
-- 7. GRANT DE ACESSO
-- ======================================
grant select, insert, update, delete on public.tarefas to authenticated;
grant select, insert, update, delete on public.metas to authenticated;
