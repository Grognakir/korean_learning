import Link from "next/link";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { isLevelId, levels, topicsByLevel } from "@/content/levels";

export async function generateStaticParams() {
  return levels
    .filter((level) => level.available)
    .flatMap((level) =>
      topicsByLevel[level.id]
        .filter((topic) => topic.available)
        .map((topic) => ({ levelId: level.id, topicSlug: topic.slug })),
    );
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ levelId: string; topicSlug: string }>;
}) {
  "use cache";
  cacheLife("max");

  const { levelId, topicSlug } = await params;

  if (!isLevelId(levelId)) {
    notFound();
  }

  const level = levels.find((item) => item.id === levelId);
  if (!level || !level.available) {
    notFound();
  }

  const topic = topicsByLevel[levelId].find((item) => item.slug === topicSlug);
  if (!topic || !topic.available) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <section className="mb-10 max-w-2xl">
        <Link
          href={`/levels/${levelId}`}
          prefetch
          className="text-sm font-medium text-[var(--ink-soft)] transition hover:text-[var(--accent)]"
        >
          ← {level.titleKo}
        </Link>
        <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          <span className="ko-text">{topic.titleKo}</span>
        </h1>
        <p className="mt-3 text-lg font-medium">{topic.titleRu}</p>
        <p className="mt-3 text-base leading-relaxed text-[var(--ink-soft)]">{topic.description}</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="panel rounded-2xl p-5">
          <h2 className="font-display text-xl font-semibold">Задания</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">скоро</p>
        </section>
        <section className="panel rounded-2xl p-5">
          <h2 className="font-display text-xl font-semibold">Игра слов</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">скоро</p>
        </section>
      </div>
    </main>
  );
}
