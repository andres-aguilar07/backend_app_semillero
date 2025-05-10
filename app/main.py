from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.api.endpoints import assessment, users, auth
from app.api.websockets import connection
from app.core.config import settings
from app.db.session import create_tables

app = FastAPI(
    title=settings.APP_NAME,
    description="API para evaluación de salud mental con sistema de semáforo",
    version="0.1.0",
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(assessment.router, prefix="/api/assessment", tags=["assessment"])

# Configurar WebSockets
app.include_router(connection.router)

@app.on_event("startup")
async def startup():
    await create_tables()

@app.get("/")
async def root():
    return {"message": "Bienvenido a la API de Semáforo de Salud Mental"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 