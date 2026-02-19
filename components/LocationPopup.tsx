"use client";
import { Activity, Thermometer, Wind, Zap } from "lucide-react";

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
    /* Reduced width to w-64 and padding to p-4 */
    <div className="w-64 bg-[#141E1C]/95 backdrop-blur-2xl border border-[#06D6A0]/30 rounded-xl p-4 shadow-[0_0_40px_rgba(0,0,0,0.7)] relative overflow-hidden pointer-events-auto transition-all duration-300">
      {/* Slim Top Accent Bar */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#06D6A0] to-transparent opacity-50" />

      {/* Header - Smaller font and margin */}
      <h3 className="text-[#06D6A0] font-bold text-sm mb-3 truncate leading-tight italic">
        {locationName || "Analyzing..."}
      </h3>

      {/* Data Rows - More compact spacing */}
      <div className="space-y-2 mb-4">
        {isSolar ? (
          <>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Zap size={12} className="text-yellow-400" /> Potential
              </span>
              <span className="text-[#06D6A0] font-bold">
                {solarData.potential}
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400">💰 Est. Savings</span>
              <span className="text-white font-mono font-bold">
                RM {solarData.savings.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400">📏 Roof Area</span>
              <span className="text-white font-mono">{solarData.area} m²</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Thermometer size={12} className="text-orange-500" /> Temp
              </span>
              <span className="text-orange-400 font-mono font-bold">
                {envData.temp ? Number(envData.temp).toFixed(1) : "--"}°C
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Wind size={12} className="text-[#06D6A0]" /> Air Quality
              </span>
              <span className="text-[#06D6A0] font-mono font-bold">
                {envData.aqi || "--"} AQI
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Activity size={12} /> Status
              </span>
              <span className="text-gray-300 font-medium truncate max-w-[80px]">
                {envData.status}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Buttons - Slimmer padding and font */}
      <div className="grid grid-cols-2 gap-2">
        <button className="bg-[#06D6A0] text-[#0B1211] text-[9px] font-black py-2 rounded-md hover:brightness-110 active:scale-95 transition-all uppercase tracking-tighter">
          Analyze
        </button>
        <button className="bg-white/5 border border-white/10 text-white text-[9px] font-bold py-2 rounded-md hover:bg-white/10 active:scale-95 transition-all uppercase tracking-tighter">
          View 360°
        </button>
      </div>

      {/* --- FOOTER REMOVED FOR COMPACTNESS --- */}
    </div>
  );
}
