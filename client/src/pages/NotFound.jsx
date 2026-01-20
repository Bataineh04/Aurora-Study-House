import { Link } from "wouter";
import { AlertOctagon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-destructive/10 p-6 rounded-full mb-6">
        <AlertOctagon className="h-16 w-16 text-destructive" />
      </div>
      <h1 className="text-4xl font-serif font-bold text-primary mb-4">404 - Page Not Found</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link href="/" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
        Return to Home
      </Link>
    </div>
  );
}
