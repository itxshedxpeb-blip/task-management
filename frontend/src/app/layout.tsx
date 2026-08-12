import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/react-query";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { AuthProvider } from "@/features/auth/AuthContext";
import { ToastProvider } from "@/components/ui/toast";
import { ServiceWorkerUpdate } from "@/components/pwa/ServiceWorkerUpdate";
import { PWAInstallButton } from "@/components/pwa/PWAInstallButton";
import { GlobalErrorHandlers } from "@/components/error-handling/GlobalErrorHandlers";
import { ErrorBoundary } from "@/components/error-handling/ErrorBoundary";
import { SafeAreaInsets } from "@/components/SafeAreaInsets";

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
      <body className="min-h-full flex flex-col">
        <SafeAreaInsets />
        <GlobalErrorHandlers />
        <ErrorBoundary>
          <ThemeProvider defaultTheme="light">
            <QueryProvider>
              <AuthProvider>{children}<ToastProvider /></AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
