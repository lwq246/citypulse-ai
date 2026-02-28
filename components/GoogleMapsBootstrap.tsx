"use client";

import { setOptions } from "@googlemaps/js-api-loader";
import { useEffect } from "react";

export default function GoogleMapsBootstrap() {
  useEffect(() => {
    // This runs ONLY once when the entire website loads
    setOptions({
      key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
      version: "3.58", // Use a stable version to prevent breaking changes
    } as any);
  }, []);

  return null; // This component doesn't render anything
}
