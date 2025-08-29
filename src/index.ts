import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';

import { setupWebSocket } from './websocket/socket';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import evaluacionRoutes from './routes/evaluacion.routes';
import chatRoutes from './routes/chat.routes';
import psicologoRoutes from './routes/psicologo.routes';
import { runMigrations } from './db/migrate';
import { seed } from './db/seed';
import { initializeOllama } from './services/ollama.service';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/evaluaciones', evaluacionRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/psicologos', psicologoRoutes);

// Health check endpoint
app.get('/health', (_: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Setup WebSocket
setupWebSocket(io);

// Initialize database and start server
const PORT = process.env.PORT || 3000;

// Run migrations and seed data before starting the server
async function initializeAndStartServer() {
  try {
    console.log('Initializing database...');
    
    // Run migrations to create tables if they don't exist
    await runMigrations();
    
    // Seed basic data if needed
    await seed();
    
    // Initialize Ollama if enabled
    const useOllama = process.env.USE_OLLAMA === 'true';
    if (useOllama) {
      console.log('Initializing Ollama...');
      try {
        await initializeOllama();
        console.log('Ollama initialized successfully');
      } catch (ollamaError) {
        console.warn('Warning: Could not initialize Ollama:', ollamaError);
        console.log('Server will continue without Ollama support');
      }
    } else {
      console.log('Ollama disabled, using OpenAI service');
    }
    
    // Start the server
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/health`);
      if (useOllama) {
        console.log(`AI Chat available at http://localhost:${PORT}/api/chats/ia`);
      }
    });
  } catch (error) {
    console.error('Failed to initialize the server:', error);
    process.exit(1);
  }
}

initializeAndStartServer();

export default server; 