// components/LocationPopup.tsx
"use client";

// Add props interface
export default function LocationPopup({
  locationName = "Unknown Area",
}: {
  locationName?: string;
}) {
  return (
    <div className="w-72 bg-[#141E1C]/90 backdrop-blur-2xl border border-[#06D6A0]/30 rounded-2xl p-5 shadow-[0_0_40px_rgba(6,214,160,0.15)] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#06D6A0] to-transparent opacity-50" />

      {/* Use the dynamic name */}
      <h3 className="text-[#06D6A0] font-bold text-lg mb-4 truncate">
        {locationName}
      </h3>

      {/* ... Rest of code remains the same ... */}
    </div>
  );
}
