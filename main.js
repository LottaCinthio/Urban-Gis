require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/GeoJSONLayer",
  "esri/widgets/Search"
], function (Map, SceneView, GeoJSONLayer, Search) {

  // 1. Define all your data layers and their specific properties
  const analysisFiles = [
    { 
      name: "Walking Zones", 
      file: "Walk_zones_to_school.geojson", 
      type: "walk",
      toggleId: "toggleWalk" 
    },
    { 
      name: "Parking Spots", 
      file: "Parkingspots.geojson", 
      type: "parking", 
      color: [0, 197, 255, 0.7],
      toggleId: "toggleParking"
    },
    { 
      name: "Buildings", 
      file: "buildings.geojson", 
      height: 15, 
      type: "building",
      toggleId: "toggleBuildings" 
    },
    { 
      name: "Primary Schools", 
      file: "Primary_schools.geojson", 
      type: "school-icon",
      toggleId: "toggleSchools" 
    },
    { 
      name: "Bus Stops", 
      file: "Busstops.geojson", 
      type: "icon",
      toggleId: "toggleBus" 
    },
    { 
      name: "Playgrounds", 
      file: "Playgrounds.geojson", 
      type: "icon",
      toggleId: "togglePlay" 
    }
  ];

  const map = new Map({
    basemap: "gray-vector",
    ground: "world-elevation"
  });

  // 2. Loop through each file and create the 3D layers
  analysisFiles.forEach(info => {
    let renderer;

    // RENDERER: Walking Accessibility (5, 10, 15 min zones)
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
    // RENDERER: Parking Spots (Flat polygons on ground)
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
    // RENDERER: 3D Buildings (Extruded, Red for Schools)
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
    // RENDERER: Icons (Constant pixel size, no scaling)
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
            size: info.type === "school-icon" ? 28 : 20, // Constant size in pixels
            outline: { color: "white", size: 1.5 }
          }]
        }
      };
    }

    const layer = new GeoJSONLayer({
      url: "./data/" + info.file + "?v=" + new Date().getTime(),
      title: info.name,
      renderer: renderer,
      minScale: 50000, // Disappears when zoomed out to Sweden
      maxScale: 0,
      elevationInfo: { 
        mode: "relative-to-ground", 
        // Offsets prevent "Z-fighting" (flickering layers)
        offset: info.type === "walk" ? 0.5 : (info.type === "parking" ? 1.5 : 3) 
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

  // 3. Sidebar Logic: Link Checkboxes to Layer Visibility
  view.when(() => {
    analysisFiles.forEach(info => {
      const checkbox = document.getElementById(info.toggleId);
      if (checkbox) {
        checkbox.addEventListener("change", (event) => {
          const lyr = map.layers.find(l => l.title === info.name);
          if (lyr) lyr.visible = event.target.checked;
        });
      }
    });
  });

  view.ui.add(new Search({ view: view }), "top-right");
});