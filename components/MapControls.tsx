"use client";
import { Box, Minus, Plus, RotateCcw } from "lucide-react";

export default function MapControls() {
  return (
    <div className="flex items-center gap-4">
      {/* Zoom Group */}
      <div className="flex bg-[#141E1C]/80 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
        <button className="p-3 hover:bg-white/5 text-gray-400 hover:text-white transition-colors border-r border-white/5">
          <Plus size={18} />
        </button>
        <button className="p-3 hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <Minus size={18} />
        </button>
      </div>

      {/* Tilt/Reset Group */}
      <button className="flex items-center gap-2 bg-[#141E1C]/80 backdrop-blur-md border border-white/10 px-5 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all group">
        <Box size={18} className="group-hover:text-[#06D6A0]" />
        <span className="text-xs font-bold uppercase tracking-widest">
          Tilt 45°
        </span>
      </button>

      <button className="flex items-center gap-2 bg-[#141E1C]/80 backdrop-blur-md border border-white/10 px-5 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all group">
        <RotateCcw
          size={18}
          className="group-hover:rotate-180 transition-transform duration-500"
        />
        <span className="text-xs font-bold uppercase tracking-widest">
          Reset N
        </span>
      </button>
    </div>
  );
}
