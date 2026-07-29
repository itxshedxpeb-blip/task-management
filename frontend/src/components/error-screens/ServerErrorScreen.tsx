'use client';

import { ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ServerErrorScreenProps {
  message?: string;
  onRetry?: () => void;
}

export function ServerErrorScreen({ message = 'Something went wrong on our end', onRetry }: ServerErrorScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ServerCrash className="h-8 w-8 text-destructive" />
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mb-2">Server Error</h2>
          <p className="text-muted-foreground mb-6">
            {message}
          </p>
          
          {onRetry && (
            <Button onClick={onRetry} className="w-full">
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
