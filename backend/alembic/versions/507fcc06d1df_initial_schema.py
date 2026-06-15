"""initial schema

Revision ID: 507fcc06d1df
Revises:
Create Date: 2026-06-14 23:27:55.552512

"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op


# revision identifiers, used by Alembic.
revision: str = '507fcc06d1df'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enums
    employment_type = sa.Enum(
        'fte', 'contract', 'contract_to_hire', 'part_time',
        name='employment_type'
    )
    job_status = sa.Enum(
        'discovered', 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn',
        name='job_status'
    )
    conflict_level = sa.Enum('green', 'yellow', 'red', name='conflict_level')
    suggestion_type = sa.Enum(
        'skill_gap', 'resume_keyword', 'interview_prep', 'career_advice',
        name='suggestion_type'
    )
    log_status = sa.Enum('success', 'error', name='log_status')
    interview_outcome = sa.Enum('passed', 'failed', 'pending', name='interview_outcome')

    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('resume_text', sa.Text(), nullable=True),
        sa.Column('resume_file_path', sa.Text(), nullable=True),
        sa.Column('preferences', postgresql.JSONB(), nullable=True),
        sa.Column('restrictions', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        'jobs',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('title', sa.Text(), nullable=True),
        sa.Column('company', sa.Text(), nullable=True),
        sa.Column('vendor', sa.Text(), nullable=True),
        sa.Column('client', sa.Text(), nullable=True),
        sa.Column('salary_min', sa.Integer(), nullable=True),
        sa.Column('salary_max', sa.Integer(), nullable=True),
        sa.Column('tech_stack', postgresql.JSONB(), nullable=True),
        sa.Column('location', sa.Text(), nullable=True),
        sa.Column('employment_type', employment_type, nullable=True),
        sa.Column('status', job_status, nullable=False, server_default='discovered'),
        sa.Column('fit_score', sa.Integer(), nullable=True),
        sa.Column('fit_explanation', sa.Text(), nullable=True),
        sa.Column('conflict_level', conflict_level, nullable=True),
        sa.Column('conflict_reasons', postgresql.JSONB(), nullable=True),
        sa.Column('source', sa.Text(), nullable=True),
        sa.Column('source_url', sa.Text(), nullable=True),
        sa.Column('dedup_hash', sa.Text(), nullable=True, index=True),
        sa.Column('recruiter_info', postgresql.JSONB(), nullable=True),
        sa.Column('raw_text', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        'suggestions',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('job_id', sa.Integer(), sa.ForeignKey('jobs.id', ondelete='SET NULL'), nullable=True),
        sa.Column('type', suggestion_type, nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        'agent_logs',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('job_id', sa.Integer(), sa.ForeignKey('jobs.id', ondelete='SET NULL'), nullable=True),
        sa.Column('node', sa.Text(), nullable=False),
        sa.Column('status', log_status, nullable=False),
        sa.Column('input_data', postgresql.JSONB(), nullable=True),
        sa.Column('output_data', postgresql.JSONB(), nullable=True),
        sa.Column('reasoning', sa.Text(), nullable=True),
        sa.Column('execution_time_ms', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        'applications',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('job_id', sa.Integer(), sa.ForeignKey('jobs.id', ondelete='CASCADE'), nullable=False),
        sa.Column('cover_letter', sa.Text(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('follow_up_date', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint('job_id', name='uq_applications_job_id'),
    )

    op.create_table(
        'interviews',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('job_id', sa.Integer(), sa.ForeignKey('jobs.id', ondelete='CASCADE'), nullable=False),
        sa.Column('interview_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('interview_type', sa.Text(), nullable=True),
        sa.Column('interviewer_name', sa.Text(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('scorecard', postgresql.JSONB(), nullable=True),
        sa.Column('outcome', interview_outcome, nullable=False, server_default='pending'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        'feedback',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('job_id', sa.Integer(), sa.ForeignKey('jobs.id', ondelete='CASCADE'), nullable=False),
        sa.Column('actual_outcome', sa.Text(), nullable=True),
        sa.Column('accuracy_rating', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint('job_id', name='uq_feedback_job_id'),
    )


def downgrade() -> None:
    op.drop_table('feedback')
    op.drop_table('interviews')
    op.drop_table('applications')
    op.drop_table('agent_logs')
    op.drop_table('suggestions')
    op.drop_table('jobs')
    op.drop_table('users')

    op.execute('DROP TYPE IF EXISTS interview_outcome')
    op.execute('DROP TYPE IF EXISTS log_status')
    op.execute('DROP TYPE IF EXISTS suggestion_type')
    op.execute('DROP TYPE IF EXISTS conflict_level')
    op.execute('DROP TYPE IF EXISTS job_status')
    op.execute('DROP TYPE IF EXISTS employment_type')
