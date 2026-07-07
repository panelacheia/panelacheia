-- Panela Cheia — schema inicial: produtos, pedidos, itens de pedido

create extension if not exists "pgcrypto";

-- Sequência para número de pedido humano (#1, #2, ...), atômica mesmo com concorrência.
create sequence if not exists order_number_seq start 1;

create table if not exists product (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price_cents integer not null check (price_cents >= 0),
  unit text not null,
  image_url text,
  category text not null,
  is_active boolean not null default true,
  is_promo boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_category_idx on product (category);
create index if not exists product_is_active_idx on product (is_active);

create table if not exists "order" (
  id uuid primary key default gen_random_uuid(),
  order_number integer not null unique default nextval('order_number_seq'),
  fulfillment_type text not null check (fulfillment_type in ('retirada', 'entrega')),
  payment_method text not null check (payment_method in ('cartao', 'dinheiro', 'pix')),
  delivery_fee_cents integer not null check (delivery_fee_cents >= 0),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  customer_name text not null,
  customer_phone text not null,
  delivery_cep text,
  delivery_address text,
  delivery_lat numeric,
  delivery_lng numeric,
  delivery_distance_km numeric,
  geocode_status text not null default 'n/a' check (geocode_status in ('n/a', 'ok', 'failed', 'manual')),
  whatsapp_message text not null,
  status text not null default 'novo' check (status in ('novo', 'confirmado', 'cancelado')),
  created_at timestamptz not null default now()
);

create index if not exists order_created_at_idx on "order" (created_at desc);

create table if not exists order_item (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references "order" (id) on delete cascade,
  product_id uuid references product (id) on delete set null,
  product_name text not null,
  unit text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity numeric not null check (quantity > 0),
  line_total_cents integer not null check (line_total_cents >= 0)
);

create index if not exists order_item_order_id_idx on order_item (order_id);

-- Row Level Security: catálogo público só lê produtos ativos; escrita exige service role (admin, via server).
alter table product enable row level security;
alter table "order" enable row level security;
alter table order_item enable row level security;

create policy "public read active products"
  on product for select
  using (is_active = true);

-- Nenhuma policy de insert/update/delete para o público: apenas a service role (usada nas rotas
-- server-side do admin, que ignora RLS) pode escrever produtos e pedidos.
