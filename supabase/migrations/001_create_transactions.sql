create extension if not exists pgcrypto;

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  person_name text not null,
  amount numeric(12, 0) not null check (amount > 0),
  transaction_date date not null,
  direction text not null check (direction in ('in', 'out')),
  payment_method text not null check (payment_method in ('kpay', 'kmbank')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists transactions_transaction_date_desc_idx
  on public.transactions (transaction_date desc);

create index if not exists transactions_direction_idx
  on public.transactions (direction);

create index if not exists transactions_payment_method_idx
  on public.transactions (payment_method);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_transactions_updated_at on public.transactions;

create trigger set_transactions_updated_at
before update on public.transactions
for each row
execute function public.set_updated_at();
