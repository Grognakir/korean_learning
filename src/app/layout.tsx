import type { Metadata } from "next";
import { ViewTransition } from "react";
import { Fraunces, Manrope, Noto_Sans_KR } from "next/font/google";
import { SiteHeader } from "@/components/Nav";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

const korean = Noto_Sans_KR({
  variable: "--font-ko",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Корейский — обучение по 급ам",
  description: "Уровни 급 для изучения корейского языка",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${display.variable} ${body.variable} ${korean.variable} h-full`}>
      <body className="min-h-full antialiased">
        <SiteHeader />
        <ViewTransition enter="auto" exit="auto" default="none">
          {children}
        </ViewTransition>
      </body>
    </html>
  );
}
