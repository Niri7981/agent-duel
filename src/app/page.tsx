"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type ApiError = {
  error?: string;
};

async function createRound() {
  const response = await fetch("/api/round", {
    method: "POST",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiError | null;

    throw new Error(payload?.error ?? "Failed to create duel round.");
  }
}

export default function HomePage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreating, startCreateTransition] = useTransition();

  function handleCreateRound() {
    setErrorMessage(null);

    // 首页只负责发起创建，然后把用户送到真正的 duel 页面。
    startCreateTransition(async () => {
      try {
        await createRound();
        router.push("/round");
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to create duel round.",
        );
      }
    });
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-10 px-6 py-12">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.24em] text-emerald-400/80">
            AgentDuel
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Launch a real AI agent duel with one click.
          </h1>
          <p className="max-w-3xl text-base text-neutral-300 sm:text-lg">
            Create a short-horizon market duel, let two agents choose a side,
            size their bets, and settle the result through the new backend
            lifecycle we just wired up.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Duel Format
            </p>
            <p className="mt-3 text-lg font-medium">Binary short-horizon market</p>
            <p className="mt-2 text-sm text-neutral-400">
              One question, two agents, one winner.
            </p>
          </div>
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Agent Runtime
            </p>
            <p className="mt-3 text-lg font-medium">Momentum vs Contrarian</p>
            <p className="mt-2 text-sm text-neutral-400">
              Each agent makes a visible autonomous decision.
            </p>
          </div>
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Settlement
            </p>
            <p className="mt-3 text-lg font-medium">Database-backed MVP flow</p>
            <p className="mt-2 text-sm text-neutral-400">
              Create, read, settle, and reload the same duel state.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-medium text-neutral-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-300"
            disabled={isCreating}
            onClick={handleCreateRound}
            type="button"
          >
            {isCreating ? "Creating Duel..." : "Create Live Duel"}
          </button>
          <Link
            href="/round"
            className="rounded-full border border-neutral-700 px-5 py-3 text-sm font-medium text-neutral-100 transition hover:border-neutral-500"
          >
            Open Round Screen
          </Link>
          <Link
            href="/events"
            className="rounded-full border border-neutral-700 px-5 py-3 text-sm font-medium text-neutral-100 transition hover:border-neutral-500"
          >
            Open Event Pool
          </Link>
          <Link
            href="/agents"
            className="rounded-full border border-neutral-700 px-5 py-3 text-sm font-medium text-neutral-100 transition hover:border-neutral-500"
          >
            Open Agent Pool
          </Link>
          <Link
            href="/leaderboard"
            className="rounded-full border border-neutral-700 px-5 py-3 text-sm font-medium text-neutral-100 transition hover:border-neutral-500"
          >
            Open Leaderboard
          </Link>
          <a
            href="/api/round"
            className="rounded-full border border-neutral-700 px-5 py-3 text-sm font-medium text-neutral-100 transition hover:border-neutral-500"
          >
            Round API
          </a>
        </div>

        {errorMessage ? (
          <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">
            {errorMessage}
          </div>
        ) : null}
      </div>
    </main>
  );
}
