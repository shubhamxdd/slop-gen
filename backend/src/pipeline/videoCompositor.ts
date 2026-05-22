import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

export interface VideoOutput {
  filePath: string;
}

export async function compositeVideo(
  jobId: string,
  backgroundVideoPath: string,
  audioPath: string,
  subtitlePath: string,
  duration: number
): Promise<VideoOutput> {
  const outputDir = path.join(process.cwd(), 'outputs', 'video');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `${jobId}.mp4`);

  console.log(`[Job ${jobId}] Rendering final video: ${outputPath}...`);

  // Use relative path for subtitles to avoid drive letter colon issues on Windows
  const relativeSubtitlePath = path.relative(process.cwd(), subtitlePath);
  const escapedSubtitlePath = relativeSubtitlePath
    .replace(/\\/g, '/') // FFmpeg filter paths MUST use forward slashes
    .replace(/'/g, "'\\\\''"); // Escape single quotes if any

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(backgroundVideoPath)
      .inputOptions(['-stream_loop -1']) // Loop background infinitely
      .input(audioPath)
      .outputOptions([
        '-t', duration.toFixed(2), // Cut at audio duration
        '-c:v libx264',
        '-preset fast',
        '-crf 23',
        '-c:a aac',
        '-b:a 128k',
        '-map 0:v:0', // Use video from background
        '-map 1:a:0', // Use audio from merged file
        '-shortest',
        '-pix_fmt yuv420p',
        '-s 1080x1920'
      ])
      .videoFilters(`subtitles='${escapedSubtitlePath}'`) // Wrap in single quotes
      .on('start', (command) => {
        console.log(`[Job ${jobId}] FFmpeg command: ${command}`);
      })
      .on('error', (err) => {
        console.error(`[Job ${jobId}] Error compositing video:`, err.message);
        reject(new Error(`Failed to composite video: ${err.message}`));
      })
      .on('end', () => {
        console.log(`[Job ${jobId}] Video rendered successfully: ${outputPath}`);
        resolve({ filePath: outputPath });
      })
      .save(outputPath);
  });
}
