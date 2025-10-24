# Import all the models, so that Base has them before being imported by Alembic
from app.models import api_key, crm, user  # noqa: F401
