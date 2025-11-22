import Groq from 'groq-sdk';
import { EmbeddingService } from './embedding.service';
import { VectorDBService, SearchResult } from './vectordb.service';
import { AppError } from '../middleware/error.middleware';
import { ChatMessage } from '../../../shared/types';

export class RAGService {
  private groq: Groq;
  private embeddingService: EmbeddingService;
  private vectorDBService: VectorDBService;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new AppError('GROQ_API_KEY is not configured', 500);
    }
    this.groq = new Groq({ apiKey });
    this.embeddingService = new EmbeddingService();
    this.vectorDBService = new VectorDBService();
  }

  async retrieveContext(query: string, topK: number = 3): Promise<SearchResult[]> {
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);
    const results = await this.vectorDBService.searchSimilar(queryEmbedding, topK);
    return results;
  }

  async generateResponse(
    userMessage: string,
    context: SearchResult[],
    chatHistory: ChatMessage[] = []
  ): Promise<string> {
    try {
      const contextText = context
        .map((c, i) => `[Context ${i + 1}]\n${c.metadata.text}`)
        .join('\n\n');

      const systemPrompt = `You are an expert HR assistant helping with resume screening and candidate evaluation.

Use the following context from resumes to answer questions:

${contextText}

IMPORTANT INSTRUCTIONS:
- Provide responses in a natural, conversational manner
- Do NOT use markdown formatting like **bold**, *italic*, or ##headers
- Write in plain text with proper punctuation
- Use clear, professional language
- Structure information with line breaks and bullet points using simple dashes (-)
- If the context doesn't contain relevant information, say so clearly

Example good response:
"Yes, Sarah demonstrates strong coding knowledge and practical experience.

Evidence from her resume:

Area: Programming Languages
- Python, Java, C++, C, SQL, JavaScript (React, Vue, Node.js)
- Listed under Technical Skills

Experience:
- Software engineering internships
- Built a full-stack distributed app with RESTful APIs
- Developed real-time C++/Qt applications

Projects:
- AI/ML and data-pipeline work using PyTorch and HuggingFace
- B2B 3D Model Quoting System
- ThinkAhead AI Productivity Planner

She has strong foundations in multiple programming languages and practical project experience."`;

      // Build messages array with chat history
      const messages: any[] = [
        { role: 'system', content: systemPrompt }
      ];

      // Add recent chat history (last 5 messages)
      const recentHistory = chatHistory.slice(-5);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        });
      }

      // Add current user message
      messages.push({ role: 'user', content: userMessage });

      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 1024
      });

      return response.choices[0].message.content || 'No response generated';
    } catch (error: any) {
      console.error('RAG generation error:', error);
      throw new AppError('Failed to generate response', 500);
    }
  }
}
