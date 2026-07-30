"use client";

import { RefreshCw, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useServiceWorker } from '@/shared/hooks/useServiceWorker';
import { cn } from '@/lib/utils';

export function ServiceWorkerUpdate() {
  const { isUpdateAvailable, isWaiting, update, skipWaiting, error } = useServiceWorker();

  if (!isUpdateAvailable && !isWaiting) {
    return null;
  }

  const handleUpdate = () => {
    if (isWaiting) {
      skipWaiting();
    } else {
      update();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-background border border-border rounded-lg shadow-lg p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className={cn(
              "p-2 rounded-lg flex-shrink-0",
              isWaiting ? "bg-blue-500/10" : "bg-amber-500/10"
            )}>
              {isWaiting ? (
                <Check className="h-4 w-4 text-blue-500" />
              ) : (
                <RefreshCw className="h-4 w-4 text-amber-500 animate-spin" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {isWaiting ? 'Update Available' : 'Updating...'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isWaiting 
                  ? 'A new version is ready to install. Refresh to apply updates.'
                  : 'Downloading new version...'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
            onClick={() => window.location.reload()}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}

        {isWaiting && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={handleUpdate}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Now
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Later
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
