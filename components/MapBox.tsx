"use client";
import { generateFloodData } from "@/utils/mockFloodData";
import { generateHeatmapData } from "@/utils/mockHeatmapData";
import { generateSolarData } from "@/utils/mockSolarData";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import { GoogleMapsOverlay } from "@deck.gl/google-maps";
import { ScatterplotLayer } from "@deck.gl/layers";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { useEffect, useMemo, useRef, useState } from "react";
interface MapBoxProps {
  activeLayer: string;
  targetLocation: { lat: number; lng: number; name?: string };
  onMapClick?: (location: { lat: number; lng: number; name: string }) => void;
  onMapLoad?: (map: google.maps.Map) => void;
}

export default function MapBox({
  activeLayer,
  targetLocation,
  onMapClick,
  onMapLoad,
}: MapBoxProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const overlayRef = useRef<GoogleMapsOverlay | null>(null);

  // 1. DATA GENERATION (Memoized for performance)
  const heatData = useMemo(() => {
    return generateHeatmapData(targetLocation.lat, targetLocation.lng);
  }, [
    Math.round(targetLocation.lat * 100),
    Math.round(targetLocation.lng * 100),
  ]);

  const solarData = useMemo(() => {
    return generateSolarData(targetLocation.lat, targetLocation.lng);
  }, [
    Math.round(targetLocation.lat * 100),
    Math.round(targetLocation.lng * 100),
  ]);

  const floodData = useMemo(() => {
    return generateFloodData(targetLocation.lat, targetLocation.lng);
  }, [
    Math.round(targetLocation.lat * 100),
    Math.round(targetLocation.lng * 100),
  ]);

  const [zoom, setZoom] = useState(17);

  // PULSE ANIMATION TRIGGER
  const [timer, setTimer] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTimer((t) => t + 1), 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const initMap = async () => {
      setOptions({
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        version: "weekly",
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
            zoom: 17,
            maxZoom: 19,
            minZoom: 12,
            tilt: 45,
            heading: 0,
            mapId: process.env.NEXT_PUBLIC_MAP_ID as string,
            disableDefaultUI: true,
            backgroundColor: "#0B1211",
            gestureHandling: "greedy",
            renderingType: "VECTOR" as any,
          });

          mapInstanceRef.current = instance;

          instance.addListener("zoom_changed", () => {
            const z = instance.getZoom();
            if (z && Math.abs(z - zoom) > 0.5) setZoom(Math.round(z));
          });

          // Inside MapBox.tsx -> initMap function

          const overlay = new GoogleMapsOverlay({
            layers: [],
            // 1. This helps sync the resolution between Deck.gl and Google Maps
            useDevicePixels: true,

            // 2. We cast to 'any' to bypass the strict TypeScript check
            // This allows 'depthTest' and 'blend' to reach the GPU driver
            parameters: {
              depthTest: true,
              blend: true,
            } as any,
          });
          overlay.setMap(instance);
          overlayRef.current = overlay;

          if (onMapLoad) onMapLoad(instance);

          const geocoder = new Geocoder();
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
  }, []);

  // 3. LAYER RENDER ENGINE
  useEffect(() => {
    if (!overlayRef.current) return;

    const layers: any[] = [];

    // --- THERMAL MODE ---
    if (activeLayer === "thermal") {
      layers.push(
        new HeatmapLayer({
          id: "thermal-layer",
          data: heatData,
          getPosition: (d: any) => [d.lng, d.lat],
          getWeight: (d: any) => d.weight,
          radiusPixels: Math.pow(1.6, zoom - 10) * 12,
          intensity: 1.3,
          threshold: 0.05,
          aggregation: "SUM",
          colorRange: [
            [65, 182, 196],
            [127, 205, 187],
            [199, 233, 180],
            [237, 248, 177],
            [253, 187, 132],
            [227, 74, 51],
          ],
          opacity: 0.5,
        }),
      );
    }

    // --- SOLAR MODE ---
    if (activeLayer === "solar") {
      layers.push(
        new ScatterplotLayer({
          id: "solar-layer",
          data: solarData,
          getPosition: (d: any) => [d.lng, d.lat],

          // --- DYNAMIC COLOR LOGIC ---
          // d.weight is a value from 0 to 1.
          // We map 0 to Deep Amber [180, 100, 0]
          // We map 1 to Bright Gold [255, 240, 50]
          getFillColor: (d: any) => {
            const w = d.weight || 0.5;
            return [
              255, // Red
              Math.floor(100 + 140 * w), // Green (Increases for brightness)
              Math.floor(w * 50), // Blue (Small amount for "white" glow)
              220, // Opacity
            ];
          },

          getRadius: zoom > 17 ? 12 : 25,
          radiusScale: 1 + Math.sin(timer / 5) * 0.1,
          pickable: true,
          stroked: true,
          lineWidthMinPixels: 2,

          // Border color also gets brighter for high potential
          getLineColor: (d: any) => [255, 255, 255, d.weight > 0.8 ? 200 : 80],

          updateTriggers: {
            radiusScale: [timer],
            getFillColor: [solarData], // Redraw if data changes
          },
        }),
      );
    }
    if (activeLayer === "flood") {
      layers.push(
        new HeatmapLayer({
          id: "flood-layer",
          data: floodData,
          getPosition: (d: any) => [d.lng, d.lat],
          getWeight: (d: any) => d.weight,
          radiusPixels: Math.pow(1.5, zoom - 10) * 15,
          intensity: 1.5,
          // Increase threshold to 0.1 to cut off the messy "dark" edges
          threshold: 0.1,
          aggregation: "SUM",
          // NEW COLOR RANGE: Cyan -> Sky Blue -> Deep Blue (No black/dark indigo)
          colorRange: [
            [150, 230, 255], // Very Light Blue (Edges)
            [100, 200, 255],
            [50, 150, 255],
            [20, 100, 230],
            [0, 60, 180], // Deep Blue (Core/Deepest)
          ],
          opacity: 0.5,
        }),
      );
    }

    overlayRef.current.setProps({ layers });
  }, [activeLayer, heatData, solarData, zoom, timer]); // Added timer to dependency

  // Fly-to animation when location changes
  useEffect(() => {
    if (mapInstanceRef.current && targetLocation) {
      mapInstanceRef.current.moveCamera({
        center: { lat: targetLocation.lat, lng: targetLocation.lng },
        zoom: 18,
        tilt: 45,
      });
    }
  }, [targetLocation]);

  return <div ref={mapRef} className="w-full h-full brightness-[0.8]" />;
}
