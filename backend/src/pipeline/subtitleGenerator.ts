import fs from 'fs';
import path from 'path';
import { AudioSegment } from './ttsGenerator';

export async function generateSubtitles(jobId: string, segments: AudioSegment[]): Promise<string> {
  const outputDir = path.join(process.cwd(), 'outputs', 'subtitles');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `${jobId}.ass`);
  
  // Subtitles 2.1 - The "Box Highlight" Style
  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Viral,Arial,90,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,5,0,5,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  let events = '';
  let currentTime = 0;

  for (const segment of segments) {
    const words = segment.text.split(' ').filter(w => w.length > 0);
    const wordDuration = segment.duration / words.length;

    // Show 2 words at a time for maximum impact
    const wordsPerChunk = 2;
    for (let i = 0; i < words.length; i += wordsPerChunk) {
      const chunkWords = words.slice(i, i + wordsPerChunk);
      const chunkStart = currentTime + (i * wordDuration);
      const chunkEnd = currentTime + Math.min((i + wordsPerChunk) * wordDuration, segment.duration);

      const wordsInThisChunk = chunkWords.length;
      const subChunkDuration = (chunkEnd - chunkStart) / wordsInThisChunk;

      for (let j = 0; j < wordsInThisChunk; j++) {
        const activeWordIndex = j;
        const subStart = chunkStart + (j * subChunkDuration);
        const subEnd = chunkStart + ((j + 1) * subChunkDuration);

        // Build the text with "Box Highlight" effect
        // Non-active: White text, thin black border
        // Active: Black text, thick yellow border (looks like a box)
        let coloredText = '';
        for (let k = 0; k < wordsInThisChunk; k++) {
          const word = chunkWords[k].toUpperCase();
          if (k === activeWordIndex) {
            // Black text (\c&H000000&), Yellow border (\3c&H00FFFF&), Thick border (\bord12)
            coloredText += `{\\c&H000000&\\3c&H00FFFF&\\bord12}${word} `;
          } else {
            // White text (\c&HFFFFFF&), Black border (\3c&H000000&), Normal border (\bord5)
            coloredText += `{\\c&HFFFFFF&\\3c&H000000&\\bord5}${word} `;
          }
        }

        // More aggressive "Pop" animation (130% -> 100%)
        const animation = `{\\fscx130\\fscy130\\t(0,100,\\fscx100\\fscy100)}`;
        events += `Dialogue: 0,${formatASSTime(subStart)},${formatASSTime(subEnd)},Viral,,0,0,0,,{\\pos(540,960)}${animation}${coloredText.trim()}\n`;
      }
    }

    currentTime += segment.duration;
  }

  fs.writeFileSync(outputPath, header + events);
  console.log(`[Job ${jobId}] Subtitles 2.1 (Box Highlight) generated: ${outputPath}`);
  return outputPath;
}

function formatASSTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);

  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}
