import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/react-query";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { AuthProvider } from "@/features/auth/AuthContext";
import { ToastProvider } from "@/components/ui/toast";
import { ServiceWorkerUpdate } from "@/components/pwa/ServiceWorkerUpdate";
import { PWAInstallButton } from "@/components/pwa/PWAInstallButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskFlow - Task Management System",
  description: "Enterprise-grade task management system for teams and organizations",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TaskFlow",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
  },
};

export const viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Set safe area CSS variables before React loads to prevent hydration mismatch
                try {
                  if (typeof window !== 'undefined' && document.documentElement) {
                    const setSafeAreaInsets = () => {
                      try {
                        const style = document.documentElement.style;
                        const computedStyle = getComputedStyle(document.documentElement);
                        const safeAreaTop = computedStyle.getPropertyValue('safe-area-inset-top') || '0px';
                        const safeAreaRight = computedStyle.getPropertyValue('safe-area-inset-right') || '0px';
                        const safeAreaBottom = computedStyle.getPropertyValue('safe-area-inset-bottom') || '0px';
                        const safeAreaLeft = computedStyle.getPropertyValue('safe-area-inset-left') || '0px';
                        
                        style.setProperty('--safe-area-inset-top', safeAreaTop);
                        style.setProperty('--safe-area-inset-right', safeAreaRight);
                        style.setProperty('--safe-area-inset-bottom', safeAreaBottom);
                        style.setProperty('--safe-area-inset-left', safeAreaLeft);
                      } catch (e) {
                        // Silently fail if getComputedStyle is not available
                        console.warn('Failed to set safe area insets:', e);
                      }
                    };
                    
                    // Run immediately
                    setSafeAreaInsets();
                    
                    // Also run on load in case values change
                    if (document.readyState === 'loading') {
                      document.addEventListener('DOMContentLoaded', setSafeAreaInsets);
                    }
                  }
                } catch (e) {
                  // Silently fail if script execution fails
                  console.warn('Safe area script failed:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider defaultTheme="light">
          <QueryProvider>
            <AuthProvider>{children}<ToastProvider /></AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
