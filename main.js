require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/GeoJSONLayer",
  "esri/widgets/LayerList"
], function(Map, SceneView, GeoJSONLayer, LayerList) {

  const map = new Map({
    basemap: "topo-vector",
    ground: "world-elevation"
  });

  const view = new SceneView({
    container: "viewDiv",
    map: map,
    camera: {
      position: [14.162, 57.782, 2000],
      tilt: 45
    }
  });

  // 1. Buildings Layer
  const buildingsLayer = new GeoJSONLayer({
    url: "./data/buildings.geojson",
    title: "Jönköping Buildings",
    elevationInfo: { mode: "relative-to-ground" },
    renderer: {
      type: "simple",
      symbol: {
        type: "polygon-3d",
        symbolLayers: [{
          type: "extrude",
          size: 15,
          material: { color: [255, 255, 255, 0.9] }
        }]
      }
    }
  });

  // 2. Parking Spots Layer
  const parkingLayer = new GeoJSONLayer({
    url: "./data/Parkingspots.geojson", // Note the Capital P
    title: "Parking Spots",
    elevationInfo: { mode: "on-the-ground" },
    renderer: {
      type: "simple",
      symbol: {
        type: "polygon-3d",
        symbolLayers: [{
          type: "fill",
          material: { color: [0, 197, 255, 0.6] }
        }]
      }
    }
  });

  // 3. Playgrounds Layer (Point Data)
  const playgroundLayer = new GeoJSONLayer({
    url: "./data/Playgrounds.geojson", // Note the Capital P
    title: "Playgrounds",
    elevationInfo: { mode: "on-the-ground" },
    renderer: {
      type: "simple",
      symbol: {
        type: "web-style", 
        name: "playground",
        styleName: "Esri2DPointSymbolsStyle"
      }
    }
  });

  map.addMany([parkingLayer, buildingsLayer, playgroundLayer]);

  view.when(() => {
    const layerList = new LayerList({ view: view });
    view.ui.add(layerList, "bottom-left");
  });
});