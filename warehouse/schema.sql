-- Fact warehouse for the Isar Aerospace case.
-- Rule: every number is either a fact (with a source) or an assumption (with a rationale, range and sources).
-- Facts are stored in the unit of their metric, so values from different sources are directly comparable.

create table if not exists sources (
  id text primary key,
  title text not null,
  publisher text not null,
  url text,
  published text,
  accessed date not null default current_date,
  kind text not null check (kind in ('dataset', 'report', 'filing', 'press', 'article', 'price-list', 'interview', 'regulator', 'team')),
  reliability text not null check (reliability in ('high', 'medium', 'low')),
  note text,
  short text
);
-- Added after the first load; the alter keeps existing databases in step.
alter table sources add column if not exists short text;
comment on table sources is 'Every source a number in the warehouse comes from.';
comment on column sources.short is 'Citation label for the dashboard, e.g. GCAT or SIA 2026.';

create table if not exists metrics (
  id text primary key,
  name text not null,
  unit text not null,
  definition text not null
);
comment on table metrics is 'Dictionary of measured quantities. A fact''s value is always in its metric''s unit.';

create table if not exists facts (
  id bigint generated always as identity primary key,
  metric_id text not null references metrics (id),
  year int,
  scope text not null default 'global',
  entity text not null default '',
  value numeric not null,
  source_id text not null references sources (id),
  is_preferred boolean not null default false,
  confidence text not null check (confidence in ('high', 'medium', 'low')),
  note text,
  unique (metric_id, year, scope, entity, source_id)
);
comment on table facts is 'Sourced numbers in long format. Several sources may report the same metric; exactly one is preferred.';
comment on column facts.scope is 'What the number covers, e.g. global, company, site.';
comment on column facts.entity is 'Who the number is about, e.g. Isar Aerospace, Rocket Lab, Andøya. Empty for global figures.';
comment on column facts.is_preferred is 'The value the tool uses; the others are plausibility checks.';
create unique index if not exists facts_one_preferred
  on facts (metric_id, coalesce(year, 0), scope, entity) where is_preferred;

create table if not exists assumptions (
  id text primary key,
  name text not null,
  question text not null,
  tier text not null check (tier in ('TAM', 'SAM', 'SOM', 'fixed', 'outlook')),
  value numeric not null,
  low numeric,
  high numeric,
  unit text not null,
  is_lever boolean not null,
  rationale text not null,
  source_ids text[] not null default '{}',
  owner text not null,
  confidence text not null check (confidence in ('high', 'medium', 'low'))
);
comment on table assumptions is 'Judgement calls. Levers are sliders in the tool; the rest are fixed parameters shown with their rationale.';

create table if not exists launch_sites (
  id text primary key,
  name text not null,
  country text not null,
  latitude numeric not null,
  inclination_min numeric not null,
  inclination_max numeric not null,
  status text not null,
  isar_access text not null,
  max_launches_per_year int,
  note text,
  source_id text not null references sources (id)
);
comment on table launch_sites is 'Launch sites as data: the orbit band a site reaches decides which satellites Isar can serve from it.';

create table if not exists vehicles (
  id text primary key,
  name text not null,
  operator text not null,
  payload_leo_kg numeric,
  payload_sso_kg numeric,
  price_usd numeric,
  class text not null check (class in ('small', 'medium', 'heavy')),
  note text,
  source_id text not null references sources (id)
);

create table if not exists manifest (
  id text primary key,
  customer text not null,
  mission text not null,
  planned text not null,
  site text not null,
  status text not null,
  note text,
  source_id text not null references sources (id)
);
comment on table manifest is 'Isar''s known launch contracts: how long Spectrum is booked.';

create table if not exists satellites (
  jcat text primary key,
  name text not null,
  launch_year int not null,
  launch_date date,
  launch_vehicle text,
  launcher_class text not null,
  operator_code text,
  operator text,
  country text,
  customer_group text not null,
  customer_type text not null,
  mission text not null,
  orbit_class text not null,
  inclination numeric,
  mass_kg numeric,
  mass_estimated boolean not null default false,
  source_id text not null default 'gcat' references sources (id)
);
comment on table satellites is 'Every payload that reached orbit in 2024 and 2025 (McDowell GCAT), built by warehouse/build_satellites.py.';
create index if not exists satellites_year on satellites (launch_year);

-- Views are recreated on every load, so their columns can change.
drop view if exists v_facts, v_q1_funnel, v_sam_launchers;

-- Readable facts with metric and source.
create or replace view v_facts as
select f.id, f.metric_id, m.name as metric, m.unit, f.year, f.scope, f.entity, f.value, f.is_preferred,
       f.confidence, f.note, f.source_id, s.title as source, s.publisher, s.url, s.reliability
from facts f
join metrics m on m.id = f.metric_id
join sources s on s.id = f.source_id;

-- Q1 base case (Andøya only), computed from satellites, facts and assumptions: every funnel number is reproducible in SQL.
-- Revenue: TAM from the preferred launch revenue fact; SAM as a range from rideshare to dedicated price per kg.
create or replace view v_q1_funnel as
with p as (
  select
    max(value) filter (where id = 'tam_base_year') as base_year,
    max(value) filter (where id = 'sam_payload_limit_kg') as payload_kg,
    max(value) filter (where id = 'sam_other_gov_open') as other_gov,
    max(value) filter (where id = 'som_penetration') as penetration,
    max(value) filter (where id = 'som_launches_per_year') as launches,
    max(value) filter (where id = 'som_success_rate') as success,
    max(value) filter (where id = 'fixed_fill_rate') as fill,
    max(value) filter (where id = 'fixed_price_per_launch_eur') as price_eur,
    max(value) filter (where id = 'fixed_rideshare_usd_per_kg') as rideshare_usd_kg,
    max(value) filter (where id = 'fixed_dedicated_usd_per_kg') as dedicated_usd_kg,
    max(value) filter (where id = 'fixed_usd_per_eur') as usd_per_eur
  from assumptions
),
tam_revenue as (
  select f.value / p.usd_per_eur as eur
  from facts f, p
  where f.metric_id = 'launch_revenue' and f.year = p.base_year and f.is_preferred and f.scope = 'global'
),
site as (select inclination_min, inclination_max from launch_sites where id = 'andoya'),
s as (
  select sat.*,
    case sat.customer_type
      when 'open-commercial' then 1 when 'institutional-eu' then 1
      when 'institutional-other' then p.other_gov else 0 end as open_w,
    case when sat.mass_kg <= case when sat.orbit_class = 'SSO' then p.payload_kg else p.payload_kg * 1000.0 / 700 end
      then 1 else 0 end as fits_w,
    case when sat.inclination between site.inclination_min and site.inclination_max then 1 else 0 end as reach_w
  from satellites sat, p, site
  where sat.launch_year = p.base_year
),
steps as (
  select 1 as step, 'TAM' as tier, 'All satellites that reached orbit' as label,
         count(*)::numeric as satellites, sum(mass_kg) as mass_kg from s
  union all
  select 2, 'SAM', 'Open to a European launcher', sum(open_w), sum(open_w * mass_kg) from s
  union all
  select 3, 'SAM', 'Fits on Spectrum', sum(open_w * fits_w), sum(open_w * fits_w * mass_kg) from s
  union all
  select 4, 'SAM', 'Orbit reachable from Andøya', sum(open_w * fits_w * reach_w), sum(open_w * fits_w * reach_w * mass_kg) from s
),
sam as (select satellites, mass_kg from steps where step = 4),
som as (
  select sam.satellites * p.penetration as want_sats,
         sam.mass_kg * p.penetration as want_kg,
         p.launches * p.success * p.payload_kg * p.fill as can_kg,
         p.payload_kg * p.fill as per_launch_kg,
         p.price_eur
  from sam, p
)
select step, tier, label, satellites, mass_kg,
       case step
         when 1 then (select eur from tam_revenue)
         when 4 then mass_kg * p.rideshare_usd_kg / p.usd_per_eur
       end as revenue_eur,
       case step
         when 1 then (select eur from tam_revenue)
         when 4 then mass_kg * p.dedicated_usd_kg / p.usd_per_eur
       end as revenue_eur_high
from steps, p
union all
select 5, 'SOM', 'Wants a dedicated launch (penetration)', want_sats, want_kg, null, null from som
union all
select 6, 'SOM', 'Isar can fly (capacity × success)',
       want_sats * least(1, can_kg / nullif(want_kg, 0)), least(want_kg, can_kg),
       least(want_kg, can_kg) / per_launch_kg * price_eur,
       least(want_kg, can_kg) / per_launch_kg * price_eur
from som
order by step;

-- Who launched the satellites in Isar's serviceable market: today's competition for the SOM.
create or replace view v_sam_launchers as
with p as (
  select max(value) filter (where id = 'tam_base_year') as base_year,
         max(value) filter (where id = 'sam_payload_limit_kg') as payload_kg
  from assumptions
),
site as (select inclination_min, inclination_max from launch_sites where id = 'andoya')
select s.launch_vehicle, s.launcher_class, count(*) as satellites, sum(s.mass_kg) as mass_kg
from satellites s, p, site
where s.launch_year = p.base_year
  and s.customer_type in ('open-commercial', 'institutional-eu')
  and s.mass_kg <= p.payload_kg
  and s.inclination between site.inclination_min and site.inclination_max
group by 1, 2
order by satellites desc;

-- Read-only access for a future anon key; the service role and the database owner bypass RLS.
do $$
declare t text;
begin
  foreach t in array array['sources', 'metrics', 'facts', 'assumptions', 'launch_sites', 'vehicles', 'manifest', 'satellites'] loop
    execute format('alter table %I enable row level security', t);
    if not exists (select 1 from pg_policies where tablename = t and policyname = 'read_all') then
      execute format('create policy read_all on %I for select using (true)', t);
    end if;
  end loop;
end $$;
