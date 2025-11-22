import { pipeline, env } from '@xenova/transformers';
import { AppError } from '../middleware/error.middleware';

// Disable local model cache in production, use cache in development
env.cacheDir = './.cache';

export class EmbeddingService {
  private embedder: any = null;
  private modelName = 'Xenova/all-MiniLM-L6-v2'; // 384 dimensions, fast and efficient

  async initialize() {
    if (!this.embedder) {
      console.log('Loading embedding model...');
      this.embedder = await pipeline('feature-extraction', this.modelName);
      console.log('Embedding model loaded successfully');
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      await this.initialize();

      // Truncate text to avoid memory issues
      const truncatedText = text.substring(0, 512);

      // Generate embedding
      const output = await this.embedder(truncatedText, {
        pooling: 'mean',
        normalize: true
      });

      // Convert to regular array
      const embedding = Array.from(output.data);

      // Pad or truncate to 1024 dimensions to match Pinecone index
      return this.padOrTruncate(embedding, 1024);
    } catch (error: any) {
      console.error('Embedding generation error:', error);
      throw new AppError('Failed to generate embedding', 500);
    }
  }

  async generateMultipleEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      await this.initialize();

      const embeddings: number[][] = [];
      
      for (const text of texts) {
        const embedding = await this.generateEmbedding(text);
        embeddings.push(embedding);
      }

      return embeddings;
    } catch (error: any) {
      console.error('Batch embedding generation error:', error);
      throw new AppError('Failed to generate embeddings', 500);
    }
  }

  // Helper function to pad or truncate embeddings to match Pinecone dimensions
  private padOrTruncate(embedding: number[], targetDim: number): number[] {
    if (embedding.length === targetDim) {
      return embedding;
    }

    if (embedding.length > targetDim) {
      // Truncate
      return embedding.slice(0, targetDim);
    }

    // Pad with zeros
    const padded = [...embedding];
    while (padded.length < targetDim) {
      padded.push(0);
    }
    return padded;
  }
}
