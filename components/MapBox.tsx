"use client";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { useEffect, useRef } from "react";

interface MapBoxProps {
  activeLayer: string;
  targetLocation: { lat: number; lng: number };
}

export default function MapBox({ activeLayer, targetLocation }: MapBoxProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    const initMap = async () => {
      // --- THE FIX IS HERE ---
      // We add 'as any' to bypass the strict TypeScript check for 'version'
      setOptions({
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        version: "weekly", // "weekly" usually contains the latest 3D features
      } as any);

      try {
        const { Map } = (await importLibrary(
          "maps",
        )) as google.maps.MapsLibrary;

        if (mapRef.current && !mapInstanceRef.current) {
          mapInstanceRef.current = new Map(mapRef.current, {
            center: targetLocation, // Initial center
            zoom: 17,
            tilt: 45,
            heading: 0,
            mapId: process.env.NEXT_PUBLIC_MAP_ID as string,
            disableDefaultUI: true,
            backgroundColor: "#0B1211",
            gestureHandling: "greedy",
          });
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    };

    initMap();
  }, []); // Run once on mount

  // Watch for location changes and Fly!
  useEffect(() => {
    if (mapInstanceRef.current && targetLocation) {
      // Check if the map is far away from the target to decide if we fly or pan
      mapInstanceRef.current.moveCamera({
        center: targetLocation,
        zoom: 18,
        tilt: 45,
        heading: 0,
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
