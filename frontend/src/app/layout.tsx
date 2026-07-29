import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/react-query";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { AuthProvider } from "@/features/auth/AuthContext";
import { ToastProvider } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Task Management System",
  description: "Enterprise Task Management System",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TaskApp",
  },
};

export const viewport = {
  themeColor: "#000000",
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
                if (typeof window !== 'undefined' && document.documentElement) {
                  const setSafeAreaInsets = () => {
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
                  };
                  
                  // Run immediately
                  setSafeAreaInsets();
                  
                  // Also run on load in case values change
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', setSafeAreaInsets);
                  }
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
