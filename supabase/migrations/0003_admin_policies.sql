-- Qualquer usuário autenticado (login único da equipe, criado no Supabase Auth) é considerado
-- "staff" e pode ler/escrever produtos e ler pedidos. Não há hierarquia de papéis por enquanto.

create policy "staff read all products"
  on product for select
  to authenticated
  using (true);

create policy "staff write products"
  on product for insert
  to authenticated
  with check (true);

create policy "staff update products"
  on product for update
  to authenticated
  using (true)
  with check (true);

create policy "staff delete products"
  on product for delete
  to authenticated
  using (true);

create policy "staff read orders"
  on "order" for select
  to authenticated
  using (true);

create policy "staff update orders"
  on "order" for update
  to authenticated
  using (true)
  with check (true);

create policy "staff read order items"
  on order_item for select
  to authenticated
  using (true);
