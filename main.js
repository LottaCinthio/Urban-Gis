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
      height: 15, // Tall buildings
      color: [255, 255, 255, 0.9] // White
    },
    { 
      name: "Parking Spots", 
      file: "Parkingspots.geojson", 
      height: 0, // Flat on the ground
      color: [255, 255, 0, 0.7] // Yellow (so they stand out)
    }
  ];

  const map = new Map({
    basemap: "gray-vector",
    ground: "world-elevation"
  });

 analysisFiles.forEach(info => {
    // Determine the type of symbol based on height
    const symbolLayer = info.height > 0 
      ? {
          type: "extrude",
          size: info.height,
          material: { color: info.color }
        }
      : {
          type: "fill", // Flat layer like in your ArcGIS screenshot
          material: { color: info.color },
          outline: { color: [255, 255, 255, 0.4], size: 1 }
        };

    const layer = new GeoJSONLayer({
      url: "./data/" + info.file,
      title: info.name,
      elevationInfo: { 
        mode: "relative-to-ground",
        offset: info.height > 0 ? 0.2 : 0 // Lift buildings 20cm so they sit ON the blue spots
      },
      renderer: {
        type: "simple",
        symbol: {
          type: "polygon-3d",
          symbolLayers: [symbolLayer]
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