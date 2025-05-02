'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom'; // Import useFormStatus from react-dom
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatAndForwardAction, type FormState } from '@/actions/formatAndForward';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';


// Re-define schema here for client-side validation consistency
const FormSchema = z.object({
  text: z.string().min(1, { message: 'Text cannot be empty.' }),
  formattingParameters: z.string().min(1, { message: 'Formatting parameters cannot be empty.' }).default("Ensure consistent capitalization and punctuation. Remove extra whitespace."),
  email: z.string().email({ message: 'Please enter a valid email address.' }).default("recipient@example.com"), // Add default email
});

type FormData = z.infer<typeof FormSchema>;

function ResetButton({ reset }: { reset: () => void }) {
  return (
    <Button type="button" onClick={reset} className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground">
      Reset
      </Button>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
      {pending ? 'Processing...' : 'Format and Forward'}
    </Button>
  );
}


export function FormatForm() {
  const { toast } = useToast();
  const [formattedResult, setFormattedResult] = React.useState<string | null>(null);

  const handleReset = () => {
    form.reset();
    setFormattedResult(null);
  };
  const initialState: FormState = { message: null, error: null };
  const [state, formAction] = useActionState(formatAndForwardAction, initialState); // Updated usage

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      text: '',
      formattingParameters: 'Ensure consistent capitalization and punctuation. Remove extra whitespace.',
      email: 'recipient@example.com', // Set default email in form
    },
     // Use the state from useActionState to show server-side errors
    errors: state?.fieldErrors ? Object.entries(state.fieldErrors).reduce((acc, [key, value]) => {
      if (value && value.length > 0) {
        acc[key as keyof FormData] = { type: 'server', message: value[0] };
      }
      return acc;
    }, {} as any) : {},
  });

  React.useEffect(() => {
    if (state?.message && !state.error) {
      toast({
        title: "Success!",
        description: state.message,
        variant: "default",
      });
      if (state.formattedText) {
        setFormattedResult(state.formattedText);
        form.resetField("text");
      }
    } else if (state?.error) {
      toast({
        title: "Error",
        description: state.error || "An unknown error occurred.",
        variant: "destructive",
      });
      setFormattedResult(null); // Clear previous results on error
    }
  }, [state, toast,form]);

  // Manually trigger revalidation or set errors when server state changes
  React.useEffect(() => {
    if (state?.fieldErrors) {
      const fieldErrors = state.fieldErrors;
      (Object.keys(fieldErrors) as Array<keyof FormData>).forEach((field) => {
        if (fieldErrors[field] && fieldErrors[field]!.length > 0) {
          form.setError(field, { type: 'server', message: fieldErrors[field]![0] });
        }
      });
    } else {
      // Clear server errors if state no longer has them
      (Object.keys(form.formState.errors) as Array<keyof FormData>).forEach((field) => {
        if (form.formState.errors[field]?.type === 'server') {
          form.clearErrors(field);
        }
      });
    }
  }, [state?.fieldErrors, form]);

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
                The email address to send the formatted text to (simulation).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {formattedResult && (<FormItem>
          <FormLabel>Formatted Text</FormLabel>
          <FormControl>
            <Textarea value={formattedResult} disabled className="resize-y min-h-[150px] bg-input border border-border" />
          </FormControl>
        </FormItem>
        )}
        <div className="flex justify-between">
          <SubmitButton>Format and Forward</SubmitButton>
          {formattedResult && <ResetButton reset={handleReset} />}
        </div>
        {/* Display Server Messages/Errors */}
        {state?.message && !state.error && !formattedResult && (
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
        {state?.error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
      </form></Form>
  );
}
