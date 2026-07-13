import { notFound } from "next/navigation";
import { Breadcrumbs, SectionTabs, SiteHeader } from "@/components/Nav";
import { ContentLink } from "@/components/ContentLink";
import { getLevel } from "@/content/levels";
import { topics } from "@/content/level1";
import { levelParams } from "@/content/level1/params";

export function generateStaticParams() {
  return levelParams();
}

export default async function TopicsPage({
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
            { label: "Темы" },
          ]}
        />
        <SectionTabs levelId={levelId} active="topics" />
        <h1 className="font-display text-3xl font-semibold">Темы 1급</h1>
        <p className="mt-2 text-[var(--ink-soft)]">16과 по программе 새인하한국어1</p>

        <div className="mt-8 grid gap-3">
          {topics.map((topic) => (
            <ContentLink
              key={topic.id}
              href={`/level/${levelId}/topics/${topic.id}`}
              className="panel rounded-2xl px-5 py-4 transition hover:shadow-md"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--accent)]">{topic.unit}과</p>
                <p className="text-sm text-[var(--ink-soft)]">
                  {topic.subtopics.length} подтемы · {topic.subtopics.flatMap((s) => s.grammarIds).length} грамматики
                </p>
              </div>
              <p className="ko-text mt-1 text-xl font-semibold">{topic.titleKo}</p>
              <p className="text-[var(--ink-soft)]">{topic.titleRu}</p>
            </ContentLink>
          ))}
        </div>
      </main>
    </div>
  );
}
