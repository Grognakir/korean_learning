import Link from "next/link";

export function SiteHeader({ subtitle }: { subtitle?: string }) {
  return (
    <header className="border-b border-[var(--line)] bg-[var(--panel)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="group">
          <p className="font-display text-2xl font-semibold tracking-tight text-[var(--ink)] transition group-hover:text-[var(--accent)]">
            한글길
          </p>
          <p className="text-sm text-[var(--ink-soft)]">
            {subtitle ?? "Корейский по уровням 급"}
          </p>
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium text-[var(--ink-soft)]">
          <Link href="/level/1" className="hover:text-[var(--accent)]">
            1급
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Breadcrumbs({
  items,
}: {
  items: { href?: string; label: string }[];
}) {
  return (
    <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[var(--ink-soft)]">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden>/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-[var(--accent)]">
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--ink)]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function SectionTabs({
  levelId,
  active,
}: {
  levelId: string;
  active: "overview" | "topics" | "grammar" | "words";
}) {
  const base = `/level/${levelId}`;
  const tabs = [
    { id: "overview", href: base, label: "Обзор" },
    { id: "topics", href: `${base}/topics`, label: "Темы" },
    { id: "grammar", href: `${base}/grammar`, label: "Грамматика" },
    { id: "words", href: `${base}/words`, label: "Слова" },
  ] as const;

  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-[var(--accent)] text-white"
                : "bg-white/70 text-[var(--ink-soft)] hover:bg-white hover:text-[var(--ink)]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
