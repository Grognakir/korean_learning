import { notFound } from "next/navigation";
import { Breadcrumbs, SiteHeader } from "@/components/Nav";
import { getLevel } from "@/content/levels";
import { getDomain } from "@/content/level1";

export default async function ExamplesPage({
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
            { label: "Примеры" },
          ]}
        />
        <h1 className="font-display mb-6 text-3xl font-semibold">Примеры · {domain.titleRu}</h1>

        <div className="space-y-4">
          {domain.words.map((word) => (
            <article key={word.id} className="panel rounded-2xl p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="ko-text text-xl font-semibold">{word.ko}</h2>
                <p className="text-[var(--ink-soft)]">{word.ru}</p>
              </div>
              <ul className="mt-4 space-y-3">
                {word.examples.map((ex) => (
                  <li key={ex.ko} className="rounded-xl bg-white/70 px-4 py-3">
                    <p className="ko-text text-lg">{ex.ko}</p>
                    <p className="mt-1 text-sm text-[var(--ink-soft)]">{ex.ru}</p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
