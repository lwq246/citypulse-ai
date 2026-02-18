"use client";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { useEffect, useRef } from "react";

interface MapBoxProps {
  activeLayer: string;
  targetLocation: { lat: number; lng: number; name?: string };
  onMapClick?: (location: { lat: number; lng: number; name: string }) => void;
}

export default function MapBox({
  activeLayer,
  targetLocation,
  onMapClick,
}: MapBoxProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    const initMap = async () => {
      // Initialize the loader options
      setOptions({
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        version: "weekly", // "weekly" ensures 3D features are available
      } as any);

      try {
        // Import necessary libraries
        const { Map } = (await importLibrary(
          "maps",
        )) as google.maps.MapsLibrary;
        const { Geocoder } = (await importLibrary(
          "geocoding",
        )) as google.maps.GeocodingLibrary;

        if (mapRef.current && !mapInstanceRef.current) {
          // Initialize the Map
          mapInstanceRef.current = new Map(mapRef.current, {
            center: { lat: targetLocation.lat, lng: targetLocation.lng },
            zoom: 17,
            tilt: 45,
            heading: 0,
            mapId: process.env.NEXT_PUBLIC_MAP_ID as string,
            disableDefaultUI: true,
            backgroundColor: "#0B1211",
            gestureHandling: "greedy",
            // Explicitly request Vector rendering for 3D
            renderingType: "VECTOR" as any,
          });

          // Initialize Geocoder
          const geocoder = new Geocoder();

          // --- CLICK LISTENER ---
          mapInstanceRef.current.addListener(
            "click",
            (e: google.maps.MapMouseEvent) => {
              if (!e.latLng) return;

              const lat = e.latLng.lat();
              const lng = e.latLng.lng();

              // 1. Pan the map to the clicked spot
              mapInstanceRef.current?.panTo({ lat, lng });

              // 2. Get the address name (Smart Reverse Geocoding)
              geocoder.geocode(
                { location: { lat, lng } },
                (results, status) => {
                  let locationName = "Selected Location";

                  if (status === "OK" && results && results[0]) {
                    // Get the specific components (Building, Street, City, etc.)
                    const components = results[0].address_components;

                    // A. Check for a Point of Interest (e.g., "Pavilion KL", "Hotel Nusa CT")
                    const poi = components.find(
                      (c) =>
                        c.types.includes("point_of_interest") ||
                        c.types.includes("establishment") ||
                        c.types.includes("premise"),
                    );

                    // B. Check for a Route (e.g., "Jalan Mega 1/5")
                    const route = components.find((c) =>
                      c.types.includes("route"),
                    );

                    // C. Check for Neighborhood (e.g., "Bukit Bintang")
                    const neighborhood = components.find(
                      (c) =>
                        c.types.includes("sublocality") ||
                        c.types.includes("neighborhood") ||
                        c.types.includes("locality"),
                    );

                    // Logic: Use the most specific name found
                    if (poi) {
                      locationName = poi.long_name;
                    } else if (route) {
                      locationName = route.long_name;
                    } else if (neighborhood) {
                      locationName = neighborhood.long_name;
                    } else {
                      // Fallback: Use formatted address but strip numbers if they are the first part
                      const parts = results[0].formatted_address.split(",");
                      // If the first part looks like a house number (digits), skip it
                      if (/^\d+/.test(parts[0].trim())) {
                        locationName = parts[1]?.trim() || parts[0];
                      } else {
                        locationName = parts[0];
                      }
                    }
                  }

                  // 3. Send data back to Dashboard
                  if (onMapClick) {
                    onMapClick({ lat, lng, name: locationName });
                  }
                },
              );
            },
          );
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    };

    initMap();
  }, []); // Run once on mount

  // Watch for location changes (e.g., from Search Bar)
  useEffect(() => {
    if (mapInstanceRef.current && targetLocation) {
      mapInstanceRef.current.moveCamera({
        center: { lat: targetLocation.lat, lng: targetLocation.lng },
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
