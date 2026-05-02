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
  selectedAgentIds: string[];
  onSelectAgent: (id: string) => void;
}

export function AgentSelectionSection({
  agents,
  errorMessage,
  isLoading,
  selectedAgentIds,
  onSelectAgent,
}: AgentSelectionSectionProps) {
  const selectedAgents = selectedAgentIds
    .map((agentId) => agents.find((agent) => agent.id === agentId))
    .filter((agent): agent is LandingAgent => Boolean(agent));
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
            style={{
              color: "#050505",
              fontFamily: "monospace",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              WebkitTextFillColor: "#050505",
            }}
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
                  WebkitTextFillColor: "#050505",
                }}
              >
                CHOOSE YOUR
                <br />
                AGENT.
              </h2>
              <p
                className="mt-5 text-xl font-black uppercase leading-none text-black md:text-2xl"
                style={{ WebkitTextFillColor: "#050505" }}
              >
                Pick two public identities.
              </p>
            </div>
            {selectedAgents.length > 0 ? (
              <SelectedAgentDossier agents={selectedAgents} />
            ) : null}
          </div>
        </motion.div>

        <div
          className="relative border-[6px] border-black bg-[#fcee09] p-4 text-black shadow-[18px_18px_0_rgba(0,0,0,0.38)] md:p-7"
          style={{ backgroundColor: "#fcee09", color: "#050505", WebkitTextFillColor: "#050505" }}
        >
          <div className="mb-6 flex flex-col gap-3 border-b-[6px] border-[#fcee09] pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div
                className="mb-2 text-[10px] font-black text-black"
                style={{ fontFamily: "monospace", letterSpacing: "0.22em", textTransform: "uppercase", WebkitTextFillColor: "#050505" }}
              >
                Live Agent Pool
              </div>
              <h3
                className="font-black italic leading-none text-black"
                style={{
                  fontFamily: "Impact, Haettenschweiler, Arial Black, sans-serif",
                  fontSize: "clamp(42px, 6vw, 86px)",
                  textTransform: "uppercase",
                  WebkitTextFillColor: "#050505",
                }}
              >
                SELECT TWO AGENTS
              </h3>
            </div>
            <div className="text-[10px] font-black text-black" style={{ fontFamily: "monospace", letterSpacing: "0.22em", textTransform: "uppercase", WebkitTextFillColor: "#050505" }}>
              {selectedAgentIds.length}/2 LOCKED · {posterAgents.length} PUBLIC IDENTITIES ONLINE.
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
                    isSelected={selectedAgentIds.includes(agent.id)}
                    onSelect={onSelectAgent}
                    selectedSlot={
                      selectedAgentIds.includes(agent.id)
                        ? selectedAgentIds.indexOf(agent.id) + 1
                        : null
                    }
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

function SelectedAgentDossier({ agents }: { agents: LandingAgent[] }) {
  return (
    <motion.div
      key={agents.map((agent) => agent.id).join("-")}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      className="industrial-clip hidden border-4 border-black bg-[#050505] p-5 text-white shadow-[12px_12px_0_rgba(0,0,0,0.28)] lg:block"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-black" style={{ color: agents[0]?.accent ?? "#fcee09", fontFamily: "monospace", letterSpacing: "0.22em", textTransform: "uppercase" }}>
          <Swords className="h-4 w-4" />
          Duel Pair
        </div>
        <div className="bg-[#fcee09] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-black">
          {agents.length}/2
        </div>
      </div>
      <div className="grid gap-3">
        {agents.map((agent, index) => (
          <div key={agent.id} className="border-2 border-[#fcee09] bg-[#151515] p-3">
            <div className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#fcee09]">
              Agent {index === 0 ? "A" : "B"}
            </div>
            <h3 className="font-black italic leading-none text-white" style={{ fontFamily: "Impact, Haettenschweiler, Arial Black, sans-serif", fontSize: "40px", textTransform: "uppercase" }}>{agent.codename}</h3>
            <div className="mt-2 text-xl font-black uppercase leading-none" style={{ color: agent.accent }}>
              {agent.archetype}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {agents.length === 2 ? (
          <DossierTag label="Status" value="Duel Armed" emphasis />
        ) : (
          <DossierTag label="Status" value="Pick Rival" emphasis />
        )}
        {agents.map((agent) => (
          <DossierTag key={agent.id} label={agent.codename} value={formatLandingBrain(agent)} />
        ))}
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
