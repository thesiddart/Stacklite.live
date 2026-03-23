-- Extend clients table with richer profile and billing metadata
alter table public.clients
  add column if not exists contact_person_first_name text,
  add column if not exists contact_person_last_name text,
  add column if not exists company_type text,
  add column if not exists tax_id text,
  add column if not exists website text,
  add column if not exists industry text,
  add column if not exists preferred_contact_method text,
  add column if not exists payment_currency text default 'USD',
  add column if not exists payment_terms text,
  add column if not exists country text,
  add column if not exists state_province text,
  add column if not exists postal_code text,
  add column if not exists is_active boolean default true,
  add column if not exists tags text[],
  add column if not exists metadata jsonb,
  add column if not exists last_contacted_at timestamp with time zone;

-- Normalize defaults for existing rows
update public.clients
set payment_currency = coalesce(payment_currency, 'USD'),
    is_active = coalesce(is_active, true)
where payment_currency is null or is_active is null;

alter table public.clients
  alter column payment_currency set default 'USD',
  alter column payment_currency set not null,
  alter column is_active set default true,
  alter column is_active set not null;

alter table public.clients
  add constraint clients_company_type_check
    check (
      company_type is null
      or company_type in (
        'individual',
        'sole_proprietorship',
        'llc',
        'corporation',
        'partnership',
        'nonprofit',
        'agency',
        'other'
      )
    ),
  add constraint clients_preferred_contact_method_check
    check (
      preferred_contact_method is null
      or preferred_contact_method in (
        'email',
        'phone',
        'sms',
        'whatsapp',
        'none'
      )
    ),
  add constraint clients_payment_currency_check
    check (payment_currency ~ '^[A-Z]{3}$');

create index if not exists clients_is_active_idx on public.clients(is_active);
create index if not exists clients_company_type_idx on public.clients(company_type);
