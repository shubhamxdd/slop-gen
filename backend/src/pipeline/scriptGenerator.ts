import axios from 'axios';

export interface ScriptLine {
  character: string;
  line: string;
}

export async function generateScript(topic: string, characters: { A: string, B: string }): Promise<ScriptLine[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "deepseek/deepseek-v4-flash:free";

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not defined in environment variables');
  }

  const prompt = `
    Generate a funny and engaging dialogue between two characters, ${characters.A} and ${characters.B}, about: "${topic}".
    The dialogue should be suitable for a short 60-second viral video.
    Return ONLY a raw JSON array of objects with "character" and "line" keys.
    Example: [{"character": "${characters.A}", "line": "Hey, did you see that?"}, {"character": "${characters.B}", "line": "See what?"}]
    Keep it between 8 to 12 lines. No preamble, no markdown formatting, just the JSON array.
  `;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: model,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content.trim();
    // Sometimes models wrap JSON in code blocks, let's clean it up just in case
    const jsonString = content.replace(/```json|```/g, '').trim();
    const script: ScriptLine[] = JSON.parse(jsonString);

    if (!Array.isArray(script)) {
      throw new Error('Generated script is not a valid array');
    }

    return script;
  } catch (error: any) {
    console.error('Error generating script:', error.response?.data || error.message);
    throw new Error('Failed to generate script from OpenRouter');
  }
}
