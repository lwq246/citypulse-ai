"use client";
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

  // 1. STABLE DATA: Memoize both Heat and Solar data
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

  const [zoom, setZoom] = useState(17);

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
            if (z && Math.abs(z - zoom) > 0.5) {
              setZoom(Math.round(z));
            }
          });

          const overlay = new GoogleMapsOverlay({ layers: [] });
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

                // Smart Naming Logic (Malaysia-Proof)
                const poi = components.find(
                  (c) =>
                    (c.types.includes("point_of_interest") ||
                      c.types.includes("establishment")) &&
                    !c.types.includes("political"),
                );
                const route = components.find((c) => c.types.includes("route"));

                let locationName = "Selected Area";
                if (poi) locationName = poi.long_name;
                else if (route) locationName = route.long_name;
                else {
                  const parts = results[0].formatted_address.split(",");
                  locationName = isNaN(Number(parts[0]))
                    ? parts[0]
                    : parts[1]?.trim() || parts[0];
                }

                onMapClick({ lat, lng, name: locationName });
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

  // 3. LAYER ENGINE: Handles Switching and Dynamic Visuals
  useEffect(() => {
    if (!overlayRef.current) return;

    const layers: any[] = [];

    // THERMAL LAYER (Heatmap)
    if (activeLayer === "thermal") {
      layers.push(
        new HeatmapLayer({
          id: "thermal-layer",
          data: heatData,
          getPosition: (d: any) => [d.lng, d.lat],
          getWeight: (d: any) => d.weight,
          radiusPixels: Math.pow(1.55, zoom - 10) * 15,
          intensity: 1.5,
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

    // SOLAR LAYER (Scatterplot circles on roofs)
    if (activeLayer === "solar") {
      layers.push(
        new ScatterplotLayer({
          id: "solar-layer",
          data: solarData,
          getPosition: (d: any) => [d.lng, d.lat],
          // Gold color with high opacity
          getFillColor: [255, 191, 0, 200],
          // Scale size with zoom so they look like building markers
          getRadius: zoom > 17 ? 15 : 30,
          pickable: true,
          stroked: true,
          lineWidthMinPixels: 2,
          getLineColor: [255, 255, 255, 150], // White border
        }),
      );
    }

    overlayRef.current.setProps({ layers });
  }, [activeLayer, heatData, solarData, zoom]);

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
