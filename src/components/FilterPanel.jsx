import React, { useState } from "react";
import "../styles/filter-panel.css";

const FilterPanel = ({ onFilterChange }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filterTime, setFilterTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    "Noise - Residential",
    "Illegal Parking",
    "Street Condition",
    "Water System",
    "Pothole",
    "Graffiti",
    "Heat/Hot Water",
  ];

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    setIsLoading(true);

    // Call parent handler
    onFilterChange(value);

    // Clear the loading state after a moment
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  };

  const handleReset = () => {
    setSelectedCategory("");
    setFilterTime(null);
    onFilterChange("");
  };

  return (
    <div className="filter-panel" data-testid="filter-panel">
      <h2>🔍 Filters</h2>

      <div className="filter-group">
        <label htmlFor="category-filter">Complaint Type:</label>
        <select
          id="category-filter"
          data-testid="category-filter"
          value={selectedCategory}
          onChange={handleFilterChange}
          disabled={isLoading}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {selectedCategory && (
        <button className="reset-btn" onClick={handleReset}>
          ✕ Clear Filter
        </button>
      )}

      {filterTime !== null && (
        <div
          className={`filter-time ${filterTime < 100 ? "success" : "warning"}`}
        >
          ⏱️ Filter update: {filterTime.toFixed(2)}ms
          {filterTime < 100 ? " ✓" : " ⚠️"}
        </div>
      )}

      <div className="filter-info">
        <p>📊 Real-time filtering using MapLibre GL JS layer filters</p>
      </div>
    </div>
  );
};

export default FilterPanel;
