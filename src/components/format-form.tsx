'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { formatAndForwardAction, type FormState } from '@/actions/formatAndForward';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';


// Re-define schema here for client-side validation consistency
const FormSchema = z.object({
  text: z.string().min(1, { message: 'Text cannot be empty.' }),
  formattingParameters: z.string().min(1, { message: 'Formatting parameters cannot be empty.' }).default("Ensure consistent capitalization and punctuation. Remove extra whitespace."),
  email: z.string().email({ message: 'Please enter a valid email address.' }).default("recipient@example.com"),
});

type FormData = z.infer<typeof FormSchema>;

function ResetButton({ reset }: { reset: () => void }) {
  return (
    <Button type="button" onClick={reset} variant="outline" className="w-full">
      Reset
      </Button>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Processing...' : 'Format and Forward'}
    </Button>
  );
}


export function FormatForm() {
  const { toast } = useToast();
  const [formattedResult, setFormattedResult] = React.useState<string | null>(null);

  const initialState: FormState = { message: null, error: null, fieldErrors: {} };
  const [state, formAction] = useActionState(formatAndForwardAction, initialState);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      text: '',
      formattingParameters: 'Ensure consistent capitalization and punctuation. Remove extra whitespace.',
      email: 'recipient@example.com',
    },
    // Remove `errors` from here; server errors will be handled by useEffect
  });

  const handleReset = () => {
    form.reset();
    setFormattedResult(null);
    // Optionally, reset the action state if a mechanism exists or is needed
  };

  React.useEffect(() => {
    if (state?.message && !state.error) {
      toast({
        title: "Success!",
        description: state.message,
        variant: "default",
      });
      if (state.formattedText) {
        setFormattedResult(state.formattedText);
        form.resetField("text"); // form.resetField is stable
      }
    } else if (state?.error) {
      toast({
        title: "Error",
        description: state.error || "An unknown error occurred.",
        variant: "destructive",
      });
      setFormattedResult(null);
    }
  }, [state?.message, state?.error, state?.formattedText, toast, form.resetField]);


  React.useEffect(() => {
    // Clear previous server-set errors first.
    // Iterate over the fields defined in the schema to avoid issues with unrelated errors.
    const schemaFields = Object.keys(FormSchema.shape) as Array<keyof FormData>;
    schemaFields.forEach(fieldName => {
      if (form.formState.errors[fieldName]?.type === 'server') {
        form.clearErrors(fieldName);
      }
    });

    // Set new server-set errors
    if (state?.fieldErrors) {
      const fieldErrors = state.fieldErrors;
      (Object.keys(fieldErrors) as Array<keyof FormData>).forEach(fieldName => {
        const messages = fieldErrors[fieldName];
        if (messages && messages.length > 0) {
          form.setError(fieldName, {
            type: 'server',
            message: messages[0],
          });
        }
      });
    }
  }, [state?.fieldErrors, form.setError, form.clearErrors, form.formState.errors]); // form.setError and form.clearErrors are stable. form.formState.errors is added to re-evaluate clearing.

  return (<Form {...form}><form action={formAction} className="space-y-6">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unformatted Text</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Paste or type your text here..."
                  className="resize-y min-h-[150px] bg-input border border-border"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The text you want the AI to format.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="formattingParameters"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Formatting Parameters</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Convert to bullet points, Fix grammar" {...field} className="bg-input border border-border" />
              </FormControl>
              <FormDescription>
                Instructions for the AI on how to format the text.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipient Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="recipient@example.com" {...field} className="bg-input border border-border" />
              </FormControl>
              <FormDescription>
                The email address to send the formatted text to.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {formattedResult && (<FormItem>
          <FormLabel>Formatted Text Result</FormLabel>
          <FormControl>
            <Textarea value={formattedResult} readOnly className="resize-y min-h-[150px] bg-muted border border-border" />
          </FormControl>
        </FormItem>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SubmitButton />
          <ResetButton reset={handleReset} />
        </div>
        {/* Display Server Action General Messages (not field errors) */}
        {state?.message && !state.error && !state.fieldErrors && Object.keys(state.fieldErrors).length === 0 && !formattedResult && (
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
        {state?.error && !state.fieldErrors && Object.keys(state.fieldErrors).length === 0 && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
      </form></Form>
  );
}
