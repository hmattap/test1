'use server';

import { z } from 'zod';
import { formatText, type FormatTextInput, type FormatTextOutput } from '@/ai/flows/format-text';
import { getAdminApp } from '@/lib/firebase-admin';
import { getDb } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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


    // 3. Save to Firestore
    const db = getDb();
    if (!db) {
      throw new Error('Firestore database is not initialized.');
    }
    const docRef = await addDoc(collection(db, 'formattedTexts'), {
      originalText: text,
      formattingParameters: formattingParameters,
      formattedText: formattedText,
      recipientEmail: email,
      createdAt: serverTimestamp(),
    });
    console.log('Document written with ID: ', docRef.id);

    // 4. Send email using Firebase Cloud Functions
    const admin = getAdminApp();
    try {
      await admin.firestore().collection('mail').add({
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
