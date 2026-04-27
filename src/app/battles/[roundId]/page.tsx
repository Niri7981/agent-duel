import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  ChevronLeft,
  ExternalLink,
  Fingerprint,
  ShieldCheck,
  Trophy,
  User,
  Zap,
} from "lucide-react";

import { getAgentPoolEntryByIdentityKey } from "@/lib/server/agents/get-agent-pool";
import { getBattleAnchor } from "@/lib/server/battles/get-battle-anchor";
import { getBattleProof } from "@/lib/server/battles/get-battle-proof";
import { getBattleRecord } from "@/lib/server/battles/get-battle-record";

function formatUsd(value: number | null) {
  if (value == null) {
    return "Pending";
  }

  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(value);
}

function formatSide(side: "yes" | "no" | null) {
  return side ? side.toUpperCase() : "Pending";
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return "Pending";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatRankDelta(delta: number) {
  if (delta > 0) {
    return `+${delta}`;
  }

  if (delta < 0) {
    return `${delta}`;
  }

  return "0";
}

function formatHash(value?: string | null) {
  if (!value) {
    return "Pending";
  }

  if (value.length <= 28) {
    return value;
  }

  return `${value.slice(0, 14)}...${value.slice(-10)}`;
}

function resultLabel(params: {
  hasWinner: boolean;
  isWinner: boolean;
  settled: boolean;
}) {
  if (!params.settled) {
    return "Combatant";
  }

  if (!params.hasWinner) {
    return "Draw";
  }

  return params.isWinner ? "Victor" : "Defeated";
}

function participantAccent(agentId: string) {
  return agentId.includes("momentum") ? "#ff1f2d" : "#39ff14";
}

export default async function BattleDetailPage({
  params,
}: {
  params: Promise<{ roundId: string }>;
}) {
  const { roundId } = await params;
  const [battle, proof, anchor] = await Promise.all([
    getBattleRecord(roundId),
    getBattleProof(roundId),
    getBattleAnchor(roundId),
  ]);

  if (!battle) {
    notFound();
  }

  const profileKeys = [
    ...new Set(
      battle.participants.map((participant) => participant.agentId).concat(
        proof?.reputationEffects.map((effect) => effect.identityKey) ?? [],
      ),
    ),
  ];

  const profiles = await Promise.all(
    profileKeys.map(async (identityKey) => {
      const profile = await getAgentPoolEntryByIdentityKey(identityKey);
      return [identityKey, profile] as const;
    }),
  );

  const profileIdByIdentityKey = new Map(
    profiles.flatMap(([identityKey, profile]) =>
      profile ? ([[identityKey, profile.id]] as const) : [],
    ),
  );

  const winnerProfileId = battle.winningAgentId
    ? profileIdByIdentityKey.get(battle.winningAgentId) ?? null
    : null;
  const isSettled = battle.roundStatus === "settled";
  const proofHash = anchor?.proofHash ?? null;
  const isAnchored = Boolean(anchor?.onchainSignature);
  const verificationStatus = anchor?.verificationStatus ?? "pending";
  const isVerified = anchor?.verified === true;
  const verificationTone = isVerified
    ? "#39ff14"
    : verificationStatus === "mismatch"
      ? "#ff1f2d"
      : "#ffb000";
  const verificationLabel = isVerified
    ? "PDA Verified"
    : verificationStatus === "mismatch"
      ? "PDA Mismatch"
      : verificationStatus === "missing"
        ? "PDA Missing"
        : "Verification Pending";

  return (
    <main className="min-h-screen bg-[#fcee09] text-black">
      <div className="acid-grid-overlay fixed inset-0" />

      <div className="relative mx-auto flex min-h-screen max-w-[1500px] flex-col gap-6 px-4 py-6 md:px-8">
        <header className="industrial-clip border-[6px] border-black bg-[#050505] p-5 text-[#fcee09]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-[4px] border-[#fcee09] pb-4">
            <Link
              href="/round"
              className="industrial-clip-sm inline-flex items-center gap-2 border-[3px] border-[#fcee09] px-4 py-3 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#fcee09]"
            >
              <ChevronLeft className="h-4 w-4" />
              Round
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge label={isSettled ? "Proof Sealed" : "Battle Live"} tone={isSettled ? "#39ff14" : "#ffb000"} />
              <StatusBadge label={proof ? `V${proof.proofVersion}` : "Proof Pending"} tone="#00eaff" />
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="inline-flex border-2 border-[#fcee09] px-3 py-1 font-mono text-[9px] font-black uppercase tracking-[0.24em]">
                Inspect Proof
              </div>
              <h1 className="mt-4 max-w-5xl font-black uppercase italic leading-none text-[clamp(38px,7vw,104px)]">
                {battle.question}
              </h1>
            </div>
            <div className="border-[4px] border-[#fcee09] bg-[#fcee09] px-5 py-4 text-black">
              <div className="font-mono text-[9px] font-black uppercase tracking-[0.22em]">
                Winner
              </div>
              <div className="mt-1 font-black uppercase italic leading-none text-4xl">
                {battle.winningAgentName ?? "Pending"}
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <section className="industrial-clip border-[6px] border-black bg-[#fcee09] p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b-[4px] border-black pb-3">
                <h2 className="font-black uppercase italic leading-none text-4xl">
                  Battle Record
                </h2>
                <div className="font-mono text-[10px] font-black uppercase tracking-[0.2em]">
                  {battle.marketSymbol} / {formatTimestamp(battle.createdAt)}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {battle.participants.map((participant) => {
                  const profileId = profileIdByIdentityKey.get(participant.agentId) ?? null;
                  const accent = participantAccent(participant.agentId);
                  const statusLabel = resultLabel({
                    hasWinner: battle.winningAgentId != null,
                    isWinner: participant.isWinner,
                    settled: isSettled,
                  });

                  return (
                    <article
                      key={participant.agentId}
                      className="industrial-clip-sm border-[5px] bg-[#050505] p-4 text-white"
                      style={{ borderColor: accent }}
                    >
                      <div className="flex items-start justify-between gap-4 border-b-[3px] border-[#202326] pb-4">
                        <div>
                          <div className="font-mono text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: accent }}>
                            {statusLabel}
                          </div>
                          {profileId ? (
                            <Link href={`/agents/${profileId}`} className="mt-2 block">
                              <h3 className="font-black uppercase italic leading-none text-4xl">
                                {participant.name}
                              </h3>
                            </Link>
                          ) : (
                            <h3 className="mt-2 font-black uppercase italic leading-none text-4xl">
                              {participant.name}
                            </h3>
                          )}
                        </div>
                        {participant.isWinner && isSettled ? (
                          <Trophy className="h-10 w-10" style={{ color: accent }} />
                        ) : null}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <ProofTile label="Decision" value={formatSide(participant.side)} tone={participant.side === "yes" ? "#39ff14" : "#ff1f2d"} />
                        <ProofTile label="Exposure" value={formatUsd(participant.sizeUsd)} tone="#fcee09" />
                        <ProofTile label="Final" value={formatUsd(participant.finalBalance)} tone="#00eaff" />
                        <ProofTile label="PnL" value={formatUsd(participant.pnlUsd)} tone={participant.pnlUsd >= 0 ? "#39ff14" : "#ff1f2d"} />
                      </div>

                      <div className="mt-4 border-[3px] border-[#202326] bg-[#111111] p-4">
                        <div className="font-mono text-[8px] font-black uppercase tracking-[0.2em] text-neutral-400">
                          Rationale
                        </div>
                        <p className="mt-2 line-clamp-4 text-sm font-bold uppercase leading-relaxed text-white">
                          {participant.reason ?? "No recorded reason yet."}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="industrial-clip border-[6px] border-black bg-[#050505] p-5 text-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-[4px] border-[#fcee09] pb-4">
                <div>
                  <div className="inline-flex items-center gap-2 border-2 border-[#fcee09] px-3 py-1 font-mono text-[9px] font-black uppercase tracking-[0.24em] text-[#fcee09]">
                    <Zap className="h-3.5 w-3.5" />
                    Reputation Impact
                  </div>
                  <h2 className="mt-3 font-black uppercase italic leading-none text-4xl text-[#fcee09]">
                    Identity Movement
                  </h2>
                </div>
                {!proof ? (
                  <span className="border-[3px] border-[#ffb000] px-3 py-2 font-mono text-[9px] font-black uppercase tracking-[0.2em] text-[#ffb000]">
                    Pending Verification
                  </span>
                ) : null}
              </div>

              {!proof ? (
                <div className="mt-5 border-[4px] border-[#202326] bg-[#111111] p-8 text-center font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#ffb000]">
                  Proof snapshot will be generated after settlement.
                </div>
              ) : (
                <div className="mt-5 grid gap-3">
                  {proof.reputationEffects.map((effect) => {
                    const profileId = profileIdByIdentityKey.get(effect.identityKey) ?? null;
                    const isWin = effect.result === "win";
                    const tone = isWin ? "#39ff14" : "#ff1f2d";

                    return (
                      <article
                        key={effect.identityKey}
                        className="grid gap-4 border-[4px] border-[#202326] bg-[#111111] p-4 md:grid-cols-[1fr_auto]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center border-[3px] border-black bg-[#fcee09] text-black">
                            <Activity className="h-7 w-7" />
                          </div>
                          <div>
                            {profileId ? (
                              <Link href={`/agents/${profileId}`} className="font-black uppercase italic text-xl" style={{ color: tone }}>
                                {effect.name}
                              </Link>
                            ) : (
                              <p className="font-black uppercase italic text-xl" style={{ color: tone }}>
                                {effect.name}
                              </p>
                            )}
                            <p className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">
                              ID: {effect.identityKey}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 md:min-w-[330px]">
                          <ProofTile label="Rank" value={`#${effect.rankAfter}`} tone={tone} />
                          <ProofTile label="Move" value={formatRankDelta(effect.rankDelta)} tone={tone} />
                          <ProofTile label="Streak" value={`${effect.streakAfter}`} tone="#ffb000" />
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <article className="industrial-clip sticky top-6 border-[6px] border-black bg-[#050505] p-5 text-white">
              <div className="inline-flex items-center gap-2 border-2 border-[#ffb000] px-3 py-1 font-mono text-[9px] font-black uppercase tracking-[0.24em] text-[#ffb000]">
                <Fingerprint className="h-3.5 w-3.5" />
                Onchain Proof Module
              </div>
              <h2 className="mt-3 font-black uppercase italic leading-none text-5xl text-[#fcee09]">
                {proof ? verificationLabel : "Awaiting Proof"}
              </h2>

              <div className="mt-5 grid gap-3">
                <ProofTile label="Round ID" value={battle.roundId} tone="#fcee09" />
                <ProofTile label="Proof Hash" value={formatHash(proofHash)} tone="#ffb000" />
                <ProofTile label="Hash Mode" value={proof ? "SHA-256 / CANONICAL JSON" : "Pending"} tone="#00eaff" />
                <ProofTile label="Verify" value={verificationLabel} tone={verificationTone} />
                <ProofTile label="Network" value={(anchor?.network ?? "localnet").toUpperCase()} tone="#39ff14" />
                <ProofTile
                  label="Local Tx"
                  value={formatHash(anchor?.onchainSignature)}
                  tone={isAnchored ? "#39ff14" : "#ffb000"}
                />
                <ProofTile
                  label="Proof PDA"
                  value={formatHash(anchor?.onchainProofAddress)}
                  tone={isAnchored ? "#39ff14" : "#ffb000"}
                />
                <ProofTile
                  label="Slot"
                  value={anchor?.slot != null ? anchor.slot.toString() : "Pending"}
                  tone="#00eaff"
                />
                <ProofTile
                  label="Anchored At"
                  value={formatTimestamp(anchor?.anchoredAt ?? null)}
                  tone="#ffffff"
                />
              </div>

              {anchor?.verificationError ? (
                <div className="mt-4 border-[3px] border-[#ff1f2d] bg-[#ff1f2d] p-3 font-mono text-[9px] font-black uppercase tracking-[0.18em] text-black">
                  {anchor.verificationError}
                </div>
              ) : null}

              <div className="mt-5 grid gap-3">
                {anchor?.explorerUrl ? (
                  <Link
                    href={anchor.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="industrial-clip-sm flex items-center justify-center gap-2 border-[3px] border-[#39ff14] bg-[#39ff14] px-4 py-3 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-black"
                  >
                    View On Solana Explorer
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="industrial-clip-sm flex items-center justify-center gap-2 border-[3px] border-[#ffb000] bg-[#111111] px-4 py-3 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#ffb000]">
                    Awaiting Localnet Anchor
                  </span>
                )}
                <Link
                  href={`/api/battles/${battle.roundId}`}
                  className="industrial-clip-sm flex items-center justify-center gap-2 border-[3px] border-[#fcee09] bg-[#fcee09] px-4 py-3 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-black"
                >
                  Raw Record
                  <ExternalLink className="h-4 w-4" />
                </Link>
                <Link
                  href={`/api/battles/${battle.roundId}/proof`}
                  className="industrial-clip-sm flex items-center justify-center gap-2 border-[3px] border-[#00eaff] bg-[#00eaff] px-4 py-3 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-black"
                >
                  Proof Payload
                  <ExternalLink className="h-4 w-4" />
                </Link>
                {winnerProfileId ? (
                  <Link
                    href={`/agents/${winnerProfileId}`}
                    className="industrial-clip-sm flex items-center justify-center gap-2 border-[3px] border-[#39ff14] bg-[#39ff14] px-4 py-3 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-black"
                  >
                    <User className="h-4 w-4" />
                    Victor Profile
                  </Link>
                ) : null}
              </div>
            </article>
          </aside>
        </section>
      </div>
    </main>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: string }) {
  return (
    <div
      className="inline-flex items-center gap-2 border-[3px] px-3 py-2 font-mono text-[10px] font-black uppercase tracking-[0.2em]"
      style={{ borderColor: tone, color: tone }}
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      {label}
    </div>
  );
}

function ProofTile({
  label,
  tone,
  value,
}: {
  label: string;
  tone: string;
  value: string;
}) {
  return (
    <div className="min-w-0 border-[3px] border-[#202326] bg-[#111111] p-3">
      <div className="font-mono text-[8px] font-black uppercase tracking-[0.2em] text-neutral-500">
        {label}
      </div>
      <div className="mt-1 break-all font-black uppercase italic leading-tight" style={{ color: tone }}>
        {value}
      </div>
    </div>
  );
}
