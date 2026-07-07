-- Status de pagamento do pedido, independente do status de andamento (novo/confirmado/cancelado).
alter table "order"
  add column if not exists payment_status text not null default 'pendente'
  check (payment_status in ('pendente', 'pago', 'nao_pago'));
