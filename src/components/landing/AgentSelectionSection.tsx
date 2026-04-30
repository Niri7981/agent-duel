"use client";

import { motion } from "framer-motion";
import {
  formatLandingBrain,
  type LandingAgent,
} from "@/lib/landing/use-landing-agents";
import { AgentCard } from "./AgentCard";
import { Crown, Swords } from "lucide-react";

interface AgentSelectionSectionProps {
  agents: LandingAgent[];
  errorMessage: string | null;
  isLoading: boolean;
  selectedAgentId: string | null;
  onSelectAgent: (id: string) => void;
}

export function AgentSelectionSection({
  agents,
  errorMessage,
  isLoading,
  selectedAgentId,
  onSelectAgent,
}: AgentSelectionSectionProps) {
  const selectedAgent =
    agents.find((agent) => agent.id === selectedAgentId) ?? agents[0] ?? null;
  const posterAgents = agents;

  return (
    <section id="agents" className="relative min-h-screen overflow-hidden bg-[#fcee09] py-24 text-black md:py-28">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,#fcee09_0%,#fcee09_58%,#d8c900_100%)]" />
      <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(90deg,rgba(0,0,0,.18)_1px,transparent_1px),linear-gradient(rgba(0,0,0,.12)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="absolute left-[-8%] top-0 h-full w-[24%] -skew-x-12 border-r-[6px] border-black bg-[#d8c900]/60" />
      <div className="absolute right-0 top-16 hidden h-[calc(100%-4rem)] w-24 border-l-[6px] border-black bg-[#d8c900] lg:block" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-12rem)] max-w-[1580px] flex-col justify-center gap-10 px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.7 }}
          className="mx-auto flex flex-col items-center space-y-5 text-center"
        >
          <div
            className="inline-flex items-center gap-3 border-2 border-black bg-[#fcee09] px-4 py-2 text-[11px] font-black text-black shadow-[8px_8px_0_rgba(0,0,0,0.65)]"
            style={{ fontFamily: "monospace", letterSpacing: "0.22em", textTransform: "uppercase" }}
          >
            <Crown className="h-4 w-4" />
            {"/// AGENT.MODULE"}
            <span>SELECTING...</span>
          </div>
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center">
              <h2
                className="font-black italic"
                style={{
                  fontFamily: "Impact, Haettenschweiler, Arial Black, sans-serif",
                  fontSize: "clamp(76px, 12vw, 168px)",
                  letterSpacing: "0",
                  lineHeight: 0.82,
                  textTransform: "uppercase",
                }}
              >
                CHOOSE YOUR
                <br />
                AGENT.
              </h2>
              <p className="mt-5 text-xl font-black uppercase leading-none text-black md:text-2xl">
                Pick a public identity.
              </p>
            </div>
            {selectedAgent ? <SelectedAgentDossier agent={selectedAgent} /> : null}
          </div>
        </motion.div>

        <div className="relative border-[6px] border-black bg-[#050505] p-4 text-white shadow-[18px_18px_0_rgba(0,0,0,0.38)] md:p-7">
          <div className="mb-6 flex flex-col gap-3 border-b-[6px] border-[#fcee09] pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div
                className="mb-2 text-[10px] font-black text-[#fcee09]"
                style={{ fontFamily: "monospace", letterSpacing: "0.22em", textTransform: "uppercase" }}
              >
                Live Agent Pool
              </div>
              <h3
                className="font-black italic leading-none text-white"
                style={{
                  fontFamily: "Impact, Haettenschweiler, Arial Black, sans-serif",
                  fontSize: "clamp(42px, 6vw, 86px)",
                  textTransform: "uppercase",
                }}
              >
                SELECT AGENT
              </h3>
            </div>
            <div className="text-[10px] font-black text-white/55" style={{ fontFamily: "monospace", letterSpacing: "0.22em", textTransform: "uppercase" }}>
              {posterAgents.length} PUBLIC IDENTITIES ONLINE.
            </div>
          </div>

          {isLoading ? (
            <AgentPoolState label="Loading live agent pool..." />
          ) : errorMessage ? (
            <AgentPoolState label={errorMessage} tone="error" />
          ) : posterAgents.length === 0 ? (
            <AgentPoolState label="No public agents online." />
          ) : (
            <div className="relative flex flex-wrap justify-center gap-8 overflow-visible px-2 pb-10 pt-6">
              {posterAgents.map((agent) => (
                <div key={agent.id} className="shrink-0 snap-start">
                  <AgentCard
                    agent={agent}
                    isSelected={selectedAgentId === agent.id}
                    onSelect={onSelectAgent}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SelectedAgentDossier({ agent }: { agent: LandingAgent }) {
  return (
    <motion.div
      key={agent.id}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      className="industrial-clip hidden border-4 border-black bg-[#050505] p-5 text-white shadow-[12px_12px_0_rgba(0,0,0,0.28)] lg:block"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-black" style={{ color: agent.accent, fontFamily: "monospace", letterSpacing: "0.22em", textTransform: "uppercase" }}>
          <Swords className="h-4 w-4" />
          Locked
        </div>
        <div className="bg-[#fcee09] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-black">
          #{agent.rank}
        </div>
      </div>
      <h3 className="font-black italic leading-none text-white" style={{ fontFamily: "Impact, Haettenschweiler, Arial Black, sans-serif", fontSize: "48px", textTransform: "uppercase" }}>{agent.codename}</h3>
      <div className="mt-3 text-2xl font-black uppercase leading-none" style={{ color: agent.accent }}>
        {agent.archetype}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <DossierTag label="Risk" value={agent.riskLabel} />
        <DossierTag label="Win Rate" value={agent.winRate} />
        <DossierTag label="Streak" value={`${agent.streak}W`} />
        <DossierTag label="Brain" value={formatLandingBrain(agent)} emphasis />
      </div>
    </motion.div>
  );
}

function DossierTag({
  emphasis = false,
  label,
  value,
}: {
  emphasis?: boolean;
  label: string;
  value: string;
}) {
  return (
    <span
      className={`border-2 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] ${
        emphasis
          ? "border-[#fcee09] bg-[#fcee09] text-black"
          : "border-[#fcee09] bg-[#151515] text-white"
      }`}
    >
      {label}: {value}
    </span>
  );
}

function AgentPoolState({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "error" | "neutral";
}) {
  return (
    <div
      className={`mx-auto my-10 max-w-xl border-4 p-8 text-center text-xs font-black uppercase tracking-[0.22em] ${
        tone === "error"
          ? "border-[#ff1f2d] bg-[#210608] text-[#ff9aa2]"
          : "border-[#fcee09] bg-[#111111] text-white"
      }`}
      style={{ fontFamily: "monospace" }}
    >
      {label}
    </div>
  );
}
