"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  formatLandingBrain,
  type LandingAgent,
} from "@/lib/landing/use-landing-agents";
import { Flame, Radar, Shield, Trophy, Zap, Lock } from "lucide-react";

interface AgentCardProps {
  agent: LandingAgent;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function AgentCard({ agent, isSelected, onSelect }: AgentCardProps) {
  return (
    <AgentCardFront agent={agent} isSelected={isSelected} onSelect={onSelect} />
  );
}

export function AgentCardFront({ agent, isSelected, onSelect }: AgentCardProps) {
  const [imageLoaded, setImageLoaded] = useState(true);

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(agent.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(agent.id);
        }
      }}
      animate={{
        scale: isSelected ? 1.08 : 0.96,
        y: isSelected ? -16 : 0,
        rotateZ: isSelected
          ? agent.identityKey === "agent-momentum"
            ? -1
            : 1
          : 0,
        opacity: isSelected ? 1 : 0.72,
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
      className="cursor-pointer outline-none"
      style={{ zIndex: isSelected ? 20 : 1 }}
    >
      <article
        style={{
          width: "clamp(280px, 31vw, 360px)",
          height: "clamp(520px, 58vw, 650px)",
        }}
        className={`industrial-clip relative overflow-hidden text-left shadow-[10px_10px_0_rgba(0,0,0,0.72)] outline-none transition-all duration-300 ${
          isSelected
            ? "border-4 border-[#fcee09] bg-[#050505] shadow-[0_20px_50px_rgba(252,238,9,0.2)]"
            : "border-4 border-black bg-[#050505] hover:border-[#fcee09]"
        }`}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            borderColor: isSelected ? agent.accent : undefined,
            boxShadow: isSelected ? `inset 0 0 0 3px ${agent.accent}, 0 0 70px ${agent.color}55` : undefined,
          }}
        />
        <div className="absolute inset-x-0 top-0 h-2" style={{ backgroundColor: agent.color }} />
        <div className="absolute inset-0 opacity-35" style={{ background: `radial-gradient(circle at 50% 34%, ${agent.color}55, transparent 45%)` }} />
        <div className="scanline absolute inset-0 opacity-18" />

        <div className="relative z-10 flex h-full flex-col">
          <div
            className="relative flex shrink-0 items-center justify-center overflow-hidden border-b-4 border-black bg-[#151515]"
            style={{ height: "64%" }}
          >
            <div className="absolute inset-x-6 bottom-6 h-16 skew-y-[-5deg] border-4 border-[#202326] bg-[#050505]" />
            {agent.image && imageLoaded ? (
              <img
                src={agent.image}
                alt={agent.name}
                onError={() => setImageLoaded(false)}
                className="relative z-10 object-contain drop-shadow-[0_12px_14px_rgba(0,0,0,0.72)]"
                style={{
                  maxHeight: "94%",
                  maxWidth: "94%",
                  width: "auto",
                  height: "auto",
                }}
              />
            ) : (
              <div className="relative z-10 flex h-32 w-32 items-center justify-center border-4 bg-[#050505]" style={{ borderColor: agent.color }}>
                <AgentFallbackIcon agentId={agent.identityKey} color={agent.accent} />
              </div>
            )}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="industrial-clip-sm border-2 border-[#fcee09] bg-[#050505] px-2 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-white">
                {agent.riskLabel}
              </div>
              <div className="industrial-clip-sm border-2 border-black bg-[#fcee09] px-2 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-black">
                {agent.winRate} WR
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col justify-between space-y-2 bg-[#050505] p-4">
            <div>
              <Link
                href={`/agents/${agent.id}`}
                className="relative z-20 inline-block outline-none transition hover:translate-x-1 focus-visible:ring-2 focus-visible:ring-[#fcee09]"
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
              <h3
                className="font-black italic leading-none text-white"
                style={{
                  fontFamily: "Impact, Haettenschweiler, Arial Black, sans-serif",
                  fontSize: "clamp(34px, 3.8vw, 52px)",
                  textTransform: "uppercase",
                }}
              >
                {agent.codename}
              </h3>
              </Link>
              <p className="mt-1.5 text-lg font-black uppercase leading-none" style={{ color: agent.accent }}>
                {agent.archetype}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <AgentStat label="Risk" value={agent.riskLabel} />
              <AgentStat label="Win Rate" value={agent.winRate} />
              <AgentStat label="Streak" value={`${agent.streak}W`} />
              <AgentStat label="Rank" value={`#${agent.rank}`} />
              <AgentStat label="Brain" value={formatLandingBrain(agent)} wide />
            </div>

            <div className="flex items-center justify-between border-t-2 border-[#202326] pt-3">
              <div
                className={`flex items-center gap-2 text-[10px] font-black transition-colors ${
                  isSelected ? "text-[#fcee09]" : "text-white/50"
                }`}
                style={{ fontFamily: "monospace", letterSpacing: "0.18em", textTransform: "uppercase" }}
              >
                {isSelected ? (
                  <>
                    <Lock className="h-4 w-4" />
                    LOCKED IN
                  </>
                ) : (
                  <>
                    <Trophy className="h-4 w-4" />
                    Select Agent
                  </>
                )}
              </div>
              <Zap
                className={`h-5 w-5 transition-transform duration-500 ${isSelected ? "scale-125 rotate-12" : ""}`}
                style={{ color: isSelected ? "#fcee09" : agent.accent }}
              />
            </div>
          </div>
        </div>
      </article>
    </motion.div>
  );
}

function AgentStat({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`min-h-[48px] border-2 bg-[#151515] p-1.5 ${
        wide ? "col-span-2 border-[#fcee09]/70" : "border-[#202326]"
      }`}
    >
      <div
        className={`mb-1 text-[7px] font-black ${
          wide ? "text-[#fcee09]" : "text-white/40"
        }`}
        style={{
          fontFamily: "monospace",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div className="line-clamp-2 text-[10px] font-black uppercase leading-tight text-white">
        {value}
      </div>
    </div>
  );
}

function AgentFallbackIcon({ agentId, color }: { agentId: string; color: string }) {
  if (agentId === "agent-momentum") {
    return <Flame className="h-24 w-24" style={{ color }} />;
  }

  if (agentId === "agent-contrarian") {
    return <Shield className="h-24 w-24" style={{ color }} />;
  }

  return <Radar className="h-24 w-24" style={{ color }} />;
}
