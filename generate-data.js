import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, "public", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Generate 50,000 random points in NYC area
const features = [];
const complaintTypes = [
  "Noise - Residential",
  "Illegal Parking",
  "Street Condition",
  "Water System",
  "Pothole",
  "Graffiti",
  "Heat/Hot Water",
];

console.log("🔄 Generating 50,000 sample geospatial points...");

for (let i = 0; i < 50000; i++) {
  // Random coordinates in NYC area
  const lng = -74.006 + (Math.random() - 0.5) * 0.4;
  const lat = 40.7128 + (Math.random() - 0.5) * 0.4;

  features.push({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [lng, lat],
    },
    properties: {
      complaintType:
        complaintTypes[Math.floor(Math.random() * complaintTypes.length)],
      descriptor: "Sample complaint #" + (i + 1),
      createdDate: new Date(
        Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
      )
        .toISOString()
        .split("T")[0],
      status: Math.random() > 0.5 ? "Open" : "Closed",
    },
  });

  // Progress indicator
  if ((i + 1) % 10000 === 0) {
    console.log(`  ✓ Generated ${i + 1} points...`);
  }
}

const geojson = {
  type: "FeatureCollection",
  features: features,
};

const outputPath = path.join(dataDir, "nyc_311.geojson");
fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));

console.log(`✅ Successfully generated 50,000 sample points!`);
console.log(`📁 Saved to: ${outputPath}`);
console.log(
  `📊 File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`,
);
