-- Renomeia o status de pagamento "nao_pago" para "cancelado".
update "order" set payment_status = 'cancelado' where payment_status = 'nao_pago';

alter table "order" drop constraint if exists order_payment_status_check;
alter table "order"
  add constraint order_payment_status_check
  check (payment_status in ('pendente', 'pago', 'cancelado'));
