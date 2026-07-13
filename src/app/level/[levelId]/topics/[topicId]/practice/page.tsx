import { notFound } from "next/navigation";
import { Breadcrumbs, SiteHeader } from "@/components/Nav";
import { PracticeQuiz } from "@/components/PracticeQuiz";
import { getLevel } from "@/content/levels";
import { getTopic, getTopicExercises, getDomainClozes } from "@/content/level1";

export default async function TopicPracticePage({
  params,
}: {
  params: Promise<{ levelId: string; topicId: string }>;
}) {
  const { levelId, topicId } = await params;
  const level = getLevel(levelId);
  const topic = getTopic(topicId);
  if (!level?.available || !topic) notFound();

  const grammarEx = getTopicExercises(topicId);
  const vocabEx = topic.vocabDomainIds.flatMap((id) => getDomainClozes(id)).slice(0, 8);
  const exercises = [
    ...grammarEx,
    ...vocabEx.map((e) => ({ ...e, kind: "cloze" as const })),
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader subtitle={level.titleRu} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Breadcrumbs
          items={[
            { href: "/", label: "Главная" },
            { href: `/level/${levelId}`, label: level.titleKo },
            { href: `/level/${levelId}/topics`, label: "Темы" },
            { href: `/level/${levelId}/topics/${topicId}`, label: topic.titleRu },
            { label: "Тренировка" },
          ]}
        />
        <h1 className="font-display mb-6 text-3xl font-semibold">Тренировка: {topic.titleRu}</h1>
        <PracticeQuiz exercises={exercises} title={`${topic.unit}과 · ${topic.titleKo}`} />
      </main>
    </div>
  );
}
