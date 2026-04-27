"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MOCK_DUELS = [
  {
    id: 1,
    title: "Momentum vs Contrarian",
    status: "LIVE",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop",
    accent: "from-red-500 to-orange-500",
  },
  {
    id: 2,
    title: "The News Agent Trial",
    status: "QUEUED",
    image: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2940&auto=format&fit=crop",
    accent: "from-blue-500 to-cyan-500",
  },
  {
    id: 3,
    title: "Whale Watcher Duel",
    status: "STARTING",
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2874&auto=format&fit=crop",
    accent: "from-emerald-500 to-green-500",
  },
];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);

  const handleNext = () => setIndex((prev) => (prev + 1) % MOCK_DUELS.length);
  const handlePrev = () => setIndex((prev) => (prev - 1 + MOCK_DUELS.length) % MOCK_DUELS.length);

  return (
    <div className="relative w-full h-[400px] md:h-[600px] flex items-center justify-center overflow-hidden py-20">
      <div className="relative flex items-center justify-center w-full max-w-6xl px-4">
        {MOCK_DUELS.map((duel, i) => {
          let position = i - index;
          if (position < -1) position += MOCK_DUELS.length;
          if (position > 1) position -= MOCK_DUELS.length;

          const isActive = position === 0;
          
          return (
            <motion.div
              key={duel.id}
              initial={false}
              animate={{
                x: position * 300,
                scale: isActive ? 1.05 : 0.85,
                opacity: isActive ? 1 : 0.4,
                zIndex: isActive ? 20 : 10,
                rotateY: position * -25,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={() => setIndex(i)}
              className="absolute w-[300px] md:w-[500px] aspect-video cursor-pointer group"
            >
              <div className={`relative w-full h-full rounded-[2rem] overflow-hidden border-2 border-white/10 bg-slate-900 shadow-2xl`}>
                <img 
                  src={duel.image} 
                  alt={duel.title} 
                  className={`w-full h-full object-cover transition-all duration-500 ${isActive ? "brightness-100" : "brightness-50"}`}
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80`} />
                
                <div className="absolute bottom-8 left-8 right-8 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-0.5 rounded bg-emerald-500 text-[10px] font-black text-black tracking-widest`}>
                      {duel.status}
                    </div>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-white leading-none">
                    {duel.title}
                  </h2>
                </div>

                {isActive && (
                  <div className={`absolute inset-0 border-4 border-emerald-500/20 rounded-[2rem] pointer-events-none shadow-[inset_0_0_50px_rgba(16,185,129,0.2)]`} />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
        <button onClick={handlePrev} className="p-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button onClick={handleNext} className="p-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
