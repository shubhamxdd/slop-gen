import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { runPipeline, PipelineInput } from './pipeline';

import { env } from "./config/env"

dotenv.config();

const app = express();
const PORT = env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'ClipForge Backend is running!' });
});

app.post('/api/generate', async (req: Request, res: Response) => {
  const { topic, characters, backgroundId } = req.body;
  
  if (!topic || !characters || !backgroundId) {
    return res.status(400).json({ success: false, error: 'Missing required fields: topic, characters, backgroundId' });
  }

  const jobId = uuidv4();
  
  // For now, we run it synchronously and return the result
  // In a real app, this would be an async job queue (BullMQ)
  const result = await runPipeline(jobId, { topic, characters, backgroundId });

  if (result.success) {
    res.json({ success: true, jobId, script: result.script });
  } else {
    res.status(500).json({ success: false, jobId, error: result.error });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
