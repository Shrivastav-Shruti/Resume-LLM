import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { upload } from '../middleware/upload.middleware';
import { PDFService } from '../services/pdf.service';
import { EmbeddingService } from '../services/embedding.service';
import { VectorDBService } from '../services/vectordb.service';
import { AppError } from '../middleware/error.middleware';

const router = Router();
const pdfService = new PDFService();
const embeddingService = new EmbeddingService();
const vectorDBService = new VectorDBService();

// In-memory storage (replace with database in production)
const resumeStore = new Map<string, any>();
const jobDescriptionStore = new Map<string, any>();

router.post('/resume', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const id = uuidv4();
    const text = await pdfService.extractText(req.file.buffer, req.file.originalname);
    const parsed = pdfService.parseResumeText(text);
    const embedding = await embeddingService.generateEmbedding(text);

    // Store in vector DB
    await vectorDBService.upsertVector({
      id,
      values: embedding,
      metadata: {
        text,
        type: 'resume',
        fileName: req.file.originalname,
        ...parsed
      }
    });

    // Store in memory
    const resume = {
      id,
      text,
      fileName: req.file.originalname,
      uploadedAt: new Date(),
      parsed
    };
    resumeStore.set(id, resume);

    res.json({
      success: true,
      id,
      message: 'Resume uploaded successfully',
      parsed,
      text // Include full text for match scoring
    });
  } catch (error) {
    next(error);
  }
});

router.post('/job-description', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const id = uuidv4();
    const text = await pdfService.extractText(req.file.buffer, req.file.originalname);
    const embedding = await embeddingService.generateEmbedding(text);

    // Store in vector DB
    await vectorDBService.upsertVector({
      id,
      values: embedding,
      metadata: {
        text,
        type: 'job_description',
        fileName: req.file.originalname
      }
    });

    // Store in memory
    const jobDescription = {
      id,
      text,
      fileName: req.file.originalname,
      uploadedAt: new Date()
    };
    jobDescriptionStore.set(id, jobDescription);

    res.json({
      success: true,
      id,
      message: 'Job description uploaded successfully',
      text // Include full text for match scoring
    });
  } catch (error) {
    next(error);
  }
});

router.get('/resume/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const resume = resumeStore.get(req.params.id);
    if (!resume) {
      throw new AppError('Resume not found', 404);
    }
    res.json({ success: true, ...resume });
  } catch (error) {
    next(error);
  }
});

router.get('/job-description/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobDescription = jobDescriptionStore.get(req.params.id);
    if (!jobDescription) {
      throw new AppError('Job description not found', 404);
    }
    res.json({ success: true, ...jobDescription });
  } catch (error) {
    next(error);
  }
});

// Delete specific resume
router.delete('/resume/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    await vectorDBService.deleteVector(id);
    resumeStore.delete(id);
    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Delete specific job description
router.delete('/job-description/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    await vectorDBService.deleteVector(id);
    jobDescriptionStore.delete(id);
    res.json({ success: true, message: 'Job description deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Delete all resumes
router.delete('/resumes/all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await vectorDBService.deleteVectorsByType('resume');
    resumeStore.clear();
    res.json({ success: true, message: 'All resumes deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Delete all job descriptions
router.delete('/job-descriptions/all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await vectorDBService.deleteVectorsByType('job_description');
    jobDescriptionStore.clear();
    res.json({ success: true, message: 'All job descriptions deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Delete everything from Pinecone
router.delete('/all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await vectorDBService.deleteAllVectors();
    resumeStore.clear();
    jobDescriptionStore.clear();
    res.json({ success: true, message: 'All data deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
