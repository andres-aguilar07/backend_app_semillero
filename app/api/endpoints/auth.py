from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core import security
from app.core.config import settings
from app.db.session import get_session
from app.models.user import User
from app.schemas.user import User as UserSchema
from app.schemas.user import UserCreate

router = APIRouter()

@router.post("/login", response_model=dict)
async def login_access_token(
    db: AsyncSession = Depends(get_session),
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Any:
    """
    OAuth2 compatible token login, obtiene un token de acceso para credenciales válidas.
    """
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario inactivo",
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=str(user.id), expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

@router.post("/register", response_model=UserSchema)
async def register_user(
    *,
    db: AsyncSession = Depends(get_session),
    user_in: UserCreate,
) -> Any:
    """
    Registra un nuevo usuario.
    """
    # Verificar que el email no exista
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalars().first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="Ya existe un usuario con este email.",
        )
    # Crear el usuario
    user_in_data = user_in.dict()
    user = User(
        email=user_in_data["email"],
        hashed_password=security.get_password_hash(user_in_data["password"]),
        full_name=user_in_data.get("full_name"),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user 