// Inside LocationPopup.tsx
export default function LocationPopup({ locationName, activeLayer }: any) {
  // Dynamic stats based on layer
  const isSolar = activeLayer === "solar";

  return (
    <div className="w-72 bg-[#141E1C]/90 backdrop-blur-2xl border border-[#06D6A0]/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      <h3 className="text-[#06D6A0] font-bold text-lg mb-4 truncate">
        {locationName}
      </h3>

      <div className="space-y-3 mb-6">
        {isSolar ? (
          <>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">☀️ Solar Potential</span>
              <span className="text-[#06D6A0] font-bold italic">Excellent</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">💰 Est. Savings</span>
              <span className="text-white font-mono">RM 3,420 /yr</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">📏 Usable Roof</span>
              <span className="text-white font-mono">142 m²</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">🌡️ Heat Index</span>
              <span className="text-orange-400 font-bold">High (38°C)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">🍃 Air Quality</span>
              <span className="text-[#06D6A0] font-mono">42 AQI</span>
            </div>
          </>
        )}
      </div>

      {/* Buttons... */}
    </div>
  );
}
