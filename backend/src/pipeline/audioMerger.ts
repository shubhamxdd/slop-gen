import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { AudioSegment } from './ttsGenerator';

export interface MergedAudio {
  filePath: string;
  totalDuration: number;
}

export async function mergeAudio(jobId: string, segments: AudioSegment[]): Promise<MergedAudio> {
  const outputDir = path.join(process.cwd(), 'outputs', 'audio', jobId);
  const outputPath = path.join(outputDir, 'merged.mp3');

  console.log(`[Job ${jobId}] Merging ${segments.length} audio segments into ${outputPath}...`);

  return new Promise((resolve, reject) => {
    const command = ffmpeg();

    // Add each segment as an input
    segments.forEach((segment) => {
      command.input(segment.filePath);
    });

    command
      .on('error', (err) => {
        console.error(`[Job ${jobId}] Error merging audio:`, err.message);
        reject(new Error(`Failed to merge audio: ${err.message}`));
      })
      .on('end', () => {
        // Calculate total duration from segments
        const totalDuration = segments.reduce((acc, seg) => acc + seg.duration, 0);
        console.log(`[Job ${jobId}] Audio merged successfully. Total duration: ${totalDuration.toFixed(2)}s`);
        resolve({
          filePath: outputPath,
          totalDuration,
        });
      })
      .mergeToFile(outputPath, outputDir);
  });
}
