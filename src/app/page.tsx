"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingHero } from "@/components/landing/LandingHero";
import { EventSelectionSection } from "@/components/landing/EventSelectionSection";
import { AgentSelectionSection } from "@/components/landing/AgentSelectionSection";
import { BattlePreviewSection } from "@/components/landing/BattlePreviewSection";
import { SectionTransition } from "@/components/landing/SectionTransition";
import { MOCK_EVENTS } from "@/lib/mocks/landing-demo-data";
import { useLandingAgents } from "@/lib/landing/use-landing-agents";

type ApiError = {
  error?: string;
};

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
  const {
    agents,
    errorMessage: agentErrorMessage,
    isLoading: isLoadingAgents,
  } = useLandingAgents();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreating, startCreateTransition] = useTransition();

  const [selectedEventId, setSelectedEventId] = useState<string>(MOCK_EVENTS[0].id);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const selectedEvent = MOCK_EVENTS.find(e => e.id === selectedEventId) || MOCK_EVENTS[0];
  const effectiveSelectedAgentId = selectedAgentId ?? agents[0]?.id ?? null;
  const selectedAgent =
    agents.find((agent) => agent.id === effectiveSelectedAgentId) ??
    agents[0] ??
    null;

  function handleEnterArena() {
    setErrorMessage(null);
    startCreateTransition(async () => {
      try {
        if (!selectedAgent) {
          throw new Error("Choose an arena agent before starting the duel.");
        }

        const opponentAgent = agents.find((agent) => agent.id !== selectedAgent.id);

        if (!opponentAgent) {
          throw new Error("At least two arena agents are required to start a duel.");
        }

        await createRound({
          agentIds: [selectedAgent.id, opponentAgent.id],
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
          agents={agents}
          errorMessage={agentErrorMessage}
          isLoading={isLoadingAgents}
          selectedAgentId={effectiveSelectedAgentId} 
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
          agents={agents}
          errorMessage={agentErrorMessage}
          isLoadingAgents={isLoadingAgents}
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
