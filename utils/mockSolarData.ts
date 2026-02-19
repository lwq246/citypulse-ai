// utils/mockSolarData.ts

export function generateSolarData(lat: number, lng: number) {
  const data = [];
  // We use fewer points for solar to represent individual buildings
  for (let i = 0; i < 150; i++) {
    const roofArea = Math.floor(Math.random() * 200) + 50; // 50sqm to 250sqm
    const efficiency = Math.random() * 0.2 + 0.8; // 80% to 100% sunlight
    
    // Malaysian Solar Math: 
    // Avg 4 hours peak sun * area * 0.15 panel efficiency * 365 days * RM 0.50 per kWh
    const annualSavings = Math.floor(roofArea * 4 * 0.15 * 365 * 0.5);

    data.push({
      lng: lng + (Math.random() - 0.5) * 0.012,
      lat: lat + (Math.random() - 0.5) * 0.012,
      area: roofArea,
      savings: annualSavings,
      sunlight: Math.floor(efficiency * 100),
      // Solar Color: Bright Gold to Amber
      color: [255, 200, 0]
    });
  }
  return data;
}