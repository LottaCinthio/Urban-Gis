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
      const iconUrl = info.name === "Bus Stops" 
        ? "https://static.arcgis.com/images/Symbols/Transportation/Bus.png"
        : "https://static.arcgis.com/images/Symbols/OutdoorRecreation/Playground.png";

      renderer = {
        type: "simple",
        symbol: {
          type: "point-3d",
          symbolLayers: [{
            type: "icon",
            resource: { href: iconUrl },
            size: 24, // Base size
            material: { color: [255, 255, 255] }
          }]
        },
        // This ensures they scale but stay within a readable range
        visualVariables: [{
          type: "size",
          field: "ObjectID", // We use a dummy field to trigger the scaling
          valueExpression: "$view.scale",
          stops: [
            { scale: 500, size: 30 },   // Large when very close
            { scale: 2000, size: 20 },  // Normal when near
            { scale: 10000, size: 10 }, // Smaller when far
            { scale: 50000, size: 5 }   // Tiny dots when very far
          ]
        }]
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
      url: "./data/" + info.file,
      title: info.name,
      elevationInfo: { 
        mode: "relative-to-ground",
        offset: 2 // Lift them 2 meters off the ground so they don't vanish
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