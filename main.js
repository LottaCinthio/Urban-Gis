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
      color: [76, 230, 0]
    },
    { 
      name: "Bus Stops", 
      file: "Busstops.geojson", 
      height: 0, 
      color: [0, 92, 230]
    }
  ];

  const map = new Map({
    basemap: "gray-vector",
    ground: "world-elevation"
  });

  analysisFiles.forEach(info => {
    let renderer;

    // POINT LAYERS: Bus stops & playgrounds
    if (info.name === "Bus Stops" || info.name === "Playgrounds") {

      const iconUrl =
        info.name === "Bus Stops"
          ? "./icons/bus.svg"
          : "./icons/playground.svg";

      renderer = {
        type: "simple",
        symbol: {
          type: "point-3d",
          symbolLayers: [{
            type: "icon",
            resource: { href: iconUrl },

            // Base size in pixels
            size: 18,

            // Scale with zoom
            sizeStops: [
              { distance: 2000, size: 10 },
              { distance: 1000, size: 16 },
              { distance: 500,  size: 24 },
              { distance: 200,  size: 36 }
            ],

            outline: {
              color: "white",
              size: 1
            }
          }]
        }
      };

    } else {
      // POLYGON LAYERS: Buildings & parking
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

      renderer = {
        type: "simple",
        symbol: {
          type: "polygon-3d",
          symbolLayers: [symbolLayer]
        }
      };
    }

    const layer = new GeoJSONLayer({
      url: "./data/" + info.file + "?v=" + new Date().getTime(),
      title: info.name,
      elevationInfo: {
        mode: "relative-to-ground",
        offset: 1
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
        x: 14.274,
        y: 57.797,
        z: 1000
      },
      tilt: 50
    }
  });

  view.ui.add(new Search({ view: view }), "top-right");
  view.ui.add(new LayerList({ view: view }), "bottom-left");
});
