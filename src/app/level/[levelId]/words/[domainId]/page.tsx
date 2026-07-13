import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, SiteHeader } from "@/components/Nav";
import { ContentLink } from "@/components/ContentLink";
import { getLevel } from "@/content/levels";
import { getDomain } from "@/content/level1";
import { domainParams } from "@/content/level1/params";

export function generateStaticParams() {
  return domainParams();
}

export default async function DomainPage({
  params,
}: {
  params: Promise<{ levelId: string; domainId: string }>;
}) {
  const { levelId, domainId } = await params;
  const level = getLevel(levelId);
  const domain = getDomain(domainId);
  if (!level?.available || !domain) notFound();

  const modes = [
    {
      href: `/level/${levelId}/words/${domainId}/anki`,
      title: "Anki",
      desc: "Карточки с интервальным повторением: KO↔RU",
    },
    {
      href: `/level/${levelId}/words/${domainId}/cloze`,
      title: "Подстановка",
      desc: "Вставьте слово в предложение",
    },
    {
      href: `/level/${levelId}/words/${domainId}/examples`,
      title: "Примеры",
      desc: "Предложения со словами области и перевод",
    },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader subtitle={level.titleRu} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Breadcrumbs
          items={[
            { href: "/", label: "Главная" },
            { href: `/level/${levelId}`, label: level.titleKo },
            { href: `/level/${levelId}/words`, label: "Слова" },
            { label: domain.titleRu },
          ]}
        />

        <h1 className="ko-text text-3xl font-bold sm:text-4xl">{domain.titleKo}</h1>
        <p className="mt-2 text-lg text-[var(--ink-soft)]">{domain.titleRu}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {modes.map((mode) => (
            <ContentLink key={mode.href} href={mode.href} className="panel rounded-2xl p-5 hover:shadow-md">
              <p className="font-display text-xl font-semibold">{mode.title}</p>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">{mode.desc}</p>
            </ContentLink>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold">Список слов</h2>
          <ul className="mt-4 divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white/60">
            {domain.words.map((word) => (
              <li key={word.id} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3">
                <span className="ko-text text-lg font-medium">{word.ko}</span>
                <span className="text-[var(--ink-soft)]">{word.ru}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
