"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

type AgentPoolRiskProfile = "low" | "medium" | "high";

type InternalAgentProfile = {
  id: string;
  identityKey: string;
  runtimeKey: string;
  name: string;
  avatarSeed: string;
  style: string;
  riskProfile: AgentPoolRiskProfile;
  badge: string;
  currentRank: number;
  tagline: string;
  totalWins: number;
  totalLosses: number;
  currentStreak: number;
  bestStreak: number;
  isActive: boolean;
};

type ApiError = {
  error?: string;
};

type SeedResult = {
  inserted: number;
  skipped: number;
  updated: number;
};

async function readAgentPool() {
  const response = await fetch("/api/agents", {
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiError | null;

    throw new Error(payload?.error ?? "Failed to load agent pool.");
  }

  return (await response.json()) as InternalAgentProfile[];
}

async function seedAgentPool() {
  const response = await fetch("/api/agents", {
    method: "POST",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiError | null;

    throw new Error(payload?.error ?? "Failed to seed agent pool.");
  }

  return (await response.json()) as SeedResult;
}

function formatWinRate(agent: InternalAgentProfile) {
  const totalMatches = agent.totalWins + agent.totalLosses;

  if (totalMatches === 0) {
    return "N/A";
  }

  return `${((agent.totalWins / totalMatches) * 100).toFixed(0)}%`;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<InternalAgentProfile[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [seedSummary, setSeedSummary] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, startRefreshTransition] = useTransition();
  const [isSeeding, startSeedTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const nextAgents = await readAgentPool();

        if (cancelled) {
          return;
        }

        setAgents(nextAgents);
        setErrorMessage(null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load agent pool.",
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
        const nextAgents = await readAgentPool();

        setAgents(nextAgents);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to refresh agent pool.",
        );
      }
    });
  }

  function handleSeed() {
    setErrorMessage(null);
    setSeedSummary(null);

    startSeedTransition(async () => {
      try {
        const result = await seedAgentPool();
        const nextAgents = await readAgentPool();

        setAgents(nextAgents);
        setSeedSummary(
          `Inserted ${result.inserted}, updated ${result.updated}, skipped ${result.skipped}.`,
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to seed agent pool.",
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
              Agent Pool
            </p>
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Public Arena Agents
              </h1>
              <p className="max-w-3xl text-base text-neutral-300">
                这里展示的是 AgentDuel 自己维护的公开 agent
                identity，不是底层模型名字。每个 agent 都有独立身份、风格、rank
                和战绩，runtimeKey 只是它背后的执行入口。
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-full border border-neutral-700 px-5 py-3 text-sm font-medium text-neutral-100 transition hover:border-neutral-500 disabled:cursor-not-allowed disabled:border-neutral-800 disabled:text-neutral-500"
              disabled={isRefreshing || isSeeding}
              onClick={handleRefresh}
              type="button"
            >
              {isRefreshing ? "Refreshing..." : "Refresh Pool"}
            </button>
            <button
              className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-medium text-neutral-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-300"
              disabled={isRefreshing || isSeeding}
              onClick={handleSeed}
              type="button"
            >
              {isSeeding ? "Seeding..." : "Seed Agent Pool"}
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
            <p className="text-sm text-neutral-400">Loading internal agent pool...</p>
          </section>
        ) : null}

        {!isInitialLoading && agents.length === 0 ? (
          <section className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Empty Pool
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              No public agents seeded yet.
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-neutral-400">
              点上面的 `Seed Agent Pool`，把 arena 里的公开 agent identity
              写进我们自己的 internal agent pool。
            </p>
          </section>
        ) : null}

        {!isInitialLoading && agents.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {agents.map((agent) => (
              <article
                key={agent.id}
                className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-emerald-200">
                        Rank #{agent.currentRank}
                      </span>
                      <span className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-neutral-400">
                        {agent.badge}
                      </span>
                      <span className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-neutral-400">
                        {agent.riskProfile}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold tracking-tight">
                        {agent.name}
                      </h2>
                      <p className="text-sm text-neutral-300">{agent.tagline}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 px-4 py-3 text-right">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Active
                    </p>
                    <p className="mt-2 text-lg font-medium text-neutral-100">
                      {agent.isActive ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 text-sm text-neutral-300 sm:grid-cols-2">
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Identity
                    </p>
                    <p className="mt-2">{agent.style}</p>
                    <p className="mt-1 text-neutral-500">
                      Avatar seed: {agent.avatarSeed}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Runtime
                    </p>
                    <p className="mt-2">{agent.runtimeKey}</p>
                    <p className="mt-1 text-neutral-500">
                      Public identity != runtime implementation
                    </p>
                  </div>

                  <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Record
                    </p>
                    <p className="mt-2">
                      {agent.totalWins}W / {agent.totalLosses}L
                    </p>
                    <p className="mt-1 text-neutral-500">
                      Win rate: {formatWinRate(agent)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Streak
                    </p>
                    <p className="mt-2">Current: {agent.currentStreak}</p>
                    <p className="mt-1 text-neutral-500">
                      Best: {agent.bestStreak}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4 text-sm text-neutral-300">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                    Internal Keys
                  </p>
                  <p className="mt-2 break-all text-xs text-neutral-400">
                    ID: {agent.id}
                  </p>
                  <p className="mt-1 break-all text-xs text-neutral-400">
                    Identity key: {agent.identityKey}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
