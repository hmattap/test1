'use server';

import { z } from 'zod';
import { formatText, type FormatTextInput, type FormatTextOutput } from '@/ai/flows/format-text';
import { getAdminApp } from '@/lib/firebase-admin';
import { getFirestore, FieldValue } from 'firebase-admin/firestore'; // Correct imports

// Define the schema for the form input
const FormSchema = z.object({
  text: z.string().min(1, { message: 'Text cannot be empty.' }),
  formattingParameters: z.string().min(1, { message: 'Formatting parameters cannot be empty.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

export type FormState = {
  message: string | null;
  formattedText?: string;
  error?: string | null;
  fieldErrors?: {
    text?: string[];
    formattingParameters?: string[];
    email?: string[];
  }
};

// Server action function
export async function formatAndForwardAction(
  prevState: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  // 1. Validate form data
  const validatedFields = FormSchema.safeParse({
    text: formData.get('text'),
    formattingParameters: formData.get('formattingParameters'),
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed. Please check your input.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
      error: 'Validation Error'
    };
  }

  const { text, formattingParameters, email } = validatedFields.data;

  try {
    // 2. Call the AI formatting agent
    const formatInput: FormatTextInput = { text, formattingParameters };
    const formatOutput: FormatTextOutput = await formatText(formatInput);
    const formattedText = formatOutput.formattedText;


    // 3. Save to Firestore (using Admin SDK)
    const adminApp = getAdminApp(); // Get the initialized Admin app
    const db = getFirestore(adminApp); // Get the admin firestore
    await db.collection('formattedTexts').add({ // Use db.collection() and db.add() for Admin SDK
      originalText: text,
      formattingParameters: formattingParameters,
      formattedText: formattedText,
      recipientEmail: email,
      createdAt: FieldValue.serverTimestamp(), // Correct usage
    });
    

    // 4. Send email using Firebase Cloud Functions
    try {
      await db.collection('mail').add({ // Use the Admin db to interact with Firestore in mail collection
        to: email,
        template: {
          subject: 'Formatted Text',
          text: formattedText,
        },
      });
      console.log(`Email queued for sending to: ${email}`);
    } catch (emailError) {
      console.error('Error queuing email:', emailError);
    }
    return {
      message: 'Text formatted, saved, and email simulated successfully!',
      formattedText: formattedText,
      error: null,
    };
  } catch (error: any) {
    console.error('Action failed:', error);
    let errorMessage = 'An unexpected error occurred.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // Check if it's a Genkit/AI error specifically
    if (error.details) {
       errorMessage = `AI Formatting Error: ${error.details}`;
    }
    return {
      message: 'Action failed.',
      error: errorMessage,
    };
  }
}