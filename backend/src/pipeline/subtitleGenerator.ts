import fs from 'fs';
import path from 'path';
import { AudioSegment } from './ttsGenerator';

export async function generateSubtitles(jobId: string, segments: AudioSegment[]): Promise<string> {
  const outputDir = path.join(process.cwd(), 'outputs', 'subtitles');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `${jobId}.ass`);
  
  // ASS Header with Viral Style
  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Viral,Arial,80,&H00FFFFFF,&H000000FF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,6,0,5,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  let events = '';
  let currentTime = 0;

  for (const segment of segments) {
    const words = segment.text.split(' ').filter(w => w.length > 0);
    const wordDuration = segment.duration / words.length;

    // Show 1-2 words at a time for that high-energy feel
    const wordsPerChunk = 2;
    for (let i = 0; i < words.length; i += wordsPerChunk) {
      const chunk = words.slice(i, i + wordsPerChunk).join(' ');
      const start = currentTime + (i * wordDuration);
      const end = currentTime + Math.min((i + wordsPerChunk) * wordDuration, segment.duration);

      events += `Dialogue: 0,${formatASSTime(start)},${formatASSTime(end)},Viral,,0,0,0,,{\\pos(540,960)}${chunk.toUpperCase()}\n`;
    }

    currentTime += segment.duration;
  }

  fs.writeFileSync(outputPath, header + events);
  console.log(`[Job ${jobId}] Subtitles generated: ${outputPath}`);
  return outputPath;
}

function formatASSTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);

  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}
