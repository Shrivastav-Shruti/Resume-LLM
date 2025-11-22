import { Pinecone } from '@pinecone-database/pinecone';
import { AppError } from '../middleware/error.middleware';

export interface VectorRecord {
  id: string;
  values: number[];
  metadata: {
    text: string;
    type: 'resume' | 'job_description';
    fileName?: string;
    [key: string]: any;
  };
}

export interface SearchResult {
  id: string;
  score: number;
  metadata: any;
}

export class VectorDBService {
  private pinecone: Pinecone;
  private indexName: string;

  constructor() {
    const apiKey = process.env.PINECONE_API_KEY;
    
    if (!apiKey) {
      throw new AppError('PINECONE_API_KEY is not configured', 500);
    }

    // Pinecone v6+ only needs apiKey (no environment parameter)
    this.pinecone = new Pinecone({ 
      apiKey
    });
    this.indexName = process.env.PINECONE_INDEX || 'resume-screening';
  }

  async upsertVector(record: VectorRecord): Promise<void> {
    try {
      const index = this.pinecone.index(this.indexName);
      await index.upsert([record]);
    } catch (error: any) {
      console.error('Vector upsert error:', error);
      throw new AppError('Failed to store vector', 500);
    }
  }

  async searchSimilar(
    queryVector: number[],
    topK: number = 5,
    filter?: Record<string, any>
  ): Promise<SearchResult[]> {
    try {
      const index = this.pinecone.index(this.indexName);
      const results = await index.query({
        vector: queryVector,
        topK,
        includeMetadata: true,
        filter
      });

      return results.matches?.map(match => ({
        id: match.id,
        score: match.score || 0,
        metadata: match.metadata
      })) || [];
    } catch (error: any) {
      console.error('Vector search error:', error);
      throw new AppError('Failed to search vectors', 500);
    }
  }

  async deleteVector(id: string): Promise<void> {
    try {
      const index = this.pinecone.index(this.indexName);
      await index.deleteOne(id);
    } catch (error: any) {
      console.error('Vector deletion error:', error);
      throw new AppError('Failed to delete vector', 500);
    }
  }

  async deleteAllVectors(): Promise<void> {
    try {
      const index = this.pinecone.index(this.indexName);
      await index.deleteAll();
      console.log('All vectors deleted from Pinecone');
    } catch (error: any) {
      console.error('Delete all vectors error:', error);
      throw new AppError('Failed to delete all vectors', 500);
    }
  }

  async deleteVectorsByType(type: 'resume' | 'job_description'): Promise<void> {
    try {
      const index = this.pinecone.index(this.indexName);
      await index.deleteMany({ type });
      console.log(`All ${type} vectors deleted from Pinecone`);
    } catch (error: any) {
      console.error(`Delete ${type} vectors error:`, error);
      throw new AppError(`Failed to delete ${type} vectors`, 500);
    }
  }
}
