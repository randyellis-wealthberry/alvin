import "~/styles/globals.css";

import { type Metadata, type Viewport } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { InstallPrompt, IOSInstallInstructions } from "~/components/pwa";

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
  themeColor: "#2e026d",
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
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <InstallPrompt />
        <IOSInstallInstructions />
      </body>
    </html>
  );
}
