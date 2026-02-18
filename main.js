require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/GeoJSONLayer",
  "esri/widgets/Search",
  "esri/widgets/LayerList"
], function (Map, SceneView, GeoJSONLayer, Search, LayerList) {

  const analysisFiles = [
    // 1. UPDATED FILENAME: Your Service Area "blobs"
    { 
      name: "Walking Accessibility to Schools", 
      file: "Walk_zones_to_school.geojson", 
      type: "analysis" 
    },
    // 2. BUILDINGS: Using Join_Count to highlight schools
    { 
      name: "Jönköping Buildings", 
      file: "buildings.geojson", 
      height: 15, 
      type: "building" 
    },
    { 
      name: "Parking Spots", 
      file: "Parkingspots.geojson", 
      height: 0, 
      color: [0, 197, 255, 0.6] 
    },
    { 
      name: "Playgrounds", 
      file: "Playgrounds.geojson", 
      type: "icon" 
    },
    { 
      name: "Bus Stops", 
      file: "Busstops.geojson", 
      type: "icon" 
    }
  ];

  const map = new Map({
    basemap: "gray-vector",
    ground: "world-elevation"
  });

  analysisFiles.forEach(info => {
    let renderer;

    // RENDERER FOR WALK ZONES: 5, 10, 15 minute isochrones
    if (info.type === "analysis") {
      renderer = {
        type: "unique-value",
        field: "ToBreak", 
        uniqueValueInfos: [
          { value: 5, symbol: { type: "simple-fill", color: [46, 204, 113, 0.5], outline: { width: 0 } } },
          { value: 10, symbol: { type: "simple-fill", color: [241, 196, 15, 0.4], outline: { width: 0 } } },
          { value: 15, symbol: { type: "simple-fill", color: [230, 126, 34, 0.3], outline: { width: 0 } } }
        ]
      };
    } 
    
    // RENDERER FOR 3D BUILDINGS: Extrusion and School Highlighting
    else if (info.type === "building") {
      renderer = {
        type: "unique-value",
        field: "Join_Count", 
        defaultSymbol: { 
          type: "polygon-3d", 
          symbolLayers: [{ type: "extrude", size: info.height, material: { color: [255, 255, 255, 0.9] } }] 
        },
        uniqueValueInfos: [
          { 
            value: 1, 
            symbol: { 
              type: "polygon-3d", 
              symbolLayers: [{ type: "extrude", size: info.height + 5, material: { color: "red" } }] 
            } 
          }
        ]
      };
    }

    // RENDERER FOR ICONS: Bus stops & playgrounds
    else if (info.type === "icon") {
      const iconUrl = info.name === "Bus Stops" ? "./icons/bus.svg" : "./icons/playground.svg";
      renderer = {
        type: "simple",
        symbol: {
          type: "point-3d",
          symbolLayers: [{ type: "icon", resource: { href: iconUrl }, size: 18 }]
        }
      };
    }

    const layer = new GeoJSONLayer({
      // Ensure your data folder path is correct
      url: "./data/" + info.file + "?v=" + new Date().getTime(),
      title: info.name,
      renderer: renderer,
      elevationInfo: { 
        mode: "relative-to-ground", 
        offset: 1 
      }
    });

    map.add(layer);
  });

  const view = new SceneView({
    container: "viewDiv",
    map: map,
    camera: { 
      position: { x: 14.242, y: 57.782, z: 1500 }, 
      tilt: 50 
    }
  });

  view.ui.add(new Search({ view: view }), "top-right");
  view.ui.add(new LayerList({ view: view }), "bottom-left");
});