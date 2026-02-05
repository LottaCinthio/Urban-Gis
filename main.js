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
            size: 20 // Default base size
          }]
        },
        // THIS FORCES THE SCALING: Large when near, small when far
        visualVariables: [{
          type: "size",
          valueExpression: "$view.scale",
          stops: [
            { scale: 500, size: 40 },    // Very large when you are right next to the building
            { scale: 2000, size: 20 },   // Normal size at street level
            { scale: 10000, size: 8 },   // Small when viewing the neighborhood
            { scale: 50000, size: 2 }    // Just a tiny dot when viewing the whole city
          ]
        }]
      };
    } else {
      const symbolLayer = info.height > 0 
        ? { type: "extrude", size: info.height, material: { color: info.color } }
        : { type: "fill", material: { color: info.color } };
      
      renderer = {
        type: "simple",
        symbol: { type: "polygon-3d", symbolLayers: [symbolLayer] }
      };
    }

    const layer = new GeoJSONLayer({
      url: "./data/" + info.file + "?v=" + new Date().getTime(),
      title: info.name,
      elevationInfo: { 
        mode: "relative-to-ground",
        // Lifts them up to ensure they aren't hidden by the parking lots
        offset: 5 
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