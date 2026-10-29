# Database dump: Isar Aerospace fact warehouse

Full CSV dump of the team's Supabase database (Postgres), taken on 2026-10-29 with `uv run warehouse/dump.py`. It contains every table and every view, so the data can be read, filtered or loaded without access to Supabase. The schema with all view definitions is in [schema.sql](schema.sql).

- **Tables** (`tables/`) hold sourced facts, team assumptions and the raw catalogues. **Views** (`views/`) are computed from them in SQL; the dashboard model is tested against them.
- **Format:** UTF-8, comma-separated, header row. Lists are joined with `;`, booleans are `true`/`false`, NULL is an empty cell. Money in real 2026 euros unless the column says otherwise.
- **Sources:** every fact and assumption points to a row in `sources` (`source_id` / `source_ids`). Satellites and launches come from Jonathan McDowell's [GCAT](https://planet4589.org/space/gcat/) catalogue.
- **Not Isar data, not investment advice:** figures are team estimates from public sources and an expert interview during a two-day case exercise.

To load it into a fresh Postgres: run `schema.sql`, then `\copy <table> from 'tables/<table>.csv' csv header` per table, parents first (`sources`, `metrics`, then the rest).

| Kind | Name | Rows | Content |
| --- | --- | ---: | --- |
| table | [`assumptions`](tables/assumptions.csv) | 33 | Team judgements: value, range, reasoning, sources, owner, confidence; lever or fixed |
| table | [`expansion_fields`](tables/expansion_fields.csv) | 13 | Q2: 13 growth fields with market, growth, Isar share, margin, cost, capital, sources |
| table | [`facts`](tables/facts.csv) | 83 | Measured numbers in long format (metric, year, scope, entity, value, source); one preferred source per metric |
| table | [`launch_site_vehicles`](tables/launch_site_vehicles.csv) | 149 | Who launches what from where: site x vehicle with status, orbits, pad |
| table | [`launch_sites`](tables/launch_sites.csv) | 56 | Global spaceport register: operator, location, reachable inclination band, status, pads, limits, Isar relation |
| table | [`launches`](tables/launches.csv) | 838 | Every orbital and deep-space launch attempt since 2024 (GCAT) |
| table | [`manifest`](tables/manifest.csv) | 11 | Isar Aerospace's known contracts |
| table | [`metrics`](tables/metrics.csv) | 47 | Dictionary of measured quantities with unit and definition |
| table | [`satellites`](tables/satellites.csv) | 7,361 | All 7,361 satellites launched 2024/2025 (GCAT) with mass, inclination, customer group, mission, launcher |
| table | [`scenarios`](tables/scenarios.csv) | 3 | P&L scenarios Bear / ASCENT / Bull with their parameters |
| table | [`site_nodes`](tables/site_nodes.csv) | 8 | Q3: production and launch sites with capacity, cost and role |
| table | [`sources`](tables/sources.csv) | 242 | Every source: title, publisher, URL, kind, reliability, short label |
| table | [`vehicles`](tables/vehicles.csv) | 107 | Launch vehicles with operator, class, payload to LEO/SSO/GTO, status, price |
| view | [`v_facts`](views/v_facts.csv) | 83 | Facts with metric and source resolved |
| view | [`v_launch_site_activity`](views/v_launch_site_activity.csv) | 70 | Launches, failures, payload and target orbits per spaceport and year |
| view | [`v_launch_site_overview`](views/v_launch_site_overview.csv) | 56 | One row per spaceport: register, active and planned vehicles, orbits, launches per year |
| view | [`v_launches`](views/v_launches.csv) | 838 | Every launch with site, vehicle, provider and provider country resolved |
| view | [`v_launches_by_country`](views/v_launches_by_country.csv) | 30 | Launches, successes and payload per provider country and year |
| view | [`v_launches_by_provider`](views/v_launches_by_provider.csv) | 71 | Launches, successes and payload per provider and year |
| view | [`v_penetration_evidence`](views/v_penetration_evidence.csv) | 6 | Evidence for the 7 % share that buys a dedicated small launch |
| view | [`v_q1_funnel`](views/v_q1_funnel.csv) | 7 | Q1 funnel TAM -> SAM -> SOM by satellites, mass and revenue |
| view | [`v_q2_expansion_fields`](views/v_q2_expansion_fields.csv) | 52 | Q2: revenue, gross profit and EVA proxy per field for 2030/2035/2040 |
| view | [`v_q2_launch_gap`](views/v_q2_launch_gap.csv) | 2 | Q2: how many planned Isar launches today's flown demand fills |
| view | [`v_q3_site_load`](views/v_q3_site_load.csv) | 16 | Q3: launches and plant load per site and year |
| view | [`v_sam_launchers`](views/v_sam_launchers.csv) | 6 | Which launchers carry the Andoya-reachable market today |
| view | [`v_scenarios`](views/v_scenarios.csv) | 42 | P&L per scenario and year 2027-2040: revenue, cost, EBIT proxy, cumulative result |
| view | [`v_vehicle_activity`](views/v_vehicle_activity.csv) | 153 | Launches, successes and payload per vehicle and year |
| view | [`v_win_share_evidence`](views/v_win_share_evidence.csv) | 2 | Evidence for Isar's 45 % win share against Rocket Lab |

## Columns

- **`assumptions`**: `id`, `name`, `question`, `tier`, `value`, `low`, `high`, `unit`, `is_lever`, `rationale`, `source_ids`, `owner`, `confidence`
- **`expansion_fields`**: `id`, `name`, `category`, `recommendation`, `sites`, `launch_site_id`, `start_year`, `end_year`, `market_2025_eur`, `market_basis`, `growth`, `growth_basis`, `isar_share`, `share_basis`, `gross_margin`, `margin_basis`, `fixed_cost_eur`, `capex_eur`, `cost_basis`, `source_ids`, `confidence`, `note`
- **`facts`**: `id`, `metric_id`, `year`, `scope`, `entity`, `value`, `source_id`, `is_preferred`, `confidence`, `note`
- **`launch_site_vehicles`**: `site_id`, `vehicle_id`, `status`, `orbits`, `pad`, `since`, `note`, `source_id`
- **`launch_sites`**: `id`, `name`, `country`, `country_code`, `operator`, `ownership`, `latitude`, `longitude`, `inclination_min`, `inclination_max`, `launch_azimuth`, `status`, `first_orbital_launch`, `orbital_pads`, `max_vehicle_class`, `polar_sso`, `access`, `max_launches_per_year`, `cap_basis`, `expansion`, `isar_access`, `note`, `gcat_codes`, `source_id`, `source_ids`, `confidence`
- **`launches`**: `launch_tag`, `launch_date`, `launch_year`, `vehicle`, `variant`, `mission`, `site_code`, `pad`, `platform`, `agency_code`, `agency`, `success`, `launch_code`, `orbit`, `category`, `inclination`, `payload_t`, `source_id`
- **`manifest`**: `id`, `customer`, `mission`, `planned`, `site`, `status`, `note`, `source_id`
- **`metrics`**: `id`, `name`, `unit`, `definition`
- **`satellites`**: `jcat`, `name`, `launch_year`, `launch_date`, `launch_tag`, `launch_vehicle`, `launcher_class`, `operator_code`, `operator`, `country`, `customer_group`, `customer_type`, `mission`, `orbit_class`, `inclination`, `mass_kg`, `mass_estimated`, `source_id`
- **`scenarios`**: `id`, `name`, `tagline`, `sort`, `fields`, `readiness_growth`, `ns_anchor_launches`, `contract_launches`, `contract_start_year`, `institutional_after_end`, `success_2027`, `success_2030`, `rationale`, `source_ids`, `confidence`
- **`site_nodes`**: `id`, `name`, `kind`, `location`, `country_code`, `launch_site_id`, `status_today`, `role_today`, `role_proposed`, `decision`, `pads_today`, `pads_proposed`, `pad_share`, `capacity_today`, `capacity_proposed`, `capacity_unit`, `capacity_basis`, `fixed_cost_eur`, `isar_capex_eur`, `funded_by`, `trigger`, `transport`, `source_ids`, `confidence`, `note`, `latitude`, `longitude`
- **`sources`**: `id`, `title`, `publisher`, `url`, `published`, `accessed`, `kind`, `reliability`, `note`, `short`
- **`vehicles`**: `id`, `name`, `operator`, `country_code`, `class`, `payload_leo_kg`, `payload_sso_kg`, `payload_gto_kg`, `payload_estimated`, `reusable`, `status`, `first_flight`, `price_usd`, `gcat_names`, `note`, `source_id`
- **`v_facts`**: `id`, `metric_id`, `metric`, `unit`, `year`, `scope`, `entity`, `value`, `is_preferred`, `confidence`, `note`, `source_id`, `source`, `publisher`, `url`, `reliability`
- **`v_launch_site_activity`**: `site_id`, `year`, `launches`, `failures`, `payload_t`, `satellites`, `to_leo`, `to_sso`, `to_geo`, `to_other`, `vehicles`, `agencies`
- **`v_launch_site_overview`**: `id`, `name`, `country`, `country_code`, `status`, `operator`, `ownership`, `access`, `latitude`, `longitude`, `inclination_min`, `inclination_max`, `polar_sso`, `max_vehicle_class`, `orbital_pads`, `max_launches_per_year`, `active_vehicles`, `planned_vehicles`, `providers`, `provider_countries`, `orbits`, `max_payload_leo_kg`, `max_payload_sso_kg`, `max_payload_gto_kg`, `launches_2024`, `launches_2025`, `launches_2026_ytd`, `payload_t_2025`, `satellites_2025`, `cap_used_2025`, `first_orbital_launch`, `expansion`, `isar_access`, `note`, `source_id`, `confidence`
- **`v_launches`**: `launch_tag`, `launch_date`, `launch_year`, `vehicle`, `variant`, `mission`, `site_code`, `pad`, `platform`, `agency_code`, `agency`, `success`, `launch_code`, `orbit`, `category`, `inclination`, `payload_t`, `source_id`, `site_id`, `site`, `site_country`, `vehicle_id`, `vehicle_name`, `vehicle_class`, `provider`, `provider_country`
- **`v_launches_by_country`**: `country_code`, `year`, `launches`, `successes`, `payload_t`, `providers`, `provider_names`
- **`v_launches_by_provider`**: `provider`, `provider_country`, `year`, `launches`, `successes`, `payload_t`, `vehicles`
- **`v_penetration_evidence`**: `segment`, `period`, `satellites`, `mass_t`, `dedicated_share_sats`, `dedicated_share_mass`, `not_falcon9_share_sats`, `not_falcon9_share_mass`
- **`v_q1_funnel`**: `step`, `tier`, `label`, `satellites`, `mass_kg`, `revenue_eur`, `revenue_eur_high`
- **`v_q2_expansion_fields`**: `id`, `name`, `category`, `recommendation`, `sites`, `year`, `market_eur`, `isar_revenue_eur`, `gross_profit_eur`, `fixed_cost_eur`, `capital_charge_eur`, `eva_proxy_eur`, `confidence`
- **`v_q2_launch_gap`**: `year`, `planned`, `planned_basis`, `market_t`, `loads`, `launches_filled`, `share_filled`, `launches_without_visible_demand`, `launches_filled_isar_share`, `share_filled_isar`
- **`v_q3_site_load`**: `year`, `site_id`, `pursue_launches`, `conditional_launches`, `anchor_launches`, `capacity_today`, `capacity_proposed`, `load_proposed`
- **`v_sam_launchers`**: `launch_vehicle`, `launcher_class`, `satellites`, `mass_kg`
- **`v_scenarios`**: `scenario_id`, `name`, `sort`, `year`, `launches_sold`, `launches_flown`, `success_rate`, `unit_cost_eur`, `launch_revenue_eur`, `readiness_revenue_eur`, `extras_revenue_eur`, `revenue_eur`, `gross_profit_eur`, `fixed_cost_eur`, `ebit_eur`, `cumulative_ebit_eur`
- **`v_vehicle_activity`**: `vehicle_id`, `name`, `operator`, `year`, `launches`, `successes`, `payload_t`
- **`v_win_share_evidence`**: `buyer`, `satellites`, `mass_kg`, `share_sats`, `share_mass`, `operators`, `launchers`
