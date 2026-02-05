require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/GeoJSONLayer",
  "esri/widgets/Search",
  "esri/widgets/LayerList"
], function (Map, SceneView, GeoJSONLayer, Search, LayerList) {

  // 1. THE LIST: Filled in with your Jönköping file
  const analysisFiles = [
    { 
      name: "Jönköping Buildings", 
      file: "buildings.geojson", 
      height: 30, 
      color: [0, 120, 255, 0.8] 
    }
  ];

  // 2. CREATE THE MAP
  const map = new Map({
    basemap: "gray-vector",
    ground: "world-elevation" // This enables the 3D topography you see
  });

  // 3. THE LOOP: Added Elevation fixes
  analysisFiles.forEach(info => {
    const layer = new GeoJSONLayer({
      url: "./data/" + info.file,
      title: info.name,
      // FIX 1: This pulls buildings out of the ground
      elevationInfo: {
        mode: "relative-to-ground",
        offset: 0
      },
      renderer: {
        type: "simple",
        symbol: {
          type: "polygon-3d",
          symbolLayers: [{
            type: "extrude",
            size: info.height,
            material: { color: info.color }
          }]
        }
      },
      popupTemplate: {
        title: "{name}",
        content: "Building Height: {height} m"
      }
    });
    map.add(layer);
  });

  // 4. THE VIEW
  const view = new SceneView({
    container: "viewDiv",
    map: map,
    // FIX 2: Updated coordinates from Stockholm to Jönköping!
    camera: {
      position: {
        longitude: 14.1618, 
        latitude: 57.7826, 
        z: 1500 // Height of the camera in meters
      },
      tilt: 45
    }
  });

  // 5. WIDGETS
  view.ui.add(new Search({ view: view }), "top-right");
  view.ui.add(new LayerList({ view: view }), "bottom-left");
});

//name: "Building Footprints", 
//    file: "buildings.geojson", 
//     height: 25, 
//     color: [79, 129, 189, 0.8] // Blue