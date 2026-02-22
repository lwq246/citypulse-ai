export function generateHeatmapData(lat: number, lng: number) {
  const data = [];
  
  // Increase to 8,000 points for much denser coverage
  for (let i = 0; i < 2000; i++) {
    data.push({
      // Keep the spread tight so they overlap more
      lng: lng + (Math.random() - 0.5) * 0.015,
      lat: lat + (Math.random() - 0.5) * 0.015,
      weight: Math.random() * 3 
    });
  }

  return data;
}