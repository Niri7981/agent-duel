"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, DollarSign, Activity, Users } from "lucide-react";

const MOCK_EVENTS = [
  {
    id: 1,
    question: "Will SOL break $250 before epoch ends?",
    details: "This event tracks the price of Solana on the mainnet exchange. The epoch deadline is approximately 48 hours away.",
    poolSize: "450,280 USDC",
    momentum: "High",
    consensus: "68% YES",
  },
  {
    id: 2,
    question: "Will BTC reach a new ATH this weekend?",
    details: "Based on Coinbase price feed. The current ATH is $73,750. Verification required by UTC Sunday Midnight.",
    poolSize: "1,205,000 USDC",
    momentum: "Moderate",
    consensus: "42% YES",
  },
  {
    id: 3,
    question: "Will Ether ETF inflows exceed $500M this week?",
    details: "Aggregate data from institutional reporting channels. Trial ends on Friday settlement session.",
    poolSize: "310,000 USDC",
    momentum: "Increasing",
    consensus: "55% YES",
  },
];

export function EventAccordion() {
  const [expandedId, setExpandedId] = useState<number | null>(1);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 px-4 py-20">
      <div className="flex items-center gap-3 mb-8">
        <Activity className="w-6 h-6 text-emerald-500" />
        <h2 className="text-2xl font-black tracking-widest uppercase text-white">Event Pool</h2>
      </div>

      <div className="space-y-3">
        {MOCK_EVENTS.map((event) => {
          const isExpanded = expandedId === event.id;

          return (
            <div 
              key={event.id}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isExpanded ? "border-emerald-500/50 bg-emerald-500/[0.03]" : "border-white/10 bg-slate-900/40 hover:border-white/20"
              }`}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : event.id)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${isExpanded ? "bg-emerald-500 animate-pulse" : "bg-white/20"}`} />
                  <span className={`text-lg font-bold ${isExpanded ? "text-emerald-400" : "text-white"}`}>
                    {event.question}
                  </span>
                </div>
                <ChevronDown className={`w-5 h-5 text-neutral-500 transition-transform duration-300 ${isExpanded ? "rotate-180 text-emerald-400" : ""}`} />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-6">
                      <p className="text-sm text-neutral-400 italic leading-relaxed">
                        {event.details}
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase tracking-widest font-black text-neutral-500">Pool Size</p>
                          <div className="flex items-center gap-1.5 text-lg font-black text-white italic">
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                            {event.poolSize}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase tracking-widest font-black text-neutral-500">Consensus</p>
                          <div className="flex items-center gap-1.5 text-lg font-black text-white italic">
                            <Users className="w-4 h-4 text-blue-500" />
                            {event.consensus}
                          </div>
                        </div>
                        <div className="space-y-1 md:col-span-1 col-span-2">
                          <p className="text-[9px] uppercase tracking-widest font-black text-neutral-500">Momentum</p>
                          <div className="flex items-center gap-1.5 text-lg font-black text-amber-500 italic uppercase">
                            <Activity className="w-4 h-4" />
                            {event.momentum}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <button className="w-full md:w-auto px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-colors">
                          Initialize Trial Access
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
