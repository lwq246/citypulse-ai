'use client';

import AIAnalysisPanel from '@/components/AIAnalysisPanel';
import LocationPopup from '@/components/LocationPopup';
import MapBox from '@/components/MapBox';
import MapControls from '@/components/MapControls';
import SearchBar from '@/components/SearchBar';
import Sidebar from '@/components/Sidebar';
import StatusWidgets from '@/components/StatusWidgets';
import { AnimatePresence } from 'framer-motion';
import { LocateFixed } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
export default function Dashboard() {
  const [activeLayer, setActiveLayer] = useState('thermal');

  // 1. LOCATION STATE
  const [targetLocation, setTargetLocation] = useState({
    lat: 3.1579,
    lng: 101.7116,
    name: 'KL City Centre',
  });

  // 2. ENVIRONMENTAL DATA STATE (Temp & Air Quality)
  const [envData, setEnvData] = useState({
    aqi: 0,
    temp: 0,
    condition: 'Loading...',
    status: 'Analyzing Area...',
    windspeed: 0,
    weathercode: 0,
  });

  // 3. SOLAR DATA STATE (Savings & Area)
  const [solarData, setSolarData] = useState({
    area: 0,
    savings: 0,
    potential: 'Analyzing...',
    source: 'Initializing...',
  });

  const [floodData, setFloodData] = useState({
    elevation: '0',
    riskLevel: 'Analyzing...',
    estDepth: '0.0m',
  });

  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  // --- DATA FETCHING ENGINE ---

  // Fetches Air Quality and Weather
  const fetchEnvironmentalData = async (lat: number, lng: number) => {
    try {
      const response = await fetch('/api/google-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng }),
      });
      if (!response.ok) throw new Error('Env API error');
      const data = await response.json();

      setEnvData({
        aqi: Number(data.aqi),
        temp: parseFloat(data.temp),
        condition: data.condition || 'Clear',
        status: data.status || 'Moderate',
        windspeed: data.windspeed || 0,
        weathercode: data.weathercode || 0,
      });
    } catch (error) {
      console.error('Failed to fetch environmental data:', error);
    }
  };

  // Fetches Solar Insights (Google API + Predictive Fallback)
  const fetchSolarInsights = async (lat: number, lng: number) => {
    try {
      const res = await fetch('/api/solar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng }),
      });
      if (!res.ok) throw new Error('Solar API error');
      const data = await res.json();

      setSolarData({
        area: data.area,
        savings: data.savings,
        potential: data.potential,
        source: data.source,
      });
    } catch (e) {
      console.error('Solar Fetch Error', e);
    }
  };

  const fetchFloodData = async (lat: number, lng: number) => {
    try {
      const res = await fetch('/api/flood', {
        method: 'POST',
        body: JSON.stringify({ lat, lng }),
      });
      const data = await res.json();
      setFloodData(data);
    } catch (e) {
      console.error('Flood API Error', e);
    }
  };

  // --- EFFECTS ---

  // Effect 1: Initial Geolocation (Runs once)
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTargetLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: 'My Current Position',
          });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            console.warn(
              'Geolocation permission denied. Using default location.',
            );
          } else {
            console.warn('Geolocation error:', error.message);
          }
        },
      );
    }
  }, []);

  // Effect 2: Unified Data Trigger
  // This ensures that whenever 'targetLocation' updates, ALL data layers refresh
  useEffect(() => {
    if (targetLocation.lat && targetLocation.lng) {
      fetchEnvironmentalData(targetLocation.lat, targetLocation.lng);
      fetchSolarInsights(targetLocation.lat, targetLocation.lng);
      fetchFloodData(targetLocation.lat, targetLocation.lng); // <--- ADD THIS
    }
  }, [targetLocation]);

  // --- MAP CONTROL FUNCTIONS ---

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTargetLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: 'My Location',
          });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            alert(
              'Please enable location services in your browser settings to use this feature.',
            );
          } else {
            console.warn('Geolocation error:', error.message);
          }
        },
      );
    } else {
      alert('Geolocation is not supported by your browser.');
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

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: JSON.stringify({
          lat: targetLocation.lat,
          lng: targetLocation.lng,
          locationName: targetLocation.name,
        }),
      });
      const data = await res.json();
      setAiResult(data);
    } catch (e) {
      console.error('AI Error', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#0B1211] text-white font-sans">
      {/* LAYER 0: THE MAP (Background) */}
      <div className="absolute inset-0 z-0">
        <MapBox
          activeLayer={activeLayer}
          targetLocation={targetLocation}
          envData={envData} // <--- PASS THIS
          onMapClick={(loc) => setTargetLocation(loc)}
          onMapLoad={(map) => {
            mapInstanceRef.current = map;
          }}
        />
      </div>

      {/* LAYER 1: TOP HUD (Sidebar, Search, Status) */}
      {/* This layer is just for the items at the top edge */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <Sidebar activeLayer={activeLayer} setActiveLayer={setActiveLayer} />
        </div>

        <div className="flex-1 flex justify-center pointer-events-auto px-4">
          <SearchBar onLocationSelect={setTargetLocation} />
        </div>

        <div className="flex flex-col items-end gap-4 pointer-events-auto">
          <StatusWidgets
            aqi={envData.aqi}
            temp={envData.temp}
            status={envData.status}
          />
          <div className="bg-[#141E1C]/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full shadow-2xl">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest mr-2 font-bold">
              Active Region
            </span>
            <span className="text-xs font-bold text-[#06D6A0]">
              {targetLocation.name}
            </span>
          </div>
        </div>
      </div>

      {/* LAYER 2: AI ANALYSIS SIDEBAR (Fixed Right) */}
      {/* By putting it here, it slides over everything else without moving the SearchBar */}
      <AnimatePresence>
        {aiResult && (
          <AIAnalysisPanel
            data={aiResult}
            locationName={targetLocation.name}
            lat={targetLocation.lat}
            lng={targetLocation.lng}
            onClose={() => setAiResult(null)}
            activeLayer={activeLayer}
            envData={envData}
            solarData={solarData}
            floodData={floodData}
          />
        )}
      </AnimatePresence>

      {/* 3. CENTER POPUP LAYER */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        {/* This container is exactly at the dead center of the screen */}
        <div className="relative">
          {/* THE DOT: Fixed to center using translate-x/y */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#06D6A0] rounded-full shadow-[0_0_15px_#06D6A0] z-20" />

          {/* THE RING: Fixed to center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-[#06D6A0]/30 rounded-full animate-pulse" />

          {/* THE POPUP: Positioned 32px below the dot without affecting the dot's position */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-auto">
            <LocationPopup
              locationName={targetLocation.name}
              activeLayer={activeLayer}
              envData={envData}
              solarData={solarData}
              floodData={floodData}
              onAnalyze={runAIAnalysis} // <--- PASS THIS
              isAnalyzing={isAnalyzing} // <--- PASS THIS
            />
          </div>
        </div>
      </div>

      {/* 4. BOTTOM CONTROLS LAYER */}
      <div className="absolute bottom-0 left-0 w-full p-8 flex justify-between items-end z-20 pointer-events-none">
        <div className="bg-[#141E1C]/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-3 pointer-events-auto shadow-xl">
          <div className="w-2 h-2 bg-[#06D6A0] rounded-full animate-ping" />
          <span className="text-[10px] font-mono tracking-widest text-[#06D6A0]">
            ENGINE v1.0 ONLINE
          </span>
        </div>

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
            {activeLayer === 'solar'
              ? 'Solar Potential'
              : activeLayer === 'flood'
                ? 'Flood Vulnerability'
                : 'Thermal Intensity'}
          </p>
          <div
            className={`w-48 h-2 rounded-full transition-all duration-500 ${
              activeLayer === 'solar'
                ? 'bg-gradient-to-r from-amber-900 via-yellow-500 to-yellow-200'
                : activeLayer === 'flood'
                  ? 'bg-gradient-to-r from-cyan-300 via-blue-500 to-indigo-900'
                  : 'bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500'
            }`}
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
