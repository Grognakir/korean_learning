import { notFound } from "next/navigation";
import { Breadcrumbs, SiteHeader } from "@/components/Nav";
import { AnkiSession } from "@/components/AnkiSession";
import { getLevel } from "@/content/levels";
import { getDomain } from "@/content/level1";

export default async function AnkiPage({
  params,
}: {
  params: Promise<{ levelId: string; domainId: string }>;
}) {
  const { levelId, domainId } = await params;
  const level = getLevel(levelId);
  const domain = getDomain(domainId);
  if (!level?.available || !domain) notFound();

  return (
    <div className="min-h-screen">
      <SiteHeader subtitle={level.titleRu} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Breadcrumbs
          items={[
            { href: "/", label: "Главная" },
            { href: `/level/${levelId}`, label: level.titleKo },
            { href: `/level/${levelId}/words`, label: "Слова" },
            { href: `/level/${levelId}/words/${domainId}`, label: domain.titleRu },
            { label: "Anki" },
          ]}
        />
        <h1 className="font-display mb-6 text-3xl font-semibold">Anki · {domain.titleRu}</h1>
        <AnkiSession words={domain.words} domainId={domain.id} />
      </main>
    </div>
  );
}
