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
  let activeJobId: string | null = null;
  try {
    const { topic, characters, backgroundId } = req.body;
    const userId = req.user!.userId;
    
    if (!topic || !characters || !backgroundId) {
      return res.status(400).json({ success: false, error: 'Missing required fields: topic, characters, backgroundId' });
    }

    activeJobId = uuidv4();

    // 1. Check user limits and increment atomically
    const [user] = await db.update(users)
      .set({ 
        videosGeneratedThisMonth: sql`${users.videosGeneratedThisMonth} + 1`,
        updatedAt: new Date()
      })
      .where(sql`${users.id} = ${userId} AND (${users.plan} != 'free' OR ${users.videosGeneratedThisMonth} < 5)`)
      .returning();

    if (!user) {
      // Need to verify if user exists or limit was reached
      const existingUser = await db.query.users.findFirst({ where: eq(users.id, userId) });
      if (!existingUser) return res.status(404).json({ success: false, error: 'User not found' });
      return res.status(403).json({ success: false, error: 'Free tier limit reached (5 videos/month)' });
    }

    // 2. Create job entry in DB
    await db.insert(jobs).values({
      id: activeJobId,
      userId,
      topic,
      status: 'processing',
      input: { topic, characters, backgroundId },
    });

    // 3. Run pipeline (still synchronous for now)
    const result = await runPipeline(activeJobId, { topic, characters, backgroundId });

    if (result.success) {
      // Update job as completed
      await db.update(jobs)
        .set({ 
          status: 'completed', 
          progress: 'Finished', 
          outputUrl: result.videoPath,
          updatedAt: new Date() 
        })
        .where(eq(jobs.id, activeJobId));

      res.json({ success: true, jobId: activeJobId, videoPath: result.videoPath });
    } else {
      // Update job as failed
      await db.update(jobs)
        .set({ 
          status: 'failed', 
          error: result.error,
          updatedAt: new Date() 
        })
        .where(eq(jobs.id, activeJobId));

      res.status(500).json({ success: false, jobId: activeJobId, error: result.error });
    }
  } catch (error: any) {
    if (activeJobId) {
      await db.update(jobs)
        .set({ status: 'failed', error: error.message, updatedAt: new Date() })
        .where(eq(jobs.id, activeJobId));
    }
    next(error);
  }
});

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
