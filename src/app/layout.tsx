import type { Metadata } from "next";
import { Instrument_Sans, Manrope, Space_Grotesk } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AWI Foundation",
  description: "Design system foundation for AWI projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      data-theme="light"
      className={`${instrumentSans.variable} ${manrope.variable} ${spaceGrotesk.variable}`}
    >
      <body className="min-h-[100dvh] antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
