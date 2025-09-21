import { Server, Socket } from 'socket.io';
import { db } from '../db';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';

interface UserData {
  userId: number;
}

interface ChatMessage {
  chatId: number;
  userId: number;
  mensaje: string;
}

export const setupWebSocket = (io: Server): void => {
  // Keep track of online users
  const onlineUsers = new Map<number, Socket>();

  io.on('connection', (socket: Socket) => {
    console.log(`New client connected: ${socket.id}`);
    
    // Handle user authentication
    socket.on('authenticate', async (data: UserData) => {
      try {
        const { userId } = data;
        onlineUsers.set(userId, socket);
        console.log(`User ${userId} is now online`);

        // Notify the client of successful authentication
        socket.emit('authenticated', { success: true, userId });
        
        // Associate the socket with rooms for each chat the user is part of
        const chats = await getChatsForUser(userId);
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
        const { chatId, userId, mensaje } = messageData;

        const [newMessage] = await db.insert(schema.mensajes_chat)
          .values({ chat_id: chatId, usuario_id: userId, mensaje })
          .returning();
        
        // Broadcast message to all users in the chat
        io.to(`chat:${chatId}`).emit('new_message', {
          id: newMessage.id,
          chatId,
          userId,
          mensaje,
          enviado_en: newMessage.enviado_en
        });
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
      // Remove user from online map
      for (const [userId, userSocket] of onlineUsers.entries()) {
        if (userSocket.id === socket.id) {
          onlineUsers.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });
  });
};

// Helper function to get all chats for a specific user or psychologist
async function getChatsForUser(userId: number): Promise<number[]> {
  try {
    const chats = await db
      .select({ id: schema.chats.id })
      .from(schema.chats)
      .where(eq(schema.chats.estudiante_id, userId));

    return chats.map(c => c.id);
  } catch (error) {
    console.error('Error getting chats:', error);
    return [];
  }
} 