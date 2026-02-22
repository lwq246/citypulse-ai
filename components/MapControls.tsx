"use client";
import { Box, Compass, Minus, Plus, RotateCw } from "lucide-react"; // Import RotateCw

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onTilt: () => void;
  onRotate: () => void; // 1. Add this
  onReset: () => void;
}

export default function MapControls({
  onZoomIn,
  onZoomOut,
  onTilt,
  onRotate, // 2. Destructure
  onReset,
}: MapControlsProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Zoom Group */}
      <div className="flex bg-[#141E1C]/80 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        <button
          onClick={onZoomIn}
          className="p-3 hover:bg-white/5 text-gray-400 hover:text-white transition-colors border-r border-white/5"
        >
          <Plus size={18} />
        </button>
        <button
          onClick={onZoomOut}
          className="p-3 hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
        >
          <Minus size={18} />
        </button>
      </div>

      {/* 3. NEW ROTATE BUTTON */}
      <button
        onClick={onRotate}
        className="flex items-center gap-2 bg-[#141E1C]/80 backdrop-blur-md border border-white/10 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all group active:scale-95 shadow-xl"
        title="Rotate 90°"
      >
        <RotateCw
          size={18}
          className="group-hover:rotate-90 transition-transform duration-500"
        />
      </button>

      {/* Tilt Group */}
      <button
        onClick={onTilt}
        className="flex items-center gap-2 bg-[#141E1C]/80 backdrop-blur-md border border-white/10 px-5 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all group active:scale-95 shadow-xl"
      >
        <Box size={18} className="group-hover:text-[#06D6A0]" />
        <span className="text-xs font-bold uppercase tracking-widest">
          Tilt 45°
        </span>
      </button>

      {/* Reset Group */}
      <button
        onClick={onReset}
        className="flex items-center gap-2 bg-[#141E1C]/80 backdrop-blur-md border border-white/10 px-5 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all group active:scale-95 shadow-xl"
      >
        <Compass
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
