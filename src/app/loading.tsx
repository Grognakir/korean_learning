import { PageSkeleton } from "@/components/PageSkeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <PageSkeleton />
    </main>
  );
}
