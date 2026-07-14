import Link from "next/link";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { isLevelId, levels, topicsByLevel } from "@/content/levels";

export async function generateStaticParams() {
  return levels.filter((level) => level.available).map((level) => ({ levelId: level.id }));
}

export default async function LevelPage({
  params,
}: {
  params: Promise<{ levelId: string }>;
}) {
  "use cache";
  cacheLife("max");

  const { levelId } = await params;

  if (!isLevelId(levelId)) {
    notFound();
  }

  const level = levels.find((item) => item.id === levelId);
  if (!level || !level.available) {
    notFound();
  }

  const topics = topicsByLevel[levelId];

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <section className="mb-10 max-w-2xl">
        <Link
          href="/"
          prefetch
          className="text-sm font-medium text-[var(--ink-soft)] transition hover:text-[var(--accent)]"
        >
          ← На главную
        </Link>
        <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          <span className="ko-text">{level.titleKo}</span>
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-[var(--ink-soft)]">{level.description}</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {topics.map((topic) => {
          const card = (
            <div
              className={`panel h-full rounded-2xl p-5 ${topic.available ? "" : "opacity-60"}`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="ko-text text-2xl font-bold">{topic.titleKo}</h2>
                {!topic.available && (
                  <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-[var(--ink-soft)]">
                    скоро
                  </span>
                )}
              </div>
              <p className="mt-2 font-medium">{topic.titleRu}</p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">{topic.description}</p>
            </div>
          );

          if (!topic.available) {
            return <div key={topic.slug}>{card}</div>;
          }

          return (
            <Link
              key={topic.slug}
              href={`/levels/${levelId}/${topic.slug}`}
              prefetch
              className="rounded-2xl transition [&>.panel]:hover:border-[var(--accent)] [&>.panel]:hover:shadow-[0_10px_28px_rgba(20,38,31,0.12)]"
            >
              {card}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
