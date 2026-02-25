require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/GeoJSONLayer",
  "esri/Graphic",
  "esri/layers/GraphicsLayer",
  "esri/geometry/geometryEngine",
  "esri/geometry/Polyline"
], function (Map, SceneView, GeoJSONLayer, Graphic, GraphicsLayer, geometryEngine, Polyline) {

  const layersInfo = [
    { name: "Road Network", file: "roads.geojson", type: "road-network", id: "toggleRoads" },
    { name: "Health Point", file: "Healthcare_center.geojson", type: "health-icon", id: "toggleHealthcare" },
    { name: "Health Zones", file: "Walking_zones_to_healthcare.geojson", type: "health-walk", id: "toggleHealthWalk" },
    { name: "School Points", file: "Primary_schools.geojson", type: "school-icon", id: "toggleSchools" },
    { name: "School Zones", file: "Walk_zones_to_school.geojson", type: "walk", id: "toggleWalk" },
    { name: "Parking", file: "Parkingspots.geojson", type: "parking", id: "toggleParking" },
    { name: "Bus Stops", file: "Busstops.geojson", type: "bus-icon", id: "toggleBus" },
    { name: "Playgrounds", file: "Playgrounds.geojson", type: "play-icon", id: "togglePlay" },
    { name: "Buildings", file: "buildings_with_id.geojson", type: "building", id: "toggleBuildings" },
    { name: "Hospital", file: "Hospital.geojson", type: "hospital-icon", id: "toggleHospital" },
    { name: "Hospital Incidents", file: "Incidents_hospital.geojson", type: "hospital-incident-icon", id: "toggleIncidents" },
    { name: "Hospital Routes", file: "Routes_from_hospital.geojson", type: "route", id: "toggleRoutes" },
    { name: "Fire Station", file: "Firestation.geojson", type: "fire-icon", id: "toggleFirestation" },
    { name: "Fire Incidents", file: "Incidents_hospital.geojson", type: "fire-incident-house", id: "toggleFireIncidents" },
    { name: "Fire Routes", file: "firestation_routes.geojson", type: "fire-route", id: "toggleFireRoutes" },
    { name: "Police Station", file: "policestation.geojson", type: "police-icon", id: "togglePolice" },
    { name: "Crimes", file: "crime.geojson", type: "crime-icon", id: "toggleCrimes" },
    { name: "Police Routes", file: "police_route.geojson", type: "police-route", id: "togglePoliceRoutes" }
  ];

  const analysisLayer = new GraphicsLayer({ elevationInfo: { mode: "relative-to-ground", offset: 2 } });
  const map = new Map({ basemap: "gray-vector", ground: "world-elevation", layers: [analysisLayer] });

  let roadsLayerRef;

  layersInfo.forEach(info => {
    let renderer;
    let popupTemplate = null;

    if (info.type === "road-network") {
      renderer = { type: "simple", symbol: { type: "line-3d", symbolLayers: [{ type: "line", size: 1.2, material: { color: [130, 130, 130, 0.4] } }] } };
    }
    else if (info.type === "health-walk" || info.type === "walk") {
      const colors = info.type === "health-walk" ? [[52,152,219,0.6],[155,89,182,0.5],[44,62,80,0.4]] : [[46,204,113,0.5],[241,196,15,0.4],[230,126,34,0.3]];
      renderer = { type: "unique-value", field: "ToBreak", uniqueValueInfos: [{ value: 5, symbol: { type: "simple-fill", color: colors[0], outline: { width: 0 } } }, { value: 10, symbol: { type: "simple-fill", color: colors[1], outline: { width: 0 } } }, { value: 15, symbol: { type: "simple-fill", color: colors[2], outline: { width: 0 } } }] };
    } 
    else if (info.type.includes("route")) {
      let routeColor = [255, 215, 0, 0.9];
      let serviceText = "Emergency Route";
      if (info.type === "route") serviceText = "Emergency route from incident to Hospital";
      else if (info.type === "fire-route") { routeColor = [217, 48, 37, 0.9]; serviceText = "Emergency route from Fire Station to fire incident"; }
      else if (info.type === "police-route") { routeColor = [0, 0, 255, 0.9]; serviceText = "Emergency route from Police Station to crime scene"; }
      renderer = { type: "simple", symbol: { type: "line-3d", symbolLayers: [{ type: "line", size: 4, material: { color: routeColor }, cap: "round", join: "round" }] } };
      popupTemplate = { title: "Emergency Response Route", content: (f) => {
          const a = f.graphic.attributes;
          const t = a.Total_TravelTime || a.Total_Minutes || a.traveltime || a.Total_Time;
          return `<b>Service:</b> ${serviceText}<br/><b>Status:</b> Priority Access<br/><b>Total Travel Time:</b> ${t ? Math.floor(t)+" min "+Math.round((t-Math.floor(t))*60)+" sek" : "Saknas"}`;
      }};
    } 
    else if (info.type.endsWith("-icon") || info.type === "fire-incident-house" || info.type === "hospital-incident-icon" || info.type === "crime-icon") {
      let iconFile = "";
      if (info.type === "hospital-icon") iconFile = "hospital-marker.svg";
      else if (info.type === "hospital-incident-icon") iconFile = "incident-house.svg";
      else if (info.type === "fire-icon") iconFile = "firestation-marker.svg";
      else if (info.type === "fire-incident-house") iconFile = "fire-incident-house.svg";
      else if (info.type === "police-icon") iconFile = "police-marker.svg";
      else if (info.type === "crime-icon") iconFile = "crime-incident.svg";
      else if (info.type === "health-icon") iconFile = "health.svg";
      else if (info.type === "school-icon") iconFile = "school.svg";
      else if (info.type === "bus-icon") iconFile = "bus.svg";
      else if (info.type === "play-icon") iconFile = "playground.svg";
      
      renderer = { type: "simple", symbol: { type: "point-3d", symbolLayers: [{ type: "icon", resource: { href: "./icons/" + iconFile }, size: 30 }] } };
    }
    else if (info.type === "building") {
      renderer = { type: "unique-value", field: "Building_ID", defaultSymbol: { type: "polygon-3d", symbolLayers: [{ type: "extrude", size: 15, material: { color: "white" } }] }, uniqueValueInfos: [{ value: 8052, symbol: { type: "polygon-3d", symbolLayers: [{ type: "extrude", size: 40, material: { color: "#2ecc71" } }] } }] };
      popupTemplate = { title: "Building Information", content: function(feature) {
        const bID = feature.graphic.attributes.Building_ID;
        if (bID == 8052 || (bID && bID.toString() === "8052")) {
          const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf("/") + 1);
          return `<div style="text-align: center;"><b>Building ID:</b> ${bID}<br/><br/><a href="${baseUrl}IFC.html" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #2ecc71; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; cursor: pointer;">Go to 3D Model</a></div>`;
        }
        return `<b>Building ID:</b> ${bID}`;
      }};
    }
    else if (info.type === "parking") {
      renderer = { type: "simple", symbol: { type: "polygon-3d", symbolLayers: [{ type: "fill", material: { color: [0, 197, 255, 0.6] } }] } };
    }

    const checkbox = document.getElementById(info.id);
    let isVisible = checkbox ? checkbox.checked : (info.type.includes("route") || info.type.includes("walk") ? false : true);
    
    if (info.name === "Road Network") { 
      isVisible = true; 
      if (checkbox) checkbox.checked = true; 
    }

    const layer = new GeoJSONLayer({
      url: "./data/" + info.file + "?v=" + new Date().getTime(),
      title: info.name,
      renderer: renderer,
      outFields: ["*"],
      popupTemplate: popupTemplate,
      visible: isVisible,
      elevationInfo: { mode: "relative-to-ground", offset: info.type.includes("route") ? 5 : 0.5 }
    });

    if (info.name === "Road Network") roadsLayerRef = layer;
    map.add(layer);
  });

  const view = new SceneView({ container: "viewDiv", map: map, camera: { position: { x: 14.242, y: 57.782, z: 1200 }, tilt: 45 } });

  // --- KORRIGERAD MÄTNINGSLOGIK ---
  let points = [];
  
  view.on("click", async function(event) {
    if (!document.getElementById("enableABTool") || !document.getElementById("enableABTool").checked) return;
    
    // Säkerställ att klicket hamnar på marken
    const response = await view.hitTest(event);
    const mapPoint = event.mapPoint;

    if (points.length >= 2) { clearAnalysis(); }

    const marker = new Graphic({
      geometry: mapPoint,
      symbol: { type: "simple-marker", style: "circle", color: points.length === 0 ? [76, 175, 80] : [244, 67, 54], size: "12px", outline: { color: "white", width: 2 } }
    });

    points.push(marker);
    analysisLayer.add(marker);

    if (points.length === 2) {
      // 1. Hämta vägsegment i närheten
      const query = roadsLayerRef.createQuery();
      query.geometry = geometryEngine.buffer(geometryEngine.union([points[0].geometry, points[1].geometry]), 500, "meters").extent;
      query.returnGeometry = true;
      const { features } = await roadsLayerRef.queryFeatures(query);

      // 2. Skapa rutt-geometri
      const directLine = new Polyline({
        paths: [[[points[0].geometry.longitude, points[0].geometry.latitude], [points[1].geometry.longitude, points[1].geometry.latitude]]],
        spatialReference: { wkid: 4326 }
      });

      const bufferZone = geometryEngine.geodesicBuffer(directLine, 50, "meters");
      const roadPathFeatures = features.filter(f => geometryEngine.intersects(bufferZone, f.geometry));
      
      let finalDist = 0;

      if (roadPathFeatures.length > 0) {
        const finalGeometry = geometryEngine.union(roadPathFeatures.map(f => f.geometry));
        finalDist = geometryEngine.geodesicLength(finalGeometry, "kilometers");
        
        analysisLayer.add(new Graphic({
          geometry: finalGeometry,
          symbol: { type: "simple-line", color: [0, 122, 255, 0.9], width: 5 }
        }));
      } else {
        // Fallback om inga vägar hittas precis vid klicket
        finalDist = geometryEngine.geodesicLength(directLine, "kilometers") * 1.3;
        analysisLayer.add(new Graphic({ 
          geometry: directLine, 
          symbol: { type: "simple-line", color: [0, 122, 255, 0.7], width: 4, style: "dash" } 
        }));
      }

      // 3. Uppdatera panelen
      const mode = document.getElementById("transportMode").value;
      let speed = mode === "Cycling" ? 15 : mode === "Driving" ? 40 : 5;
      
      document.getElementById("res-dist").innerText = finalDist.toFixed(2) + " km";
      document.getElementById("res-time").innerText = ((finalDist / speed) * 60).toFixed(1) + " min";
      document.getElementById("res-speed").innerText = speed + " km/h";
    }
  });

  window.clearAnalysis = function() {
    points = []; analysisLayer.removeAll();
    document.getElementById("res-dist").innerText = "-"; 
    document.getElementById("res-time").innerText = "-"; 
    document.getElementById("res-speed").innerText = "-";
  };

  view.when(() => {
    layersInfo.forEach(info => {
      const cb = document.getElementById(info.id);
      if (cb) cb.addEventListener("change", (e) => {
          const lyr = map.layers.find(l => l.title === info.name);
          if (lyr) lyr.visible = e.target.checked;
      });
    });
  });
});