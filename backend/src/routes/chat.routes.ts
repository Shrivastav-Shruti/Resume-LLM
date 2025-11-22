import { Router, Request, Response, NextFunction } from 'express';
import { RAGService } from '../services/rag.service';
import { AppError } from '../middleware/error.middleware';
import { ChatMessage } from '../../../shared/types';

const router = Router();
const ragService = new RAGService();

// Enhanced chat session interface
interface ChatSession {
  id: string;
  title: string; // Auto-generated from first message
  messages: ChatMessage[];
  resumeId?: string;
  createdAt: Date;
  lastActivity: Date;
}

const chatSessions = new Map<string, ChatSession>();

// Clean up old sessions (older than 7 days)
setInterval(() => {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  
  for (const [sessionId, session] of chatSessions.entries()) {
    if (session.lastActivity.getTime() < sevenDaysAgo) {
      chatSessions.delete(sessionId);
    }
  }
}, 60 * 60 * 1000); // Run every hour

// Generate title from first message
function generateTitle(message: string): string {
  const words = message.split(' ').slice(0, 6).join(' ');
  return words.length > 50 ? words.substring(0, 50) + '...' : words;
}

// Send message
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, sessionId, resumeId } = req.body;

    if (!message) {
      throw new AppError('Message is required', 400);
    }

    if (!sessionId) {
      throw new AppError('Session ID is required', 400);
    }

    // Get or create chat session
    let session = chatSessions.get(sessionId);
    if (!session) {
      session = {
        id: sessionId,
        title: generateTitle(message),
        messages: [],
        resumeId,
        createdAt: new Date(),
        lastActivity: new Date()
      };
      chatSessions.set(sessionId, session);
    }

    // Update last activity
    session.lastActivity = new Date();

    // Retrieve relevant context from vector DB
    const context = await ragService.retrieveContext(message, 3);

    // Generate response with full chat history
    const response = await ragService.generateResponse(
      message,
      context,
      session.messages
    );

    // Create message objects
    const userMsg: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    const assistantMsg: ChatMessage = {
      role: 'assistant',
      content: response,
      timestamp: new Date()
    };

    // Update session with new messages
    session.messages.push(userMsg, assistantMsg);

    // Keep only last 50 messages to prevent memory issues
    if (session.messages.length > 50) {
      session.messages = session.messages.slice(-50);
    }

    res.json({
      success: true,
      response,
      context: context.map(c => ({
        id: c.id,
        score: c.score,
        snippet: c.metadata.text?.substring(0, 200)
      })),
      sessionInfo: {
        id: session.id,
        title: session.title,
        messageCount: session.messages.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get chat history for a session
router.get('/history/:sessionId', (req: Request, res: Response) => {
  const session = chatSessions.get(req.params.sessionId);
  
  if (!session) {
    return res.json({ 
      success: true, 
      history: [],
      message: 'No session found'
    });
  }

  res.json({ 
    success: true, 
    history: session.messages,
    sessionInfo: {
      id: session.id,
      title: session.title,
      messageCount: session.messages.length,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity
    }
  });
});

// Get all sessions (for sidebar)
router.get('/sessions', (req: Request, res: Response) => {
  const sessions = Array.from(chatSessions.values())
    .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
    .map(s => ({
      id: s.id,
      title: s.title,
      messageCount: s.messages.length,
      createdAt: s.createdAt,
      lastActivity: s.lastActivity,
      resumeId: s.resumeId,
      preview: s.messages[0]?.content.substring(0, 100) || ''
    }));

  res.json({
    success: true,
    sessions,
    totalSessions: sessions.length
  });
});

// Delete a session
router.delete('/session/:sessionId', (req: Request, res: Response) => {
  const deleted = chatSessions.delete(req.params.sessionId);
  
  res.json({
    success: true,
    message: deleted ? 'Session deleted' : 'Session not found'
  });
});

// Update session title
router.patch('/session/:sessionId/title', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title } = req.body;
    const session = chatSessions.get(req.params.sessionId);
    
    if (!session) {
      throw new AppError('Session not found', 404);
    }
    
    session.title = title;
    
    res.json({
      success: true,
      message: 'Title updated',
      session: {
        id: session.id,
        title: session.title
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
