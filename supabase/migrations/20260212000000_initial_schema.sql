-- Stacklite Database Schema
-- This migration creates all tables for the Stacklite application with Row Level Security

-- Enable UUID generation extension
create extension if not exists pgcrypto;

-- =====================================================
-- PROFILES TABLE
-- =====================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  company_name text,
  company_address text,
  tax_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies for profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- =====================================================
-- CLIENTS TABLE
-- =====================================================
create table if not exists public.clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  company_name text,
  address text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for clients
create index clients_user_id_idx on public.clients(user_id);
create index clients_created_at_idx on public.clients(created_at desc);

-- RLS Policies for clients
alter table public.clients enable row level security;

create policy "Users can manage their own clients"
  on public.clients for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =====================================================
-- CONTRACTS TABLE
-- =====================================================
create table if not exists public.contracts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  contract_number text not null,
  project_description text not null,
  start_date date,
  end_date date,
  payment_terms text,
  deliverables text,
  total_amount numeric(10,2),
  currency text default 'USD',
  status text default 'draft' check (status in ('draft', 'active', 'completed', 'cancelled')),
  pdf_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, contract_number)
);

-- Indexes for contracts
create index contracts_user_id_idx on public.contracts(user_id);
create index contracts_client_id_idx on public.contracts(client_id);
create index contracts_created_at_idx on public.contracts(created_at desc);
create index contracts_status_idx on public.contracts(status);

-- RLS Policies for contracts
alter table public.contracts enable row level security;

create policy "Users can manage their own contracts"
  on public.contracts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =====================================================
-- INVOICES TABLE
-- =====================================================
create table if not exists public.invoices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  invoice_number text not null,
  issue_date date not null,
  due_date date not null,
  subtotal numeric(10,2) default 0 not null,
  tax_rate numeric(5,2) default 0,
  tax_amount numeric(10,2) default 0,
  total numeric(10,2) not null,
  currency text default 'USD',
  notes text,
  terms text,
  status text default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  paid_at timestamp with time zone,
  pdf_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, invoice_number)
);

-- Indexes for invoices
create index invoices_user_id_idx on public.invoices(user_id);
create index invoices_client_id_idx on public.invoices(client_id);
create index invoices_created_at_idx on public.invoices(created_at desc);
create index invoices_status_idx on public.invoices(status);

-- RLS Policies for invoices
alter table public.invoices enable row level security;

create policy "Users can manage their own invoices"
  on public.invoices for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =====================================================
-- INVOICE ITEMS TABLE
-- =====================================================
create table if not exists public.invoice_items (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  description text not null,
  quantity numeric(10,2) default 1 not null,
  rate numeric(10,2) not null,
  amount numeric(10,2) generated always as (quantity * rate) stored,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for invoice_items
create index invoice_items_invoice_id_idx on public.invoice_items(invoice_id);

-- RLS Policies for invoice_items
alter table public.invoice_items enable row level security;

create policy "Users can manage their own invoice items"
  on public.invoice_items for all
  using (
    exists (
      select 1 from public.invoices
      where invoices.id = invoice_items.invoice_id
      and invoices.user_id = auth.uid()
    )
  );

-- =====================================================
-- TIME LOGS TABLE
-- =====================================================
create table if not exists public.time_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  task_name text not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone,
  duration_seconds integer,
  notes text,
  is_running boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for time_logs
create index time_logs_user_id_idx on public.time_logs(user_id);
create index time_logs_client_id_idx on public.time_logs(client_id);
create index time_logs_created_at_idx on public.time_logs(created_at desc);
create index time_logs_is_running_idx on public.time_logs(is_running);

-- RLS Policies for time_logs
alter table public.time_logs enable row level security;

create policy "Users can manage their own time logs"
  on public.time_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.clients
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.contracts
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.invoices
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.time_logs
  for each row
  execute function public.handle_updated_at();

-- Function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- =====================================================
-- SEED DATA (for development)
-- =====================================================
-- This section can be commented out for production

-- Note: Seed data would be inserted here for development testing
-- Example:
-- insert into public.clients (user_id, name, email) values
--   (auth.uid(), 'Example Client', 'client@example.com');
