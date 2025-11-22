import Groq from 'groq-sdk';
import { AppError } from '../middleware/error.middleware';
import { MatchScore } from '../../../shared/types';

export class MatchingService {
  private groq: Groq;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new AppError('GROQ_API_KEY is not configured', 500);
    }
    this.groq = new Groq({ apiKey });
  }

  async calculateMatchScore(
    resumeText: string,
    jobDescriptionText: string,
    resumeId: string,
    jobDescriptionId: string
  ): Promise<MatchScore> {
    try {
      const prompt = `You are an expert recruiter. Analyze the match between this resume and job description.

Even if the information is incomplete, provide your best analysis based on what is available.

JOB DESCRIPTION:
${jobDescriptionText.substring(0, 2000)}

RESUME:
${resumeText.substring(0, 2000)}

You MUST respond with valid JSON in this exact format:
{
  "score": 75,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "gaps": ["gap 1", "gap 2", "gap 3"],
  "insights": ["insight 1", "insight 2", "insight 3"]
}

Provide a score from 0-100 and at least 3 items for each array. Be specific and reference actual skills, experience, and requirements when available.`;

      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful assistant that always responds with valid JSON. Never refuse to provide an analysis.' 
          },
          { 
            role: 'user', 
            content: prompt 
          }
        ],
        temperature: 0.5,
        max_tokens: 1024
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new AppError('No response from LLM', 500);
      }

      // Extract JSON from response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      
      const analysis = JSON.parse(jsonStr);

      return {
        score: Math.min(100, Math.max(0, analysis.score || 50)),
        strengths: Array.isArray(analysis.strengths) ? analysis.strengths : ['Analysis in progress'],
        gaps: Array.isArray(analysis.gaps) ? analysis.gaps : ['More information needed'],
        insights: Array.isArray(analysis.insights) ? analysis.insights : ['Review candidate profile'],
        resumeId,
        jobDescriptionId
      };
    } catch (error: any) {
      console.error('Match scoring error:', error);
      
      // Fallback response if everything fails
      return {
        score: 50,
        strengths: ['Unable to analyze - please try again'],
        gaps: ['Analysis failed - check data format'],
        insights: ['System error - contact support'],
        resumeId,
        jobDescriptionId
      };
    }
  }
}
