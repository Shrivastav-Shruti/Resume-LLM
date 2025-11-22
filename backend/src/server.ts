import dotenv from 'dotenv';
// Load environment variables FIRST before any other imports
dotenv.config();

import express from 'express';
import cors from 'cors';
import uploadRoutes from './routes/upload.routes';
import matchRoutes from './routes/match.routes';
import chatRoutes from './routes/chat.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Resume Screening API is running' });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
