"""Connection to the team's Supabase Postgres, read from the repo's .env (never printed, never committed)."""
import os
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent


def env(name: str) -> str:
    if name in os.environ:
        return os.environ[name]
    for line in (ROOT / ".env").read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            if key.strip() == name:
                return value.strip().strip('"').strip("'")
    raise SystemExit(f"{name} is missing in .env")


def connect():
    import psycopg

    return psycopg.connect(env("SUPABASE_DB_URL"), autocommit=False)
