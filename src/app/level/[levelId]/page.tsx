import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, SectionTabs, SiteHeader } from "@/components/Nav";
import { ContentLink } from "@/components/ContentLink";
import { getLevel } from "@/content/levels";
import { grammar, topics, vocabDomains } from "@/content/level1";
import { levelParams } from "@/content/level1/params";

export function generateStaticParams() {
  return levelParams();
}

export default async function LevelPage({
  params,
}: {
  params: Promise<{ levelId: string }>;
}) {
  const { levelId } = await params;
  const level = getLevel(levelId);
  if (!level) notFound();
  if (!level.available) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="font-display text-4xl font-semibold">{level.titleRu}</h1>
          <p className="mt-4 text-[var(--ink-soft)]">Этот уровень ещё в подготовке.</p>
          <Link href="/" className="mt-8 inline-block text-[var(--accent)]">
            На главную
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader subtitle={level.titleRu} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Breadcrumbs items={[{ href: "/", label: "Главная" }, { label: level.titleKo }]} />
        <SectionTabs levelId={levelId} active="overview" />

        <section className="mb-10">
          <h1 className="font-display text-4xl font-semibold">{level.titleRu}</h1>
          <p className="mt-3 max-w-2xl text-[var(--ink-soft)]">{level.description}</p>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <Link href={`/level/${levelId}/topics`} className="panel rounded-2xl p-6 hover:shadow-md">
            <p className="text-sm font-semibold text-[var(--accent)]">Темы</p>
            <p className="font-display mt-2 text-3xl font-semibold">{topics.length}</p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">уроков (과) с подтемами и практикой</p>
          </Link>
          <Link href={`/level/${levelId}/grammar`} className="panel rounded-2xl p-6 hover:shadow-md">
            <p className="text-sm font-semibold text-[var(--accent)]">Грамматика</p>
            <p className="font-display mt-2 text-3xl font-semibold">{grammar.length}</p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">пунктов с объяснениями и упражнениями</p>
          </Link>
          <Link href={`/level/${levelId}/words`} className="panel rounded-2xl p-6 hover:shadow-md">
            <p className="text-sm font-semibold text-[var(--accent)]">Слова</p>
            <p className="font-display mt-2 text-3xl font-semibold">{vocabDomains.length}</p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">областей: Anki, подстановка, примеры</p>
          </Link>
        </div>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold">С чего начать</h2>
          <div className="mt-4 grid gap-3">
            {topics.slice(0, 3).map((topic) => (
              <ContentLink
                key={topic.id}
                href={`/level/${levelId}/topics/${topic.id}`}
                className="panel flex items-center justify-between rounded-xl px-5 py-4 hover:shadow-sm"
              >
                <div>
                  <p className="text-sm text-[var(--ink-soft)]">{topic.unit}과</p>
                  <p className="ko-text text-lg font-medium">
                    {topic.titleKo}{" "}
                    <span className="font-sans text-base text-[var(--ink-soft)]">· {topic.titleRu}</span>
                  </p>
                </div>
                <span className="text-[var(--accent)]">→</span>
              </ContentLink>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
