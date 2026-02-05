require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/GeoJSONLayer",
  "esri/widgets/Search",
  "esri/widgets/LayerList"
], function (Map, SceneView, GeoJSONLayer, Search, LayerList) {

  const analysisFiles = [
    { 
      name: "Jönköping Buildings", 
      file: "buildings.geojson", 
      color: [255, 255, 255, 0.9] // Professional White
    }
  ];

  const map = new Map({
    basemap: "gray-vector",
    ground: "world-elevation"
  });

  analysisFiles.forEach(info => {
    const layer = new GeoJSONLayer({
      url: "./data/" + info.file,
      title: info.name,
      elevationInfo: {
        mode: "relative-to-ground"
      },
      renderer: {
        type: "simple",
        symbol: {
          type: "polygon-3d",
          symbolLayers: [{
            type: "extrude",
            size: 15, // FORCED HEIGHT: Since your file has no 'height' property
            material: { color: info.color }
          }]
        }
      }
    });
    map.add(layer);
  });

  const view = new SceneView({
    container: "viewDiv",
    map: map,
    camera: {
      position: {
        longitude: 14.274, // Centered on your data's coordinates
        latitude: 57.797, 
        z: 1000
      },
      tilt: 50
    }
  });

  view.ui.add(new Search({ view: view }), "top-right");
  view.ui.add(new LayerList({ view: view }), "bottom-left");
});

//name: "Building Footprints", 
//    file: "buildings.geojson", 
//     height: 25, 
//     color: [79, 129, 189, 0.8] // Blue