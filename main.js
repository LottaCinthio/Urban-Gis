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
    let renderer;

    if (info.name === "Playgrounds") {
      // High-quality ArcGIS Playground Symbol (CIM Symbol)
      renderer = {
        type: "simple",
        symbol: {
          type: "cim",
          data: {
            type: "CIMSymbolReference",
            symbol: {
              type: "CIMPointSymbol",
              symbolLayers: [
                {
                  type: "CIMVectorMarker",
                  enable: true,
                  size: 20, // Adjust size to make it more visible
                  frame: { xmin: 0, ymin: 0, xmax: 17, ymax: 17 },
                  markerGraphics: [{
                    type: "CIMMarkerGraphic",
                    geometry: {
                      rings: [[[8.5, 0.2], [7.1, 0.2], [3.2, 11], [0.2, 11], [0.2, 12.5], [3.7, 12.5], [4.2, 11], [12.8, 11], [13.3, 12.5], [16.8, 12.5], [16.8, 11], [13.8, 11], [9.9, 0.2], [8.5, 0.2]]]
                    },
                    symbol: {
                      type: "CIMPolygonSymbol",
                      symbolLayers: [{
                        type: "CIMSolidFill",
                        enable: true,
                        color: [34, 139, 34, 255] // Forest Green
                      }]
                    }
                  }]
                }
              ]
            }
          }
        }
      };
    } else {
      // Standard logic for Buildings and Parking
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
      // Points need to be clamped to the ground so they don't float
      elevationInfo: { mode: "on-the-ground" },
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

//name: "Building Footprints", 
//    file: "buildings.geojson", 
//     height: 25, 
//     color: [79, 129, 189, 0.8] // Blue