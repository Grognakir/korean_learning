import type { Metadata } from "next";
import type { ReactNode } from "react";

import { APP_DESCRIPTION, APP_NAME, DEFAULT_LANGUAGE } from "@/constants";
import "@/styles/reset.css";
import "@/styles/tokens.css";
import "@/styles/globals.css";
import "@/styles/utilities.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang={DEFAULT_LANGUAGE}>
      <body>
        <a className="skip-link" href="#main-content">
          Перейти к содержимому
        </a>
        {children}
      </body>
    </html>
  );
}
