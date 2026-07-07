-- Bucket de imagens dos produtos. Crie o bucket "product-images" pelo painel do Supabase
-- (Storage > New bucket > nome "product-images" > Public bucket = true) antes de rodar esta migration,
-- ou descomente o insert abaixo se preferir criar via SQL.

-- insert into storage.buckets (id, name, public)
-- values ('product-images', 'product-images', true)
-- on conflict (id) do nothing;

create policy "public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Upload/edição/remoção de imagens: qualquer usuário autenticado (login único da equipe no admin).
create policy "staff upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

create policy "staff update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

create policy "staff delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');
