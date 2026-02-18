require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/GeoJSONLayer"
], function (Map, SceneView, GeoJSONLayer) {

  const layersInfo = [
    { name: "Walking Zones", file: "Walk_zones_to_school.geojson", type: "walk", id: "toggleWalk" },
    { name: "Buildings", file: "buildings.geojson", type: "building", id: "toggleBuildings" },
    { name: "Primary Schools", file: "Primary_schools.geojson", type: "school-icon", id: "toggleSchools" },
    { name: "Parking Spots", file: "Parkingspots.geojson", type: "parking", id: "toggleParking" },
    { name: "Bus Stops", file: "Busstops.geojson", type: "icon", id: "toggleBus" },
    { name: "Playgrounds", file: "Playgrounds.geojson", type: "icon", id: "togglePlay" }
  ];

  const map = new Map({ basemap: "gray-vector", ground: "world-elevation" });

  layersInfo.forEach(info => {
    let renderer;

    if (info.type === "walk") {
      renderer = {
        type: "unique-value", field: "ToBreak",
        uniqueValueInfos: [
          { value: 5, symbol: { type: "simple-fill", color: [46, 204, 113, 0.5], outline: { width: 0 } } },
          { value: 10, symbol: { type: "simple-fill", color: [241, 196, 15, 0.4], outline: { width: 0 } } },
          { value: 15, symbol: { type: "simple-fill", color: [230, 126, 34, 0.3], outline: { width: 0 } } }
        ]
      };
    } else if (info.type === "building") {
      renderer = {
        type: "unique-value", field: "Join_Count",
        defaultSymbol: { type: "polygon-3d", symbolLayers: [{ type: "extrude", size: 15, material: { color: "white" } }] },
        uniqueValueInfos: [{ value: 1, symbol: { type: "polygon-3d", symbolLayers: [{ type: "extrude", size: 22, material: { color: "red" } }] } }]
      };
    } else if (info.type === "parking") {
      renderer = { type: "simple", symbol: { type: "polygon-3d", symbolLayers: [{ type: "fill", material: { color: [0, 197, 255, 0.6] } }] } };
    } else {
      // Icon Renderer for Schools, Bus, and Playgrounds
      let iconPath = info.type === "school-icon" ? "./icons/school.svg" : (info.name === "Bus Stops" ? "./icons/bus.svg" : "./icons/playground.svg");
      renderer = {
        type: "simple",
        symbol: {
          type: "point-3d",
          symbolLayers: [{
            type: "icon", resource: { href: iconPath }, size: info.type === "school-icon" ? 30 : 20,
            outline: { color: "white", size: 1 }
          }]
        }
      };
    }

    const layer = new GeoJSONLayer({
      url: "./data/" + info.file + "?v=" + new Date().getTime(),
      title: info.name,
      renderer: renderer,
      elevationInfo: { 
        mode: "relative-to-ground", 
        // Lifts icons high enough to sit on top of buildings
        offset: info.type.includes("icon") ? 35 : 1 
      }
    });
    map.add(layer);
  });

  const view = new SceneView({
    container: "viewDiv", map: map,
    camera: { position: { x: 14.242, y: 57.782, z: 1200 }, tilt: 45 }
  });

  // Enable constant size for icons
  view.environment.lighting.directShadowsEnabled = true;

  // Toggle Logic - Links checkboxes to layer visibility
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