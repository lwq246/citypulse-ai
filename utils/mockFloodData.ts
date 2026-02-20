// utils/mockFloodData.ts

export function generateFloodData(lat: number, lng: number) {
  const data = [];
  // We generate clusters to look like "pooling" water
  for (let i = 0; i < 1500; i++) {
    const isMainPool = Math.random() > 0.7;
    
    data.push({
      // Concentrate points in specific clusters rather than a perfect circle
      lng: lng + (Math.random() - 0.5) * 0.025,
      lat: lat + (Math.random() - 0.5) * 0.025,
      // Weight represents "Water Depth" or "Saturation"
      weight: isMainPool ? Math.random() * 5 : Math.random() * 1.5,
    });
  }
  return data;
}