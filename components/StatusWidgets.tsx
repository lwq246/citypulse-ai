import { Thermometer, Wind } from "lucide-react";

export default function StatusWidgets() {
  return (
    <div className="flex flex-col gap-4 w-64">
      {/* Air Quality Widget */}
      <div className="bg-[#141E1C]/70 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-2xl">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-gray-400 text-[10px] uppercase tracking-widest">
              Air Quality
            </p>
            <h3 className="text-4xl font-light">
              42 <span className="text-xs text-[#06D6A0]">AQI</span>
            </h3>
          </div>
          <div className="p-2 bg-[#06D6A0]/20 rounded-lg text-[#06D6A0]">
            <Wind size={20} />
          </div>
        </div>
        <div className="flex gap-1 h-4 items-end">
          {[20, 40, 60, 100, 60, 30].map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-sm ${i === 3 ? "bg-[#06D6A0]" : "bg-gray-700"}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <p className="text-[10px] text-[#06D6A0] mt-2 font-medium">
          Excellent Condition
        </p>
      </div>

      {/* Surface Temp Widget */}
      <div className="bg-[#141E1C]/70 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-2xl">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-400 text-[10px] uppercase tracking-widest">
              Surface Temp
            </p>
            <h3 className="text-4xl font-light text-orange-500">
              34.2 <span className="text-xs">°C</span>
            </h3>
          </div>
          <div className="p-2 bg-orange-500/20 rounded-lg text-orange-500">
            <Thermometer size={20} />
          </div>
        </div>
        <div className="mt-2 h-[1px] bg-white/10 relative">
          <div className="absolute top-0 left-0 h-full w-2/3 bg-orange-500 shadow-[0_0_10px_orange]" />
        </div>
        <p className="text-[10px] text-orange-500 mt-2 font-medium">
          +2.4° VS AVG
        </p>
      </div>
    </div>
  );
}
