alter table public.transactions
  alter column amount type numeric(12, 0)
  using round(amount);
