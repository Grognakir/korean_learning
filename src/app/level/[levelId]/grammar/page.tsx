import { notFound } from "next/navigation";
import { Breadcrumbs, SectionTabs, SiteHeader } from "@/components/Nav";
import { ContentLink } from "@/components/ContentLink";
import { getLevel } from "@/content/levels";
import { grammar, getTopic } from "@/content/level1";
import { levelParams } from "@/content/level1/params";

export function generateStaticParams() {
  return levelParams();
}

export default async function GrammarListPage({
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
            { label: "Грамматика" },
          ]}
        />
        <SectionTabs levelId={levelId} active="grammar" />
        <h1 className="font-display text-3xl font-semibold">Грамматика 1급</h1>
        <p className="mt-2 text-[var(--ink-soft)]">{grammar.length} пунктов с объяснениями и практикой</p>

        <div className="mt-8 grid gap-3">
          {grammar.map((g) => {
            const topic = getTopic(g.topicId);
            return (
              <ContentLink
                key={g.id}
                href={`/level/${levelId}/grammar/${g.id}`}
                className="panel rounded-2xl px-5 py-4 hover:shadow-md"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="ko-text text-xl font-semibold text-[var(--accent)]">{g.form}</p>
                  {topic && (
                    <p className="text-sm text-[var(--ink-soft)]">
                      {topic.unit}과 · {topic.titleRu}
                    </p>
                  )}
                </div>
                <p className="mt-1 font-medium">{g.titleRu}</p>
              </ContentLink>
            );
          })}
        </div>
      </main>
    </div>
  );
}
