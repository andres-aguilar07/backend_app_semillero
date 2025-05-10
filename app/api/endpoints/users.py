from typing import Any, List, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.security import get_password_hash, verify_password
from app.api.dependencies import get_current_user, get_current_active_superuser
from app.db.session import get_session
from app.models.user import User
from app.schemas.user import User as UserSchema
from app.schemas.user import UserCreate, UserUpdate

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
async def read_users(
    db: AsyncSession = Depends(get_session),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_superuser),
) -> Any:
    """
    Retorna una lista de usuarios.
    """
    result = await db.execute(select(User).offset(skip).limit(limit))
    users = result.scalars().all()
    return users

@router.post("/", response_model=UserSchema)
async def create_user(
    *,
    db: AsyncSession = Depends(get_session),
    user_in: UserCreate,
    current_user: User = Depends(get_current_active_superuser),
) -> Any:
    """
    Crea un nuevo usuario.
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
    obj_in_data = jsonable_encoder(user_in)
    del obj_in_data["password"]
    db_obj = User(**obj_in_data)
    db_obj.hashed_password = get_password_hash(user_in.password)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

@router.get("/me", response_model=UserSchema)
async def read_user_me(
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retorna el usuario actual.
    """
    return current_user

@router.put("/me", response_model=UserSchema)
async def update_user_me(
    *,
    db: AsyncSession = Depends(get_session),
    password: Optional[str] = Body(None),
    full_name: Optional[str] = Body(None),
    email: Optional[str] = Body(None),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Actualiza el usuario actual.
    """
    current_user_data = jsonable_encoder(current_user)
    user_in = UserUpdate(**current_user_data)
    if password is not None:
        user_in.password = password
    if full_name is not None:
        user_in.full_name = full_name
    if email is not None:
        user_in.email = email
    
    # Actualizar el usuario
    obj_in_data = jsonable_encoder(user_in, exclude_unset=True)
    for field in obj_in_data:
        if field == "password":
            setattr(current_user, "hashed_password", get_password_hash(obj_in_data[field]))
        else:
            setattr(current_user, field, obj_in_data[field])
    
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user 