import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, SectionTabs, SiteHeader } from "@/components/Nav";
import { getLevel } from "@/content/levels";
import { vocabDomains } from "@/content/level1";

export default async function WordsPage({
  params,
}: {
  params: Promise<{ levelId: string }>;
}) {
  const { levelId } = await params;
  const level = getLevel(levelId);
  if (!level?.available) notFound();

  return (
    <div className="min-h-screen">
      <SiteHeader subtitle={level.titleRu} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Breadcrumbs
          items={[
            { href: "/", label: "Главная" },
            { href: `/level/${levelId}`, label: level.titleKo },
            { label: "Слова" },
          ]}
        />
        <SectionTabs levelId={levelId} active="words" />
        <h1 className="font-display text-3xl font-semibold">Словарные области</h1>
        <p className="mt-2 text-[var(--ink-soft)]">
          Выберите область: Anki-карточки, подстановка в предложения и примеры
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {vocabDomains.map((domain) => (
            <Link
              key={domain.id}
              href={`/level/${levelId}/words/${domain.id}`}
              className="panel rounded-2xl p-5 hover:shadow-md"
            >
              <p className="ko-text text-xl font-semibold">{domain.titleKo}</p>
              <p className="mt-1 font-medium">{domain.titleRu}</p>
              <p className="mt-3 text-sm text-[var(--ink-soft)]">{domain.words.length} слов</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
