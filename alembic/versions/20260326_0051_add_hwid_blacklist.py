"""Add hwid_blacklist table for banning specific hardware IDs.

Revision ID: 0051
Revises: 0050
Create Date: 2026-03-26
"""
from alembic import op

revision = "0051"
down_revision = "0050"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS hwid_blacklist (
            id SERIAL PRIMARY KEY,
            hwid VARCHAR(255) NOT NULL UNIQUE,
            action VARCHAR(20) NOT NULL DEFAULT 'alert',
            reason TEXT,
            added_by_admin_id INTEGER,
            added_by_username VARCHAR(255),
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_hwid_blacklist_hwid
        ON hwid_blacklist (hwid)
    """)


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS hwid_blacklist")
