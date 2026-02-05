require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/GeoJSONLayer",
  "esri/widgets/Search",
  "esri/widgets/LayerList"
], function (Map, SceneView, GeoJSONLayer, Search, LayerList) {

  // 1. THE LIST: Just add new lines here when you have new files!
  const analysisFiles = [
    { 
    name: "Jönköping Buildings", 
    file: "buildings.geojson", // This must match your filename exactly!
    height: 30, 
    color: [0, 120, 255, 0.8] 
  }
    
    // Add your next analysis layer here...
  ];

  // 2. CREATE THE MAP
  const map = new Map({
    basemap: "gray-vector",
    ground: "world-elevation"
  });

  // 3. THE LOOP: This automatically creates each layer from your list
  analysisFiles.forEach(info => {
    const layer = new GeoJSONLayer({
      url: "./data/" + info.file,
      title: info.name,
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
        content: "Analysis Attribute: {height} m"
      }
    });
    map.add(layer);
  });

  // 4. THE VIEW
  const view = new SceneView({
    container: "viewDiv",
    map: map,
    camera: {
      position: {
        longitude: 18.0686,
        latitude: 59.3293,
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