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
