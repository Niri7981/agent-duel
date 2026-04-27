"use client";

import { motion } from "framer-motion";
import { MOCK_EVENTS } from "@/lib/mocks/landing-demo-data";
import { EventCard } from "./EventCard";
import { Crosshair, ShieldCheck } from "lucide-react";

interface EventSelectionSectionProps {
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
}

export function EventSelectionSection({ selectedEventId, onSelectEvent }: EventSelectionSectionProps) {
  const selectedEvent = MOCK_EVENTS.find((event) => event.id === selectedEventId) || MOCK_EVENTS[0];

  return (
    <section id="events" className="acid-yellow-section relative min-h-screen overflow-hidden py-24 md:py-28">
      <div className="acid-yellow-gradient absolute inset-0" />
      <div className="acid-grid-overlay absolute inset-0 opacity-35" />
      <div className="industrial-yellow-slab absolute left-[-12%] top-12 h-32 w-[58%] -skew-x-12 border-y-[6px] border-black" />
      <div className="industrial-yellow-slab absolute bottom-0 right-[-10%] h-48 w-[56%] -skew-x-12 border-t-[6px] border-black" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-12rem)] max-w-[1560px] flex-col justify-center gap-10 px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto max-w-5xl space-y-5 text-center"
        >
          <div
            className="acid-label inline-flex items-center gap-3 border-[3px] border-black px-5 py-2 text-[11px] font-black shadow-[8px_8px_0_rgba(0,0,0,0.72)]"
            style={{ fontFamily: "monospace", letterSpacing: "0.22em", textTransform: "uppercase" }}
          >
            <Crosshair className="h-4 w-4" />
            {"/// EVENT.MODULE"}
            <span>LOADING...</span>
          </div>
          <h2
            className="font-black italic text-black"
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
            BATTLE EVENT.
          </h2>
          <p className="mx-auto text-xl font-black uppercase leading-none text-black md:text-2xl">
            PICK THE ARENA OBJECTIVE.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 42 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="industrial-black-panel border-[6px] border-black p-4 shadow-[18px_18px_0_rgba(0,0,0,0.38)] md:p-7"
        >
          <div className="mb-6 flex flex-col gap-4 border-b-[6px] border-[#fcee09] pb-6 lg:flex-row lg:items-end lg:justify-between">
            <SelectedMatchPanel event={selectedEvent} />
            <div
              className="flex items-center gap-3 text-[10px] font-black text-[#fcee09]"
              style={{ fontFamily: "monospace", letterSpacing: "0.22em", textTransform: "uppercase" }}
            >
              <ShieldCheck className="h-4 w-4" />
              {MOCK_EVENTS.length} EVENTS ONLINE
            </div>
          </div>

          <div className="flex snap-x gap-6 overflow-x-auto pb-6">
            {MOCK_EVENTS.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isSelected={selectedEventId === event.id}
                onSelect={onSelectEvent}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SelectedMatchPanel({ event }: { event: (typeof MOCK_EVENTS)[number] }) {
  return (
    <div className="max-w-4xl">
      <div className="acid-label mb-3 inline-flex border-2 border-[#fcee09] px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em]">
        LOCKED EVENT
      </div>
      <h3
        className="font-black leading-none text-white"
        style={{
          fontFamily: "Impact, Haettenschweiler, Arial Black, sans-serif",
          fontSize: "clamp(42px, 5vw, 76px)",
          textTransform: "uppercase",
        }}
      >
        {event.shortQuestion}
      </h3>
      <div className="mt-4 flex flex-wrap gap-2">
        <MatchTag label="Source" value={event.sourceShort} />
        <MatchTag label="Consensus" value={event.consensus} />
        <MatchTag label="Risk" value={event.difficulty} />
        <MatchTag label="Status" value={event.status} />
      </div>
    </div>
  );
}

function MatchTag({ label, value }: { label: string; value: string }) {
  return (
    <div className="industrial-dark-steel border-2 border-[#2b2b2b] px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white">
      <span className="text-[#fcee09]">{label}:</span> {value}
    </div>
  );
}
