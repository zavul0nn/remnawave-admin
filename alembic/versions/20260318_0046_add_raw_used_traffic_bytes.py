"""Add raw_used_traffic_bytes to users for accumulated raw traffic tracking.

Revision ID: 0046
Revises: 0045
Create Date: 2026-03-18
"""
from alembic import op
import sqlalchemy as sa

revision = "0046"
down_revision = "0045"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("raw_used_traffic_bytes", sa.BigInteger(), server_default="0", nullable=False),
    )


def downgrade() -> None:
    op.drop_column("users", "raw_used_traffic_bytes")
