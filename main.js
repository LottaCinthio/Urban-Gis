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
      height: 15, 
      color: [255, 255, 255, 0.9] 
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
      height: 0, 
      color: [76, 230, 0] // Bright Green
    }
  ];

  const map = new Map({
    basemap: "gray-vector",
    ground: "world-elevation"
  });

  analysisFiles.forEach(info => {
    let renderer;

    if (info.name === "Playgrounds") {
      // Use a predefined "Park" symbol for the playgrounds
      renderer = {
        type: "simple",
        symbol: {
          type: "web-style", 
          name: "park",
          styleName: "Esri2DPointSymbolsStyle"
        }
      };
    } else {
      // Logic for Buildings and Parking
      const symbolLayer = info.height > 0 
        ? { type: "extrude", size: info.height, material: { color: info.color } }
        : { type: "fill", material: { color: info.color }, outline: { color: [255, 255, 255, 0.4], size: 1 } };
      
      renderer = {
        type: "simple",
        symbol: {
          type: "polygon-3d",
          symbolLayers: [symbolLayer]
        }
      };
    }

    const layer = new GeoJSONLayer({
      url: "./data/" + info.file,
      title: info.name,
      // Playgrounds need to be clamped to the ground to be visible
      elevationInfo: { 
        mode: "on-the-ground" 
      },
      renderer: renderer
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