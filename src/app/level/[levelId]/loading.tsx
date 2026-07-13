export default function LevelLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="border-b border-[var(--line)] bg-[var(--panel)] px-4 py-4 sm:px-6">
        <div className="mx-auto h-10 max-w-5xl rounded-lg bg-white/60" />
      </div>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 h-4 w-48 rounded bg-white/60" />
        <div className="mb-8 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-full bg-white/60" />
          ))}
        </div>
        <div className="h-10 w-2/3 max-w-md rounded bg-white/60" />
        <div className="mt-8 grid gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/50" />
          ))}
        </div>
      </main>
    </div>
  );
}
