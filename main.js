require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/GeoJSONLayer",
  "esri/Graphic",
  "esri/layers/GraphicsLayer",
  "esri/geometry/geometryEngine",
  "esri/geometry/Polyline",
  "esri/core/reactiveUtils"
], function (Map, SceneView, GeoJSONLayer, Graphic, GraphicsLayer, geometryEngine, Polyline, reactiveUtils) {

  // ... (Hela din layersInfo-lista behålls exakt som förut) ...

  const analysisLayer = new GraphicsLayer({ elevationInfo: { mode: "relative-to-ground", offset: 2 } });
  const map = new Map({ 
    basemap: "gray-vector", 
    ground: "world-elevation", 
    layers: [analysisLayer] 
  });

  // Vi behöver referera till väglagret för att hämta geometrierna
  const roadsLayer = new GeoJSONLayer({
    url: "./data/roads.geojson",
    visible: false // Vi behöver bara datan, inte nödvändigtvis se lagret hela tiden
  });
  map.add(roadsLayer);

  // ... (Din tidigare layersInfo.forEach-loop för alla andra lager behålls) ...

  const view = new SceneView({ container: "viewDiv", map: map, camera: { position: { x: 14.242, y: 57.782, z: 1200 }, tilt: 45 } });

  let points = [];
  
  view.on("click", function(event) {
    if (!document.getElementById("enableABTool") || !document.getElementById("enableABTool").checked) return;
    if (points.length >= 2) { clearAnalysis(); }

    const marker = new Graphic({
      geometry: event.mapPoint,
      symbol: { type: "simple-marker", style: "circle", color: points.length === 0 ? [76, 175, 80] : [244, 67, 54], size: "12px", outline: { color: "white", width: 2 } }
    });
    points.push(marker);
    analysisLayer.add(marker);

    if (points.length === 2) {
      calculateTrueRoadPath();
    }
  });

  async function calculateTrueRoadPath() {
    // 1. Hämta alla vägar från roadsLayer
    const query = roadsLayer.createQuery();
    query.geometry = geometryEngine.buffer(geometryEngine.union(points.map(p => p.geometry)), 1, "kilometers"); // Sök i närheten
    const { features } = await roadsLayer.queryFeatures(query);

    if (features.length === 0) {
      console.warn("Inga vägar hittades i närheten.");
      return;
    }

    // 2. För en enkel lokal lösning utan en routing-motor:
    // Vi hittar de vägsegment som ligger närmast den tänkta linjen.
    // Detta simulerar "snabbaste vägen" genom att följa existerande roads.geojson-geometrier.
    
    let totalRealDistance = 0;
    let roadPaths = [];

    // Vi skapar en visuell rutt som följer vägsegmenten
    features.forEach(f => {
      const distToStart = geometryEngine.distance(points[0].geometry, f.geometry);
      const distToEnd = geometryEngine.distance(points[1].geometry, f.geometry);
      
      // Om vägsegmentet ligger mellan våra punkter, inkludera det i beräkningen
      if (distToStart < 0.5 && distToEnd < 0.5) { // Tröskelvärde för närliggande vägar
        roadPaths.push(f.geometry.paths[0]);
        totalRealDistance += geometryEngine.geodesicLength(f.geometry, "kilometers");
      }
    });

    // Om vi inte hittade sammanhängande segment (lokal data-begränsning),
    // faller vi tillbaka på fågelvägen + vägfaktor men ritar linjen snyggare.
    if (totalRealDistance === 0) {
        const fallbackLine = new Polyline({
            paths: [[ [points[0].geometry.longitude, points[0].geometry.latitude], [points[1].geometry.longitude, points[1].geometry.latitude] ]],
            spatialReference: { wkid: 4326 }
        });
        totalRealDistance = geometryEngine.geodesicLength(fallbackLine, "kilometers") * 1.25;
        analysisLayer.add(new Graphic({ geometry: fallbackLine, symbol: { type: "simple-line", color: [0, 122, 255, 0.8], width: 4 } }));
    } else {
        // Om vi hittade vägsegment, rita ut dem!
        const roadLine = new Polyline({ paths: roadPaths, spatialReference: { wkid: 4326 } });
        analysisLayer.add(new Graphic({ geometry: roadLine, symbol: { type: "simple-line", color: [0, 122, 255, 0.8], width: 4 } }));
    }

    // 3. Beräkna tid baserat på transportmode
    const mode = document.getElementById("transportMode").value;
    let speed = mode === "Cycling" ? 15 : mode === "Driving" ? 40 : 5;
    const travelTime = (totalRealDistance / speed) * 60;

    // 4. Uppdatera panelen
    document.getElementById("res-dist").innerText = totalRealDistance.toFixed(2) + " km";
    document.getElementById("res-time").innerText = travelTime.toFixed(1) + " min";
    document.getElementById("res-speed").innerText = speed + " km/h";
  }

  window.clearAnalysis = function() {
    points = [];
    analysisLayer.removeAll();
    document.getElementById("res-dist").innerText = "-";
    document.getElementById("res-time").innerText = "-";
    document.getElementById("res-speed").innerText = "-";
  };
});