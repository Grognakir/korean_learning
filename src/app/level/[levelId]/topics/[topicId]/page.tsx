import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, SiteHeader } from "@/components/Nav";
import { ContentLink } from "@/components/ContentLink";
import { getLevel } from "@/content/levels";
import { getGrammar, getTopic, vocabDomains } from "@/content/level1";
import { topicParams } from "@/content/level1/params";

export function generateStaticParams() {
  return topicParams();
}

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ levelId: string; topicId: string }>;
}) {
  const { levelId, topicId } = await params;
  const level = getLevel(levelId);
  const topic = getTopic(topicId);
  if (!level?.available || !topic) notFound();

  const domains = vocabDomains.filter((d) => topic.vocabDomainIds.includes(d.id));

  return (
    <div className="min-h-screen">
      <SiteHeader subtitle={level.titleRu} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Breadcrumbs
          items={[
            { href: "/", label: "Главная" },
            { href: `/level/${levelId}`, label: level.titleKo },
            { href: `/level/${levelId}/topics`, label: "Темы" },
            { label: topic.titleRu },
          ]}
        />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[var(--accent)]">{topic.unit}과</p>
            <h1 className="ko-text mt-1 text-3xl font-bold sm:text-4xl">{topic.titleKo}</h1>
            <p className="mt-2 text-lg text-[var(--ink-soft)]">{topic.titleRu}</p>
          </div>
          <Link
            href={`/level/${levelId}/topics/${topicId}/practice`}
            className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Тренировать тему
          </Link>
        </div>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold">Подтемы</h2>
          <div className="mt-4 grid gap-4">
            {topic.subtopics.map((sub) => (
              <div key={sub.id} className="panel rounded-2xl p-5">
                <p className="ko-text text-lg font-semibold">{sub.titleKo}</p>
                <p className="text-[var(--ink-soft)]">{sub.titleRu}</p>
                <ul className="mt-4 space-y-2">
                  {sub.grammarIds.map((gid) => {
                    const g = getGrammar(gid);
                    if (!g) return null;
                    return (
                      <li key={gid}>
                        <ContentLink
                          href={`/level/${levelId}/grammar/${gid}`}
                          className="flex flex-wrap items-baseline gap-2 rounded-lg px-2 py-1.5 hover:bg-white/70"
                        >
                          <span className="ko-text font-medium text-[var(--accent)]">{g.form}</span>
                          <span className="text-sm text-[var(--ink-soft)]">{g.titleRu}</span>
                        </ContentLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {domains.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-2xl font-semibold">Связанные слова</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {domains.map((d) => (
                <ContentLink
                  key={d.id}
                  href={`/level/${levelId}/words/${d.id}`}
                  className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium hover:bg-white"
                >
                  {d.titleRu}
                </ContentLink>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
