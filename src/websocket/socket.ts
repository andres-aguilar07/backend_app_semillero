import { Server, Socket } from 'socket.io';
import { dbAdapter } from '../db/drizzle-adapter';

interface UserData {
  userId: number;
  role: 'usuario' | 'psicologo';
}

interface ChatMessage {
  chatId: number;
  emisorId: number;
  emisorTipo: 'usuario' | 'psicologo';
  mensaje: string;
}

export const setupWebSocket = (io: Server): void => {
  // Keep track of online users and psychologists
  const onlineUsers = new Map<number, Socket>();
  const onlinePsicologos = new Map<number, Socket>();

  io.on('connection', (socket: Socket) => {
    console.log(`New client connected: ${socket.id}`);
    
    // Handle user authentication
    socket.on('authenticate', async (data: UserData) => {
      try {
        const { userId, role } = data;
        
        // Store the user's connection based on role
        if (role === 'usuario') {
          onlineUsers.set(userId, socket);
          console.log(`User ${userId} is now online`);
        } else if (role === 'psicologo') {
          onlinePsicologos.set(userId, socket);
          console.log(`Psychologist ${userId} is now online`);
        }

        // Notify the client of successful authentication
        socket.emit('authenticated', { success: true, userId, role });
        
        // Associate the socket with rooms for each chat the user is part of
        const chats = await getChatsForUser(userId, role);
        chats.forEach(chatId => {
          socket.join(`chat:${chatId}`);
        });
      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('authenticated', { success: false, error: 'Authentication failed' });
      }
    });

    // Handle new messages
    socket.on('chat_message', async (messageData: ChatMessage) => {
      try {
        const { chatId, emisorId, emisorTipo, mensaje } = messageData;
        
        // Save message to database
        const newMessage = await dbAdapter.mensajes_chat.create({
          chat_id: chatId,
          emisor_id: emisorId,
          emisor_tipo: emisorTipo,
          mensaje
        });
        
        // Get the chat to access the user ID
        const chat = await dbAdapter.chats.findUnique({
          where: { id: chatId }
        });
        
        if (!chat) {
          throw new Error('Chat not found');
        }
        
        // Broadcast message to all users in the chat
        io.to(`chat:${chatId}`).emit('new_message', {
          id: newMessage.id,
          chatId,
          emisorId,
          emisorTipo,
          mensaje,
          enviado_en: newMessage.enviado_en
        });
        
        // If a user is in "rojo" state and this is from a psychologist, send special notification
        if (emisorTipo === 'psicologo') {
          const userId = chat.usuario_id;
          const userSocket = onlineUsers.get(userId);
          
          if (userSocket) {
            userSocket.emit('psico_response', {
              chatId,
              mensaje
            });
          }
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle user joining a specific chat
    socket.on('join_chat', (chatId: number) => {
      socket.join(`chat:${chatId}`);
      socket.emit('joined_chat', { chatId });
    });
    
    // Handle user is typing notification
    socket.on('typing', (data: { chatId: number, userId: number, isTyping: boolean }) => {
      socket.to(`chat:${data.chatId}`).emit('user_typing', {
        chatId: data.chatId,
        userId: data.userId,
        isTyping: data.isTyping
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      // Remove user from online maps
      for (const [userId, userSocket] of onlineUsers.entries()) {
        if (userSocket.id === socket.id) {
          onlineUsers.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
      
      for (const [psicologoId, psicologoSocket] of onlinePsicologos.entries()) {
        if (psicologoSocket.id === socket.id) {
          onlinePsicologos.delete(psicologoId);
          console.log(`Psychologist ${psicologoId} disconnected`);
          break;
        }
      }
    });
  });
};

// Helper function to get all chats for a specific user or psychologist
async function getChatsForUser(userId: number, role: 'usuario' | 'psicologo'): Promise<number[]> {
  try {
    const chats = await dbAdapter.chats.findMany({
      where: {
        [role === 'usuario' ? 'usuario_id' : 'psicologo_id']: userId,
        activo: true
      }
    });
    
    return chats.map(chat => chat.id);
  } catch (error) {
    console.error('Error getting chats:', error);
    return [];
  }
} 