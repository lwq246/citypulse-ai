"use client";
import { importLibrary } from "@googlemaps/js-api-loader";
import { Command, Search } from "lucide-react";
import { useEffect, useRef } from "react";

// Define the Props interface
interface SearchBarProps {
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    name: string;
  }) => void;
}

export default function SearchBar({ onLocationSelect }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initAutocomplete = async () => {
      // 1. Load the Places Library
      const { Autocomplete } = (await importLibrary(
        "places",
      )) as google.maps.PlacesLibrary;

      if (inputRef.current) {
        // 2. Attach Autocomplete to the input
        const autocomplete = new Autocomplete(inputRef.current, {
          fields: ["geometry", "name", "formatted_address"],
          componentRestrictions: { country: "my" }, // Limit search to Malaysia
        });

        // 3. Listen for selection
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();

          if (place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const name = place.name || "Unknown Location";

            // 4. Send data back to Dashboard
            onLocationSelect({ lat, lng, name });
            console.log("Selected:", name, lat, lng);
          }
        });
      }
    };

    initAutocomplete();
  }, [onLocationSelect]);

  return (
    <div className="w-full max-w-xl group relative">
      <div className="relative flex items-center z-50">
        <Search className="absolute left-4 w-4 h-4 text-gray-400 group-focus-within:text-[#06D6A0] transition-colors" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search Kuala Lumpur landmarks (e.g. KLCC, Bangsar)..."
          className="w-full bg-[#141E1C]/80 backdrop-blur-xl border border-white/10 py-3 pl-12 pr-16 rounded-xl text-sm focus:outline-none focus:border-[#06D6A0]/50 transition-all shadow-2xl text-white placeholder-gray-500"
        />
        <div className="absolute right-4 flex items-center gap-1 px-2 py-1 rounded bg-black/40 border border-white/10 text-[10px] text-gray-500 font-mono">
          <Command size={10} /> K
        </div>
      </div>

      {/* Search results container (Google maps will inject DOM elements here automatically) */}
    </div>
  );
}
