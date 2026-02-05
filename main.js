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
    },
    { 
      name: "Playgrounds", 
      file: "Playgrounds.geojson", 
      height: 0, 
      color: [100, 255, 100, 1] // Green for playgrounds
    }
  ];

  const map = new Map({
    basemap: "gray-vector",
    ground: "world-elevation"
  });

analysisFiles.forEach(info => {
    let symbol;

    // Logic for Point data (Playgrounds)
    if (info.name === "Playgrounds") {
      symbol = {
        type: "point-3d", 
        symbolLayers: [{
          type: "icon", // Standard icon pins
          size: 12,
          resource: { primitive: "circle" },
          material: { color: info.color },
          outline: { color: "white", size: 1 }
        }]
      };
    } 
    // Logic for Polygon data (Buildings and Parking)
    else {
      const symbolLayer = info.height > 0 
        ? { type: "extrude", size: info.height, material: { color: info.color } }
        : { type: "fill", material: { color: info.color }, outline: { color: [255, 255, 255, 0.4], size: 1 } };
      
      symbol = {
        type: "polygon-3d",
        symbolLayers: [symbolLayer]
      };
    }

    const layer = new GeoJSONLayer({
      url: "./data/" + info.file,
      title: info.name,
      elevationInfo: { 
        mode: "relative-to-ground",
        offset: info.name === "Jönköping Buildings" ? 0.2 : 0 
      },
      renderer: {
        type: "simple",
        symbol: symbol
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