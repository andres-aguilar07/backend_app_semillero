from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import AsyncSession

Base = declarative_base()

# Importar todos los modelos para que Alembic los reconozca
from app.models.user import User
from app.models.assessment import Assessment, AssessmentQuestion, AssessmentAnswer 