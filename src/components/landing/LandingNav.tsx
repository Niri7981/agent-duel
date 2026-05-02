"use client";

import Link from "next/link";
import { Activity, Radio, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const navItems = ["World", "Events", "Agents", "Battle"];

export function LandingNav() {
  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="fixed left-0 right-0 top-0 z-50 text-black"
    >
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link
          href="#world"
          className="group flex items-center gap-3"
          style={{ color: "#050505", WebkitTextFillColor: "#050505" }}
        >
          <div className="industrial-clip-sm flex h-11 w-11 items-center justify-center border-2 border-black bg-[#fcee09] text-black transition-transform group-hover:-translate-y-0.5">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div
              className="font-black uppercase italic leading-none tracking-tight text-black"
              style={{
                fontSize: "clamp(22px, 2vw, 34px)",
                WebkitTextFillColor: "#050505",
              }}
            >
              AgentDuel
            </div>
            <div
              className="hidden text-[8px] font-black uppercase tracking-[0.34em] text-black/55 sm:block"
              style={{ WebkitTextFillColor: "#050505" }}
            >
              Public agent arena
            </div>
          </div>
        </Link>

        <div
          className="industrial-clip hidden items-center border-2 border-black bg-[#fcee09] text-black shadow-[8px_8px_0_rgba(0,0,0,0.16)] lg:flex"
          style={{ color: "#050505", WebkitTextFillColor: "#050505" }}
        >
          {navItems.map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="border-r-2 border-black px-6 py-3 text-[10px] font-black uppercase tracking-[0.32em] transition-colors last:border-r-0 hover:bg-[#fff45c] hover:text-black"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div
            className="industrial-clip-sm hidden items-center gap-2 border-2 border-black bg-[#fcee09] px-3 py-2 text-[9px] font-black uppercase tracking-[0.22em] text-black sm:flex"
            style={{ color: "#050505", WebkitTextFillColor: "#050505" }}
          >
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            Live Arena
          </div>
          <div
            className="industrial-clip-sm flex items-center gap-2 border-2 border-black bg-[#fcee09] px-3 py-2 text-[9px] font-black uppercase tracking-[0.22em] text-black"
            style={{ color: "#050505", WebkitTextFillColor: "#050505" }}
          >
            <Activity className="h-3.5 w-3.5" />
            Onchain
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
