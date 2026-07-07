-- Preço "de" (antes da promoção), exibido riscado ao lado do preço atual quando is_promo = true.
alter table product
  add column if not exists original_price_cents integer
  check (original_price_cents is null or original_price_cents >= 0);
