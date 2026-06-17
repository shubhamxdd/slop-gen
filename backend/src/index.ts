import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { runPipeline } from './pipeline';
import { env } from "./config/env";
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middleware/error.middleware';
import { authMiddleware, AuthRequest } from './middleware/auth.middleware';
import { db } from './db';
import { users } from './db/schema/users';
import { jobs } from './db/schema/jobs';
import { eq, sql } from 'drizzle-orm';

const app = express();
const PORT = env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'ClipForge Backend is running!' });
});

app.use('/api/auth', authRoutes);

app.post('/api/generate', authMiddleware, async (req: AuthRequest, res, next) => {
  let jobId: string | undefined;
  try {
    const { topic, characters, backgroundId } = req.body;
    const userId = req.user!.userId;

    if (!topic || !characters || !backgroundId) {
      return res.status(400).json({ success: false, error: 'Missing required fields: topic, characters, backgroundId' });
    }

    // 1. Check user limits and increment atomically
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    if (user.plan === 'free' && user.videosGeneratedThisMonth >= 5) {
      return res.status(403).json({ success: false, error: 'Free tier limit reached (5 videos/month)' });
    }

    jobId = uuidv4();

    // 2. Create job entry in DB and increment user video count atomically
    await db.transaction(async (tx) => {
      await tx.insert(jobs).values({
        id: jobId!,
        userId,
        topic,
        status: 'processing',
        input: { topic, characters, backgroundId },
      });

      await tx.update(users)
        .set({ videosGeneratedThisMonth: sql`${users.videosGeneratedThisMonth} + 1` })
        .where(eq(users.id, userId));
    });

    // 4. Run pipeline (still synchronous for now)
    const result = await runPipeline(jobId, { topic, characters, backgroundId });

    if (result.success) {
      // Update job as completed
      await db.update(jobs)
        .set({ status: 'completed', progress: 'Finished', outputUrl: result.videoPath, updatedAt: new Date() })
        .where(eq(jobs.id, jobId));

      res.json({ success: true, jobId, videoPath: result.videoPath });
    } else {
      // Update job as failed
      await db.update(jobs)
        .set({ status: 'failed', error: result.error, updatedAt: new Date() })
        .where(eq(jobs.id, jobId));

      res.status(500).json({ success: false, jobId, error: result.error });
    }
  } catch (error) {
    // Update job status to failed if an exception occurs
    if (jobId) {
      await db.update(jobs)
        .set({ status: 'failed', error: (error as Error).message || 'Unknown error', updatedAt: new Date() })
        .where(eq(jobs.id, jobId));
    }
    next(error);
  }
});

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
