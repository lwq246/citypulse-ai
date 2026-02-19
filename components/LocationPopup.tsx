"use client";
import { Activity, Building2, Thermometer, Wind, Zap } from "lucide-react";

// 1. Define the Interface for TypeScript
interface LocationPopupProps {
  locationName: string;
  activeLayer: string;
  envData: {
    aqi: number;
    temp: number;
    status: string;
  };
  solarData: {
    area: number;
    savings: number;
    potential: string;
    source: string;
  };
}

export default function LocationPopup({
  locationName,
  activeLayer,
  envData,
  solarData,
}: LocationPopupProps) {
  const isSolar = activeLayer === "solar";

  return (
    <div className="w-72 bg-[#141E1C]/95 backdrop-blur-2xl border border-[#06D6A0]/30 rounded-2xl p-5 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden pointer-events-auto">
      {/* Decorative High-Tech Top Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#06D6A0] to-transparent opacity-50" />

      {/* Header */}
      <h3 className="text-[#06D6A0] font-bold text-lg mb-4 truncate pr-2">
        {locationName || "Detecting Location..."}
      </h3>

      {/* Dynamic Data Grid */}
      <div className="space-y-3 mb-6">
        {isSolar ? (
          <>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 flex items-center gap-2">
                <Zap size={14} className="text-yellow-400" /> Solar Potential
              </span>
              <span className="text-[#06D6A0] font-bold italic">
                {solarData.potential}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">💰 Est. Savings</span>
              <span className="text-white font-mono font-bold text-sm">
                RM {solarData.savings.toLocaleString()} /yr
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">📏 Usable Roof</span>
              <span className="text-white font-mono">{solarData.area} m²</span>
            </div>
            <div className="text-[8px] text-gray-600 mt-2 text-right italic font-mono uppercase">
              Data Source: {solarData.source}
            </div>
          </>
        ) : (
          /* THERMAL / DEFAULT VIEW */
          <>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 flex items-center gap-2">
                <Thermometer size={14} className="text-orange-500" /> Surface
                Temp
              </span>
              <span className="text-orange-400 font-mono font-bold">
                {envData.temp ? Number(envData.temp).toFixed(1) : "--"}°C
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 flex items-center gap-2">
                <Wind size={14} className="text-[#06D6A0]" /> Air Quality
              </span>
              <span className="text-[#06D6A0] font-mono font-bold">
                {envData.aqi || "--"} AQI
              </span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-white/5 pt-2 mt-2">
              <span className="text-gray-500 flex items-center gap-2">
                <Activity size={14} /> Local Status
              </span>
              <span className="text-gray-300 text-[10px] font-medium uppercase tracking-tighter">
                {envData.status}
              </span>
            </div>
          </>
        )}
      </div>

      {/* ACTION BUTTONS (Added back) */}
      <div className="grid grid-cols-2 gap-3">
        <button
          className="bg-[#06D6A0] text-[#0B1211] text-[10px] font-black py-2.5 rounded-lg hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest"
          onClick={() => alert("AI Analysis starting for " + locationName)}
        >
          Analyze
        </button>
        <button
          className="bg-white/5 border border-white/10 text-white text-[10px] font-bold py-2.5 rounded-lg hover:bg-white/10 active:scale-95 transition-all uppercase tracking-widest"
          onClick={() =>
            window.open(
              `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${envData.temp}`,
              "_blank",
            )
          }
        >
          View 360°
        </button>
      </div>

      {/* Subtle Bottom Telemetry */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Building2 size={10} className="text-gray-600" />
          <span className="text-[8px] text-gray-600 font-mono uppercase">
            Structural Scan v1.0
          </span>
        </div>
        <div className="w-1.5 h-1.5 bg-[#06D6A0] rounded-full animate-pulse shadow-[0_0_5px_#06D6A0]" />
      </div>
    </div>
  );
}
