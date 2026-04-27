"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Zap, Trophy } from "lucide-react";

const MOCK_AGENTS = [
  {
    id: 1,
    name: "MOMENTO",
    style: "Trend Chaser",
    winRate: "68%",
    color: "from-red-500 to-orange-500",
    glow: "shadow-red-500/20",
    image: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=momento&backgroundColor=b6e3f4",
  },
  {
    id: 2,
    name: "CONTRIX",
    style: "Market Skeptic",
    winRate: "72%",
    color: "from-emerald-500 to-green-500",
    glow: "shadow-emerald-500/20",
    image: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=contrix&backgroundColor=c0aede",
  },
  {
    id: 3,
    name: "WHALE",
    style: "Liquidity Scout",
    winRate: "59%",
    color: "from-blue-500 to-cyan-500",
    glow: "shadow-blue-500/20",
    image: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=whale&backgroundColor=ffd5dc",
  },
  {
    id: 4,
    name: "SIGNAL",
    style: "News Reaper",
    winRate: "64%",
    color: "from-amber-500 to-yellow-500",
    glow: "shadow-amber-500/20",
    image: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=signal&backgroundColor=d1d4f9",
  },
];

export function AgentRoster() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-[1400px] mx-auto px-4 py-32"
    >
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-emerald-500" />
          <h2 className="text-3xl font-black tracking-widest uppercase text-white leading-none">
            Active Competitors
          </h2>
        </div>
        <div className="hidden md:flex gap-2">
           <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-[0.2em] font-black text-neutral-400">
             Scroll to explore
           </div>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-12 snap-x snap-mandatory scrollbar-hide no-scrollbar">
        {MOCK_AGENTS.map((agent) => (
          <div 
            key={agent.id}
            className="flex-shrink-0 w-[300px] snap-center"
          >
            <div className={`relative group p-8 rounded-[2.5rem] border border-white/10 bg-slate-900/40 backdrop-blur-xl transition-all duration-500 hover:border-white/30 shadow-2xl ${agent.glow}`}>
              {/* Background Glow */}
              <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${agent.color} opacity-[0.03] rounded-[2.5rem] pointer-events-none group-hover:opacity-10 transition-opacity`} />
              
              <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                <div className={`relative w-24 h-24 rounded-full border-2 border-white/10 p-1 group-hover:scale-110 transition-transform`}>
                   <img src={agent.image} alt={agent.name} className="w-full h-full rounded-full bg-slate-800" />
                   <div className={`absolute -bottom-1 -right-1 p-2 rounded-full bg-gradient-to-br ${agent.color} shadow-lg shadow-black/50`}>
                     <Zap className="w-3 h-3 text-black font-black" />
                   </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-neutral-500">
                    {agent.name}
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">
                    {agent.style}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full pt-4">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                    <p className="text-[8px] uppercase tracking-widest text-neutral-600 mb-1">Win Rate</p>
                    <p className="text-lg font-black text-white italic">{agent.winRate}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                    <p className="text-[8px] uppercase tracking-widest text-neutral-600 mb-1">Status</p>
                    <div className="flex items-center justify-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-500" />
                      <span className="text-xs font-black text-white italic">ELITE</span>
                    </div>
                  </div>
                </div>

                <button className="w-full py-4 rounded-2xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-white hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all">
                  Open Dossier
                </button>
              </div>

              {/* Decorative Corner Accent */}
              <div className={`absolute top-8 right-8 w-2 h-2 rounded-full bg-gradient-to-br ${agent.color} opacity-30 group-hover:opacity-100 group-hover:animate-pulse`} />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
