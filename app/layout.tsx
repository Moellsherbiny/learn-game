import type { Metadata } from "next";
import { Alexandria } from "next/font/google";

import "./globals.css";

import { auth } from "@/auth";
import SessionProvider from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/next-theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const alexandria = Alexandria({
  subsets: ["latin", "arabic"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Learn Game",
    template: "%s | Learn Game",
  },
  description:
    "منصة تعليمية تعتمد على التلعيب لتحويل التعلم إلى مغامرة ممتعة من خلال المستويات ونقاط الخبرة والتحديات الجماعية.",
  keywords: [
    "Learn Game",
    "Gamified Learning",
    "التعلم بالتلعيب",
    "منصة تعليمية",
    "نقاط الخبرة",
    "Levels",
    "Interactive Learning",
    "Team Battles",
    "Programming Education",
  ],
  authors: [
    {
      name: "Learn Game Team",
    },
  ],
  creator: "Learn Game",
  publisher: "Learn Game",
  applicationName: "Learn Game",
  category: "education",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    siteName: "Learn Game",
    title: "Learn Game - منصة تعليمية تعتمد على التلعيب",
    description:
      "حوّل التعلم إلى مغامرة ممتعة مع المستويات ونقاط الخبرة ولوحة الصدارة والتحديات الجماعية.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Learn Game",
    description:
      "منصة تعليمية تعتمد على التلعيب لتحويل التعلم إلى مغامرة ممتعة.",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${alexandria.variable} ${alexandria.className} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider delayDuration={150}>
              {children}

              <Toaster
                position="top-right"
                richColors
                closeButton
                expand
                theme="system"
              />
            </TooltipProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}