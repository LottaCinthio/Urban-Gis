require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/GeoJSONLayer",
  "esri/widgets/LayerList"
], function(Map, SceneView, GeoJSONLayer, LayerList) {

  // 1. THE LIST: The files you want to show
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
      color: [76, 230, 0] 
    }
  ];

  const map = new Map({
    basemap: "topo-vector",
    ground: "world-elevation"
  });

  const view = new SceneView({
    container: "viewDiv",
    map: map,
    camera: {
      position: [14.16, 57.78, 2000],
      tilt: 45
    }
  });

  // 2. THE LOOP: This handles adding the layers
  analysisFiles.forEach(info => {
    let layerRenderer;

    if (info.name === "Playgrounds") {
      // Logic for Points (Playgrounds) using a simple circular marker
      layerRenderer = {
        type: "simple",
        symbol: {
          type: "simple-marker", 
          style: "circle",
          color: [76, 230, 0],
          size: "12px",
          outline: { color: "white", width: 1 }
        }
      };
    } else {
      // Logic for Polygons (Buildings and Parking)
      const symbolLayer = info.height > 0 
        ? { type: "extrude", size: info.height, material: { color: info.color } }
        : { type: "fill", material: { color: info.color }, outline: { color: [255, 255, 255, 0.4], size: 1 } };
      
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
      elevationInfo: { mode: "on-the-ground" },
      renderer: layerRenderer
    });
    map.add(layer);
  });

  view.when(() => {
    const layerList = new LayerList({ view: view });
    view.ui.add(layerList, "bottom-left");
  });
});
//name: "Building Footprints", 
//    file: "buildings.geojson", 
//     height: 25, 
//     color: [79, 129, 189, 0.8] // Blue