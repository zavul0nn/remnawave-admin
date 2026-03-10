"""Add topic_type to alert_rules for explicit Telegram topic routing.

Revision ID: 0045
Revises: 0044
Create Date: 2026-03-10
"""
from alembic import op
import sqlalchemy as sa

revision = "0045"
down_revision = "0044"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "alert_rules",
        sa.Column("topic_type", sa.String(50), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("alert_rules", "topic_type")
