// src/ai/flows/format-text.ts
'use server';
/**
 * @fileOverview A text formatting AI agent.
 *
 * - formatText - A function that handles the text formatting process.
 * - FormatTextInput - The input type for the formatText function.
 * - FormatTextOutput - The return type for the formatText function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const FormatTextInputSchema = z.object({
  text: z.string().describe('The unformatted text to be formatted.'),
  formattingParameters: z
    .string()
    .describe('The parameters to use when formatting the text.'),
});
export type FormatTextInput = z.infer<typeof FormatTextInputSchema>;

const FormatTextOutputSchema = z.object({
  formattedText: z.string().describe('The formatted text.'),
});
export type FormatTextOutput = z.infer<typeof FormatTextOutputSchema>;

export async function formatText(input: FormatTextInput): Promise<FormatTextOutput> {
  return formatTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'formatTextPrompt',
  input: {
    schema: z.object({
      text: z.string().describe('The unformatted text to be formatted.'),
      formattingParameters: z
        .string()
        .describe('The parameters to use when formatting the text.'),
    }),
  },
  output: {
    schema: z.object({
      formattedText: z.string().describe('The formatted text.'),
    }),
  },
  prompt: `You are a text formatting expert. You will format the given text based on the provided formatting parameters.\n\nText: {{{text}}}\nFormatting Parameters: {{{formattingParameters}}}\n\nFormatted Text:`,
});

const formatTextFlow = ai.defineFlow<typeof FormatTextInputSchema, typeof FormatTextOutputSchema>(
  {
    name: 'formatTextFlow',
    inputSchema: FormatTextInputSchema,
    outputSchema: FormatTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
