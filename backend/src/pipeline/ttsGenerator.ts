import axios from 'axios';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { ScriptLine } from './scriptGenerator';

export interface AudioSegment {
  lineIndex: number;
  filePath: string;
  duration: number; // in seconds
  character: string;
  text: string;
}

export async function generateTTS(
  jobId: string,
  script: ScriptLine[],
  voiceMap: Record<string, string>
): Promise<AudioSegment[]> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY is not defined');
  }

  const outputDir = path.join(process.cwd(), 'outputs', 'audio', jobId);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const audioSegments: AudioSegment[] = [];

  for (let i = 0; i < script.length; i++) {
    const { character, line } = script[i];
    let voiceId = voiceMap[character];

    // Fallback for testing
    if (!voiceId || voiceId === 'v1') voiceId = 'JBFqnCBsd6RMkjVDRZzb'; // George
    if (voiceId === 'v2') voiceId = 'XB0fDUnXU5powFXDhCwa'; // Charlotte

    const fileName = `line_${i}.mp3`;
    const filePath = path.join(outputDir, fileName);

    console.log(`[Job ${jobId}] Generating TTS for line ${i} (${character}) using voice ${voiceId}...`);

    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          text: line,
          model_id: 'eleven_flash_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        },
        {
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          responseType: 'stream',
        }
      );

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Get duration using ffprobe
      const duration = await getAudioDuration(filePath);

      audioSegments.push({
        lineIndex: i,
        filePath,
        duration,
        character,
        text: line,
      });
    } catch (error: any) {
      console.error(`Error generating TTS for line ${i}:`, error.message);
      if (error.response) {
        // Axios stores response data as a stream when responseType is 'stream'
        // We can't easily read it here, but we can log the status
        console.error('API Status:', error.response.status);
      }
      throw new Error(`Failed to generate TTS for line ${i}: ${error.message}`);
    }
  }

  return audioSegments;
}

function getAudioDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const duration = metadata.format.duration;
      if (duration === undefined) return reject(new Error('Duration not found'));
      resolve(duration);
    });
  });
}
