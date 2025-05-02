import { FormatForm } from '@/components/format-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24 bg-secondary/50">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Format & Forward</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your text and formatting instructions, then specify the email address to send the formatted result.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormatForm />
        </CardContent>
      </Card>
    </main>
  );
}
