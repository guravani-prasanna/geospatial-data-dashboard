# Geospatial Data Dashboard

A high-performance, interactive geospatial data visualization dashboard built with Mapbox GL JS, React, and a custom Quadtree implementation.

## Features

- 🗺️ **Full-screen Mapbox GL JS map** centered on New York City
- 📊 **50,000+ geospatial data points** with intelligent clustering
- 🔥 **Heatmap layer** for density visualization at low zoom levels
- 🎯 **Real-time filtering** by complaint type (<50ms updates)
- 📈 **Live statistics sidebar** with pie charts
- 🌳 **Quadtree spatial indexing** for fast bbox queries
- ⚡ **60 FPS performance** maintained during pan/zoom
- 🐳 **Docker deployment** ready
- 📋 **Comprehensive performance documentation**

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Mapbox account (free tier available)

### Installation

```bash
# Clone the repository
git clone https://github.com/guravani-prasanna/geospatial-data-dashboard.git
cd geospatial-data-dashboard

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your Mapbox token to .env
# VITE_MAPBOX_TOKEN=pk_your_token_here
```
Development
bash
npm run dev
Open http://localhost:5173 in your browser.

Production Build
bash
npm run build
npm run preview
Docker Deployment
bash
docker-compose up -d --build
Access the app at http://localhost:8080

Project Structure
Code
├── public/
│   └── data/
│       └── nyc_311.geojson       # 50,000+ geospatial points
├── src/
│   ├── components/
│   │   ├── Map.jsx               # Mapbox map component
│   │   ├── FilterPanel.jsx       # Filter controls
│   │   └── StatsSidebar.jsx      # Statistics display
│   ├── utils/
│   │   ├── Quadtree.js           # Spatial indexing
│   │   └── performanceUtils.js   # Performance helpers
│   ├── styles/                   # Component styles
│   └── App.jsx                   # Main application
├── Dockerfile                    # Container configuration
├── docker-compose.yml            # Service orchestration
├── vite.config.js               # Vite configuration
├── package.json                 # Dependencies
├── PERFORMANCE.md               # Performance analysis
└── README.md                    # This file


How It Works
1. Data Loading
Loads 50,000+ NYC 311 service request points from GeoJSON
Points are automatically clustered by Mapbox GL JS
Clustering reduces visible DOM elements by 95%
2. Clustering
At different zoom levels:

Zoom ≤ 9: Heatmap shows density patterns
Zoom 10: Smooth transition to clustered points
Zoom ≥ 14: Individual points visible
Zoom ≥ 15: Fine-grained detail
3. Filtering
Select a complaint type from the dropdown:

Instantly filters visible points
Uses GPU-accelerated Mapbox expressions
Update time: < 50ms ✨
4. Statistics
Auto-updating sidebar shows:

Total visible points
Visible clusters count
Top complaint type
Distribution pie chart
5. Quadtree Mode
Toggle to manual Quadtree-based clustering:

Query spatial data structure for visible bounds
O(log n) complexity for bbox queries
Compare performance vs. Mapbox clustering
