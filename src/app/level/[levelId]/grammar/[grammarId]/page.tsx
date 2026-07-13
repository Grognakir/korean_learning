import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, SiteHeader } from "@/components/Nav";
import { getLevel } from "@/content/levels";
import { getGrammar, getGrammarExercises, getTopic } from "@/content/level1";

export default async function GrammarDetailPage({
  params,
}: {
  params: Promise<{ levelId: string; grammarId: string }>;
}) {
  const { levelId, grammarId } = await params;
  const level = getLevel(levelId);
  const point = getGrammar(grammarId);
  if (!level?.available || !point) notFound();
  const topic = getTopic(point.topicId);
  const exercises = getGrammarExercises(grammarId);

  return (
    <div className="min-h-screen">
      <SiteHeader subtitle={level.titleRu} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Breadcrumbs
          items={[
            { href: "/", label: "Главная" },
            { href: `/level/${levelId}`, label: level.titleKo },
            { href: `/level/${levelId}/grammar`, label: "Грамматика" },
            { label: point.titleRu },
          ]}
        />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="ko-text text-3xl font-bold text-[var(--accent)] sm:text-4xl">{point.form}</p>
            <h1 className="font-display mt-2 text-2xl font-semibold">{point.titleRu}</h1>
            {topic && (
              <Link
                href={`/level/${levelId}/topics/${topic.id}`}
                className="mt-2 inline-block text-sm text-[var(--ink-soft)] hover:text-[var(--accent)]"
              >
                Тема: {topic.unit}과 · {topic.titleRu}
              </Link>
            )}
          </div>
          {exercises.length > 0 && (
            <Link
              href={`/level/${levelId}/grammar/${grammarId}/practice`}
              className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Тренировать
            </Link>
          )}
        </div>

        <section className="panel mt-8 rounded-2xl p-6">
          <h2 className="font-display text-xl font-semibold">Объяснение</h2>
          <p className="mt-3 leading-relaxed text-[var(--ink-soft)]">{point.explanation}</p>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-xl font-semibold">Примеры</h2>
          <ul className="mt-4 space-y-3">
            {point.examples.map((ex) => (
              <li key={ex.ko} className="panel rounded-xl px-4 py-3">
                <p className="ko-text text-lg font-medium">{ex.ko}</p>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">{ex.ru}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
