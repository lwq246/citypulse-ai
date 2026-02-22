"use client";
import { Thermometer, Wind } from "lucide-react";

// 1. Define the Interface for the props
interface StatusWidgetsProps {
  aqi: number;
  temp: number;
  status: string;
}

// 2. Apply the interface to the component
export default function StatusWidgets({
  aqi,
  temp,
  status,
}: StatusWidgetsProps) {
  return (
    <div className="flex flex-col gap-4 w-64">
      {/* Air Quality Widget */}
      <div className="bg-[#141E1C]/70 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-2xl">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">
              Air Quality
            </p>
            <h3 className="text-4xl font-light">
              {typeof aqi === "number" ? aqi : "--"}
              <span className="text-xs text-[#06D6A0] font-bold">AQI</span>
            </h3>
          </div>
          <div className="p-2 bg-[#06D6A0]/20 rounded-lg text-[#06D6A0]">
            <Wind size={20} />
          </div>
        </div>

        {/* Simple visual bar */}
        <div className="flex gap-1 h-1.5 mt-3">
          <div
            className={`flex-1 rounded-full ${aqi < 50 ? "bg-[#06D6A0]" : "bg-gray-700"}`}
          />
          <div
            className={`flex-1 rounded-full ${aqi >= 50 && aqi < 100 ? "bg-yellow-500" : "bg-gray-700"}`}
          />
          <div
            className={`flex-1 rounded-full ${aqi >= 100 ? "bg-red-500" : "bg-gray-700"}`}
          />
        </div>

        <p className="text-[10px] text-[#06D6A0] mt-2 font-bold uppercase tracking-wider">
          {status}
        </p>
      </div>

      {/* Surface Temp Widget */}
      <div className="bg-[#141E1C]/70 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-2xl">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">
              Local Temp
            </p>
            <h3 className="text-4xl font-light text-orange-500 tracking-tighter">
              {temp ? Number(temp).toFixed(1) : "--"}{" "}
              <span className="text-xs font-bold text-orange-400">°C</span>
            </h3>
          </div>
          <div className="p-2 bg-orange-500/20 rounded-lg text-orange-500">
            <Thermometer size={20} />
          </div>
        </div>
        <div className="mt-4 h-[2px] bg-white/5 relative overflow-hidden rounded-full">
          <div
            className="absolute top-0 left-0 h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)] transition-all duration-1000"
            style={{ width: `${(temp / 45) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
