from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.db.base import Base

# Crear un motor de base de datos asíncrono
engine = create_async_engine(settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"), echo=True)

# Crear una fábrica de sesiones asíncronas
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_session() -> AsyncSession:
    """
    Dependencia para obtener una sesión de base de datos
    """
    async with async_session() as session:
        yield session

async def create_tables():
    """
    Crea todas las tablas en la base de datos
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all) 