const fs = require("fs");
const path = require("path");

// Download NYC 311 data from:
// https://data.cityofnewyork.us/api/views/erm2-nwe9/rows.json?accessType=DOWNLOAD

async function prepareData() {
  try {
    // Replace with actual downloaded file path
    const rawData = JSON.parse(
      fs.readFileSync("path/to/raw_data.json", "utf8"),
    );

    const features = rawData.slice(0, 50000).map((record) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [parseFloat(record[13]), parseFloat(record[14])],
      },
      properties: {
        complaintType: record[7],
        descriptor: record[8],
        createdDate: record[9],
        status: record[11],
      },
    }));

    const geojson = {
      type: "FeatureCollection",
      features: features.filter(
        (f) => f.geometry.coordinates[0] && f.geometry.coordinates[1],
      ),
    };

    fs.writeFileSync(
      path.join(__dirname, "../public/data/nyc_311.geojson"),
      JSON.stringify(geojson, null, 2),
    );

    console.log(`Created GeoJSON with ${geojson.features.length} features`);
  } catch (error) {
    console.error("Error preparing data:", error);
  }
}

prepareData();
