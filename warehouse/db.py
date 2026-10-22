"""Connection to the team's Supabase Postgres, read from the repo's .env (never printed, never committed)."""
import os
import pathlib
import urllib.parse

ROOT = pathlib.Path(__file__).resolve().parent.parent

# Supabase's direct host (db.<ref>.supabase.co) is IPv6 only. On networks without IPv6 the session pooler
# (IPv4, same password, user postgres.<ref>) takes over. Region of our project: eu-west-1.
DEFAULT_POOLER_HOST = "aws-0-eu-west-1.pooler.supabase.com"


def env(name: str, default: str | None = None) -> str:
    if name in os.environ:
        return os.environ[name]
    for line in (ROOT / ".env").read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            if key.strip() == name:
                return value.strip().strip('"').strip("'")
    if default is not None:
        return default
    raise SystemExit(f"{name} is missing in .env")


def pooler_url(direct_url: str) -> str:
    """The session-pooler form of a direct Supabase URL: user postgres.<ref> on the regional pooler host."""
    u = urllib.parse.urlparse(direct_url)
    ref = u.hostname.split(".")[1]
    host = env("SUPABASE_POOLER_HOST", DEFAULT_POOLER_HOST)
    password = urllib.parse.quote(u.password or "", safe="")
    return urllib.parse.urlunparse(u._replace(netloc=f"postgres.{ref}:{password}@{host}:5432"))


def connect():
    import psycopg

    url = env("SUPABASE_DB_URL")
    try:
        return psycopg.connect(url, autocommit=False, connect_timeout=8)
    except psycopg.OperationalError:
        print("direct connection failed (no IPv6?), using the Supabase session pooler")
        return psycopg.connect(pooler_url(url), autocommit=False, connect_timeout=15)
