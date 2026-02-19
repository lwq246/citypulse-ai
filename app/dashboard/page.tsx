"use client";

import LocationPopup from "@/components/LocationPopup";
import MapBox from "@/components/MapBox";
import MapControls from "@/components/MapControls";
import SearchBar from "@/components/SearchBar";
import Sidebar from "@/components/Sidebar";
import StatusWidgets from "@/components/StatusWidgets";
import { LocateFixed } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Dashboard() {
  const [activeLayer, setActiveLayer] = useState("thermal");

  // 1. LOCATION STATE
  const [targetLocation, setTargetLocation] = useState({
    lat: 3.1579,
    lng: 101.7116,
    name: "KL City Centre",
  });

  // 2. ENVIRONMENTAL DATA STATE (Real-time from Google APIs)
  const [envData, setEnvData] = useState({
    aqi: 0,
    temp: 0,
    condition: "Loading...",
    status: "Analyzing Area...",
  });
  const [solarData, setSolarData] = useState({
    area: 0,
    savings: 0,
    potential: "Analyzing...",
    source: "",
  });

  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  const fetchSolarInsights = async (lat: number, lng: number) => {
    try {
      const res = await fetch("/api/solar", {
        method: "POST",
        body: JSON.stringify({ lat, lng }),
      });
      const data = await res.json();
      setSolarData(data);
    } catch (e) {
      console.error("Solar Error", e);
    }
  };

  // --- EFFECT 1: GET INITIAL USER POSITION ---
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTargetLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: "My Current Position",
          });
        },
        (error) => {
          console.error("Initial geolocation error:", error);
        },
      );
    }
  }, []);

  // --- EFFECT 2: FETCH LIVE GOOGLE ENVIRONMENTAL DATA ---
  // This triggers every time targetLocation changes
  useEffect(() => {
    const fetchGoogleData = async () => {
      try {
        // --- MODIFIED: Call your own local API instead of Google ---
        const response = await fetch("/api/google-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: targetLocation.lat,
            lng: targetLocation.lng,
          }),
        });

        if (!response.ok) throw new Error("Local API error");

        const data = await response.json();

        // Update UI with data received from the server
        setEnvData({
          // Convert specifically to a number to be safe
          aqi: Number(data.aqi),
          temp: parseFloat(data.temp),
          condition: data.status === "Good air quality" ? "Clear" : "Hazy",
          status: data.status,
        });
      } catch (error) {
        console.error("Failed to fetch environmental data:", error);
      }
    };

    if (targetLocation.lat && targetLocation.lng) {
      fetchGoogleData();
    }
  }, [targetLocation]);

  // --- MAP CONTROL FUNCTIONS ---
  const handleLocateMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setTargetLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          name: "My Location",
        });
      });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(
        (mapInstanceRef.current.getZoom() || 17) + 1,
      );
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(
        (mapInstanceRef.current.getZoom() || 17) - 1,
      );
    }
  };

  const handleTilt = () => {
    if (mapInstanceRef.current) {
      const currentTilt = mapInstanceRef.current.getTilt();
      mapInstanceRef.current.setTilt(currentTilt === 45 ? 0 : 45);
    }
  };

  const handleReset = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.moveCamera({ heading: 0, tilt: 45 });
    }
  };

  const handleRotate = () => {
    if (mapInstanceRef.current) {
      const currentHeading = mapInstanceRef.current.getHeading() || 0;
      mapInstanceRef.current.setHeading(currentHeading + 90);
    }
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#0B1211] text-white font-sans">
      {/* 1. THE MAP LAYER */}
      <div className="absolute inset-0 z-0">
        <MapBox
          activeLayer={activeLayer}
          targetLocation={targetLocation}
          onMapClick={(loc) => {
            setTargetLocation(loc);
            fetchSolarInsights(loc.lat, loc.lng); // Get solar data for new click
          }}
        />
      </div>

      {/* 2. TOP UI LAYER */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <Sidebar activeLayer={activeLayer} setActiveLayer={setActiveLayer} />
        </div>

        <div className="flex-1 flex justify-center pointer-events-auto px-4">
          <SearchBar onLocationSelect={setTargetLocation} />
        </div>

        <div className="flex flex-col items-end gap-4 pointer-events-auto">
          {/* Real Google Data passed to Widgets */}
          <StatusWidgets
            aqi={envData.aqi}
            temp={envData.temp}
            status={envData.status}
          />
          <div className="bg-[#141E1C]/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full shadow-2xl">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest mr-2">
              Active Region
            </span>
            <span className="text-xs font-bold text-[#06D6A0]">
              {targetLocation.name}
            </span>
          </div>
        </div>
      </div>

      {/* 3. CENTER POPUP LAYER */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="relative w-64 h-64 border border-[#06D6A0]/20 rounded-full flex items-center justify-center animate-pulse">
          <div className="w-2 h-2 bg-[#06D6A0] rounded-full shadow-[0_0_15px_#06D6A0]" />
          <div className="absolute top-full mt-4 pointer-events-auto">
            <LocationPopup
              locationName={targetLocation.name}
              activeLayer={activeLayer}
              envData={envData}
              solarData={solarData} // NEW PROP
            />
          </div>
        </div>
      </div>

      {/* 4. BOTTOM CONTROLS LAYER */}
      <div className="absolute bottom-0 left-0 w-full p-8 flex justify-between items-end z-20 pointer-events-none">
        {/* System Status Indicator */}
        <div className="bg-[#141E1C]/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-3 pointer-events-auto shadow-xl">
          <div className="w-2 h-2 bg-[#06D6A0] rounded-full animate-ping" />
          <span className="text-[10px] font-mono tracking-widest text-[#06D6A0]">
            ENGINE v1.0 ONLINE
          </span>
        </div>

        {/* Map Controls */}
        <div className="pointer-events-auto flex gap-4">
          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onTilt={handleTilt}
            onRotate={handleRotate}
            onReset={handleReset}
          />
          <button
            onClick={handleLocateMe}
            className="bg-[#141E1C]/80 backdrop-blur-md border border-white/10 p-3.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-[#06D6A0] transition-all group shadow-2xl active:scale-90"
            title="My Location"
          >
            <LocateFixed
              size={20}
              className="group-hover:scale-110 transition-transform"
            />
          </button>
        </div>

        {/* Intensity Legend */}
        <div className="bg-[#141E1C]/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl pointer-events-auto shadow-2xl">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 font-bold">
            {activeLayer === "solar" ? "Solar Yield" : "Thermal Intensity"}
          </p>
          <div
            className={`w-48 h-2 rounded-full ${activeLayer === "solar" ? "bg-gradient-to-r from-amber-900 to-yellow-400" : "bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500"}`}
          />
          <div className="flex justify-between text-[8px] mt-1 text-gray-500 font-bold uppercase tracking-tighter">
            <span>Low</span>
            <span>Critical</span>
          </div>
        </div>
      </div>
    </main>
  );
}
