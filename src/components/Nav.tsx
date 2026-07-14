import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--panel)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" prefetch className="group">
          <p className="font-display text-2xl font-semibold tracking-tight text-[var(--ink)] transition group-hover:text-[var(--accent)]">
            한글길
          </p>
          <p className="text-sm text-[var(--ink-soft)]">Корейский по уровням 급</p>
        </Link>
      </div>
    </header>
  );
}
