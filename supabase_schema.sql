-- Home Sale schema for Supabase

create type item_status as enum ('available', 'reserved', 'sold');
create type item_condition as enum ('new', 'like_new', 'good', 'fair', 'parts');
create type reservation_status as enum ('pending', 'confirmed', 'cancelled');

create table items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  status item_status not null default 'available',
  condition item_condition not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table item_images (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  image_url text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table reservations (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  message text,
  status reservation_status not null default 'pending',
  reserved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_items_status on items(status);
create index idx_items_condition on items(condition);
create index idx_item_images_item_id_display_order on item_images(item_id, display_order);
create index idx_reservations_item_id on reservations(item_id);
create index idx_reservations_status on reservations(status);

create or replace function set_items_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_items_set_updated_at
before update on items
for each row
execute function set_items_updated_at();
