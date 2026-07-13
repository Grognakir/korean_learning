import { notFound } from "next/navigation";
import { Breadcrumbs, SiteHeader } from "@/components/Nav";
import { PracticeQuiz } from "@/components/PracticeQuiz";
import { getLevel } from "@/content/levels";
import { getGrammar, getGrammarExercises } from "@/content/level1";

export default async function GrammarPracticePage({
  params,
}: {
  params: Promise<{ levelId: string; grammarId: string }>;
}) {
  const { levelId, grammarId } = await params;
  const level = getLevel(levelId);
  const point = getGrammar(grammarId);
  if (!level?.available || !point) notFound();

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
            { href: `/level/${levelId}/grammar/${grammarId}`, label: point.titleRu },
            { label: "Тренировка" },
          ]}
        />
        <h1 className="font-display mb-2 text-3xl font-semibold">Тренировка</h1>
        <p className="ko-text mb-6 text-[var(--accent)]">{point.form}</p>
        <PracticeQuiz exercises={exercises} title={point.titleRu} studiedKey={{ kind: "studiedGrammar", id: grammarId }} />
      </main>
    </div>
  );
}
