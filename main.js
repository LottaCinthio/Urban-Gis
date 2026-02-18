require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/GeoJSONLayer"
], function (Map, SceneView, GeoJSONLayer) {

  const layersInfo = [
    { name: "Health Point", file: "Healthcare_center.geojson", type: "health-icon", id: "toggleHealthcare" },
    { name: "Health Zones", file: "Walking_zones_to_healthcare.geojson", type: "health-walk", id: "toggleHealthWalk" },
    { name: "School Points", file: "Primary_schools.geojson", type: "school-icon", id: "toggleSchools" },
    { name: "School Zones", file: "Walk_zones_to_school.geojson", type: "walk", id: "toggleWalk" },
    { name: "Parking", file: "Parkingspots.geojson", type: "parking", id: "toggleParking" },
    { name: "Bus Stops", file: "Busstops.geojson", type: "bus-icon", id: "toggleBus" },
    { name: "Playgrounds", file: "Playgrounds.geojson", type: "play-icon", id: "togglePlay" },
    { name: "Buildings", file: "buildings.geojson", type: "building", id: "toggleBuildings" }
  ];

  const map = new Map({ basemap: "gray-vector", ground: "world-elevation" });

  layersInfo.forEach(info => {
    let renderer;

    // RENDERER: Healthcare Zones (Blue/Purple palette)
    if (info.type === "health-walk") {
      renderer = {
        type: "unique-value", field: "ToBreak",
        uniqueValueInfos: [
          { value: 5, symbol: { type: "simple-fill", color: [52, 152, 219, 0.6], outline: { width: 0 } } },
          { value: 10, symbol: { type: "simple-fill", color: [155, 89, 182, 0.5], outline: { width: 0 } } },
          { value: 15, symbol: { type: "simple-fill", color: [44, 62, 80, 0.4], outline: { width: 0 } } }
        ]
      };
    } 
    // RENDERER: School Zones (Green/Orange palette)
    else if (info.type === "walk") {
      renderer = {
        type: "unique-value", field: "ToBreak",
        uniqueValueInfos: [
          { value: 5, symbol: { type: "simple-fill", color: [46, 204, 113, 0.5], outline: { width: 0 } } },
          { value: 10, symbol: { type: "simple-fill", color: [241, 196, 15, 0.4], outline: { width: 0 } } },
          { value: 15, symbol: { type: "simple-fill", color: [230, 126, 34, 0.3], outline: { width: 0 } } }
        ]
      };
    } 
    // RENDERER: Constant-size 3D Icons
    else if (info.type.includes("icon")) {
      let iconFile = "school.svg";
      if (info.type === "health-icon") iconFile = "health.svg";
      if (info.type === "bus-icon") iconFile = "bus.svg";
      if (info.type === "play-icon") iconFile = "playground.svg";

      renderer = {
        type: "simple",
        symbol: { 
          type: "point-3d", 
          symbolLayers: [{ 
            type: "icon", resource: { href: "./icons/" + iconFile }, 
            size: info.type.includes("school") || info.type.includes("health") ? 30 : 20,
            outline: { color: "white", size: 1.5 }
          }] 
        }
      };
    }
    // RENDERER: Parking & Buildings
    else if (info.type === "parking") {
      renderer = { type: "simple", symbol: { type: "polygon-3d", symbolLayers: [{ type: "fill", material: { color: [0, 197, 255, 0.6] } }] } };
    } else {
      renderer = {
        type: "unique-value", field: "Join_Count",
        defaultSymbol: { type: "polygon-3d", symbolLayers: [{ type: "extrude", size: 15, material: { color: "white" } }] },
        uniqueValueInfos: [{ value: 1, symbol: { type: "polygon-3d", symbolLayers: [{ type: "extrude", size: 22, material: { color: "red" } }] } }]
      };
    }

    const layer = new GeoJSONLayer({
      url: "./data/" + info.file + "?v=" + new Date().getTime(),
      title: info.name,
      renderer: renderer,
      elevationInfo: { 
        mode: "relative-to-ground", 
        // Offsets prevent layers from overlapping on the ground
        offset: info.type.includes("icon") ? 45 : (info.type.includes("walk") ? 1.5 : 0.5) 
      }
    });
    map.add(layer);
  });

  const view = new SceneView({
    container: "viewDiv", map: map,
    camera: { position: { x: 14.242, y: 57.782, z: 1200 }, tilt: 45 },
    screenSizePerspectiveEnabled: false // Keeps icons the same size when zooming
  });

  // Toggle Layer Visibility
  view.when(() => {
    layersInfo.forEach(info => {
      const checkbox = document.getElementById(info.id);
      if (checkbox) {
        checkbox.addEventListener("change", (e) => {
          const lyr = map.layers.find(l => l.title === info.name);
          if (lyr) lyr.visible = e.target.checked;
        });
      }
    });
  });
});