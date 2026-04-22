"use client";

import {
  ActionTimeline,
  AgentCard,
  BankrollPanel,
  EventCard,
  RoundShell,
  SettlementResult,
} from "@/components";
import type { RoundState } from "@/lib/types/round";
import { useEffect, useState, useTransition } from "react";

type ApiError = {
  error?: string;
};

async function readRound() {
  const response = await fetch("/api/round", {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiError | null;

    throw new Error(payload?.error ?? "Failed to load duel round.");
  }

  return (await response.json()) as RoundState;
}

async function createRound() {
  const response = await fetch("/api/round", {
    method: "POST",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiError | null;

    throw new Error(payload?.error ?? "Failed to create duel round.");
  }

  return (await response.json()) as RoundState;
}

async function settleRound() {
  const response = await fetch("/api/settle", {
    method: "POST",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiError | null;

    throw new Error(payload?.error ?? "Failed to settle duel round.");
  }

  return (await response.json()) as RoundState;
}

export default function RoundPage() {
  const [round, setRound] = useState<RoundState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isCreating, startCreateTransition] = useTransition();
  const [isRefreshing, startRefreshTransition] = useTransition();
  const [isSettling, startSettleTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    // 首次进入页面时读取最新一场 duel；如果还没有，就显示空状态。
    void (async () => {
      try {
        const nextRound = await readRound();

        if (cancelled) {
          return;
        }

        setRound(nextRound);
        setErrorMessage(null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load duel round.",
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

  function handleCreateRound() {
    setErrorMessage(null);

    startCreateTransition(async () => {
      try {
        const nextRound = await createRound();

        setRound(nextRound);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to create duel round.",
        );
      }
    });
  }

  function handleRefreshRound() {
    setErrorMessage(null);

    startRefreshTransition(async () => {
      try {
        const nextRound = await readRound();

        setRound(nextRound);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to refresh duel round.",
        );
      }
    });
  }

  function handleSettleRound() {
    setErrorMessage(null);

    startSettleTransition(async () => {
      try {
        const nextRound = await settleRound();

        setRound(nextRound);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to settle duel round.",
        );
      }
    });
  }

  const showBusyState = isCreating || isRefreshing || isSettling;

  if (isInitialLoading) {
    return (
      <RoundShell>
        <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-8">
          <p className="text-sm text-neutral-400">Loading duel state...</p>
        </section>
      </RoundShell>
    );
  }

  if (!round) {
    return (
      <RoundShell>
        <section className="space-y-6 rounded-3xl border border-neutral-800 bg-neutral-900 p-8">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              No Active Duel
            </p>
            <h2 className="text-3xl font-semibold tracking-tight">
              Start the first live round.
            </h2>
            <p className="max-w-2xl text-sm text-neutral-400">
              The backend is ready. Create a duel to generate a persisted round,
              two agent actions, and a pending settlement record.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-medium text-neutral-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-300"
              disabled={isCreating}
              onClick={handleCreateRound}
              type="button"
            >
              {isCreating ? "Creating Duel..." : "Create Duel"}
            </button>
            <button
              className="rounded-full border border-neutral-700 px-5 py-3 text-sm font-medium text-neutral-100 transition hover:border-neutral-500 disabled:cursor-not-allowed disabled:border-neutral-800 disabled:text-neutral-500"
              disabled={isRefreshing}
              onClick={handleRefreshRound}
              type="button"
            >
              Refresh
            </button>
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {errorMessage}
            </div>
          ) : null}
        </section>
      </RoundShell>
    );
  }

  return (
    <RoundShell>
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-neutral-800 bg-neutral-900 px-5 py-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            Round Control
          </p>
          <p className="text-sm text-neutral-300">
            Round ID: <span className="font-mono text-neutral-100">{round.id}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-full border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-100 transition hover:border-neutral-500 disabled:cursor-not-allowed disabled:border-neutral-800 disabled:text-neutral-500"
            disabled={showBusyState}
            onClick={handleRefreshRound}
            type="button"
          >
            {isRefreshing ? "Refreshing..." : "Refresh Round"}
          </button>
          <button
            className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-medium text-neutral-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-300"
            disabled={showBusyState || round.status === "settled"}
            onClick={handleSettleRound}
            type="button"
          >
            {isSettling
              ? "Settling..."
              : round.status === "settled"
                ? "Already Settled"
                : "Settle Duel"}
          </button>
        </div>
      </section>

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <section className="space-y-6">
          <EventCard event={round.event} />
          <div className="grid gap-4 md:grid-cols-2">
            {round.agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
          <ActionTimeline actions={round.actions} />
        </section>

        <aside className="space-y-6">
          <BankrollPanel balances={round.balances} />
          <SettlementResult settlement={round.settlement} />
        </aside>
      </div>
    </RoundShell>
  );
}
