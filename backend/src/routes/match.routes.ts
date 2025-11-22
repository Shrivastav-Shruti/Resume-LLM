import { Router, Request, Response, NextFunction } from 'express';
import { MatchingService } from '../services/matching.service';
import { AppError } from '../middleware/error.middleware';

const router = Router();
const matchingService = new MatchingService();

router.post('/score', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resumeText, jobDescriptionText, resumeId, jobDescriptionId } = req.body;

    if (!resumeText || !jobDescriptionText) {
      throw new AppError('Both resumeText and jobDescriptionText are required', 400);
    }

    const matchScore = await matchingService.calculateMatchScore(
      resumeText,
      jobDescriptionText,
      resumeId || 'unknown',
      jobDescriptionId || 'unknown'
    );

    res.json({
      success: true,
      matchScore
    });
  } catch (error) {
    next(error);
  }
});

export default router;
