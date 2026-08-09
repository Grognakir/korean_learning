import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";

import { APP_DESCRIPTION, APP_NAME, DEFAULT_LANGUAGE } from "@/constants";
import { AuthProvider } from "@/features/authentication/context/AuthContext";
import { UserMenuPlaceholder } from "@/features/authentication/components/UserMenu/UserMenuPlaceholder";
import { HeaderAuthSection } from "@/features/authentication/server/HeaderAuthSection";
import { AppShell } from "@/wrappers";
import "@/styles/reset.css";
import "@/styles/tokens.css";
import "@/styles/globals.css";
import "@/styles/utilities.css";

export const metadata: Metadata = {
  description: APP_DESCRIPTION,
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
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
        <AuthProvider user={null}>
          <AppShell
            userMenu={
              <Suspense fallback={<UserMenuPlaceholder />}>
                <HeaderAuthSection />
              </Suspense>
            }
          >
            {children}
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
