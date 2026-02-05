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

    // Separate logic for Playgrounds
    if (info.name === "Playgrounds") {
      renderer = {
        type: "simple",
        symbol: {
          type: "point-3d",
          symbolLayers: [{
            type: "icon",
            resource: { href: "https://static.arcgis.com/images/Symbols/OutdoorRecreation/Playground.png" },
            size: 20
          }]
        },
        visualVariables: [{
          type: "size",
          valueExpression: "$view.scale",
          stops: [
            { scale: 1000, size: 25 },
            { scale: 10000, size: 10 },
            { scale: 50000, size: 5 }
          ]
        }]
      };
    } 
    // Separate logic for Bus Stops
    else if (info.name === "Bus Stops") {
      renderer = {
        type: "simple",
        symbol: {
          type: "point-3d",
          symbolLayers: [{
            type: "icon",
            resource: { href: "https://static.arcgis.com/images/Symbols/Transportation/Bus.png" },
            size: 20
          }]
        },
        visualVariables: [{
          type: "size",
          valueExpression: "$view.scale",
          stops: [
            { scale: 1000, size: 25 },
            { scale: 10000, size: 10 },
            { scale: 50000, size: 5 }
          ]
        }]
      };
    } 
    // Logic for Buildings and Parking
    else {
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
        mode: "on-the-ground",
        // This tiny offset helps Playgrounds stay on top of Parking spots
        offset: info.name === "Playgrounds" ? 0.5 : 0 
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