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
    },
    { 
      name: "Bus Stops", 
      file: "Busstops.geojson", 
      height: 0, 
      color: [0, 92, 230] // Blue for bus stops
    }
  ];

  const map = new Map({
    basemap: "gray-vector",
    ground: "world-elevation"
  });

 analysisFiles.forEach(info => {
    let renderer;

    if (info.name === "Bus Stops" || info.name === "Playgrounds") {
      renderer = {
        type: "simple",
        symbol: {
          type: "point-3d", 
          symbolLayers: [{
            type: "object", // Objects scale perfectly with zoom
            resource: { primitive: "cylinder" },
            width: 15, // 15 meters wide
            height: 5, // 5 meters tall
            material: { color: info.name === "Bus Stops" ? "blue" : "purple" }
          }]
        }
      };
    } else {
      const symbolLayer = info.height > 0 
        ? { type: "extrude", size: info.height, material: { color: info.color } }
        : { type: "fill", material: { color: info.color }, outline: { color: [255, 255, 255, 0.4], size: 1 } };
      
      renderer = {
        type: "simple",
        symbol: { type: "polygon-3d", symbolLayers: [symbolLayer] }
      };
    }

    const layer = new GeoJSONLayer({
      url: "./data/" + info.file + "?v=" + new Date().getTime(), // Forces browser to bypass cache
      title: info.name,
      elevationInfo: { 
        mode: "relative-to-ground",
        offset: info.name === "Playgrounds" ? 5 : 0 
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
        x: 14.274, // Longitude
        y: 57.797, // Latitude
        z: 1000    // Altitude in meters
      },
      tilt: 50
    }
  });

  view.ui.add(new Search({ view: view }), "top-right");
  view.ui.add(new LayerList({ view: view }), "bottom-left");
});