"""Supabase service-role client.

The service role bypasses RLS, so this client must NEVER be exposed to the
browser. It is used only by trusted server-side handlers (webhook, NUBAN
allocation).
"""
from __future__ import annotations

from functools import lru_cache

from supabase import Client, create_client

from .config import get_settings


@lru_cache
def get_supabase() -> Client:
    s = get_settings()
    return create_client(s.SUPABASE_URL, s.SUPABASE_SERVICE_ROLE_KEY)
