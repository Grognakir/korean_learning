import Link from "next/link";
import { SiteHeader } from "@/components/Nav";
import { levels } from "@/content/levels";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <section className="mb-12 max-w-2xl">
          <p className="ko-text text-sm font-medium text-[var(--accent)]">한국어 학습</p>
          <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Учите корейский по 급ам
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-[var(--ink-soft)]">
            Темы, грамматика и слова из программы 1급. Тренируйте конструкции, учите лексику как в
            Anki и закрепляйте словами в предложениях.
          </p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {levels.map((level) => {
            const card = (
              <div
                className={`panel h-full rounded-2xl p-5 transition ${
                  level.available ? "hover:-translate-y-0.5 hover:shadow-md" : "opacity-60"
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="ko-text text-2xl font-bold">{level.titleKo}</h2>
                  {!level.available && (
                    <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-[var(--ink-soft)]">
                      скоро
                    </span>
                  )}
                </div>
                <p className="mt-2 font-medium">{level.titleRu}</p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">
                  {level.description}
                </p>
              </div>
            );

            return level.available ? (
              <Link key={level.id} href={`/level/${level.id}`}>
                {card}
              </Link>
            ) : (
              <div key={level.id}>{card}</div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
