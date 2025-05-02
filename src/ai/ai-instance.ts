import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

console.log("GOOGLE_GENAI_API_KEY:", process.env.GOOGLE_GENAI_API_KEY);

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});
