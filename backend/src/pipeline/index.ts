import path from 'path';
import { generateScript, ScriptLine } from './scriptGenerator';
import { generateTTS, AudioSegment } from './ttsGenerator';
import { mergeAudio, MergedAudio } from './audioMerger';
import { generateSubtitles } from './subtitleGenerator';
import { compositeVideo } from './videoCompositor';

export interface PipelineInput {
  topic: string;
  characters: {
    A: { name: string; voiceId: string };
    B: { name: string; voiceId: string };
  };
  backgroundId: string;
}

export async function runPipeline(jobId: string, input: PipelineInput) {
  try {
    console.log(`[Job ${jobId}] Starting pipeline...`);

    // Step 1: Generate Script
    console.log(`[Job ${jobId}] Step 1: Generating script...`);
    const characters = { A: input.characters.A.name, B: input.characters.B.name };
    const script = await generateScript(input.topic, characters);
    console.log(`[Job ${jobId}] Script generated:`, JSON.stringify(script));

    // Step 2: Generate TTS
    console.log(`[Job ${jobId}] Step 2: Generating TTS...`);
    const voiceMap: Record<string, string> = {
      [input.characters.A.name]: input.characters.A.voiceId,
      [input.characters.B.name]: input.characters.B.voiceId,
    };
    const audioSegments = await generateTTS(jobId, script, voiceMap);
    console.log(`[Job ${jobId}] TTS generated: ${audioSegments.length} segments`);

    // Step 3: Merge Audio
    console.log(`[Job ${jobId}] Step 3: Merging audio segments...`);
    const mergedAudio = await mergeAudio(jobId, audioSegments);

    // Step 4: Generate Subtitles
    console.log(`[Job ${jobId}] Step 4: Generating styled subtitles...`);
    const subtitlePath = await generateSubtitles(jobId, audioSegments);

    // Step 5: Composite Video
    console.log(`[Job ${jobId}] Step 5: Compositing final video...`);
    // Map backgroundId to actual file (for now assuming it's in assets/background)
    const backgroundVideoPath = path.join(process.cwd(), 'assets', 'background', `${input.backgroundId}.mp4`);
    const videoOutput = await compositeVideo(
      jobId,
      backgroundVideoPath,
      mergedAudio.filePath,
      subtitlePath,
      mergedAudio.totalDuration
    );

    return { 
      success: true, 
      jobId,
      videoPath: videoOutput.filePath,
      duration: mergedAudio.totalDuration 
    };
  } catch (error: any) {
    console.error(`[Job ${jobId}] Pipeline failed:`, error.message);
    return { success: false, error: error.message };
  }
}
