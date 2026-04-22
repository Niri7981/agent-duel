"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

type EventPoolStatus = "candidate" | "ready" | "live" | "settled" | "archived";

type EventPoolCategory = "crypto" | "macro" | "headline" | "sports" | "other";

type EventPoolItem = {
  id: string;
  sourceKey: "polymarket";
  externalEventId: string;
  externalMarketId: string | null;
  slug: string | null;
  title: string;
  question: string;
  category: EventPoolCategory;
  marketSymbol: string;
  yesLabel: string;
  noLabel: string;
  startsAt: string | null;
  endsAt: string | null;
  durationSeconds: number;
  resolutionSource: string;
  sourceLabel: string;
  externalUrl: string | null;
  currentPrice: number | null;
  volumeUsd: number | null;
  liquidityScore: number | null;
  status: EventPoolStatus;
  playable: boolean;
  spectatorNote: string;
  stageLabel: string;
};

type ApiError = {
  error?: string;
};

type SeedResult = {
  inserted: number;
  invalid: number;
  skipped: number;
  updated: number;
};

async function readEventPool() {
  const response = await fetch("/api/events", {
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiError | null;

    throw new Error(payload?.error ?? "Failed to load event pool.");
  }

  return (await response.json()) as EventPoolItem[];
}

async function syncEventPool() {
  const response = await fetch("/api/events", {
    body: JSON.stringify({
      limit: 12,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiError | null;

    throw new Error(payload?.error ?? "Failed to sync event pool.");
  }

  return (await response.json()) as SeedResult;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "TBD";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "TBD";
  }

  return date.toLocaleString();
}

function formatNumber(value: number | null, digits = 2) {
  if (value === null) {
    return "N/A";
  }

  return value.toFixed(digits);
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventPoolItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [seedSummary, setSeedSummary] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, startRefreshTransition] = useTransition();
  const [isSyncing, startSyncTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const nextEvents = await readEventPool();

        if (cancelled) {
          return;
        }

        setEvents(nextEvents);
        setErrorMessage(null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load event pool.",
        );
      } finally {
        if (!cancelled) {
          setIsInitialLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleRefresh() {
    setErrorMessage(null);
    setSeedSummary(null);

    startRefreshTransition(async () => {
      try {
        const nextEvents = await readEventPool();

        setEvents(nextEvents);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to refresh event pool.",
        );
      }
    });
  }

  function handleSync() {
    setErrorMessage(null);
    setSeedSummary(null);

    startSyncTransition(async () => {
      try {
        const result = await syncEventPool();
        const nextEvents = await readEventPool();

        setEvents(nextEvents);
        setSeedSummary(
          `Inserted ${result.inserted}, updated ${result.updated}, skipped ${result.skipped}, invalid ${result.invalid}.`,
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to sync event pool.",
        );
      }
    });
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-400/80">
              Event Pool
            </p>
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Playable Arena Events
              </h1>
              <p className="max-w-3xl text-base text-neutral-300">
                这里展示的是当前真的能进入 AgentDuel round 的内部 event
                pool。我们不会把所有 normalize 后的候选都放出来，页面只保留
                现在适合 arena 使用的 playable events。
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-full border border-neutral-700 px-5 py-3 text-sm font-medium text-neutral-100 transition hover:border-neutral-500 disabled:cursor-not-allowed disabled:border-neutral-800 disabled:text-neutral-500"
              disabled={isRefreshing || isSyncing}
              onClick={handleRefresh}
              type="button"
            >
              {isRefreshing ? "Refreshing..." : "Refresh Pool"}
            </button>
            <button
              className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-medium text-neutral-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-300"
              disabled={isRefreshing || isSyncing}
              onClick={handleSync}
              type="button"
            >
              {isSyncing ? "Syncing..." : "Sync From Polymarket"}
            </button>
            <Link
              href="/"
              className="rounded-full border border-neutral-700 px-5 py-3 text-sm font-medium text-neutral-100 transition hover:border-neutral-500"
            >
              Back Home
            </Link>
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">
            {errorMessage}
          </div>
        ) : null}

        {seedSummary ? (
          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-200">
            {seedSummary}
          </div>
        ) : null}

        {isInitialLoading ? (
          <section className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8">
            <p className="text-sm text-neutral-400">Loading internal event pool...</p>
          </section>
        ) : null}

        {!isInitialLoading && events.length === 0 ? (
          <section className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Empty Pool
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              No playable arena events yet.
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-neutral-400">
              先点上面的 `Sync From Polymarket`，系统会从外部 source
              拉候选事件，再只把当前适合 arena 的事件放进 playable pool。
            </p>
          </section>
        ) : null}

        {!isInitialLoading && events.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {events.map((event) => (
              <article
                key={event.id}
                className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-neutral-400">
                        {event.stageLabel}
                      </span>
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-emerald-200">
                        {event.status}
                      </span>
                      <span className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-neutral-400">
                        {event.category}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold tracking-tight">
                        {event.title}
                      </h2>
                      <p className="text-sm text-neutral-300">{event.question}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 px-4 py-3 text-right">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Playable
                    </p>
                    <p className="mt-2 text-lg font-medium text-neutral-100">
                      {event.playable ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 text-sm text-neutral-300 sm:grid-cols-2">
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Source
                    </p>
                    <p className="mt-2">{event.sourceLabel}</p>
                    <p className="mt-1 text-neutral-500">{event.resolutionSource}</p>
                  </div>

                  <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Market
                    </p>
                    <p className="mt-2">{event.marketSymbol}</p>
                    <p className="mt-1 text-neutral-500">
                      {event.yesLabel} / {event.noLabel}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Timing
                    </p>
                    <p className="mt-2">Start: {formatDateTime(event.startsAt)}</p>
                    <p className="mt-1">End: {formatDateTime(event.endsAt)}</p>
                    <p className="mt-1 text-neutral-500">
                      Duration: {Math.round(event.durationSeconds / 60)} min
                    </p>
                  </div>

                  <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Signal
                    </p>
                    <p className="mt-2">
                      Price: {formatNumber(event.currentPrice, 4)}
                    </p>
                    <p className="mt-1">
                      Volume: {formatNumber(event.volumeUsd, 2)}
                    </p>
                    <p className="mt-1">
                      Liquidity: {formatNumber(event.liquidityScore, 2)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4 text-sm text-neutral-300">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                    Spectator Note
                  </p>
                  <p className="mt-2">{event.spectatorNote}</p>
                  <p className="mt-3 break-all text-xs text-neutral-500">
                    Internal ID: {event.id}
                  </p>
                  <p className="mt-1 break-all text-xs text-neutral-500">
                    External Event ID: {event.externalEventId}
                  </p>
                  {event.externalUrl ? (
                    <a
                      className="mt-3 inline-flex text-xs font-medium text-emerald-300 transition hover:text-emerald-200"
                      href={event.externalUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Open source event
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
