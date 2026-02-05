require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/GeoJSONLayer",
  "esri/widgets/Search",
  "esri/widgets/LayerList"
], function (Map, SceneView, GeoJSONLayer, Search, LayerList) {

  // 1. THE LIST: Corrected filename and properties
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
    ground: "world-elevation" // Enables 3D terrain
  });

  // 3. THE LOOP: Added Elevation logic to prevent "Underground" buildings
  analysisFiles.forEach(info => {
    const layer = new GeoJSONLayer({
      url: "./data/" + info.file,
      title: info.name,
      // MANDATORY: Sit buildings on top of the Jönköping hills
      elevationInfo: {
        mode: "relative-to-ground",
        offset: 0
      },
      renderer: {
        type: "simple",
        symbol: {
          type: "polygon-3d",
          symbolLayers: [{
            type: "extrude", // This creates the 3D volume
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

  // 4. THE VIEW: Moved camera from Stockholm to Jönköping
  const view = new SceneView({
    container: "viewDiv",
    map: map,
    camera: {
      position: {
        longitude: 14.1618, // Jönköping center
        latitude: 57.7826, 
        z: 1500
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