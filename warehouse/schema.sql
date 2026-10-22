-- Fact warehouse for the Isar Aerospace case.
-- Rule: every number is either a fact (with a source) or an assumption (with a rationale, range and sources).
-- Facts are stored in the unit of their metric, so values from different sources are directly comparable.
-- load.py rebuilds the warehouse from warehouse/seed on every run (export first if you edited in Supabase),
-- so tables are recreated from this file rather than migrated. Other tables in the database are not touched.

drop view if exists v_facts, v_q1_funnel, v_sam_launchers, v_launch_site_overview, v_launch_site_activity, v_vehicle_activity,
  v_launches_by_provider, v_launches_by_country, v_launches, v_q2_launch_gap, v_penetration_evidence;
drop table if exists launch_site_vehicles, launches, satellites, manifest, vehicles, launch_sites,
  assumptions, facts, metrics, sources cascade;

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
  tier text not null check (tier in ('TAM', 'SAM', 'SOM', 'fixed', 'outlook', 'trigger')),
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
  country_code text,
  operator text,
  ownership text check (ownership in ('government', 'military', 'commercial', 'public-private')),
  latitude numeric,
  longitude numeric,
  inclination_min numeric,
  inclination_max numeric,
  launch_azimuth text,
  status text not null check (status in ('operational', 'under construction', 'planned', 'inactive')),
  first_orbital_launch int,
  orbital_pads int,
  max_vehicle_class text check (max_vehicle_class in ('small', 'medium', 'heavy', 'super-heavy')),
  polar_sso boolean,
  access text check (access in ('sovereign', 'national-commercial', 'international')),
  max_launches_per_year int,
  cap_basis text,
  expansion text,
  isar_access text,
  note text,
  gcat_codes text[] not null default '{}',
  source_id text not null references sources (id),
  source_ids text[] not null default '{}',
  confidence text not null default 'medium' check (confidence in ('high', 'medium', 'low'))
);
comment on table launch_sites is 'Global spaceport register. The orbit band a site reaches decides which satellites a launcher can serve from it.';
comment on column launch_sites.latitude is 'Main orbital pad; empty for planned sites without published coordinates.';
comment on column launch_sites.inclination_min is 'Lowest inclination reachable by direct ascent within the allowed launch azimuths.';
comment on column launch_sites.access is 'sovereign: only the state''s own launchers; national-commercial: domestic companies; international: open to foreign providers.';
comment on column launch_sites.max_launches_per_year is 'Licensed or officially planned cap for the whole site; cap_basis says which.';
comment on column launch_sites.gcat_codes is 'GCAT Launch_Site codes: joins the site to the launches table.';

create table if not exists vehicles (
  id text primary key,
  name text not null,
  operator text not null,
  country_code text,
  class text not null check (class in ('small', 'medium', 'heavy', 'super-heavy')),
  payload_leo_kg numeric,
  payload_sso_kg numeric,
  payload_gto_kg numeric,
  payload_estimated boolean not null default false,
  reusable boolean,
  status text check (status in ('operational', 'development', 'retired')),
  first_flight int,
  price_usd numeric,
  gcat_names text[] not null default '{}',
  note text,
  source_id text not null references sources (id)
);
comment on table vehicles is 'Launch vehicles with payload capability. Class by LEO payload: small < 2 t, medium 2–20 t, heavy 20–50 t, super-heavy > 50 t.';
comment on column vehicles.gcat_names is 'LV_Type names in GCAT: joins the vehicle to the launches table.';

create table if not exists launch_site_vehicles (
  site_id text not null references launch_sites (id),
  vehicle_id text not null references vehicles (id),
  status text not null check (status in ('active', 'planned', 'contracted', 'retired')),
  orbits text[] not null default '{}',
  pad text,
  since int,
  note text,
  source_id text not null references sources (id),
  primary key (site_id, vehicle_id)
);
comment on table launch_site_vehicles is 'Who launches what from where: one row per spaceport and vehicle, with the orbits flown and the status.';

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
  launch_tag text,
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

create table if not exists launches (
  launch_tag text primary key,
  launch_date date not null,
  launch_year int not null,
  vehicle text,
  variant text,
  mission text,
  site_code text,
  pad text,
  platform text,
  agency_code text,
  agency text,
  success boolean not null,
  launch_code text not null,
  orbit text not null,
  category text,
  inclination numeric,
  payload_t numeric,
  source_id text not null default 'gcat' references sources (id)
);
comment on table launches is 'Every orbital and deep-space launch attempt since 2024 (McDowell GCAT), built by warehouse/build_launches.py.';
comment on column launches.orbit is 'Target orbit: LEO (incl. space stations), SSO, GTO, MEO, GEO, HEO, escape.';
comment on column launches.payload_t is 'Payload mass placed in orbit, tonnes (GCAT OrbPay).';

-- Views are recreated on every load, so their columns can change.

-- Readable facts with metric and source.
create or replace view v_facts as
select f.id, f.metric_id, m.name as metric, m.unit, f.year, f.scope, f.entity, f.value, f.is_preferred,
       f.confidence, f.note, f.source_id, s.title as source, s.publisher, s.url, s.reliability
from facts f
join metrics m on m.id = f.metric_id
join sources s on s.id = f.source_id;

-- Q1 base case (Andøya only), computed from satellites, facts, assumptions and Spectrum's payload in vehicles:
-- every funnel number is reproducible in SQL.
-- Revenue: TAM from the preferred launch revenue fact; SAM as a range from rideshare to dedicated price per kg.
create or replace view v_q1_funnel as
with p as (
  select
    max(value) filter (where id = 'tam_base_year') as base_year,
    -- Spectrum's payload is a sourced vehicle fact, not an assumption.
    (select payload_sso_kg from vehicles where id = 'spectrum') as payload_sso,
    (select payload_leo_kg from vehicles where id = 'spectrum') as payload_leo,
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
    case when sat.mass_kg <= case when sat.orbit_class = 'SSO' then p.payload_sso else p.payload_leo end
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
         p.launches * p.success * p.payload_sso * p.fill as can_kg,
         p.payload_sso * p.fill as per_launch_kg,
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
         (select payload_sso_kg from vehicles where id = 'spectrum') as payload_sso,
         (select payload_leo_kg from vehicles where id = 'spectrum') as payload_leo
  from assumptions
),
site as (select inclination_min, inclination_max from launch_sites where id = 'andoya')
select s.launch_vehicle, s.launcher_class, count(*) as satellites, sum(s.mass_kg) as mass_kg
from satellites s, p, site
where s.launch_year = p.base_year
  and s.customer_type in ('open-commercial', 'institutional-eu')
  and s.mass_kg <= case when s.orbit_class = 'SSO' then p.payload_sso else p.payload_leo end
  and s.inclination between site.inclination_min and site.inclination_max
group by 1, 2
order by satellites desc;

-- Activity per spaceport and year from GCAT: launches, failures, payload mass and target orbits.
-- Satellites per launch exist for 2024 and 2025 only (the satellites table), so that column is empty for 2026.
create or replace view v_launch_site_activity as
with sats as (
  select launch_tag, count(*) as satellites, sum(mass_kg) as mass_kg from satellites group by launch_tag
)
select s.id as site_id, l.launch_year as year,
       count(*) as launches,
       count(*) filter (where not l.success) as failures,
       round(sum(l.payload_t) filter (where l.success), 1) as payload_t,
       sum(sa.satellites) as satellites,
       count(*) filter (where l.orbit = 'LEO') as to_leo,
       count(*) filter (where l.orbit = 'SSO') as to_sso,
       count(*) filter (where l.orbit in ('GTO', 'GEO')) as to_geo,
       count(*) filter (where l.orbit not in ('LEO', 'SSO', 'GTO', 'GEO')) as to_other,
       string_agg(distinct l.vehicle, ', ' order by l.vehicle) as vehicles,
       string_agg(distinct l.agency, ', ' order by l.agency) as agencies
from launch_sites s
join launches l on l.site_code = any (s.gcat_codes)
left join sats sa on sa.launch_tag = l.launch_tag
group by s.id, l.launch_year;

-- One row per spaceport: register, who flies what from there, what it can lift, and how busy it is.
create or replace view v_launch_site_overview as
with fleet as (
  select lsv.site_id,
         string_agg(v.name || ' (' || v.operator || ')', ', ' order by v.name) filter (where lsv.status = 'active') as active_vehicles,
         string_agg(v.name || ' (' || v.operator || ')', ', ' order by v.name)
           filter (where lsv.status in ('planned', 'contracted')) as planned_vehicles,
         string_agg(distinct v.operator, ', ' order by v.operator) filter (where lsv.status <> 'retired') as providers,
         string_agg(distinct v.country_code, ', ' order by v.country_code) filter (where lsv.status <> 'retired') as provider_countries,
         max(v.payload_leo_kg) filter (where lsv.status <> 'retired') as max_payload_leo_kg,
         max(v.payload_sso_kg) filter (where lsv.status <> 'retired') as max_payload_sso_kg,
         max(v.payload_gto_kg) filter (where lsv.status <> 'retired') as max_payload_gto_kg
  from launch_site_vehicles lsv
  join vehicles v on v.id = lsv.vehicle_id
  group by lsv.site_id
),
served as (
  select site_id, string_agg(distinct o, ', ' order by o) as orbits
  from launch_site_vehicles, unnest(orbits) as o
  where status <> 'retired'
  group by site_id
),
act as (
  select site_id,
         sum(launches) filter (where year = 2024) as launches_2024,
         sum(launches) filter (where year = 2025) as launches_2025,
         sum(launches) filter (where year = 2026) as launches_2026_ytd,
         sum(payload_t) filter (where year = 2025) as payload_t_2025,
         sum(satellites) filter (where year = 2025) as satellites_2025
  from v_launch_site_activity
  group by site_id
)
select s.id, s.name, s.country, s.country_code, s.status, s.operator, s.ownership, s.access,
       s.latitude, s.longitude, s.inclination_min, s.inclination_max, s.polar_sso, s.max_vehicle_class,
       s.orbital_pads, s.max_launches_per_year,
       f.active_vehicles, f.planned_vehicles, f.providers, f.provider_countries, served.orbits,
       f.max_payload_leo_kg, f.max_payload_sso_kg, f.max_payload_gto_kg,
       coalesce(a.launches_2024, 0) as launches_2024, coalesce(a.launches_2025, 0) as launches_2025,
       coalesce(a.launches_2026_ytd, 0) as launches_2026_ytd, a.payload_t_2025, a.satellites_2025,
       round(coalesce(a.launches_2025, 0)::numeric / nullif(s.max_launches_per_year, 0), 2) as cap_used_2025,
       s.first_orbital_launch, s.expansion, s.isar_access, s.note, s.source_id, s.confidence
from launch_sites s
left join fleet f on f.site_id = s.id
left join served on served.site_id = s.id
left join act a on a.site_id = s.id
order by coalesce(a.launches_2025, 0) desc, s.name;

-- Launches per vehicle and year (through vehicles.gcat_names): cadence and reliability of every rocket.
create or replace view v_vehicle_activity as
select v.id as vehicle_id, v.name, v.operator, l.launch_year as year,
       count(*) as launches,
       count(*) filter (where l.success) as successes,
       round(sum(l.payload_t) filter (where l.success), 1) as payload_t
from vehicles v
join launches l on l.vehicle = any (v.gcat_names)
group by v.id, v.name, v.operator, l.launch_year;

-- Every launch with spaceport, vehicle and launch provider resolved. GCAT names the launching agency at
-- sub-unit level (CALT, SAST, Rocket Lab NZ), so the provider and its country come from the vehicle.
create or replace view v_launches as
select l.*, s.id as site_id, s.name as site, s.country_code as site_country,
       v.id as vehicle_id, v.name as vehicle_name, v.class as vehicle_class,
       coalesce(v.operator, l.agency) as provider, v.country_code as provider_country
from launches l
left join launch_sites s on l.site_code = any (s.gcat_codes)
left join vehicles v on l.vehicle = any (v.gcat_names);

-- Launches per launch provider and year: who flies how often, how reliably, how much mass.
create or replace view v_launches_by_provider as
select provider, provider_country, launch_year as year,
       count(*) as launches,
       count(*) filter (where success) as successes,
       round(sum(payload_t) filter (where success), 1) as payload_t,
       string_agg(distinct vehicle_name, ', ' order by vehicle_name) as vehicles
from v_launches
group by provider, provider_country, launch_year;

-- Launches per country of the launch provider and year.
create or replace view v_launches_by_country as
select provider_country as country_code, launch_year as year,
       count(*) as launches,
       count(*) filter (where success) as successes,
       round(sum(payload_t) filter (where success), 1) as payload_t,
       count(distinct provider) as providers,
       string_agg(distinct provider, ', ' order by provider) as provider_names
from v_launches
group by provider_country, launch_year;

-- Evidence for the SOM penetration assumption: the share of the serviceable market that actually bought a
-- dedicated small-launcher ride instead of rideshare (revealed preference), by year and pooled, by count and mass.
-- "Andøya band" uses the Q1 SAM filters; "Western open market" drops only the orbit filter. Not on Falcon 9 is an
-- upper bound: it also counts national rockets and primary rides on larger vehicles.
create or replace view v_penetration_evidence as
with p as (select max(value) filter (where id = 'sam_other_gov_open') as other_gov from assumptions),
spec as (select payload_sso_kg, payload_leo_kg from vehicles where id = 'spectrum'),
site as (select inclination_min, inclination_max from launch_sites where id = 'andoya'),
s as (
  select sat.launch_year::text as period, sat.mass_kg, sat.launcher_class, coalesce(sat.launch_vehicle, '') as vehicle,
         sat.inclination between site.inclination_min and site.inclination_max as in_band,
         case sat.customer_type
           when 'open-commercial' then 1 when 'institutional-eu' then 1
           when 'institutional-other' then p.other_gov else 0 end as w
  from satellites sat, p, spec, site
  where sat.mass_kg <= case when sat.orbit_class = 'SSO' then spec.payload_sso_kg else spec.payload_leo_kg end
),
periods as (select * from s union all select '2024–2025', mass_kg, launcher_class, vehicle, in_band, w from s),
segments as (
  select 'Andøya band (Q1 SAM)' as segment, * from periods where in_band
  union all
  select 'Western open market, all orbits', * from periods
)
select segment, period,
       round(sum(w), 1) as satellites,
       round(sum(w * mass_kg) / 1000, 1) as mass_t,
       round(sum(w) filter (where launcher_class = 'small') / sum(w), 3) as dedicated_share_sats,
       round(sum(w * mass_kg) filter (where launcher_class = 'small') / sum(w * mass_kg), 3) as dedicated_share_mass,
       round(sum(w) filter (where vehicle not like 'Falcon 9%') / sum(w), 3) as not_falcon9_share_sats,
       round(sum(w * mass_kg) filter (where vehicle not like 'Falcon 9%') / sum(w * mass_kg), 3) as not_falcon9_share_mass
from segments
where w > 0
group by segment, period
order by segment, period;

-- RQ2: how many of Isar's planned launches the demand visible in flight data fills. The 2028 plan is a sourced
-- fact, the 2030 plan a team assumption; everything else comes from the Q1 funnel and the Q2 assumptions.
create or replace view v_q2_launch_gap as
with p as (
  select
    max(value) filter (where id = 'tam_base_year') as base_year,
    max(value) filter (where id = 'som_penetration') as penetration,
    max(value) filter (where id = 'outlook_market_growth') as growth,
    max(value) filter (where id = 'q2_load_kg') as load_kg,
    max(value) filter (where id = 'q2_success_rate_2028') as success_2028,
    max(value) filter (where id = 'q2_success_rate_2030') as success_2030,
    max(value) filter (where id = 'q2_launches_planned_2030') as planned_2030
  from assumptions
),
sam as (select mass_kg from v_q1_funnel where step = 4),
plan as (
  select 2028 as year,
         (select value from facts
          where metric_id = 'launches_planned' and year = 2028 and entity = 'Isar Aerospace' and is_preferred) as planned,
         'fact (Payload)' as planned_basis,
         p.success_2028 as success
  from p
  union all
  select 2030, p.planned_2030, 'team assumption', p.success_2030 from p
),
calc as (
  select plan.*, sam.mass_kg * power(1 + p.growth, plan.year - p.base_year) * p.penetration / p.load_kg as loads,
         sam.mass_kg * power(1 + p.growth, plan.year - p.base_year) as market_kg
  from plan, p, sam
)
select year, planned, planned_basis,
       round(market_kg / 1000, 1) as market_t,
       round(loads, 2) as loads,
       round(loads / success, 1) as launches_filled,
       round(loads / success / planned, 2) as share_filled,
       round(planned - loads / success, 1) as launches_without_visible_demand
from calc
order by year;

-- Read-only access for a future anon key; the service role and the database owner bypass RLS.
do $$
declare t text;
begin
  foreach t in array array['sources', 'metrics', 'facts', 'assumptions', 'launch_sites', 'vehicles', 'launch_site_vehicles',
                            'manifest', 'satellites', 'launches'] loop
    execute format('alter table %I enable row level security', t);
    if not exists (select 1 from pg_policies where tablename = t and policyname = 'read_all') then
      execute format('create policy read_all on %I for select using (true)', t);
    end if;
  end loop;
end $$;
