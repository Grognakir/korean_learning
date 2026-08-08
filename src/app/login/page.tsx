import type { Metadata } from "next";

import { RoutePlaceholder } from "@/components/layout";

export const metadata: Metadata = {
  title: "Вход",
  description: "Вход в аккаунт появится после подключения защищённого хранилища.",
};

export default function LoginPage() {
  return (
    <RoutePlaceholder
      actions={[{ href: "/", label: "Продолжить как гость" }]}
      description="Авторизация будет подключена после настройки защищённого хранилища и политик доступа."
      title="Вход"
    />
  );
}
