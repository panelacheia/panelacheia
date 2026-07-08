-- A coluna category (texto) foi substituída por category_id (FK para a tabela category)
-- na migration 0005. Ficou órfã, ainda NOT NULL, e passou a quebrar a criação de produtos
-- (o app não envia mais valor pra ela). Nada no código a referencia — segura pra remover.
alter table product drop column if exists category;
