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
      color: [76, 230, 0] // Bright Green
    }
  ];

  const map = new Map({
    basemap: "gray-vector",
    ground: "world-elevation"
  });

analysisFiles.forEach(info => {
    let layerRenderer;

    // 1. Logic for Playgrounds (Point data)
    if (info.name === "Playgrounds") {
      layerRenderer = {
        type: "simple",
        symbol: {
          type: "simple-marker", // Very reliable for Point data
          style: "diamond",
          color: [76, 230, 0, 1], // Bright Green
          size: "14px",
          outline: {
            color: [255, 255, 255],
            width: 1
          }
        }
      };
    } 
    // 2. Logic for Polygons (Buildings and Parking)
    else {
      const symbolLayer = info.height > 0 
        ? { 
            type: "extrude", 
            size: info.height, 
            material: { color: info.color } 
          }
        : { 
            type: "fill", 
            material: { color: info.color }, 
            outline: { color: [255, 255, 255, 0.4], size: 1 } 
          };
      
      layerRenderer = {
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
      elevationInfo: { 
        mode: "on-the-ground" 
      },
      renderer: layerRenderer
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