-- Fact warehouse for the Isar Aerospace case.
-- Rule: every number is either a fact (with a source) or an assumption (with a rationale, range and sources).
-- Facts are stored in the unit of their metric, so values from different sources are directly comparable.
-- load.py rebuilds the warehouse from warehouse/seed on every run (export first if you edited in Supabase),
-- so tables are recreated from this file rather than migrated. Other tables in the database are not touched.

drop view if exists v_scenarios, v_facts, v_q1_funnel, v_sam_launchers, v_launch_site_overview, v_launch_site_activity, v_vehicle_activity,
  v_launches_by_provider, v_launches_by_country, v_launches, v_q2_launch_gap, v_penetration_evidence, v_win_share_evidence,
  v_q2_expansion_fields, v_q3_site_load;
drop table if exists scenarios, site_nodes, expansion_fields, launch_site_vehicles, launches, satellites, manifest, vehicles, launch_sites,
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

create table if not exists expansion_fields (
  id text primary key,
  name text not null,
  category text not null check (category in ('core', 'site', 'product', 'adjacent')),
  recommendation text not null check (recommendation in ('pursue', 'conditional', 'not')),
  sites text,
  launch_site_id text references launch_sites (id),
  start_year int not null,
  end_year int,
  market_2025_eur numeric not null,
  market_basis text not null,
  growth numeric not null,
  growth_basis text not null,
  isar_share numeric not null,
  share_basis text not null,
  gross_margin numeric not null,
  margin_basis text not null,
  fixed_cost_eur numeric not null default 0,
  capex_eur numeric not null default 0,
  cost_basis text,
  source_ids text[] not null default '{}',
  confidence text not null check (confidence in ('high', 'medium', 'low')),
  note text
);
comment on table expansion_fields is 'RQ2 expansion fields as a small model: market today, growth, Isar''s share, margin and the cost of entering. Every number has a basis text and sources; v_q2_expansion_fields rolls it forward.';
comment on column expansion_fields.isar_share is 'Share of the field''s market Isar can win: reachable part × win share, explained in share_basis.';
comment on column expansion_fields.fixed_cost_eur is 'Yearly fixed cost the field adds (e.g. a site fee), charged from start_year.';
comment on column expansion_fields.capex_eur is 'Capital the field ties up; charged at the WACC assumption from 2027 on.';
comment on column expansion_fields.launch_site_id is 'Where the field''s Spectrum launches fly from; empty for services or a different rocket.';

create table if not exists site_nodes (
  id text primary key,
  name text not null,
  kind text not null check (kind in ('hq', 'production', 'test', 'launch')),
  location text not null,
  country_code text not null,
  launch_site_id text references launch_sites (id),
  status_today text not null,
  role_today text not null,
  role_proposed text not null,
  decision text not null check (decision in ('keep', 'expand', 'option', 'hold')),
  pads_today numeric,
  pads_proposed numeric,
  pad_share numeric,
  capacity_today numeric,
  capacity_proposed numeric,
  capacity_unit text,
  capacity_basis text,
  fixed_cost_eur numeric not null default 0,
  isar_capex_eur numeric not null default 0,
  funded_by text,
  trigger text,
  transport text,
  source_ids text[] not null default '{}',
  confidence text not null check (confidence in ('high', 'medium', 'low')),
  note text,
  latitude numeric,
  longitude numeric
);
comment on table site_nodes is 'RQ3: Isar''s production, test and launch sites today and as proposed, with capacity, cost, who pays and the trigger for each step.';
comment on column site_nodes.latitude is 'WGS84 position for the footprint map (town centre for plant, HQ and test site; the spaceport for launch nodes).';
comment on column site_nodes.pad_share is 'Share of a pad Isar can use: 1 for an own pad, less for a shared complex.';
comment on column site_nodes.capacity_today is 'Production nodes: rockets a year. Launch nodes: computed in v_q3_site_load from pads × q3_pad_cadence.';

create table if not exists scenarios (
  id text primary key,
  name text not null,
  tagline text not null,
  sort int not null,
  fields text[] not null,
  readiness_growth numeric not null,
  ns_anchor_launches numeric not null default 0,
  contract_launches numeric not null default 0,
  contract_start_year int not null,
  institutional_after_end numeric not null default 0,
  success_2027 numeric not null,
  success_2030 numeric not null,
  rationale text not null,
  source_ids text[] not null default '{}',
  confidence text not null check (confidence in ('high', 'medium', 'low'))
);
comment on table scenarios is 'Final: three named P&L scenarios under the team''s assumptions (Bear, ASCENT as base, Bull). v_scenarios rolls each into revenue and EBIT per year.';
comment on column scenarios.fields is 'expansion_fields this scenario earns from. sovereign_readiness is split into flown launches and an availability fee, mission_extras is a service; every other field is sold as Spectrum launches.';
comment on column scenarios.contract_launches is 'Launches a year from frame contracts beyond the visible demand (the A in ASCENT), from contract_start_year.';
comment on column scenarios.institutional_after_end is 'Share of the 2030 level of institutional_elc that a successor programme keeps after the field''s end_year.';

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
    max(value) filter (where id = 'som_win_share') as win_share,
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
  select sam.satellites * p.penetration as dedicated_sats,
         sam.mass_kg * p.penetration as dedicated_kg,
         sam.satellites * p.penetration * p.win_share as want_sats,
         sam.mass_kg * p.penetration * p.win_share as want_kg,
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
select 5, 'SOM', 'Wants a dedicated launch (penetration)', dedicated_sats, dedicated_kg, null, null from som
union all
select 6, 'SOM', 'Chooses Isar (win share against Rocket Lab and others)', want_sats, want_kg, null, null from som
union all
select 7, 'SOM', 'Isar can fly (capacity × success)',
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

-- Evidence for the win-share assumption: who bought the dedicated launches in Isar's band in 2024 and 2025,
-- split into European operators (Isar's natural customers) and the rest, with the launchers they flew on.
create or replace view v_win_share_evidence as
with p as (select max(value) filter (where id = 'sam_other_gov_open') as other_gov from assumptions),
spec as (select payload_sso_kg, payload_leo_kg from vehicles where id = 'spectrum'),
site as (select inclination_min, inclination_max from launch_sites where id = 'andoya'),
s as (
  select sat.*,
         case sat.customer_type
           when 'open-commercial' then 1 when 'institutional-eu' then 1
           when 'institutional-other' then p.other_gov else 0 end as w,
         sat.country in ('F', 'D', 'UK', 'I', 'E', 'FI', 'L', 'LU', 'I-ESA', 'I-EU', 'PL', 'NL', 'N', 'S', 'DK', 'CH',
                         'B', 'A', 'P', 'IRL', 'GR', 'CZ', 'EE', 'LT', 'LV', 'HU', 'RO', 'BG', 'SK', 'SI', 'HR', 'IS') as european
  from satellites sat, p, spec, site
  where sat.launch_year in (2024, 2025)
    and sat.launcher_class = 'small'
    and sat.mass_kg <= case when sat.orbit_class = 'SSO' then spec.payload_sso_kg else spec.payload_leo_kg end
    and sat.inclination between site.inclination_min and site.inclination_max
)
select case when european then 'European operators' else 'Other operators' end as buyer,
       round(sum(w), 1) as satellites,
       round(sum(w * mass_kg)) as mass_kg,
       round(sum(w) / sum(sum(w)) over (), 3) as share_sats,
       round(sum(w * mass_kg) / sum(sum(w * mass_kg)) over (), 3) as share_mass,
       string_agg(distinct operator, ', ' order by operator) as operators,
       string_agg(distinct launch_vehicle, ', ' order by launch_vehicle) as launchers
from s
where w > 0
group by 1
order by 1;

-- RQ2: how many of Isar's planned launches the demand visible in flight data fills. The 2028 plan is a sourced
-- fact, the 2030 plan a team assumption; everything else comes from the Q1 funnel and the Q2 assumptions.
create or replace view v_q2_launch_gap as
with p as (
  select
    max(value) filter (where id = 'tam_base_year') as base_year,
    max(value) filter (where id = 'som_penetration') as penetration,
    max(value) filter (where id = 'som_win_share') as win_share,
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
         p.win_share,
         sam.mass_kg * power(1 + p.growth, plan.year - p.base_year) as market_kg
  from plan, p, sam
)
select year, planned, planned_basis,
       round(market_kg / 1000, 1) as market_t,
       round(loads, 2) as loads,
       round(loads / success, 1) as launches_filled,
       round(loads / success / planned, 2) as share_filled,
       round(planned - loads / success, 1) as launches_without_visible_demand,
       round(loads * win_share / success, 1) as launches_filled_isar_share,
       round(loads * win_share / success / planned, 2) as share_filled_isar
from calc
order by year;

-- RQ2 expansion fields rolled forward to 2030, 2035 and 2040: market, Isar revenue, gross profit and a simplified
-- EVA proxy (gross profit − yearly fixed cost − WACC × capital tied up). Gross profit stands in for NOPAT, so the
-- proxy ranks fields; it is not a valuation.
create or replace view v_q2_expansion_fields as
with p as (select max(value) filter (where id = 'q2_wacc') as wacc from assumptions),
y as (select unnest(array[2025, 2030, 2035, 2040]) as year),
f as (
  select e.*, y.year, e.market_2025_eur * power(1 + e.growth, y.year - 2025) as market_eur,
         (y.year >= e.start_year and y.year <= coalesce(e.end_year, 9999)) as active
  from expansion_fields e, y
)
select f.id, f.name, f.category, f.recommendation, f.sites, f.year,
       round(f.market_eur) as market_eur,
       round(case when f.active then f.market_eur * f.isar_share else 0 end) as isar_revenue_eur,
       round(case when f.active then f.market_eur * f.isar_share * f.gross_margin else 0 end) as gross_profit_eur,
       round(case when f.active then f.fixed_cost_eur else 0 end) as fixed_cost_eur,
       round(case when f.year >= 2027 then f.capex_eur * p.wacc else 0 end) as capital_charge_eur,
       round(case when f.active then f.market_eur * f.isar_share * f.gross_margin - f.fixed_cost_eur else 0 end
             - case when f.year >= 2027 then f.capex_eur * p.wacc else 0 end) as eva_proxy_eur,
       f.confidence
from f, p
order by f.year, eva_proxy_eur desc;

-- RQ3: launches each site has to carry (from the RQ2 expansion fields: Isar revenue ÷ price per launch) against
-- its capacity (pads × launches per pad, Isar's share of shared pads), and all Spectrum launches against the factory.
create or replace view v_q3_site_load as
with p as (
  select max(value) filter (where id = 'q3_pad_cadence') as cadence,
         max(value) filter (where id = 'q3_ns_anchor_launches') as ns_anchor,
         max(value) filter (where id = 'fixed_price_per_launch_eur') as price
  from assumptions
),
demand as (
  select e.launch_site_id as site_id, x.year,
         coalesce(sum(x.isar_revenue_eur) filter (where e.recommendation = 'pursue'), 0) / p.price as pursue_launches,
         coalesce(sum(x.isar_revenue_eur) filter (where e.recommendation <> 'pursue'), 0) / p.price as conditional_launches
  from v_q2_expansion_fields x
  join expansion_fields e on e.id = x.id
  cross join p
  where e.launch_site_id is not null
  group by e.launch_site_id, x.year, p.price
),
cap as (
  select launch_site_id as site_id,
         sum(coalesce(pads_today, 0) * coalesce(pad_share, 1)) as pads_today,
         sum(coalesce(pads_proposed, 0) * coalesce(pad_share, 1)) as pads_proposed
  from site_nodes where kind = 'launch' group by launch_site_id
),
sites as (
  select d.year, d.site_id, d.pursue_launches, d.conditional_launches,
         -- Anchor launches start with the first launch from Nova Scotia (start year of its expansion field).
         case when d.site_id = 'nova-scotia'
                   and d.year >= (select start_year from expansion_fields where id = 'site_nova_scotia')
              then p.ns_anchor else 0 end as anchor_launches,
         c.pads_today * p.cadence as capacity_today, c.pads_proposed * p.cadence as capacity_proposed
  from demand d join cap c on c.site_id = d.site_id cross join p
),
factory as (
  select s.year, 'factory-parsdorf'::text as site_id,
         sum(s.pursue_launches) as pursue_launches, sum(s.conditional_launches) as conditional_launches,
         sum(s.anchor_launches) as anchor_launches,
         (select sum(capacity_today) from site_nodes where kind = 'production') as capacity_today,
         (select sum(capacity_proposed) from site_nodes where kind = 'production') as capacity_proposed
  from sites s group by s.year
)
select year, site_id,
       round(pursue_launches, 2) as pursue_launches,
       round(conditional_launches, 2) as conditional_launches,
       anchor_launches,
       round(capacity_today, 1) as capacity_today,
       round(capacity_proposed, 1) as capacity_proposed,
       round((pursue_launches + conditional_launches + anchor_launches) / nullif(capacity_proposed, 0), 2) as load_proposed
from (select * from sites union all select * from factory) t
order by year, site_id;

-- Final: three P&L scenarios, 2027–2040, in real 2026 euros. Revenue reuses the RQ2 expansion fields (same basis as
-- v_q3_site_load); launch cost follows Rocket Lab's measured cost curve scaled to Spectrum; EBIT subtracts the fixed
-- cost base and the fixed costs of every field the scenario uses. dashboard/src/model/scenarios.ts mirrors it (test).
create or replace view v_scenarios as
with p as (
  select max(value) filter (where id = 'fixed_price_per_launch_eur') as price,
         max(value) filter (where id = 'q3_learning_rate') as lr,
         max(value) filter (where id = 'fixed_usd_per_eur') as usd_per_eur,
         max(value) filter (where id = 'scen_size_factor') as size_factor,
         max(value) filter (where id = 'scen_ref_cadence') as ref_cadence,
         max(value) filter (where id = 'scen_fixed_opex_eur') as fixed_opex,
         max(value) filter (where id = 'scen_readiness_launch_share') as rdy_launch_share,
         max(value) filter (where id = 'scen_readiness_fee_margin') as rdy_fee_margin,
         (select value from facts where metric_id = 'cost_per_launch' and entity = 'Rocket Lab' and year = 2025 and is_preferred) as ref_cost_usd
  from assumptions
),
y as (select generate_series(2027, 2040) as year),
fy as (
  select sc.id as scenario_id, y.year, e.id as field_id, e.gross_margin, e.fixed_cost_eur,
         (e.id not in ('sovereign_readiness', 'mission_extras')) as is_launch,
         case
           when y.year between e.start_year and coalesce(e.end_year, 9999)
             then e.market_2025_eur * power(1 + case when e.id = 'sovereign_readiness' then sc.readiness_growth else e.growth end, y.year - 2025) * e.isar_share
           when e.end_year is not null and y.year > e.end_year
             then sc.institutional_after_end * e.market_2025_eur * power(1 + e.growth, e.end_year - 2025) * e.isar_share
           else 0 end as revenue_eur,
         (y.year between e.start_year and coalesce(e.end_year, 9999)) as active,
         -- The Nova Scotia fee starts when the waiver ends (pro rata in that year), not with the first launch.
         case when y.year between e.start_year and coalesce(e.end_year, 9999)
              then e.fixed_cost_eur * case when e.id = 'site_nova_scotia'
                                           then least(greatest(y.year + 1 - (select value from assumptions where id = 'scen_ns_fee_start_year'), 0), 1)
                                           else 1 end
              else 0 end as fixed_cost_due_eur
  from scenarios sc cross join y
  join expansion_fields e on e.id = any (sc.fields)
),
agg as (
  select sc.id as scenario_id, sc.name, sc.sort, y.year,
         coalesce((select sum(revenue_eur) from fy where fy.scenario_id = sc.id and fy.year = y.year and fy.is_launch), 0)
           + case when 'site_nova_scotia' = any (sc.fields)
                       and y.year >= (select start_year from expansion_fields where id = 'site_nova_scotia')
                  then sc.ns_anchor_launches * p.price else 0 end
           + case when y.year >= sc.contract_start_year then sc.contract_launches * p.price else 0 end as launch_revenue_eur,
         coalesce((select sum(revenue_eur) from fy where fy.scenario_id = sc.id and fy.year = y.year and fy.field_id = 'sovereign_readiness'), 0) as readiness_revenue_eur,
         coalesce((select sum(revenue_eur) from fy where fy.scenario_id = sc.id and fy.year = y.year and fy.field_id = 'mission_extras'), 0) as extras_revenue_eur,
         coalesce((select sum(revenue_eur * gross_margin) from fy where fy.scenario_id = sc.id and fy.year = y.year and fy.field_id = 'mission_extras'), 0) as extras_profit_eur,
         coalesce((select sum(fixed_cost_due_eur) from fy where fy.scenario_id = sc.id and fy.year = y.year), 0) as field_fixed_cost_eur,
         case when y.year <= 2027 then sc.success_2027
              when y.year >= 2030 then sc.success_2030
              else sc.success_2027 + (sc.success_2030 - sc.success_2027) * (y.year - 2027) / 3.0 end as success_rate,
         p.*
  from scenarios sc cross join y cross join p
),
l as (
  select a.*,
         a.launch_revenue_eur / a.price + a.readiness_revenue_eur * a.rdy_launch_share / a.price as launches_sold,
         a.ref_cost_usd * a.size_factor / a.usd_per_eur as ref_cost_eur
  from agg a
),
c as (
  select l.*, l.launches_sold / l.success_rate as launches_flown,
         -- No learning beyond the volume Rocket Lab has measured: at or above the reference cadence the cost stays flat.
         l.ref_cost_eur * power(least(greatest(l.launches_sold / l.success_rate, 1), l.ref_cadence) / l.ref_cadence, ln(l.lr) / ln(2)) as unit_cost_eur
  from l
),
r as (
  select c.*,
         c.launch_revenue_eur + c.readiness_revenue_eur + c.extras_revenue_eur as revenue_eur,
         c.launch_revenue_eur + c.readiness_revenue_eur * c.rdy_launch_share - c.launches_flown * c.unit_cost_eur
           + c.readiness_revenue_eur * (1 - c.rdy_launch_share) * c.rdy_fee_margin + c.extras_profit_eur as gross_profit_eur
  from c
)
select scenario_id, name, sort, year,
       round(launches_sold, 2) as launches_sold,
       round(launches_flown, 2) as launches_flown,
       round(success_rate, 3) as success_rate,
       round(unit_cost_eur) as unit_cost_eur,
       round(launch_revenue_eur) as launch_revenue_eur,
       round(readiness_revenue_eur) as readiness_revenue_eur,
       round(extras_revenue_eur) as extras_revenue_eur,
       round(revenue_eur) as revenue_eur,
       round(gross_profit_eur) as gross_profit_eur,
       round(fixed_opex + field_fixed_cost_eur) as fixed_cost_eur,
       round(gross_profit_eur - fixed_opex - field_fixed_cost_eur) as ebit_eur,
       round(sum(gross_profit_eur - fixed_opex - field_fixed_cost_eur) over (partition by scenario_id order by year)) as cumulative_ebit_eur
from r
order by sort, year;

-- Read-only access for a future anon key; the service role and the database owner bypass RLS.
do $$
declare t text;
begin
  foreach t in array array['sources', 'metrics', 'facts', 'assumptions', 'launch_sites', 'vehicles', 'launch_site_vehicles',
                            'manifest', 'satellites', 'launches', 'expansion_fields', 'site_nodes', 'scenarios'] loop
    execute format('alter table %I enable row level security', t);
    if not exists (select 1 from pg_policies where tablename = t and policyname = 'read_all') then
      execute format('create policy read_all on %I for select using (true)', t);
    end if;
  end loop;
end $$;
