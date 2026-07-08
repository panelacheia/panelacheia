-- Modo manutenção: quando ativo, o site mostra uma mensagem ao cliente em vez do
-- catálogo/carrinho/checkout, evitando pedidos com preço ou produto desatualizado
-- enquanto o funcionário está mexendo no catálogo.

create table if not exists store_status (
  id smallint primary key default 1 check (id = 1), -- garante uma linha só (singleton)
  maintenance_mode boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into store_status (id, maintenance_mode)
values (1, false)
on conflict (id) do nothing;

alter table store_status enable row level security;

create policy "public read store status"
  on store_status for select
  using (true);

create policy "staff update store status"
  on store_status for update
  to authenticated
  using (true)
  with check (true);
