"use client";

import { Download, Smartphone, Monitor, X, Check, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePWAInstall } from '@/shared/hooks/usePWAInstall';
import { cn } from '@/lib/utils';

interface PWAInstallButtonProps {
  variant?: 'icon' | 'text' | 'full';
  className?: string;
  showInHeader?: boolean;
}

export function PWAInstallButton({ 
  variant = 'icon', 
  className,
  showInHeader = false 
}: PWAInstallButtonProps) {
  const {
    canInstall,
    isInstalled,
    isInstalling,
    installState,
    platformInfo,
    install,
    dismiss,
    error,
  } = usePWAInstall();

  // Don't show if already installed or not supported
  if (isInstalled || !canInstall) {
    return null;
  }

  const handleInstall = () => {
    install();
  };

  const handleDismiss = () => {
    dismiss();
  };

  // Icon-only variant for header
  if (variant === 'icon') {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleInstall}
          disabled={isInstalling}
          className={cn('h-9 w-9 relative', className)}
          aria-label="Install app"
          title={platformInfo.isIOS ? 'Add to Home Screen' : 'Install app'}
        >
          {isInstalling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : platformInfo.isIOS ? (
            <Smartphone className="h-4 w-4" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>

        {error && (
          <div className="fixed top-20 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg z-50 text-sm">
            {error}
            <button
              onClick={handleDismiss}
              className="ml-2 hover:opacity-70"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4 inline" />
            </button>
          </div>
        )}
      </>
    );
  }

  // Text variant for settings or other areas
  if (variant === 'text') {
    return (
      <>
        <Button
          onClick={handleInstall}
          disabled={isInstalling}
          className={cn('gap-2', className)}
          variant={showInHeader ? 'ghost' : 'default'}
        >
          {isInstalling ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Installing...
            </>
          ) : platformInfo.isIOS ? (
            <>
              <Smartphone className="h-4 w-4" />
              Add to Home Screen
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Install App
            </>
          )}
        </Button>

        {error && (
          <div className="mt-2 text-sm text-destructive flex items-center gap-2">
            <Info className="h-4 w-4" />
            {error}
          </div>
        )}
      </>
    );
  }

  // Full variant with dialog for iOS instructions
  if (variant === 'full') {
    return (
      <>
        <Button
          onClick={handleInstall}
          disabled={isInstalling}
          className={cn('gap-2', className)}
        >
          {isInstalling ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Installing...
            </>
          ) : platformInfo.isIOS ? (
            <>
              <Smartphone className="h-4 w-4" />
              Add to Home Screen
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Install App
            </>
          )}
        </Button>

        {/* iOS Instructions Dialog */}
        {platformInfo.isIOS && platformInfo.installInstructions && (
          <Dialog open={isInstalling} onOpenChange={handleDismiss}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Install on iPhone/iPad
                </DialogTitle>
                <DialogDescription>
                  Follow these steps to add TaskFlow to your home screen:
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <span className="text-blue-500 font-semibold text-sm">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Tap the Share button</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      It's at the bottom of the screen (square with arrow pointing up)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <span className="text-blue-500 font-semibold text-sm">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Scroll down and tap "Add to Home Screen"</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This will add the app icon to your home screen
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <span className="text-blue-500 font-semibold text-sm">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Tap "Add" in the top right</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      The app will be added to your home screen
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleDismiss} variant="outline">
                  Got it
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {error && (
          <div className="mt-2 text-sm text-destructive flex items-center gap-2">
            <Info className="h-4 w-4" />
            {error}
          </div>
        )}
      </>
    );
  }

  return null;
}
