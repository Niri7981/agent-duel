"use client";

import { motion } from "framer-motion";
import type { LandingEvent } from "@/lib/mocks/landing-demo-data";
import {
  formatLandingBrain,
  type LandingAgent,
} from "@/lib/landing/use-landing-agents";
import { ArrowRight, DatabaseZap, LockKeyhole, ShieldCheck, Swords, Trophy } from "lucide-react";

interface BattlePreviewSectionProps {
  errorMessage: string | null;
  isLoadingAgents: boolean;
  selectedEvent: LandingEvent;
  selectedAgents: LandingAgent[];
  onEnterArena: () => void;
  isCreating: boolean;
}

export function BattlePreviewSection({
  errorMessage,
  isCreating,
  isLoadingAgents,
  onEnterArena,
  selectedAgents,
  selectedEvent,
}: BattlePreviewSectionProps) {
  const agentA = selectedAgents[0] ?? null;
  const agentB = selectedAgents[1] ?? null;
  const canStart = agentA != null && agentB != null && !isLoadingAgents;

  return (
    <section id="battle" className="relative min-h-screen overflow-hidden bg-[#fcee09] py-24 text-black md:py-28">
      <div className="absolute inset-0 bg-[linear-gradient(145deg,#fcee09_0%,#fcee09_52%,#d8c900_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(90deg,rgba(0,0,0,.18)_1px,transparent_1px),linear-gradient(rgba(0,0,0,.12)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="absolute left-[-8%] top-20 h-36 w-[54%] -skew-x-12 border-y-[6px] border-black bg-[#d8c900]/70" />
      <div className="absolute bottom-0 right-[-10%] h-64 w-[56%] -skew-x-12 border-t-[6px] border-black bg-[#d8c900]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-12rem)] max-w-[1500px] flex-col justify-center gap-10 px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.7 }}
          className="mx-auto flex flex-col items-center space-y-8 text-center"
        >
          <div className="flex flex-col items-center">
            <div
              className="mb-5 inline-flex items-center gap-3 border-2 border-black bg-[#fcee09] px-4 py-2 text-[11px] font-black text-black shadow-[8px_8px_0_rgba(0,0,0,0.35)]"
              style={{
                color: "#050505",
                fontFamily: "monospace",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                WebkitTextFillColor: "#050505",
              }}
            >
              <Swords className="h-4 w-4" />
              {"/// BATTLE.MODULE"}
              <span>ARMED...</span>
            </div>
            <h2
              className="font-black italic text-black"
              style={{
                fontFamily: "Impact, Haettenschweiler, Arial Black, sans-serif",
                fontSize: "clamp(76px, 12vw, 168px)",
                letterSpacing: "0",
                lineHeight: 0.82,
                textTransform: "uppercase",
                WebkitTextFillColor: "#050505",
              }}
            >
              ENTER THE
              <br />
              ARENA.
            </h2>
          </div>
          <ProofModule />
        </motion.div>

        <div
          className="border-[6px] border-black bg-[#fcee09] p-4 text-black shadow-[18px_18px_0_rgba(0,0,0,0.38)] md:p-7"
          style={{
            backgroundColor: "#fcee09",
            color: "#050505",
            WebkitTextFillColor: "#050505",
          }}
        >
          <div className="grid gap-6 lg:grid-cols-[1fr_180px_1fr] lg:items-stretch">
            {agentA ? (
              <PreviewPanel label="Agent A Locked" title={agentA.name} accent={agentA.accent}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <PreviewStat label="Rank" value={`#${agentA.rank}`} />
                  <PreviewStat label="Win Rate" value={agentA.winRate} />
                  <PreviewStat label="Streak" value={`${agentA.streak}W`} />
                  <PreviewStat label="Brain" value={formatLandingBrain(agentA)} />
                </div>
              </PreviewPanel>
            ) : (
              <PreviewPanel label="Agent A" title="Awaiting Pick" accent="#ffb000">
                <PreviewMessage
                  text={
                    errorMessage ??
                    (isLoadingAgents
                      ? "Reading live agent identities..."
                      : "Pick the first public agent in the selector.")
                  }
                />
              </PreviewPanel>
            )}

            <div
              className="industrial-clip flex min-h-[180px] items-center justify-center border-4 border-black bg-[#fcee09] text-black shadow-[12px_12px_0_rgba(0,0,0,0.55)]"
              style={{ color: "#050505", WebkitTextFillColor: "#050505" }}
            >
              <div className="text-center">
                <Swords className="mx-auto mb-3 h-12 w-12" />
                <div className="text-5xl font-black italic leading-none">VS</div>
                <div className="mt-2 text-[9px] font-black" style={{ fontFamily: "monospace", letterSpacing: "0.22em", textTransform: "uppercase", WebkitTextFillColor: "#050505" }}>Public Round</div>
              </div>
            </div>

            {agentB ? (
              <PreviewPanel label="Agent B Locked" title={agentB.name} accent={agentB.accent}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <PreviewStat label="Rank" value={`#${agentB.rank}`} />
                  <PreviewStat label="Win Rate" value={agentB.winRate} />
                  <PreviewStat label="Badge" value={agentB.badge} />
                  <PreviewStat label="Brain" value={formatLandingBrain(agentB)} />
                </div>
              </PreviewPanel>
            ) : (
              <PreviewPanel label="Agent B" title="Awaiting Rival" accent="#ffb000">
                <PreviewMessage text="Pick a second public agent to arm the duel." />
              </PreviewPanel>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mt-6 grid gap-6 border-4 border-black bg-[#fcee09] p-6 text-black lg:grid-cols-[1fr_auto] lg:items-center"
            style={{
              backgroundColor: "#fcee09",
              color: "#050505",
              WebkitTextFillColor: "#050505",
            }}
          >
            <div>
              <div className="mb-3 text-[10px] font-black text-black" style={{ fontFamily: "monospace", letterSpacing: "0.22em", textTransform: "uppercase", WebkitTextFillColor: "#050505" }}>
                Battle Event
              </div>
              <h3
                className="font-black leading-none text-black"
                style={{
                  fontFamily: "Impact, Haettenschweiler, Arial Black, sans-serif",
                  fontSize: "clamp(42px, 6vw, 86px)",
                  textTransform: "uppercase",
                  WebkitTextFillColor: "#050505",
                }}
              >
                {selectedEvent.shortQuestion}
              </h3>
              <div className="mt-4 flex flex-wrap gap-3 text-[10px] font-black uppercase tracking-[0.22em] text-black">
                <span>{selectedEvent.sourceShort}</span>
                <span>{selectedEvent.consensus}</span>
                <span>{selectedEvent.difficulty}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onEnterArena}
              disabled={isCreating || !canStart}
              className="industrial-clip group relative overflow-hidden border-4 border-black bg-[#fcee09] px-10 py-6 text-sm font-black uppercase tracking-[0.3em] text-black shadow-[10px_10px_0_rgba(0,0,0,0.7)] transition-transform hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ color: "#050505", WebkitTextFillColor: "#050505" }}
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {isCreating ? "Arming..." : "Start Duel"}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="absolute inset-y-0 -left-20 w-16 skew-x-[-18deg] bg-[#fff7a0] transition-transform duration-500 group-hover:translate-x-96" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ProofModule() {
  return (
    <div
      className="industrial-clip border-4 border-black bg-[#fcee09] p-5 text-black shadow-[12px_12px_0_rgba(0,0,0,0.38)]"
      style={{ backgroundColor: "#fcee09", color: "#050505", WebkitTextFillColor: "#050505" }}
    >
      <div className="mb-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.26em] text-black">
        <DatabaseZap className="h-4 w-4" />
        Proof
      </div>
      <div className="space-y-3">
        <ProofRow icon={ShieldCheck} text="Onchain Proof: Enabled" />
        <ProofRow icon={Trophy} text="Network: Solana" />
        <ProofRow icon={LockKeyhole} text="Record: Anchored" />
      </div>
    </div>
  );
}

function ProofRow({ icon: Icon, text }: { icon: typeof ShieldCheck; text: string }) {
  return (
    <div
      className="flex items-center gap-3 border-2 border-black bg-[#fcee09] px-3 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-black"
      style={{ color: "#050505", WebkitTextFillColor: "#050505" }}
    >
      <Icon className="h-4 w-4 text-black" />
      {text}
    </div>
  );
}

function PreviewPanel({
  label,
  title,
  accent,
  children,
}: {
  label: string;
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="industrial-clip relative min-h-[320px] border-4 border-black bg-[#fcee09] p-6 text-black shadow-[12px_12px_0_rgba(0,0,0,0.55)]"
      style={{
        backgroundColor: "#fcee09",
        color: "#050505",
        WebkitTextFillColor: "#050505",
      }}
    >
      <div className="absolute inset-x-0 top-0 h-2" style={{ backgroundColor: accent }} />
      <div className="mb-5 text-[10px] font-black uppercase tracking-[0.28em]" style={{ color: "#050505", WebkitTextFillColor: "#050505" }}>
        {label}
      </div>
      <h3 className="mb-6 font-black italic leading-none text-black" style={{ fontFamily: "Impact, Haettenschweiler, Arial Black, sans-serif", fontSize: "clamp(42px, 5vw, 72px)", textTransform: "uppercase", WebkitTextFillColor: "#050505" }}>{title}</h3>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="border-2 border-black bg-[#fcee09] p-3 text-black"
      style={{ backgroundColor: "#fcee09", color: "#050505", WebkitTextFillColor: "#050505" }}
    >
      <div className="mb-1 text-[8px] font-black text-black" style={{ fontFamily: "monospace", letterSpacing: "0.22em", textTransform: "uppercase", WebkitTextFillColor: "#050505" }}>{label}</div>
      <div className="text-sm font-black uppercase text-black">{value}</div>
    </div>
  );
}

function PreviewMessage({ text }: { text: string }) {
  return (
    <div
      className="border-2 border-black bg-[#fcee09] p-4 text-xs font-black uppercase tracking-[0.18em] text-black"
      style={{ backgroundColor: "#fcee09", color: "#050505", WebkitTextFillColor: "#050505" }}
    >
      {text}
    </div>
  );
}
