from typing import Dict, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from jose import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import json

from app.core import security
from app.core.config import settings
from app.db.session import get_session
from app.models.user import User

router = APIRouter()

# Gestor de conexiones activas
class ConnectionManager:
    def __init__(self):
        # Pacientes: user_id -> WebSocket
        self.active_patients: Dict[int, WebSocket] = {}
        # Psicólogos: user_id -> WebSocket
        self.active_psychologists: Dict[int, WebSocket] = {}
        # Conexiones activas entre pacientes y psicólogos: (patient_id, psychologist_id) -> bool
        self.active_connections: Dict[tuple, bool] = {}
    
    async def connect_patient(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_patients[user_id] = websocket
        # Notificar psicólogos disponibles
        await self.notify_patient_available(user_id)
    
    async def connect_psychologist(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_psychologists[user_id] = websocket
    
    def disconnect_patient(self, user_id: int):
        if user_id in self.active_patients:
            del self.active_patients[user_id]
            # Limpiar conexiones activas
            connections_to_remove = []
            for (patient_id, psychologist_id) in self.active_connections.keys():
                if patient_id == user_id:
                    connections_to_remove.append((patient_id, psychologist_id))
            
            for conn in connections_to_remove:
                del self.active_connections[conn]
    
    def disconnect_psychologist(self, user_id: int):
        if user_id in self.active_psychologists:
            del self.active_psychologists[user_id]
            # Limpiar conexiones activas
            connections_to_remove = []
            for (patient_id, psychologist_id) in self.active_connections.keys():
                if psychologist_id == user_id:
                    connections_to_remove.append((patient_id, psychologist_id))
            
            for conn in connections_to_remove:
                del self.active_connections[conn]
    
    async def notify_patient_available(self, patient_id: int):
        """Notifica a los psicólogos que hay un paciente disponible"""
        for psychologist_id, websocket in self.active_psychologists.items():
            await websocket.send_json({
                "type": "new_patient",
                "patient_id": patient_id
            })
    
    async def connect_session(self, patient_id: int, psychologist_id: int):
        """Establece una conexión entre paciente y psicólogo"""
        if patient_id in self.active_patients and psychologist_id in self.active_psychologists:
            self.active_connections[(patient_id, psychologist_id)] = True
            
            # Notificar al paciente
            await self.active_patients[patient_id].send_json({
                "type": "session_started",
                "psychologist_id": psychologist_id
            })
            
            # Notificar al psicólogo
            await self.active_psychologists[psychologist_id].send_json({
                "type": "session_started",
                "patient_id": patient_id
            })
            
            return True
        return False
    
    async def send_message(self, sender_id: int, receiver_id: int, message: str, is_psychologist: bool):
        """Envía un mensaje entre paciente y psicólogo"""
        if is_psychologist:
            if receiver_id in self.active_patients and (receiver_id, sender_id) in self.active_connections:
                await self.active_patients[receiver_id].send_json({
                    "type": "message",
                    "sender_id": sender_id,
                    "content": message,
                    "is_psychologist": True
                })
                return True
        else:  # Paciente
            if receiver_id in self.active_psychologists and (sender_id, receiver_id) in self.active_connections:
                await self.active_psychologists[receiver_id].send_json({
                    "type": "message",
                    "sender_id": sender_id,
                    "content": message,
                    "is_psychologist": False
                })
                return True
        return False

# Instancia del gestor de conexiones
manager = ConnectionManager()

async def get_user_from_token(token: str, db: AsyncSession) -> User:
    """Obtiene el usuario a partir del token JWT"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[security.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        if user is None:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        
        return user
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="No se pudo validar credenciales")

@router.websocket("/ws/patient")
async def websocket_patient(websocket: WebSocket, token: str, db: AsyncSession = Depends(get_session)):
    """Endpoint WebSocket para pacientes que buscan conexión con psicólogos"""
    try:
        user = await get_user_from_token(token, db)
        
        await manager.connect_patient(websocket, user.id)
        
        try:
            while True:
                data = await websocket.receive_text()
                try:
                    message_data = json.loads(data)
                    
                    # Procesar diferentes tipos de mensajes
                    if message_data.get("type") == "message":
                        psychologist_id = message_data.get("receiver_id")
                        content = message_data.get("content")
                        
                        if psychologist_id and content:
                            success = await manager.send_message(
                                user.id, psychologist_id, content, is_psychologist=False
                            )
                            if not success:
                                await websocket.send_json({
                                    "type": "error",
                                    "message": "No se pudo enviar el mensaje"
                                })
                except json.JSONDecodeError:
                    await websocket.send_json({
                        "type": "error",
                        "message": "Formato de mensaje inválido"
                    })
        except WebSocketDisconnect:
            manager.disconnect_patient(user.id)
    except HTTPException:
        await websocket.close(code=1008)  # Policy violation

@router.websocket("/ws/psychologist")
async def websocket_psychologist(websocket: WebSocket, token: str, db: AsyncSession = Depends(get_session)):
    """Endpoint WebSocket para psicólogos que ofrecen ayuda"""
    try:
        user = await get_user_from_token(token, db)
        
        # Verificar que el usuario sea un psicólogo (esto requeriría un campo adicional en el modelo de usuario)
        if not user.is_superuser:  # Simplificado para este ejemplo
            await websocket.close(code=1008)
            return
        
        await manager.connect_psychologist(websocket, user.id)
        
        try:
            while True:
                data = await websocket.receive_text()
                try:
                    message_data = json.loads(data)
                    
                    # Procesar diferentes tipos de mensajes
                    if message_data.get("type") == "connect_patient":
                        patient_id = message_data.get("patient_id")
                        if patient_id:
                            success = await manager.connect_session(patient_id, user.id)
                            if not success:
                                await websocket.send_json({
                                    "type": "error",
                                    "message": "No se pudo conectar con el paciente"
                                })
                    
                    elif message_data.get("type") == "message":
                        patient_id = message_data.get("receiver_id")
                        content = message_data.get("content")
                        
                        if patient_id and content:
                            success = await manager.send_message(
                                user.id, patient_id, content, is_psychologist=True
                            )
                            if not success:
                                await websocket.send_json({
                                    "type": "error",
                                    "message": "No se pudo enviar el mensaje"
                                })
                except json.JSONDecodeError:
                    await websocket.send_json({
                        "type": "error",
                        "message": "Formato de mensaje inválido"
                    })
        except WebSocketDisconnect:
            manager.disconnect_psychologist(user.id)
    except HTTPException:
        await websocket.close(code=1008)  # Policy violation 