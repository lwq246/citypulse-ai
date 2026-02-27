// components/Sidebar.tsx
"use client";
import { ArrowLeft, ShieldAlert, Sun, Thermometer } from "lucide-react";
import Link from "next/link";
import React from "react";

// 1. Define the props the Sidebar expects
interface SidebarProps {
  activeLayer: string;
  setActiveLayer: (layer: string) => void; // This is the type for a React useState setter
}

export default function Sidebar({ activeLayer, setActiveLayer }: SidebarProps) {
  return (
    <div className="absolute top-6 left-6 w-80 flex flex-col gap-6 z-10 pointer-events-auto">
      {/* Logo Area */}
      <div className="bg-[#141E1C]/70 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl group transition-all hover:border-[#06D6A0]/50 pointer-events-auto">
        <Link href="/" className="flex items-center gap-4">
          {/* The Icon box holds the Back Arrow */}
          <div className="p-2 bg-[#06D6A0] rounded-lg text-[#0B1211] shadow-[0_0_15px_rgba(6,214,160,0.3)] group-hover:scale-110 transition-transform flex items-center justify-center">
            <ArrowLeft className="w-6 h-6" strokeWidth={3} />
          </div>

          {/* Brand Title Stack */}
          <div>
            <h1 className="text-white font-bold tracking-wider text-lg leading-tight group-hover:text-[#06D6A0] transition-colors">
              CITYPULSE AI
            </h1>
            <p className="text-[#06D6A0] text-[10px] font-mono tracking-widest uppercase opacity-80">
              Urban Data Engine v1.0
            </p>
          </div>
        </Link>
      </div>

      {/* Visualizers Card */}
      <div className="bg-[#141E1C]/70 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl space-y-6">
        <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest">
          Core Visualizers
        </h2>

        {/* 2. We link the 'active' prop to the state and add the 'onClick' handler */}
        <LayerToggle
          icon={<Thermometer size={18} />}
          label="Thermal Pulse"
          sub="Urban heat island mapping"
          active={activeLayer === "thermal"}
          onClick={() => setActiveLayer("thermal")}
        />
        <LayerToggle
          icon={<Sun size={18} />}
          label="Solar Goldmine"
          sub="Rooftop harvesting potential"
          active={activeLayer === "solar"}
          onClick={() => setActiveLayer("solar")}
        />
        <LayerToggle
          icon={<ShieldAlert size={18} />}
          label="Flood Guardian"
          sub="Elevation-based risk"
          active={activeLayer === "flood"}
          onClick={() => setActiveLayer("flood")}
        />
      </div>
    </div>
  );
}

// 3. Update LayerToggle to accept the onClick function
interface LayerToggleProps {
  icon: React.ReactNode;
  label: string;
  sub: string;
  active: boolean;
  onClick: () => void;
}

function LayerToggle({ icon, label, sub, active, onClick }: LayerToggleProps) {
  return (
    <div
      onClick={onClick} // This makes the button interactive
      className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer select-none hover:bg-white/5 ${
        active
          ? "bg-[#06D6A0]/10 border border-[#06D6A0]/30"
          : "border border-transparent"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`${active ? "text-[#06D6A0]" : "text-gray-500"}`}>
          {icon}
        </div>
        <div>
          <p className="text-white text-sm font-medium">{label}</p>
          <p className="text-gray-500 text-[10px]">{sub}</p>
        </div>
      </div>

      <div
        className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${
          active ? "bg-[#06D6A0]" : "bg-gray-700"
        }`}
      >
        <div
          className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${
            active ? "right-1" : "left-1"
          }`}
        />
      </div>
    </div>
  );
}
