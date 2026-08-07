import type { Metadata } from "next";

import { RoutePlaceholder } from "@/components/layout";

type ModulePageProps = {
  params: Promise<{ moduleSlug: string }>;
};

export async function generateMetadata({ params }: ModulePageProps): Promise<Metadata> {
  const { moduleSlug } = await params;

  return {
    title: `Модуль ${moduleSlug}`,
  };
}

export function generateStaticParams() {
  return [{ moduleSlug: "sample-module" }];
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { moduleSlug } = await params;

  return (
    <RoutePlaceholder
      actions={[{ href: "/training", label: "Перейти к тренировке" }]}
      description="Страница модуля объединит объяснение, темы и доступные режимы практики."
      eyebrow="Учебный модуль"
      title="Описание модуля"
    >
      <p>
        Технический идентификатор: <code>{moduleSlug}</code>
      </p>
    </RoutePlaceholder>
  );
}
