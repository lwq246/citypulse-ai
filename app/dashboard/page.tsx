"use client";

import LocationPopup from "@/components/LocationPopup";
import MapBox from "@/components/MapBox";
import MapControls from "@/components/MapControls";
import SearchBar from "@/components/SearchBar";
import Sidebar from "@/components/Sidebar";
import StatusWidgets from "@/components/StatusWidgets";
import { LocateFixed } from "lucide-react"; // Import the icon for the button
import { useEffect, useRef, useState } from "react";

export default function Dashboard() {
  const [activeLayer, setActiveLayer] = useState("thermal");

  // 1. DEFAULT STATE: Start at KLCC (Fallback)
  const [targetLocation, setTargetLocation] = useState({
    lat: 3.1579,
    lng: 101.7116,
    name: "KL City Centre",
  });

  // 2. NEW: Get User Location on Load
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Success: Update state to user's location
          setTargetLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: "Current Location", // We don't know the street name yet
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fail: Stay at KLCC default
        },
      );
    }
  }, []);

  // 3. Helper function to trigger location manually
  const handleLocateMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setTargetLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          name: "Current Location",
        });
      });
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  const fetchGoogleWeather = async (lat: number, lng: number) => {
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    // Note: Ensure the API name in the URL matches the latest Google documentation
    const url = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${API_KEY}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: {
            latitude: lat,
            longitude: lng,
          },
          units: "METRIC", // Get Celsius
          languageCode: "en",
        }),
      });

      const data = await response.json();

      // Google returns temperature and weather descriptions (e.g., "Clear", "Cloudy")
      return {
        temp: data.temperature.value,
        condition: data.condition.text,
        icon: data.condition.icon, // Google provides an icon URL too!
      };
    } catch (error) {
      console.error("Google Weather Error:", error);
      return { temp: 32, condition: "Sunny" }; // Fallback
    }
  };

  // 1. CREATE A REF TO HOLD THE MAP INSTANCE
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  // 2. DEFINE CONTROL FUNCTIONS
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom() || 17;
      mapInstanceRef.current.setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom() || 17;
      mapInstanceRef.current.setZoom(currentZoom - 1);
    }
  };

  const handleTilt = () => {
    if (mapInstanceRef.current) {
      // Toggle between 0 (flat) and 45 (3D)
      const currentTilt = mapInstanceRef.current.getTilt();
      mapInstanceRef.current.setTilt(currentTilt === 45 ? 0 : 45);
    }
  };

  const handleReset = () => {
    if (mapInstanceRef.current) {
      // Reset to North (Heading 0) and Tilt 45
      mapInstanceRef.current.moveCamera({
        heading: 0,
        tilt: 45,
      });
    }
  };

  const handleRotate = () => {
    if (mapInstanceRef.current) {
      const currentHeading = mapInstanceRef.current.getHeading() || 0;
      // Rotate 90 degrees clockwise
      const newHeading = currentHeading + 90;

      mapInstanceRef.current.setHeading(newHeading);
    }
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#0B1211] text-white font-sans">
      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        <MapBox
          activeLayer={activeLayer}
          targetLocation={targetLocation}
          onMapClick={setTargetLocation}
          // 3. CAPTURE THE MAP INSTANCE
          onMapLoad={(map) => {
            mapInstanceRef.current = map;
          }}
        />
      </div>

      {/* Top UI */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <Sidebar activeLayer={activeLayer} setActiveLayer={setActiveLayer} />
        </div>

        <div className="flex-1 flex justify-center pointer-events-auto">
          <SearchBar onLocationSelect={setTargetLocation} />
        </div>

        <div className="flex flex-col items-end gap-4 pointer-events-auto">
          <StatusWidgets />
          <div className="bg-[#141E1C]/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest mr-2">
              Active Region
            </span>
            <span className="text-xs font-bold text-[#06D6A0]">
              {targetLocation.name}
            </span>
          </div>
        </div>
      </div>

      {/* Center Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="relative w-64 h-64 border border-[#06D6A0]/20 rounded-full flex items-center justify-center animate-pulse">
          <div className="w-2 h-2 bg-[#06D6A0] rounded-full shadow-[0_0_15px_#06D6A0]" />
          <div className="absolute top-full mt-4 pointer-events-auto">
            <LocationPopup
              locationName={targetLocation.name}
              activeLayer={activeLayer} // Pass this!
            />
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 w-full p-8 flex justify-between items-end z-20 pointer-events-none">
        <div className="bg-[#141E1C]/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-3 pointer-events-auto">
          <div className="w-2 h-2 bg-[#06D6A0] rounded-full animate-ping" />
          <span className="text-[10px] font-mono tracking-widest text-[#06D6A0]">
            SYSTEM NOMINAL
          </span>
        </div>

        <div className="pointer-events-auto flex gap-4">
          {/* 4. PASS FUNCTIONS TO CONTROLS */}
          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onTilt={handleTilt}
            onRotate={handleRotate} // <--- Connect it here
            onReset={handleReset}
          />

          <button
            onClick={handleLocateMe}
            className="bg-[#141E1C]/80 backdrop-blur-md border border-white/10 p-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-[#06D6A0] transition-colors group"
            title="Fly to My Location"
          >
            <LocateFixed size={20} className="group-hover:animate-pulse" />
          </button>
        </div>

        <div className="bg-[#141E1C]/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl pointer-events-auto">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">
            Intensity Scale
          </p>
          <div className="w-48 h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full" />
        </div>
      </div>
    </main>
  );
}
