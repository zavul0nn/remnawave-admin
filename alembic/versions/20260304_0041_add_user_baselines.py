"""Add user_baselines table for materialized violation baselines.

Revision ID: 0041
Revises: 0040
Create Date: 2026-03-04

Stores precomputed user behavior baselines to avoid recalculating
30-day connection history on every violation check. Baselines are
refreshed periodically by a background task.
"""
from typing import Sequence, Union

from alembic import op

revision: str = '0041'
down_revision: Union[str, None] = '0040'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS user_baselines (
            user_uuid UUID PRIMARY KEY REFERENCES users(uuid) ON DELETE CASCADE,
            typical_countries TEXT[],
            typical_cities TEXT[],
            typical_regions TEXT[],
            typical_asns TEXT[],
            known_ips TEXT[],
            avg_daily_unique_ips FLOAT DEFAULT 0,
            max_daily_unique_ips INTEGER DEFAULT 0,
            typical_hours INTEGER[],
            avg_session_duration_min FLOAT DEFAULT 0,
            data_points INTEGER DEFAULT 0,
            computed_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)

    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_user_baselines_computed
        ON user_baselines(computed_at)
    """)


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS user_baselines")
