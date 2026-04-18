import React, { useState } from "react";
import Map from "./components/Map";
import FilterPanel from "./components/FilterPanel";
import StatsSidebar from "./components/StatsSidebar";
import "./styles/main.css";

function App() {
  const [mapState, setMapState] = useState({
    center: [-74.006, 40.7128],
    zoom: 10,
  });
  const [statsData, setStatsData] = useState({
    totalVisible: 0,
    visibleClusters: 0,
    topComplaintType: "N/A",
    distribution: [0, 0, 0, 0, 0],
  });

  const handleFilterChange = async (category) => {
    if (window.measureFilterUpdateTime) {
      const time = await window.measureFilterUpdateTime(category);
      console.log(`Filter applied in ${time.toFixed(2)}ms`);
    }
  };

  const handleMapStateChange = (newState) => {
    setMapState(newState);
  };

  const handleStatsUpdate = (newStats) => {
    setStatsData(newStats);
  };

  return (
    <div className="app">
      <div className="map-wrapper">
        <Map
          onMapStateChange={handleMapStateChange}
          onFilterChange={handleFilterChange}
          onStatsUpdate={handleStatsUpdate}
        />
      </div>
      <div className="sidebar">
        <FilterPanel onFilterChange={handleFilterChange} />
        <StatsSidebar statsData={statsData} />
      </div>
    </div>
  );
}

export default App;
