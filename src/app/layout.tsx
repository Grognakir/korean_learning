import type { Metadata } from "next";
import { Fraunces, Manrope, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600"],
  display: "swap",
});

const korean = Noto_Sans_KR({
  variable: "--font-ko",
  weight: ["400", "700"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "Корейский — обучение по 급ам",
  description: "Темы, грамматика и слова для изучения корейского языка",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${display.variable} ${body.variable} ${korean.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
