import "~/styles/globals.css";

import { type Metadata, type Viewport } from "next";
import { Geist, Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";

import { TRPCReactProvider } from "~/trpc/react";
import { ConvexClientProvider } from "~/components/convex-provider";
import { InstallPrompt, IOSInstallInstructions } from "~/components/pwa";
import { MobileNav } from "~/components/layout/mobile-nav";
import { cn } from "~/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  applicationName: "ALVIN",
  title: {
    default: "ALVIN",
    template: "%s | ALVIN",
  },
  description: "AI-powered vitality monitoring for peace of mind",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ALVIN",
  },
  formatDetection: {
    telephone: false,
  },
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
  ],
};

export const viewport: Viewport = {
  themeColor: "#1c1917", // stone-900 - matches dark mode theme
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn(geist.variable, inter.variable, "dark")}>
      <body className="bg-background text-foreground selection:bg-primary/20 selection:text-primary min-h-screen">
        <SessionProvider>
          <ConvexClientProvider>
            <TRPCReactProvider>
              <div className="relative flex min-h-screen flex-col">
                {children}
                <MobileNav />
              </div>
            </TRPCReactProvider>
          </ConvexClientProvider>
          <InstallPrompt />
          <IOSInstallInstructions />
        </SessionProvider>
      </body>
    </html>
  );
}
