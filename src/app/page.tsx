import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-8 px-6 py-12">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.24em] text-neutral-400">
            Agent Arena
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            MVP workspace
          </h1>
          <p className="max-w-2xl text-base text-neutral-300 sm:text-lg">
            Single-round demo shell with room for engine, agents, timeline, and
            settlement.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/round"
            className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-medium text-neutral-950 transition hover:bg-emerald-300"
          >
            Open Round Screen
          </Link>
          <a
            href="/api/round"
            className="rounded-full border border-neutral-700 px-5 py-3 text-sm font-medium text-neutral-100 transition hover:border-neutral-500"
          >
            Round API
          </a>
        </div>
      </div>
    </main>
  );
}
