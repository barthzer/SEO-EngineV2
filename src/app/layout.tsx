import type { Metadata } from "next";
import { Inter, DM_Sans, Space_Grotesk } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";

/** Corps de texte */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

/** Titres */
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

/** Mono (code, valeurs techniques) */
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
      className={`${inter.variable} ${dmSans.variable} ${spaceGrotesk.variable}`}
    >
      <body className="min-h-[100dvh] antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
