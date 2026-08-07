import type { Metadata } from "next";

import { RoutePlaceholder } from "@/components/layout";

type SessionPageProps = {
  params: Promise<{ sessionId: string }>;
};

export const metadata: Metadata = {
  title: "Учебная сессия",
};

export function generateStaticParams() {
  return [{ sessionId: "demo-session" }];
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = await params;

  return (
    <RoutePlaceholder
      actions={[{ href: "/review", label: "Перейти к повторению" }]}
      description="Здесь движок будет последовательно показывать задания и сохранять ответы."
      eyebrow="Сессия"
      title="Учебная сессия"
    >
      <p>
        Идентификатор сессии: <code>{sessionId}</code>
      </p>
    </RoutePlaceholder>
  );
}
