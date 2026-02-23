"use client";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import { GoogleMapsOverlay } from "@deck.gl/google-maps";
import { ScatterplotLayer } from "@deck.gl/layers";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { useEffect, useRef, useState } from "react";

interface MapBoxProps {
  activeLayer: string;
  targetLocation: { lat: number; lng: number; name?: string };
  envData?: { aqi: number; temp: number; windspeed: number; weathercode: number };
  onMapClick?: (location: { lat: number; lng: number; name: string }) => void;
  onMapLoad?: (map: google.maps.Map) => void;
}

export default function MapBox({
  activeLayer,
  targetLocation,
  envData,
  onMapClick,
  onMapLoad,
}: MapBoxProps) {
  const GRID_SPREAD = 0.015;
  const GRID_STEP = GRID_SPREAD / 10;
  const GRID_JITTER = GRID_STEP * 0.4;
  const GRID_PAD = GRID_SPREAD / 2 + GRID_JITTER;

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const overlayRef = useRef<GoogleMapsOverlay | null>(null);

  // 1. DATA GENERATION (Memoized to prevent calculation lag)
  const [heatData, setHeatData] = useState<any[]>([]);
  const [thermalCache, setThermalCache] = useState<any[]>([]);
  const [floodCache, setFloodCache] = useState<any[]>([]);

  const getGridBBox = (lat: number, lng: number) => {
    return {
      minLat: lat - GRID_PAD,
      maxLat: lat + GRID_PAD,
      minLng: lng - GRID_PAD,
      maxLng: lng + GRID_PAD,
    };
  };

  const bboxContains = (bbox: any, lat: number, lng: number) => {
    return (
      lat >= bbox.minLat &&
      lat <= bbox.maxLat &&
      lng >= bbox.minLng &&
      lng <= bbox.maxLng
    );
  };

  const bboxIntersects = (a: any, b: any) => {
    return !(
      a.maxLat < b.minLat ||
      a.minLat > b.maxLat ||
      a.maxLng < b.minLng ||
      a.minLng > b.maxLng
    );
  };

  const collectCachedData = (cache: any[]) => {
    return cache.flatMap((entry) => entry.data || []);
  };

  useEffect(() => {
    try {
      const thermalRaw = localStorage.getItem("citypulse-thermal-cache");
      const floodRaw = localStorage.getItem("citypulse-flood-cache");

      if (thermalRaw) {
        const parsed = JSON.parse(thermalRaw);
        if (Array.isArray(parsed)) setThermalCache(parsed);
      }

      if (floodRaw) {
        const parsed = JSON.parse(floodRaw);
        if (Array.isArray(parsed)) setFloodCache(parsed);
      }
    } catch (e) {
      console.error("Failed to load cache:", e);
    }
  }, []);

  // 3. Add an Effect to fetch the real Thermal Grid
  useEffect(() => {
    const fetchRealThermalData = async () => {
      try {
        const bbox = getGridBBox(targetLocation.lat, targetLocation.lng);
        const cacheHit = thermalCache.find((entry) =>
          bboxContains(entry, targetLocation.lat, targetLocation.lng),
        );

        if (cacheHit) {
          setHeatData(collectCachedData(thermalCache));
          return;
        }

        const response = await fetch("/api/thermal-grid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: targetLocation.lat,
            lng: targetLocation.lng,
          }),
        });
        const data = await response.json();
        if (!data.error) {
          const nextEntry = { ...bbox, data };
          setThermalCache((prev) => {
            const nextCache = [...prev, nextEntry];
            setHeatData(collectCachedData(nextCache));
            localStorage.setItem("citypulse-thermal-cache", JSON.stringify(nextCache));
            return nextCache;
          });
        }
      } catch (e) {
        console.error("Failed to fetch real thermal grid", e);
      }
    };

    fetchRealThermalData();
  }, [targetLocation.lat, targetLocation.lng, thermalCache]);

  // 1. Add state for real solar data
  const [realSolarBuildings, setRealSolarBuildings] = useState<any[]>([]);

  // 2. Fetch the data when location changes
  useEffect(() => {
    const fetchSolarGrid = async () => {
      try {
        const response = await fetch("/api/solar-grid", {
          method: "POST",
          body: JSON.stringify({
            lat: targetLocation.lat,
            lng: targetLocation.lng,
          }),
        });
        const data = await response.json();
        console.log("FRONTEND RECEIVED DATA:", data.length);
        if (Array.isArray(data)) {
          setRealSolarBuildings(data);
        }
      } catch (e) {
        console.error("Solar Grid Fetch Error", e);
      }
    };
    fetchSolarGrid();
  }, [targetLocation.lat, targetLocation.lng]);

  // 1. Add state for flood grid data
  const [floodGridData, setFloodGridData] = useState<any[]>([]);

  // 2. Add Effect to fetch the real Flood Grid
  useEffect(() => {
    const fetchRealFloodData = async () => {
      try {
        const bbox = getGridBBox(targetLocation.lat, targetLocation.lng);
        const cacheHit = floodCache.find((entry) =>
          bboxContains(entry, targetLocation.lat, targetLocation.lng),
        );

        if (cacheHit) {
          setFloodGridData(collectCachedData(floodCache));
          return;
        }

        const response = await fetch("/api/flood-grid", {
          method: "POST",
          body: JSON.stringify({
            lat: targetLocation.lat,
            lng: targetLocation.lng,
          }),
        });
        const data = await response.json();
        const nextEntry = { ...bbox, data };
        setFloodCache((prev) => {
          const nextCache = [...prev, nextEntry];
          setFloodGridData(collectCachedData(nextCache));
          localStorage.setItem("citypulse-flood-cache", JSON.stringify(nextCache));
          return nextCache;
        });
      } catch (e) {
        console.error("Flood Grid Fetch Error", e);
      }
    };
    fetchRealFloodData();
  }, [targetLocation.lat, targetLocation.lng, floodCache]);

  const [zoom, setZoom] = useState(17);

  // PULSE ANIMATION TIMER
  const [timer, setTimer] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTimer((t) => t + 1), 100);
    return () => clearInterval(interval);
  }, []);

  // 2. INITIALIZE MAP & OVERLAY
  useEffect(() => {
    const initMap = async () => {
      setOptions({
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        version: "3.58", // Use a stable version to prevent breaking changes
      } as any);

      try {
        const { Map } = (await importLibrary(
          "maps",
        )) as google.maps.MapsLibrary;
        const { Geocoder } = (await importLibrary(
          "geocoding",
        )) as google.maps.GeocodingLibrary;

        if (mapRef.current && !mapInstanceRef.current) {
          const instance = new Map(mapRef.current, {
            center: { lat: targetLocation.lat, lng: targetLocation.lng },
            zoom: 18.5,
            maxZoom: 19,
            minZoom: 18,
            tilt: 45,
            heading: 0,
            mapId: process.env.NEXT_PUBLIC_MAP_ID as string,
            disableDefaultUI: true,
            backgroundColor: "#0B1211",
            gestureHandling: "greedy",
            renderingType: "VECTOR" as any,
          });

          mapInstanceRef.current = instance;

          // Throttled Zoom Listener
          instance.addListener("zoom_changed", () => {
            const z = instance.getZoom();
            if (z && Math.abs(z - zoom) > 0.3) setZoom(z);
          });

          // --- THE STABILITY FIX: interleaved: false ---
          // This stops the 'drawBuffers' error by giving Deck.gl its own canvas.
          const overlay = new GoogleMapsOverlay({
            layers: [],
            interleaved: false,
            useDevicePixels: true,
          });

          overlay.setMap(instance);
          overlayRef.current = overlay;

          if (onMapLoad) onMapLoad(instance);

          const geocoder = new Geocoder();

          // --- AUTO-LOCATE AFTER USER GEOLOCATION IS AVAILABLE ---
          if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                instance.panTo({ lat, lng });

                geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                  if (status === "OK" && results && results[0] && onMapClick) {
                    const components = results[0].address_components;
                    const poi = components.find(
                      (c) =>
                        c.types.includes("point_of_interest") ||
                        c.types.includes("establishment"),
                    );
                    const route = components.find((c) => c.types.includes("route"));
                    let name = poi
                      ? poi.long_name
                      : route
                        ? route.long_name
                        : results[0].formatted_address.split(",")[0];

                    onMapClick({ lat, lng, name });
                  }
                });
              },
              () => {
                // If geolocation fails or is denied, do nothing and wait for user input.
              },
              { enableHighAccuracy: true, timeout: 8000 },
            );
          }

          // --- NEW: DRAG TO RE-CENTER LOGIC ---
          let dragTimeout: NodeJS.Timeout;

          instance.addListener("dragend", () => {
            // Clear any existing timeout if user starts dragging again quickly
            clearTimeout(dragTimeout);

            // Set a new timeout for 2 seconds
            dragTimeout = setTimeout(() => {
              const center = instance.getCenter();
              if (!center) return;

              const lat = center.lat();
              const lng = center.lng();

              // Reverse geocode to get the name of the new center
              geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === "OK" && results && results[0] && onMapClick) {
                  const components = results[0].address_components;
                  const poi = components.find(
                    (c) =>
                      c.types.includes("point_of_interest") ||
                      c.types.includes("establishment"),
                  );
                  const route = components.find((c) => c.types.includes("route"));
                  let name = poi
                    ? poi.long_name
                    : route
                      ? route.long_name
                      : results[0].formatted_address.split(",")[0];
                  
                  // Trigger the same update as a click
                  onMapClick({ lat, lng, name });
                }
              });
            }, 500); 
          });

          // Keep the click listener for immediate updates
          instance.addListener("click", (e: google.maps.MapMouseEvent) => {
            if (!e.latLng) return;
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            instance.panTo({ lat, lng });

            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              if (status === "OK" && results && results[0] && onMapClick) {
                const components = results[0].address_components;
                const poi = components.find(
                  (c) =>
                    c.types.includes("point_of_interest") ||
                    c.types.includes("establishment"),
                );
                const route = components.find((c) => c.types.includes("route"));
                let name = poi
                  ? poi.long_name
                  : route
                    ? route.long_name
                    : results[0].formatted_address.split(",")[0];
                onMapClick({ lat, lng, name });
              }
            });
          });
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    };

    initMap();

    // CLEANUP: Essential to prevent lag over time
    return () => {
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
        overlayRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 3. THE LAYER ENGINE (Renders based on sidebar choice)
  useEffect(() => {
    if (!overlayRef.current) return;

    const layers: any[] = [];

    // --- THERMAL LAYER ---
    if (activeLayer === "thermal") {
      const baseTemp = envData?.temp || 30;
      const windCooling = (envData?.windspeed || 0) * 0.1; // Wind reduces heat island effect
      const aqiPenalty = (envData?.aqi || 50) > 100 ? 1.2 : 1.0; // High AQI traps heat

      layers.push(
        new HeatmapLayer({
          id: "thermal-layer",
          data: heatData, // heatData now contains raw elevation
          getPosition: (d: any) => [d.lng, d.lat],

          // Logic: Use Raw Elevation to determine color.
          // Higher Elevation = Lower Weight (Blue).
          // Lower Elevation (Basins) = Higher Weight (Red).
          getWeight: (d: any) => {
            const avgKLHeight = 35;
            // Base weight from elevation
            let weight = Math.max(0.1, avgKLHeight - d.elevation + 5);
            
            // Adjust weight based on real weather data
            // Higher base temp = higher overall weight
            // Higher wind = lower weight (cooling effect)
            // Higher AQI = higher weight (heat trapping)
            const tempFactor = baseTemp / 30; 
            weight = (weight * tempFactor * aqiPenalty) - windCooling;
            
            return Math.max(0.1, weight); // Ensure weight doesn't go negative
          },

          // --- FIX: STABILIZE THERMAL COLORS ---
          // Force Deck.gl to map weights from 0 to 40 to the colorRange.
          // Without this, it auto-scales based on the max weight in the current view.
          colorDomain: [0, 40],

          radiusPixels: Math.pow(1.6, zoom - 10) * 15,
          intensity: 2,
          threshold: 0.1,
          colorRange: [
            [65, 182, 196],
            [127, 205, 187],
            [199, 233, 180],
            [237, 248, 177],
            [253, 187, 132],
            [227, 74, 51],
          ],
          opacity: 0.35,
        }),
      );
    }

    // --- 100% REAL SOLAR LAYER ---
    if (activeLayer === "solar") {
      layers.push(
        new ScatterplotLayer({
          id: "solar-layer",
          data: realSolarBuildings,
          getPosition: (d: any) => [d.lng, d.lat],
          getFillColor: [255, 191, 0, 200], // Uniform gold for real buildings
          getRadius: 10,
          pickable: true,
          stroked: true,
          getLineWidth: 2,
          getLineColor: [255, 255, 255, 255],
        }),
      );
    }

    // --- FLOOD LAYER ---
    // Inside MapBox.tsx -> Layer Engine

    if (activeLayer === "flood" && floodGridData.length > 0) {
      // --- FIX: STABILIZE FLOOD COLORS ---
      // Instead of finding the max height in the current view (which changes when you drag),
      // we use a fixed reference height for KL (e.g., 45 meters).
      // This ensures a 20m elevation always looks the same, regardless of what's nearby.
      const fixedReferenceHeight = 45;
      
      // Weather codes for rain/drizzle/thunderstorm
      const isRaining = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(envData?.weathercode || 0);
      const rainMultiplier = isRaining ? 2.0 : 0.5; // Double risk if raining, halve if not

      layers.push(
        new HeatmapLayer({
          id: "flood-layer",
          data: floodGridData,
          getPosition: (d: any) => [d.lng, d.lat],

          // --- FIX 1: EXAGGERATE DEPTH ---
          // Instead of simple subtraction, we power it by 2.
          // This means a 2m drop looks 4x deeper, and a 4m drop looks 16x deeper.
          getWeight: (d: any) => {
            // Use the fixed reference height instead of maxLocalHeight
            const depth = Math.max(0, fixedReferenceHeight - d.elevation);
            return Math.pow(depth, 2) * rainMultiplier;
          },

          // --- FIX: STABILIZE FLOOD COLORS ---
          // Force Deck.gl to map weights from 0 to 1000 (approx 31m drop squared) to the colorRange.
          colorDomain: [0, 1000],

          // --- FIX 2: LOWER INTENSITY ---
          // We lower intensity to 0.8 so the whole map doesn't max out to dark blue immediately.
          intensity: 0.8,

          radiusPixels: Math.pow(1.5, zoom - 10) * 20, // Keep wide radius for blending
          threshold: 0.1,
          aggregation: "SUM",

          // --- FIX 3: HIGH CONTRAST PALETTE ---
          // We remove the middle blues and jump straight from Light Cyan to Deep Navy.
          colorRange: [
            [220, 250, 255], // 1. Almost White (Surface Wetness)
            [100, 220, 255], // 2. Light Cyan
            [0, 150, 255], // 3. Bright Blue
            [0, 50, 200], // 4. Royal Blue
            [0, 10, 100], // 5. Deep Navy (CRITICAL BASIN)
          ],
          opacity: isRaining ? 0.8 : 0.4, // More opaque if raining
        }),
      );
    }

    overlayRef.current.setProps({ layers });
  }, [activeLayer, heatData, zoom, timer, envData, floodGridData, realSolarBuildings]);

  // Handle Camera Movement
  useEffect(() => {
    if (mapInstanceRef.current && targetLocation) {
      mapInstanceRef.current.moveCamera({
        center: { lat: targetLocation.lat, lng: targetLocation.lng },
        zoom: 18,
        tilt: 45,
      });
    }
  }, [targetLocation]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full grayscale-[0.1] brightness-[0.7] contrast-[1.1]"
    />
  );
}
