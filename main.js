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
    { name: "Buildings", file: "buildings.geojson", type: "building", id: "toggleBuildings" }
  ];

  const map = new Map({ basemap: "gray-vector", ground: "world-elevation" });

  layersInfo.forEach(info => {
    let renderer;

    // Healthcare Walking Zones
    if (info.type === "health-walk") {
      renderer = {
        type: "unique-value", field: "ToBreak",
        uniqueValueInfos: [
          { value: 5, symbol: { type: "simple-fill", color: [52, 152, 219, 0.6], outline: { width: 0 } } },
          { value: 10, symbol: { type: "simple-fill", color: [155, 89, 182, 0.5], outline: { width: 0 } } }
        ]
      };
    } 
    // School Walking Zones
    else if (info.type === "walk") {
      renderer = {
        type: "unique-value", field: "ToBreak",
        uniqueValueInfos: [
          { value: 5, symbol: { type: "simple-fill", color: [46, 204, 113, 0.5], outline: { width: 0 } } }
        ]
      };
    } 
    // Icons
    else if (info.type === "health-icon" || info.type === "school-icon") {
      let icon = info.type === "health-icon" ? "./icons/health.svg" : "./icons/school.svg";
      renderer = {
        type: "simple",
        symbol: { type: "point-3d", symbolLayers: [{ type: "icon", resource: { href: icon }, size: 30 }] }
      };
    }
    // Buildings
    else if (info.type === "building") {
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
        offset: info.type.includes("icon") ? 40 : (info.type === "health-walk" ? 1.5 : 0.5) 
      }
    });
    map.add(layer);
  });

  const view = new SceneView({
    container: "viewDiv", map: map,
    camera: { position: { x: 14.242, y: 57.782, z: 1200 }, tilt: 45 },
    screenSizePerspectiveEnabled: false
  });

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