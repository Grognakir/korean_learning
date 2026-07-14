export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden>
      <div className="h-4 w-48 rounded bg-[var(--line)]" />
      <div className="h-10 w-2/3 max-w-md rounded-lg bg-[var(--line)]" />
      <div className="h-4 w-full max-w-xl rounded bg-[var(--line)]" />
      <div className="grid gap-3">
        <div className="h-20 rounded-2xl bg-[var(--line)]" />
        <div className="h-20 rounded-2xl bg-[var(--line)]" />
        <div className="h-20 rounded-2xl bg-[var(--line)]" />
      </div>
    </div>
  );
}
