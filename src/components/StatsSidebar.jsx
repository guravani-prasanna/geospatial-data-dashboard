import React, { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import "../styles/stats-sidebar.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const StatsSidebar = ({ statsData }) => {
  const [stats, setStats] = useState({
    totalVisible: 0,
    visibleClusters: 0,
    topComplaintType: "N/A",
    distribution: [0, 0, 0, 0, 0],
  });

  useEffect(() => {
    if (statsData) {
      setStats(statsData);
    }
  }, [statsData]);

  const chartData = {
    labels: ["Type 1", "Type 2", "Type 3", "Type 4", "Type 5"],
    datasets: [
      {
        data: stats.distribution,
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
        borderColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div className="stats-sidebar" data-testid="stats-container">
      <h2>📊 Statistics</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Visible Points</div>
          <div className="stat-value">
            {stats.totalVisible.toLocaleString()}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Visible Clusters</div>
          <div className="stat-value">{stats.visibleClusters}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Top Complaint</div>
          <div className="stat-value-small">{stats.topComplaintType}</div>
        </div>
      </div>

      <div className="chart-container">
        <h3>Complaint Distribution</h3>
        <Pie data={chartData} options={chartOptions} />
      </div>

      <div className="stats-info">
        <p>💡 Stats update when you pan or zoom the map</p>
      </div>
    </div>
  );
};

export default StatsSidebar;
