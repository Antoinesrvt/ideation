import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AIProvider } from "@/context/ai-context";
export const metadata: Metadata = {
  title: "StartupCanvas AI",
  description: "AI-powered platform for startup ideation and validation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AIProvider>
            {children}
          </AIProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
