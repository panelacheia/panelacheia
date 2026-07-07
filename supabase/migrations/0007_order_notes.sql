-- Observações internas do pedido, visíveis só no admin (nunca no WhatsApp/cliente).
alter table "order" add column if not exists internal_notes text;
