import { db } from './index';
import * as schema from './schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';

// Proporciona métodos que emulan algunas operaciones comunes de Prisma
// para facilitar la migración
export const dbAdapter = {
  preguntas: {
    findMany: async () => {
      return await db.select().from(schema.preguntas);
    },
    findUnique: async (id: number) => {
      const results = await db
        .select()
        .from(schema.preguntas)
        .where(eq(schema.preguntas.id, id))
        .limit(1);
      return results.length > 0 ? results[0] : null;
    }
  },
  
  usuarios: {
    findUnique: async (where: { id?: number; correo?: string }) => {
      let results: any[] = [];
      
      if (where.id) {
        results = await db
          .select()
          .from(schema.usuarios)
          .where(eq(schema.usuarios.id, where.id))
          .limit(1);
      } else if (where.correo) {
        results = await db
          .select()
          .from(schema.usuarios)
          .where(eq(schema.usuarios.correo, where.correo))
          .limit(1);
      }
      
      return results.length > 0 ? results[0] : null;
    },
    
    create: async (data: any) => {
      const [result] = await db.insert(schema.usuarios)
        .values(data)
        .returning();
      return result;
    },
    
    update: async (where: { id: number }, data: any) => {
      const [result] = await db.update(schema.usuarios)
        .set(data)
        .where(eq(schema.usuarios.id, where.id))
        .returning();
      return result;
    }
  },
  
  psicologos: {
    findUnique: async (where: { id?: number; correo?: string }) => {
      let results: any[] = [];
      
      if (where.id) {
        results = await db
          .select()
          .from(schema.psicologos)
          .where(eq(schema.psicologos.id, where.id))
          .limit(1);
      } else if (where.correo) {
        results = await db
          .select()
          .from(schema.psicologos)
          .where(eq(schema.psicologos.correo, where.correo))
          .limit(1);
      }
      
      return results.length > 0 ? results[0] : null;
    },
    
    findMany: async (params?: { where?: any; orderBy?: any; take?: number; skip?: number }) => {
      // Construimos una consulta base
      const baseQuery = db.select().from(schema.psicologos);
      
      // Inicializamos un arreglo para condiciones
      const conditions: any[] = [];
      
      // Agregamos condiciones si es necesario
      if (params?.where?.activo !== undefined) {
        conditions.push(eq(schema.psicologos.activo, params.where.activo));
      }
      
      // Construimos la consulta completa de una sola vez para evitar reasignaciones
      let finalQuery = conditions.length > 0 
        ? baseQuery.where(and(...conditions))
        : baseQuery;
      
      // Agregamos ordenamiento si es necesario
      if (params?.orderBy?.nombres === 'asc') {
        finalQuery = finalQuery.orderBy(asc(schema.psicologos.nombres)) as any;
      } else if (params?.orderBy?.nombres === 'desc') {
        finalQuery = finalQuery.orderBy(desc(schema.psicologos.nombres)) as any;
      }
      
      // Agregamos límite si es necesario
      if (params?.take) {
        finalQuery = finalQuery.limit(params.take) as any;
      }
      
      // Agregamos desplazamiento si es necesario
      if (params?.skip) {
        finalQuery = finalQuery.offset(params.skip) as any;
      }
      
      // Ejecutamos la consulta
      return await finalQuery;
    }
  },
  
  evaluaciones: {
    create: async (data: any) => {
      const respuestas = data.respuestas;
      delete data.respuestas;
      
      const [evaluacion] = await db.insert(schema.evaluaciones)
        .values(data)
        .returning();
      
      if (respuestas && respuestas.length > 0) {
        await db.insert(schema.respuestas)
          .values(respuestas.map((r: any) => ({ 
            ...r, 
            evaluacion_id: evaluacion.id 
          })));
      }
      
      return evaluacion;
    },
    
    findMany: async (params: { where: { usuario_id: number }; include?: any; orderBy?: any }) => {
      const evaluaciones = await db.select()
        .from(schema.evaluaciones)
        .where(eq(schema.evaluaciones.usuario_id, params.where.usuario_id))
        .orderBy(desc(schema.evaluaciones.fecha));
      
      if (params.include?.respuestas) {
        // Para cada evaluación, obtener sus respuestas
        for (const evaluacion of evaluaciones) {
          const respuestas = await db.select()
            .from(schema.respuestas)
            .where(eq(schema.respuestas.evaluacion_id, evaluacion.id));
          
          // @ts-ignore - Add respuestas to evaluacion
          evaluacion.respuestas = respuestas;
        }
      }
      
      return evaluaciones;
    },
    
    findUnique: async (params: { where: { id: number }; include?: any }) => {
      const [evaluacion] = await db.select()
        .from(schema.evaluaciones)
        .where(eq(schema.evaluaciones.id, params.where.id))
        .limit(1);
      
      if (!evaluacion) return null;
      
      if (params.include?.respuestas) {
        const respuestas = await db.select()
          .from(schema.respuestas)
          .where(eq(schema.respuestas.evaluacion_id, evaluacion.id));
        
        // @ts-ignore - Add respuestas to evaluacion
        evaluacion.respuestas = respuestas;
      }
      
      return evaluacion;
    }
  },
  
  respuestas: {
    createMany: async (data: { data: any[] }) => {
      return await db.insert(schema.respuestas).values(data.data);
    }
  },
  
  chats: {
    findMany: async (params: { where: any; orderBy?: any; include?: any }) => {
      const { where } = params;
      
      // Inicializamos condiciones
      const conditions: any[] = [];
      
      if (where.usuario_id) {
        conditions.push(eq(schema.chats.usuario_id, where.usuario_id));
      }
      
      if (where.psicologo_id) {
        conditions.push(eq(schema.chats.psicologo_id, where.psicologo_id));
      }
      
      if (where.activo !== undefined) {
        conditions.push(eq(schema.chats.activo, where.activo));
      }
      
      // Construimos y ejecutamos la consulta de una sola vez
      const query = conditions.length > 0
        ? db.select().from(schema.chats).where(and(...conditions))
        : db.select().from(schema.chats);
        
      const chats = await query;
      
      if (params.include?.usuario || params.include?.psicologo) {
        for (const chat of chats) {
          if (params.include?.usuario) {
            // @ts-ignore - Add usuario to chat
            chat.usuario = await dbAdapter.usuarios.findUnique({ id: chat.usuario_id });
          }
          
          if (params.include?.psicologo) {
            // @ts-ignore - Add psicologo to chat
            chat.psicologo = await dbAdapter.psicologos.findUnique({ id: chat.psicologo_id });
          }
        }
      }
      
      return chats;
    },
    
    findUnique: async (params: { where: { id: number }; include?: any }) => {
      const [chat] = await db.select()
        .from(schema.chats)
        .where(eq(schema.chats.id, params.where.id))
        .limit(1);
      
      if (!chat) return null;
      
      if (params.include?.mensajes) {
        const mensajes = await db.select()
          .from(schema.mensajes_chat)
          .where(eq(schema.mensajes_chat.chat_id, chat.id))
          .orderBy(asc(schema.mensajes_chat.enviado_en));
        
        // @ts-ignore - Add mensajes to chat
        chat.mensajes = mensajes;
      }
      
      if (params.include?.usuario) {
        // @ts-ignore - Add usuario to chat
        chat.usuario = await dbAdapter.usuarios.findUnique({ id: chat.usuario_id });
      }
      
      if (params.include?.psicologo) {
        // @ts-ignore - Add psicologo to chat
        chat.psicologo = await dbAdapter.psicologos.findUnique({ id: chat.psicologo_id });
      }
      
      return chat;
    },
    
    create: async (data: any) => {
      const [chat] = await db.insert(schema.chats)
        .values(data)
        .returning();
      return chat;
    },
    
    update: async (params: { where: { id: number }; data: any }) => {
      const [updated] = await db.update(schema.chats)
        .set(params.data)
        .where(eq(schema.chats.id, params.where.id))
        .returning();
      return updated;
    }
  },
  
  mensajes_chat: {
    create: async (data: any) => {
      const [mensaje] = await db.insert(schema.mensajes_chat)
        .values(data)
        .returning();
      return mensaje;
    },
    
    findMany: async (params: { where: { chat_id: number }; orderBy?: any }) => {
      return await db.select()
        .from(schema.mensajes_chat)
        .where(eq(schema.mensajes_chat.chat_id, params.where.chat_id))
        .orderBy(asc(schema.mensajes_chat.enviado_en));
    }
  },
  
  contactos_psicologos: {
    create: async (data: any) => {
      const [contacto] = await db.insert(schema.contactos_psicologos)
        .values(data)
        .returning();
      return contacto;
    },
    
    findMany: async (params: { where: any; include?: any }) => {
      const { where } = params;
      
      // Inicializamos condiciones
      const conditions: any[] = [];
      
      if (where.usuario_id) {
        conditions.push(eq(schema.contactos_psicologos.usuario_id, where.usuario_id));
      }
      
      if (where.psicologo_id) {
        conditions.push(eq(schema.contactos_psicologos.psicologo_id, where.psicologo_id));
      }
      
      // Construimos y ejecutamos la consulta de una sola vez
      const query = conditions.length > 0
        ? db.select().from(schema.contactos_psicologos).where(and(...conditions))
        : db.select().from(schema.contactos_psicologos);
        
      const contactos = await query;
      
      if (params.include?.usuario || params.include?.psicologo) {
        for (const contacto of contactos) {
          if (params.include?.usuario) {
            // @ts-ignore - Add usuario to contacto
            contacto.usuario = await dbAdapter.usuarios.findUnique({ id: contacto.usuario_id });
          }
          
          if (params.include?.psicologo) {
            // @ts-ignore - Add psicologo to contacto
            contacto.psicologo = await dbAdapter.psicologos.findUnique({ id: contacto.psicologo_id });
          }
        }
      }
      
      return contactos;
    }
  }
}; 