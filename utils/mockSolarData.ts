export function generateSolarData(lat: number, lng: number) {
  const data = [];
  for (let i = 0; i < 150; i++) {
    // Randomize the potential (weight)
    const weight = Math.random(); 
    
    data.push({
      lng: lng + (Math.random() - 0.5) * 0.012,
      lat: lat + (Math.random() - 0.5) * 0.012,
      weight: weight, // Used for the color scale
      area: Math.floor(weight * 150) + 50,
      savings: Math.floor(weight * 5000) + 500,
    });
  }
  return data;
}