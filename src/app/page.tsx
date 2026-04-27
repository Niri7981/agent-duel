"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingHero } from "@/components/landing/LandingHero";
import { EventSelectionSection } from "@/components/landing/EventSelectionSection";
import { AgentSelectionSection } from "@/components/landing/AgentSelectionSection";
import { BattlePreviewSection } from "@/components/landing/BattlePreviewSection";
import { SectionTransition } from "@/components/landing/SectionTransition";
import { MOCK_EVENTS, MOCK_AGENTS } from "@/lib/mocks/landing-demo-data";

type ApiError = {
  error?: string;
};

type AgentPoolEntry = {
  id: string;
  identityKey: string;
  name: string;
  runtimeKey: string;
};

async function readAgentPool() {
  const response = await fetch("/api/agents?limit=12", {
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiError | null;
    throw new Error(payload?.error ?? "Failed to load agent pool.");
  }

  return (await response.json()) as AgentPoolEntry[];
}

function resolveAgentPoolId(
  agentPool: AgentPoolEntry[],
  landingAgent: (typeof MOCK_AGENTS)[number],
) {
  return agentPool.find(
    (agent) =>
      agent.name === landingAgent.name ||
      agent.identityKey === `agent-${landingAgent.id}` ||
      agent.runtimeKey === landingAgent.id,
  )?.id;
}

async function createRound(input: { agentIds: string[]; eventId: string }) {
  const response = await fetch("/api/round", {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
    },
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

  const [selectedEventId, setSelectedEventId] = useState<string>(MOCK_EVENTS[0].id);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(MOCK_AGENTS[0].id);

  const selectedEvent = MOCK_EVENTS.find(e => e.id === selectedEventId) || MOCK_EVENTS[0];
  const selectedAgent = MOCK_AGENTS.find(a => a.id === selectedAgentId) || MOCK_AGENTS[0];

  function handleEnterArena() {
    setErrorMessage(null);
    startCreateTransition(async () => {
      try {
        const agentPool = await readAgentPool();
        const opponentAgent =
          MOCK_AGENTS.find((agent) => agent.id !== selectedAgent.id) ?? MOCK_AGENTS[1];
        const selectedAgentPoolId = resolveAgentPoolId(agentPool, selectedAgent);
        const opponentAgentPoolId = resolveAgentPoolId(agentPool, opponentAgent);

        if (!selectedAgentPoolId || !opponentAgentPoolId) {
          throw new Error("Selected arena agents are not available in the agent pool.");
        }

        await createRound({
          agentIds: [selectedAgentPoolId, opponentAgentPoolId],
          eventId: selectedEvent.id,
        });
        router.push("/round");
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to create duel round.",
        );
      }
    });
  }

  const acidWallpaperStyle = { backgroundColor: "#fcee09" };

  return (
    <main
      className="landing-black-text acid-yellow-section h-screen overflow-y-auto overflow-x-hidden snap-y snap-proximity scroll-smooth selection:bg-[#fcee09] selection:text-black"
      style={acidWallpaperStyle}
    >
      <LandingNav />
      
      {/* Section 01: Hero */}
      <section className="h-screen min-h-screen w-full snap-start snap-always shrink-0 overflow-hidden bg-black">
        <LandingHero />
      </section>

      <SectionTransition from="dark" to="yellow" label="// EVENT.MODULE loading..." />

      {/* Section 02: Event Selection */}
      <section
        className="acid-yellow-section relative min-h-screen w-full snap-start snap-always shrink-0 overflow-hidden"
        style={acidWallpaperStyle}
      >
        <div className="acid-yellow-gradient absolute inset-0" />
        <div className="acid-grid-overlay absolute inset-0 opacity-25" />
        <div className="relative z-10">
        <EventSelectionSection 
          selectedEventId={selectedEventId} 
          onSelectEvent={setSelectedEventId} 
        />
        </div>
      </section>

      <SectionTransition from="yellow" to="yellow" label="// AGENT.SELECTOR online..." />

      {/* Section 03: Agent Selection */}
      <section
        className="acid-yellow-section relative min-h-screen w-full snap-start snap-always shrink-0 overflow-hidden"
        style={acidWallpaperStyle}
      >
        <div className="acid-yellow-gradient absolute inset-0" />
        <div className="acid-grid-overlay absolute inset-0 opacity-25" />
        <div className="relative z-10">
        <AgentSelectionSection 
          selectedAgentId={selectedAgentId} 
          onSelectAgent={setSelectedAgentId} 
        />
        </div>
      </section>

      <SectionTransition from="yellow" to="yellow" label="// BATTLE.PREVIEW armed..." labelOnly />

      {/* Section 04: Battle Preview */}
      <section
        className="acid-yellow-section relative min-h-screen w-full snap-start snap-always shrink-0 overflow-hidden"
        style={acidWallpaperStyle}
      >
        <div className="acid-yellow-gradient absolute inset-0" />
        <div className="acid-grid-overlay absolute inset-0 opacity-25" />
        <div className="relative z-10">
        <BattlePreviewSection 
          selectedEvent={selectedEvent}
          selectedAgent={selectedAgent}
          onEnterArena={handleEnterArena}
          isCreating={isCreating}
        />
        </div>
      </section>

      {/* Global Error Message Toast-like */}
      {errorMessage && (
        <div className="fixed bottom-10 right-10 z-50 border-[3px] border-black bg-[#fcee09] p-4 text-xs font-black uppercase tracking-widest text-black shadow-[8px_8px_0_#000] animate-in fade-in slide-in-from-bottom-5">
          {errorMessage}
        </div>
      )}
    </main>
  );
}
