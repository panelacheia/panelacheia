-- Categorias como entidade própria (antes era texto livre em product.category).

create table if not exists category (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

insert into category (name)
select distinct category from product
on conflict (name) do nothing;

alter table product add column if not exists category_id uuid references category(id);

update product set category_id = category.id
from category
where product.category = category.name and product.category_id is null;

alter table product alter column category_id set not null;

alter table category enable row level security;

create policy "public read categories"
  on category for select
  using (true);

create policy "staff write categories"
  on category for insert
  to authenticated
  with check (true);

create policy "staff update categories"
  on category for update
  to authenticated
  using (true)
  with check (true);

create policy "staff delete categories"
  on category for delete
  to authenticated
  using (true);
