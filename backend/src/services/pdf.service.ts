import pdfParse from 'pdf-parse';
import { AppError } from '../middleware/error.middleware';

export class PDFService {
  async extractText(buffer: Buffer, fileName: string): Promise<string> {
    try {
      if (fileName.endsWith('.txt')) {
        return buffer.toString('utf-8');
      }

      if (fileName.endsWith('.pdf')) {
        const data = await pdfParse(buffer);
        return data.text;
      }

      throw new AppError('Unsupported file format', 400);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to extract text from file', 500);
    }
  }

  parseResumeText(text: string): {
    name?: string;
    email?: string;
    phone?: string;
    skills: string[];
    summary?: string;
  } {
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    
    const email = text.match(emailRegex)?.[0];
    const phone = text.match(phoneRegex)?.[0];
    
    // Extract name (usually first line or after "Name:")
    const nameMatch = text.match(/^(.+?)(?:\n|Email|Phone)/i) || 
                     text.match(/Name[:\s]+(.+?)(?:\n|Email|Phone)/i);
    const name = nameMatch?.[1]?.trim();

    // Extract skills (common patterns)
    const skillsSection = text.match(/Skills?[:\s]+([\s\S]+?)(?:\n\n|Experience|Education|$)/i);
    const skills = skillsSection 
      ? skillsSection[1].split(/[,\n•]/).map(s => s.trim()).filter(s => s.length > 0)
      : [];

    return { name, email, phone, skills, summary: text.substring(0, 200) };
  }
}
