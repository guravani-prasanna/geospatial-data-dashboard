import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { Quadtree, Rectangle } from "../utils/Quadtree";
import "../styles/map.css";

const Map = ({ onMapStateChange, onFilterChange, onStatsUpdate }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const quadtreeRef = useRef(null);
  const allFeaturesRef = useRef([]);
  const dataLoadedRef = useRef(false);
  const styleLoadedRef = useRef(false);
  const updateStatsTimeoutRef = useRef(null);
  const clusteringEnabledRef = useRef(false);

  useEffect(() => {
    if (map.current) return;

    // Create map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [-74.006, 40.7128],
      zoom: 10,
      pitch: 0,
      bearing: 0,
    });

    // Wait for map to be fully loaded with style
    const handleStyleLoad = () => {
      if (styleLoadedRef.current) return;
      styleLoadedRef.current = true;

      console.log("✅ Map style loaded");
      setLoaded(true);

      // Add source and layers with a small delay
      setTimeout(() => {
        addDataLayers();
      }, 100);
    };

    map.current.on("style.load", handleStyleLoad);

    map.current.on("moveend", () => {
      if (dataLoadedRef.current) {
        const center = map.current.getCenter();
        const zoom = map.current.getZoom();

        onMapStateChange({
          center: [center.lng, center.lat],
          zoom: zoom,
        });

        // Update statistics with debouncing
        clearTimeout(updateStatsTimeoutRef.current);
        updateStatsTimeoutRef.current = setTimeout(() => {
          updateStatistics();
        }, 300);
      }
    });

    return () => {
      if (updateStatsTimeoutRef.current) {
        clearTimeout(updateStatsTimeoutRef.current);
      }
      if (map.current) {
        map.current.off("style.load", handleStyleLoad);
        map.current.remove();
      }
      map.current = null;
    };
  }, [onMapStateChange]);

  const addDataLayers = async () => {
    if (dataLoadedRef.current) return;
    dataLoadedRef.current = true;

    try {
      console.log("📥 Loading GeoJSON data...");
      const response = await fetch("/data/nyc_311.geojson");
      const data = await response.json();
      allFeaturesRef.current = data.features;
      console.log(`✅ Loaded ${data.features.length} features`);

      // Add source WITH clustering
      if (!map.current.getSource("complaints")) {
        map.current.addSource("complaints", {
          type: "geojson",
          data: data,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });
        // Mark clustering as enabled
        clusteringEnabledRef.current = true;
        console.log("✅ Source added with clustering enabled");
      }

      // Add heatmap layer
      if (!map.current.getLayer("heatmap-layer")) {
        map.current.addLayer({
          id: "heatmap-layer",
          type: "heatmap",
          source: "complaints",
          maxzoom: 15,
          paint: {
            "heatmap-weight": 1,
            "heatmap-intensity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              1,
              9,
              3,
            ],
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              "rgba(0, 0, 255, 0)",
              0.1,
              "royalblue",
              0.3,
              "cyan",
              0.5,
              "lime",
              0.7,
              "yellow",
              1,
              "red",
            ],
            "heatmap-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              2,
              9,
              20,
            ],
            "heatmap-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              0,
              8,
              1,
              9,
              0.8,
              10,
              0,
            ],
          },
        });
        console.log("✅ Heatmap layer added");
      }

      // Add cluster layer
      if (!map.current.getLayer("cluster-layer")) {
        map.current.addLayer({
          id: "cluster-layer",
          type: "circle",
          source: "complaints",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#51bbd6",
              100,
              "#f1f075",
              750,
              "#f28cb1",
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              100,
              30,
              750,
              40,
            ],
            "circle-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              0,
              8,
              1,
              9,
              0.9,
              10,
              0,
            ],
          },
        });
        console.log("✅ Cluster layer added");
      }

      // Add cluster count layer
      if (!map.current.getLayer("cluster-count")) {
        map.current.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "complaints",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-size": 12,
          },
          paint: {
            "text-color": "#000",
            "text-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              0,
              8,
              1,
              9,
              0.9,
              10,
              0,
            ],
          },
        });
        console.log("✅ Cluster count layer added");
      }

      // Add unclustered points layer
      if (!map.current.getLayer("unclustered-point")) {
        map.current.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "complaints",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": "#11b4da",
            "circle-radius": 4,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff",
            "circle-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              0,
              10,
              0,
              11,
              1,
            ],
          },
        });
        console.log("✅ Unclustered point layer added");
      }

      // Add cluster click handler
      map.current.on("click", "cluster-layer", (e) => {
        const features = map.current.queryRenderedFeatures({
          layers: ["cluster-layer"],
        });
        if (features.length === 0) return;

        const clusterId = features[0].properties.cluster_id;
        map.current
          .getSource("complaints")
          .getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;
            map.current.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom,
            });
          });
      });
      console.log("✅ Click handler added");

      // Initialize Quadtree
      if (!quadtreeRef.current) {
        initializeQuadtree(data);
      }

      // Expose window functions
      exposeWindowFunctions(data);

      // Update statistics after all layers are definitely ready
      setTimeout(() => {
        if (
          map.current.getLayer("cluster-layer") &&
          map.current.getLayer("unclustered-point")
        ) {
          updateStatistics();
          console.log("✅ All done!");
        }
      }, 1500);
    } catch (error) {
      console.error("❌ Failed to load data:", error);
    }
  };

  const initializeQuadtree = (data) => {
    try {
      console.log("🌳 Initializing Quadtree...");
      const boundary = new Rectangle(0, 0, 180, 90);
      quadtreeRef.current = new Quadtree(boundary);

      data.features.forEach((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        quadtreeRef.current.insert({
          x: lng,
          y: lat,
          feature: feature,
        });
      });

      console.log(
        "✅ Quadtree initialized with",
        data.features.length,
        "points",
      );
    } catch (error) {
      console.error("❌ Failed to initialize Quadtree:", error);
    }
  };

  const updateStatistics = () => {
    try {
      if (!map.current) return;

      // Check if layers exist
      const clusterLayerExists =
        map.current.getLayer("cluster-layer") !== undefined;
      const pointLayerExists =
        map.current.getLayer("unclustered-point") !== undefined;

      if (!clusterLayerExists || !pointLayerExists) {
        return;
      }

      // Get all visible features
      const visibleFeatures = map.current.queryRenderedFeatures({
        layers: ["unclustered-point", "cluster-layer"],
      });

      let totalVisible = 0;
      let complaintCounts = {};

      visibleFeatures.forEach((feature) => {
        if (feature.properties.point_count) {
          totalVisible += feature.properties.point_count;
        } else {
          totalVisible += 1;
          const type = feature.properties.complaintType || "Unknown";
          complaintCounts[type] = (complaintCounts[type] || 0) + 1;
        }
      });

      // Find top complaint type
      let topType = "N/A";
      let maxCount = 0;
      Object.entries(complaintCounts).forEach(([type, count]) => {
        if (count > maxCount) {
          maxCount = count;
          topType = type;
        }
      });

      // Get distribution
      const allCounts = {};
      allFeaturesRef.current.forEach((feature) => {
        const type = feature.properties.complaintType || "Unknown";
        allCounts[type] = (allCounts[type] || 0) + 1;
      });

      const distribution = Object.values(allCounts).slice(0, 5);

      onStatsUpdate({
        totalVisible: totalVisible,
        visibleClusters: visibleFeatures.filter((f) => f.properties.point_count)
          .length,
        topComplaintType: topType,
        distribution: distribution,
      });

      console.log("📊 Stats updated:", { totalVisible, topType });
    } catch (error) {
      console.error("Error updating statistics:", error);
    }
  };

  const exposeWindowFunctions = (data) => {
    // REQUIREMENT 2: Get map state
    window.getMapState = () => {
      if (!map.current) return { center: [-74.006, 40.7128], zoom: 10 };
      const center = map.current.getCenter();
      return {
        center: [center.lng, center.lat],
        zoom: map.current.getZoom(),
      };
    };

    // Store feature count for later use
    window._totalFeatures = data.features.length;

    // REQUIREMENT 3: Get data source feature count
    window.getDataSourceFeatureCount = (sourceId) => {
      if (!map.current) return 0;
      try {
        return window._totalFeatures || 0;
      } catch (e) {
        return 0;
      }
    };

    // REQUIREMENT 4: Check if source is clustered
    // Use the ref we set when creating the source
    window.isSourceClustered = (sourceId) => {
      return clusteringEnabledRef.current === true;
    };

    // REQUIREMENT 5: Get visible feature count
    window.getVisibleFeatureCount = () => {
      if (!map.current) return 0;
      try {
        if (!map.current.getLayer("unclustered-point")) return 0;

        const features = map.current.queryRenderedFeatures({
          layers: ["unclustered-point"],
        });

        console.log("Visible unclustered points:", features.length);
        return features.length;
      } catch (error) {
        console.warn("Error getting visible features:", error);
        return 0;
      }
    };

    // REQUIREMENT 6: Measure filter update time
    window.measureFilterUpdateTime = async (filterValue) => {
      return new Promise((resolve) => {
        if (!map.current) {
          resolve(0);
          return;
        }

        const start = performance.now();

        try {
          if (filterValue) {
            const filter = ["==", ["get", "complaintType"], filterValue];
            if (map.current.getLayer("cluster-layer")) {
              map.current.setFilter("cluster-layer", [
                "all",
                ["has", "point_count"],
                filter,
              ]);
            }
            if (map.current.getLayer("unclustered-point")) {
              map.current.setFilter("unclustered-point", [
                "all",
                ["!", ["has", "point_count"]],
                filter,
              ]);
            }
            if (map.current.getLayer("heatmap-layer")) {
              map.current.setFilter("heatmap-layer", filter);
            }
          } else {
            if (map.current.getLayer("cluster-layer")) {
              map.current.setFilter("cluster-layer", ["has", "point_count"]);
            }
            if (map.current.getLayer("unclustered-point")) {
              map.current.setFilter("unclustered-point", [
                "!",
                ["has", "point_count"],
              ]);
            }
            if (map.current.getLayer("heatmap-layer")) {
              map.current.setFilter("heatmap-layer", null);
            }
          }

          setTimeout(() => {
            updateStatistics();
            const end = performance.now();
            const duration = end - start;
            console.log(`⏱️ Filter applied in ${duration.toFixed(2)}ms`);
            resolve(duration);
          }, 16);
        } catch (error) {
          console.error("Filter error:", error);
          const end = performance.now();
          resolve(end - start);
        }
      });
    };

    // REQUIREMENT 7: Get layer opacity
    window.getLayerOpacity = (layerId) => {
      if (!map.current) return 0;

      const layer = map.current.getLayer(layerId);
      if (!layer) return 0;

      const paint = layer.paint || {};
      let opacity = paint["circle-opacity"] || paint["heatmap-opacity"];

      if (!opacity) return 1;

      if (Array.isArray(opacity)) {
        const zoom = map.current.getZoom();

        if (opacity[0] === "interpolate") {
          for (let i = 3; i < opacity.length - 2; i += 2) {
            const nextZoom = opacity[i];
            if (nextZoom >= zoom) {
              const prevZoom = opacity[i - 2];
              const prevOpacity = opacity[i - 1];
              const nextOpacity = opacity[i + 1];

              if (zoom <= prevZoom) {
                return prevOpacity;
              }

              const ratio = (zoom - prevZoom) / (nextZoom - prevZoom);
              return prevOpacity + (nextOpacity - prevOpacity) * ratio;
            }
          }
          return opacity[opacity.length - 1];
        }
      }

      return opacity || 1;
    };

    // REQUIREMENT 8: Get statistic value
    window.getStatValue = (statId) => {
      if (!map.current) return null;

      try {
        if (!map.current.getLayer("unclustered-point")) return null;

        const visibleFeatures = map.current.queryRenderedFeatures({
          layers: ["unclustered-point", "cluster-layer"],
        });

        if (statId === "top-complaint-type") {
          let complaintCounts = {};

          visibleFeatures.forEach((feature) => {
            const type = feature.properties.complaintType || "Unknown";
            if (feature.properties.point_count) {
              complaintCounts[type] =
                (complaintCounts[type] || 0) + feature.properties.point_count;
            } else {
              complaintCounts[type] = (complaintCounts[type] || 0) + 1;
            }
          });

          let topType = "N/A";
          let maxCount = 0;
          Object.entries(complaintCounts).forEach(([type, count]) => {
            if (count > maxCount) {
              maxCount = count;
              topType = type;
            }
          });

          return topType;
        }

        return null;
      } catch (error) {
        return null;
      }
    };

    // REQUIREMENT 9: Get quadtree points
    window.getQuadtreePoints = (bounds) => {
      if (!quadtreeRef.current) {
        return { type: "FeatureCollection", features: [] };
      }

      try {
        let ne, sw;

        if (bounds._ne && bounds._sw) {
          ne = bounds._ne;
          sw = bounds._sw;
        } else if (typeof bounds.getNorthEast === "function") {
          ne = bounds.getNorthEast();
          sw = bounds.getSouthWest();
        } else {
          throw new Error("Invalid bounds format");
        }

        const range = new Rectangle(
          (ne.lng + sw.lng) / 2,
          (ne.lat + sw.lat) / 2,
          Math.abs(ne.lng - sw.lng) / 2,
          Math.abs(ne.lat - sw.lat) / 2,
        );

        const points = quadtreeRef.current.query(range);

        return {
          type: "FeatureCollection",
          features: points.slice(0, 5000).map((p) => p.feature),
        };
      } catch (error) {
        console.error("Error querying quadtree:", error);
        return { type: "FeatureCollection", features: [] };
      }
    };

    console.log("✅ All window functions exposed");
  };

  return (
    <div className="map-container-wrapper">
      <div
        ref={mapContainer}
        data-testid="map-container"
        className="map-container"
      />
      <button
        data-testid="toggle-quadtree"
        onClick={() => {
          console.log("Toggle quadtree clicked");
        }}
        className="quadtree-toggle"
      >
        🗺️ MapLibre Clustering
      </button>
    </div>
  );
};

export default Map;
