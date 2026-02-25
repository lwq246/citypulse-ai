"use client";
import {
  Activity,
  Droplets,
  Loader2,
  Maximize2,
  Thermometer,
  Waves,
  Wind,
  Zap,
} from "lucide-react";

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
  floodData: {
    elevation: string;
    riskLevel: string;
    estDepth: string;
  };
  // NEW PROPS FOR ANALYSIS
  onAnalyze: () => void;
  isAnalyzing: boolean;
  lat?: number;
  lng?: number;
}

export default function LocationPopup({
  locationName,
  activeLayer,
  envData,
  solarData,
  floodData,
  onAnalyze,
  isAnalyzing,
  lat,
  lng,
}: LocationPopupProps) {
  const isSolar = activeLayer === "solar";
  const isFlood = activeLayer === "flood";

  const accentColor = isSolar ? "#FFBF00" : isFlood ? "#3B82F6" : "#06D6A0";
  const borderColor = isSolar
    ? "border-yellow-500/30"
    : isFlood
      ? "border-blue-500/30"
      : "border-[#06D6A0]/30";

  // Helper to open real Google Street View
  const openStreetView = () => {
    if (lat && lng) {
      window.open(
        `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`,
        "_blank",
      );
    }
  };

  return (
    <div
      className={`w-64 bg-[#141E1C]/95 backdrop-blur-2xl border ${borderColor} rounded-xl p-4 shadow-[0_0_40px_rgba(0,0,0,0.7)] relative overflow-hidden pointer-events-auto transition-all duration-300`}
    >
      <div
        className="absolute top-0 left-0 w-full h-[2px] opacity-70"
        style={{
          background: `linear-gradient(to right, transparent, ${accentColor}, transparent)`,
        }}
      />

      <h3
        className="font-bold text-sm mb-3 truncate leading-tight italic"
        style={{ color: accentColor }}
      >
        {locationName || "Analyzing Area..."}
      </h3>

      <div className="space-y-2 mb-4">
        {isSolar ? (
          /* SOLAR MODE */
          <>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Zap size={12} className="text-yellow-400" /> Potential
              </span>
              <span className="text-yellow-400 font-bold">
                {solarData.potential}
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400">💰 Est. Savings</span>
              <span className="text-white font-mono font-bold text-[11px]">
                RM {solarData.savings.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400">📏 Roof Area</span>
              <span className="text-white font-mono">{solarData.area} m²</span>
            </div>
          </>
        ) : isFlood ? (
          /* FLOOD MODE */
          <>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Waves size={12} className="text-blue-400" /> Risk Level
              </span>
              <span className="text-blue-400 font-bold uppercase tracking-tighter">
                {floodData?.riskLevel}
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Droplets size={12} className="text-blue-300" /> Est. Depth
              </span>
              <span className="text-white font-mono">
                {floodData?.estDepth}
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400">⛰️ Elevation</span>
              <span className="text-white font-mono">
                {floodData?.elevation}m ASL
              </span>
            </div>
          </>
        ) : (
          /* THERMAL MODE */
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

      {/* REFINED BUTTONS */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="text-[#0B1211] text-[9px] font-black py-2 rounded-md hover:brightness-110 active:scale-95 transition-all uppercase tracking-tighter shadow-lg flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: accentColor }}
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={10} className="animate-spin" />
              Scanning...
            </>
          ) : (
            "Analyze"
          )}
        </button>
        <button
          onClick={openStreetView}
          className="bg-white/5 border border-white/10 text-white text-[9px] font-bold py-2 rounded-md hover:bg-white/10 active:scale-95 transition-all uppercase tracking-tighter flex items-center justify-center gap-1 cursor-pointer"
        >
          <Maximize2 size={10} />
          View 360°
        </button>
      </div>
    </div>
  );
}
