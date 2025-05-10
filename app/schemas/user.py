from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

# Esquemas base
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    is_superuser: bool = False
    full_name: Optional[str] = None

# Propiedades para crear un usuario
class UserCreate(UserBase):
    email: EmailStr
    password: str = Field(..., min_length=8)

# Propiedades para actualizar un usuario
class UserUpdate(UserBase):
    password: Optional[str] = Field(None, min_length=8)

# Propiedades compartidas en las respuestas
class UserInDBBase(UserBase):
    id: Optional[int] = None

    class Config:
        from_attributes = True

# Propiedades para retornar al cliente
class User(UserInDBBase):
    pass

# Propiedades adicionales almacenadas en la base de datos
class UserInDB(UserInDBBase):
    hashed_password: str 