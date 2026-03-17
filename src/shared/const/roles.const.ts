// Types
import { Role } from "../types/roles.types";

export const ROLES: Record<string, Role> = {
    ADMIN: {
        id: 1,
        nombre: 'admin',
    },
    PSICOLOGO: {
        id: 2,
        nombre: 'psicologo',
    },
    USUARIO: {
        id: 3,
        nombre: 'usuario',
    },
    MODERADOR: {
        id: 4,
        nombre: 'moderador',
    },
    INVITADO: {
        id: 5,
        nombre: 'invitado',
    }
}