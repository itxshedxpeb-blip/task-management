'use client';

import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { isOnline } from '@/lib/network';
import { useState, useEffect } from 'react';

export function NoInternetScreen({ onRetry }: { onRetry?: () => void }) {
  const [isChecking, setIsChecking] = useState(false);

  const handleRetry = async () => {
    setIsChecking(true);
    // Simulate network check
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (isOnline() && onRetry) {
      onRetry();
    }
    setIsChecking(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <WifiOff className="h-8 w-8 text-destructive" />
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mb-2">No Internet Connection</h2>
          <p className="text-muted-foreground mb-6">
            Please check your internet connection and try again.
          </p>
          
          <Button 
            onClick={handleRetry} 
            disabled={isChecking}
            className="w-full"
          >
            {isChecking ? 'Checking...' : 'Retry'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
