import type { Metadata } from "next";
import type { ReactNode } from "react";

import { APP_DESCRIPTION, APP_NAME, DEFAULT_LANGUAGE } from "@/constants";
import { getServerAuthUser } from "@/features/authentication/server/getServerAuthUser";
import { AppShell, AuthBoundary } from "@/wrappers";
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

export default async function RootLayout({ children }: RootLayoutProps) {
  const user = await getServerAuthUser();

  return (
    <html lang={DEFAULT_LANGUAGE}>
      <body>
        <a className="skip-link" href="#main-content">
          Перейти к содержимому
        </a>
        <AuthBoundary user={user}>
          <AppShell user={user}>{children}</AppShell>
        </AuthBoundary>
      </body>
    </html>
  );
}
