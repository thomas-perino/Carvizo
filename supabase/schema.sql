-- ============================================================================
-- Carvizo — schéma Supabase / PostgreSQL
--
-- À exécuter dans l'éditeur SQL de votre projet Supabase (ou via la CLI
-- Supabase : `supabase db push`). Ce script est idempotent (IF NOT EXISTS)
-- et peut être rejoué sans risque sur une base déjà à jour.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- vehicles
-- ----------------------------------------------------------------------------
create table if not exists vehicles (
  id text primary key default gen_random_uuid()::text,
  make text not null,
  model text not null,
  version text,
  year integer not null check (year between 1950 and 2100),
  mileage integer not null check (mileage >= 0),
  fuel_type text not null check (fuel_type in ('essence', 'diesel', 'hybride', 'electrique')),
  transmission text not null check (transmission in ('manuelle', 'automatique')),
  horsepower integer,
  fiscal_power integer,
  location text not null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- listings
-- ----------------------------------------------------------------------------
create table if not exists listings (
  id text primary key default gen_random_uuid()::text,
  vehicle_id text not null references vehicles (id) on delete cascade,
  source text not null,
  source_url text not null,
  external_id text not null,
  title text not null,
  description text not null default '',
  price integer not null check (price >= 0),
  images text[] not null default '{}',
  seller_type text not null check (seller_type in ('particulier', 'professionnel')),
  published_at timestamptz not null,
  retrieved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  -- Empêche les doublons lors d'une future récupération automatique
  -- répétée sur la même source.
  constraint listings_source_external_id_key unique (source, external_id)
);

create index if not exists listings_vehicle_id_idx on listings (vehicle_id);
create index if not exists listings_source_idx on listings (source);

-- ----------------------------------------------------------------------------
-- analyses
-- ----------------------------------------------------------------------------
create table if not exists analyses (
  id text primary key default gen_random_uuid()::text,
  listing_id text not null references listings (id) on delete cascade,

  market_value_low integer not null,
  market_value_estimated integer not null,
  market_value_high integer not null,

  resale_price_conservative integer not null,
  resale_price_realistic integer not null,
  resale_price_optimistic integer not null,

  registration_cost integer not null,
  transport_cost integer not null,
  repair_cost_low integer not null default 0,
  repair_cost_high integer not null default 0,
  preparation_cost integer not null default 0,
  unexpected_cost integer not null default 0,

  total_investment integer not null,

  profit_conservative integer not null,
  profit_realistic integer not null,
  profit_optimistic integer not null,

  roi numeric(6, 1) not null,

  risk_level text not null check (risk_level in ('faible', 'moyen', 'eleve')),
  deal_score integer not null check (deal_score between 0 and 100),

  -- Stocké en JSON (voir types/index.ts DealScoreExplanation) :
  -- { "positives": string[], "negatives": string[] }
  analysis_summary text not null default '{"positives":[],"negatives":[]}',

  created_at timestamptz not null default now(),

  -- Une seule analyse "courante" par annonce dans cette étape du projet.
  constraint analyses_listing_id_key unique (listing_id)
);

create index if not exists analyses_listing_id_idx on analyses (listing_id);
create index if not exists analyses_deal_score_idx on analyses (deal_score desc);

-- ----------------------------------------------------------------------------
-- repairs
-- ----------------------------------------------------------------------------
create table if not exists repairs (
  id text primary key default gen_random_uuid()::text,
  analysis_id text not null references analyses (id) on delete cascade,
  name text not null,
  description text not null default '',
  cost_low integer not null check (cost_low >= 0),
  cost_high integer not null check (cost_high >= cost_low),
  difficulty text not null check (difficulty in ('facile', 'moyenne', 'difficile')),
  risk_level text not null check (risk_level in ('faible', 'moyen', 'eleve')),
  category text not null check (
    category in ('usure', 'carrosserie', 'electrique', 'mecanique_majeure', 'accident')
  )
);

create index if not exists repairs_analysis_id_idx on repairs (analysis_id);

-- ----------------------------------------------------------------------------
-- users
--
-- Table de profil applicatif, en complément de auth.users (authentification
-- non implémentée à cette étape — voir spec §14). Préparée pour l'étape
-- suivante du produit.
-- ----------------------------------------------------------------------------
create table if not exists users (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- favorites
-- ----------------------------------------------------------------------------
create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  listing_id text not null references listings (id) on delete cascade,
  created_at timestamptz not null default now(),

  constraint favorites_user_listing_key unique (user_id, listing_id)
);

create index if not exists favorites_user_id_idx on favorites (user_id);

-- ============================================================================
-- Row Level Security
--
-- Les données de véhicules / annonces / analyses / réparations sont
-- publiques en lecture (c'est le catalogue d'opportunités). Seule
-- l'écriture est réservée au rôle service_role (utilisé côté serveur par
-- le futur pipeline d'ingestion). Les favoris sont privés par utilisateur.
-- ============================================================================

alter table vehicles enable row level security;
alter table listings enable row level security;
alter table analyses enable row level security;
alter table repairs enable row level security;
alter table users enable row level security;
alter table favorites enable row level security;

drop policy if exists "public_read_vehicles" on vehicles;
create policy "public_read_vehicles" on vehicles for select using (true);

drop policy if exists "public_read_listings" on listings;
create policy "public_read_listings" on listings for select using (true);

drop policy if exists "public_read_analyses" on analyses;
create policy "public_read_analyses" on analyses for select using (true);

drop policy if exists "public_read_repairs" on repairs;
create policy "public_read_repairs" on repairs for select using (true);

drop policy if exists "users_read_own_profile" on users;
create policy "users_read_own_profile" on users for select using (auth.uid() = id);

drop policy if exists "users_read_own_favorites" on favorites;
create policy "users_read_own_favorites" on favorites for select using (auth.uid() = user_id);

drop policy if exists "users_manage_own_favorites" on favorites;
create policy "users_manage_own_favorites" on favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
