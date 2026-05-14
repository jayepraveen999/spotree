-- Enable PostGIS
create extension if not exists postgis;

-- User profiles (linked to Supabase Auth)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  school_name text default '',
  created_at timestamptz default now()
);

-- Tree entries with PostGIS geography
create table trees (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  location geography(Point, 4326) not null,
  photo_url text default '',
  species text not null,
  species_confidence int default 60,
  health_status text default '',
  health_confidence int default 60,
  estimated_height text default '',
  height_confidence int default 60,
  trunk_diameter text default '',
  diameter_confidence int default 60,
  notes text default '',
  spotify_url text default '',
  spotify_track_name text default '',
  spotify_artist text default '',
  created_at timestamptz default now()
);

-- Index for spatial queries
create index trees_location_idx on trees using gist (location);

-- Index for user lookups
create index trees_user_id_idx on trees (user_id);

-- Helper view: trees with lat/lng and user name for easy querying
-- security_invoker=false ensures all users see all rows regardless of RLS
create or replace view trees_with_user with (security_invoker = false) as
select
  t.id,
  t.user_id,
  p.name as user_name,
  st_y(t.location::geometry) as latitude,
  st_x(t.location::geometry) as longitude,
  t.photo_url,
  t.species,
  t.species_confidence,
  t.health_status,
  t.health_confidence,
  t.estimated_height,
  t.height_confidence,
  t.trunk_diameter,
  t.diameter_confidence,
  t.notes,
  t.spotify_url,
  t.spotify_track_name,
  t.spotify_artist,
  t.created_at
from trees t
join profiles p on p.id = t.user_id;

-- Row Level Security
alter table profiles enable row level security;
alter table trees enable row level security;

-- Profiles: users can read all, update own
create policy "Anyone can view profiles"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Trees: anyone can read, authenticated users can insert own
create policy "Anyone can view trees"
  on trees for select using (true);

create policy "Authenticated users can insert trees"
  on trees for insert with check (auth.uid() = user_id);

create policy "Users can update own trees"
  on trees for update using (auth.uid() = user_id);

create policy "Users can delete own trees"
  on trees for delete using (auth.uid() = user_id);
