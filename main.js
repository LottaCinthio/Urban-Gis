require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/GeoJSONLayer",
  "esri/widgets/Search",
  "esri/widgets/LayerList"
], function (Map, SceneView, GeoJSONLayer, Search, LayerList) {

  const analysisFiles = [
    { name: "Walking Zones", file: "Walk_zones_to_school.geojson", type: "walk" },
    { name: "Buildings", file: "buildings.geojson", height: 15, type: "building" },
    { name: "Primary Schools", file: "Primary_schools.geojson", type: "school-icon" },
    { name: "Bus Stops", file: "Busstops.geojson", type: "icon" },
    { name: "Playgrounds", file: "Playgrounds.geojson", type: "icon" }
  ];

  const map = new Map({
    basemap: "gray-vector",
    ground: "world-elevation"
  });

  analysisFiles.forEach(info => {
    let renderer;

    // 1. Walking Zones (Ground Polygons)
    if (info.type === "walk") {
      renderer = {
        type: "unique-value",
        field: "ToBreak",
        uniqueValueInfos: [
          { value: 5, symbol: { type: "simple-fill", color: [46, 204, 113, 0.4], outline: { width: 0 } } },
          { value: 10, symbol: { type: "simple-fill", color: [241, 196, 15, 0.3], outline: { width: 0 } } },
          { value: 15, symbol: { type: "simple-fill", color: [230, 126, 34, 0.2], outline: { width: 0 } } }
        ]
      };
    } 
    // 2. 3D Buildings
    else if (info.type === "building") {
      renderer = {
        type: "unique-value",
        field: "Join_Count", 
        defaultSymbol: { 
          type: "polygon-3d", 
          symbolLayers: [{ type: "extrude", size: info.height, material: { color: [255, 255, 255, 0.8] } }] 
        },
        uniqueValueInfos: [
          { value: 1, symbol: { type: "polygon-3d", symbolLayers: [{ type: "extrude", size: 25, material: { color: [255, 0, 0, 0.9] } }] } }
        ]
      };
    }
    // 3. Constant Size Icons
    else if (info.type === "icon" || info.type === "school-icon") {
      let iconPath = "./icons/playground.svg";
      if (info.name === "Bus Stops") iconPath = "./icons/bus.svg";
      if (info.type === "school-icon") iconPath = "./icons/school.svg";

      renderer = {
        type: "simple",
        symbol: {
          type: "point-3d",
          symbolLayers: [{
            type: "icon",
            resource: { href: iconPath },
            size: info.type === "school-icon" ? 28 : 20, // Constant pixel size
            outline: { color: "white", size: 1.5 }
          }]
        }
      };
    }

    const layer = new GeoJSONLayer({
      url: "./data/" + info.file + "?v=" + new Date().getTime(),
      title: info.name,
      renderer: renderer,
      // FIX: minScale prevents the icons from cluttering the map when zoomed out to Sweden
      minScale: 50000, 
      maxScale: 0,
      elevationInfo: { 
        mode: "relative-to-ground", 
        offset: 2 // Lifted slightly so it doesn't disappear into the 3D terrain
      }
    });

    map.add(layer);
  });

  const view = new SceneView({
    container: "viewDiv",
    map: map,
    camera: { 
      position: { x: 14.242, y: 57.782, z: 1200 }, 
      tilt: 45 
    }
  });

  view.ui.add(new Search({ view: view }), "top-right");
  view.ui.add(new LayerList({ view: view }), "bottom-left");
});