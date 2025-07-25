"""Make access_token non-unique

Revision ID: 05eb92871fc3
Revises: 35429427cf4b
Create Date: 2025-07-05 23:58:38.920922

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '05eb92871fc3'
down_revision = '35429427cf4b'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('admins', schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f('admins_access_token_key'), type_='unique')

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f('users_access_token_key'), type_='unique')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.create_unique_constraint(batch_op.f('users_access_token_key'), ['access_token'], postgresql_nulls_not_distinct=False)

    with op.batch_alter_table('admins', schema=None) as batch_op:
        batch_op.create_unique_constraint(batch_op.f('admins_access_token_key'), ['access_token'], postgresql_nulls_not_distinct=False)

    # ### end Alembic commands ###
