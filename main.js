require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/GeoJSONLayer",
  "esri/widgets/Search",
  "esri/widgets/LayerList"
], function (Map, SceneView, GeoJSONLayer, Search, LayerList) {

  const analysisFiles = [
    // 1. Bottom Layer: Walk Zones
    { name: "Walking Zones", file: "Walk_zones_to_school.geojson", type: "walk" },
    // 2. Middle Layer: Parking
    { name: "Parking Spots", file: "Parkingspots.geojson", type: "parking", color: [0, 197, 255, 0.7] },
    // 3. Top Layers: Icons and Buildings
    { name: "Primary Schools", file: "Primary_schools.geojson", type: "school-icon" },
    { name: "Buildings", file: "buildings.geojson", height: 15, type: "building" },
    { name: "Bus Stops", file: "Busstops.geojson", type: "icon" },
    { name: "Playgrounds", file: "Playgrounds.geojson", type: "icon" }
  ];

  const map = new Map({
    basemap: "gray-vector",
    ground: "world-elevation"
  });

  analysisFiles.forEach(info => {
    let renderer;

    if (info.type === "walk") {
      renderer = {
        type: "simple",
        symbol: { type: "simple-fill", outline: { width: 0 } },
        visualVariables: [{
          type: "color",
          field: "ToBreak",
          stops: [
            { value: 5, color: [46, 204, 113, 0.4] },
            { value: 10, color: [241, 196, 15, 0.3] },
            { value: 15, color: [230, 126, 34, 0.2] }
          ]
        }]
      };
    } 
    else if (info.type === "parking") {
      renderer = {
        type: "simple",
        symbol: {
          type: "polygon-3d",
          symbolLayers: [{
            type: "fill",
            material: { color: info.color },
            outline: { color: "white", size: 1 }
          }]
        }
      };
    }
    else if (info.type === "building") {
      renderer = {
        type: "unique-value",
        field: "Join_Count", 
        defaultSymbol: { 
          type: "polygon-3d", 
          symbolLayers: [{ type: "extrude", size: info.height, material: { color: [255, 255, 255, 0.8] } }] 
        },
        uniqueValueInfos: [
          { value: 1, symbol: { type: "polygon-3d", symbolLayers: [{ type: "extrude", size: 25, material: { color: "red" } }] } }
        ]
      };
    }
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
            size: info.type === "school-icon" ? 28 : 20,
            outline: { color: "white", size: 1.5 }
          }]
        }
      };
    }

    const layer = new GeoJSONLayer({
      url: "./data/" + info.file + "?v=" + new Date().getTime(),
      title: info.name,
      renderer: renderer,
      minScale: 50000,
      elevationInfo: { 
        mode: "relative-to-ground", 
        // Different offsets prevent layers from overlapping
        offset: info.type === "walk" ? 0.5 : (info.type === "parking" ? 1.5 : 3) 
      }
    });

    map.add(layer);
  });

  const view = new SceneView({
    container: "viewDiv",
    map: map,
    camera: { position: { x: 14.242, y: 57.782, z: 1200 }, tilt: 45 }
  });

  view.ui.add(new Search({ view: view }), "top-right");
  view.ui.add(new LayerList({ view: view }), "bottom-left");
});