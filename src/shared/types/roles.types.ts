export type Role = { 
    id: number;
    nombre: RoleNombre;
}

export type RoleNombre = 'admin' | 'psicologo' | 'usuario' | 'moderador' | 'invitado';