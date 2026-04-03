import "./globals.css";
import type { Metadata } from "next";
import { Manrope, Oswald, Roboto_Slab } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "../components/providers/query-provider";
import { TooltipProvider } from "../components/ui/tooltip";
import { cn } from "../lib/utils";

const robotoSlabHeading = Roboto_Slab({
  subsets: ["latin"],
  variable: "--font-heading",
});

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-brand",
});

export const metadata: Metadata = {
  title: "Formex",
  description: "Genarate diploma formats in minutes.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("font-sans", manrope.variable, robotoSlabHeading.variable)}
    >
      <body
        className={`${manrope.variable} ${robotoSlabHeading.variable} ${oswald.variable} border-border bg-background antialiased`}
      >
        <QueryProvider>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
