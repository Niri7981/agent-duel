import { ArenaEvent } from "@/lib/types/event";

export function EventCard({ event }: { event: ArenaEvent }) {
  return (
    <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
        Event
      </p>
      <h2 className="mt-3 text-2xl font-semibold">{event.question}</h2>
      <p className="mt-2 text-sm text-neutral-400">
        Resolution source: {event.resolutionSource}
      </p>
    </section>
  );
}
