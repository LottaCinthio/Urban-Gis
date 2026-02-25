require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/GeoJSONLayer"
], function (Map, SceneView, GeoJSONLayer) {

  const layersInfo = [
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
    { name: "Fire Incidents", file: "Incidents_hospital.geojson", type: "fire-incident-icon", id: "toggleFireIncidents" },
    { name: "Fire Routes", file: "firestation_routes.geojson", type: "fire-route", id: "toggleFireRoutes" },
    { name: "Police Station", file: "policestation.geojson", type: "police-icon", id: "togglePolice" },
    { name: "Crimes", file: "crime.geojson", type: "crime-icon", id: "toggleCrimes" },
    { name: "Police Routes", file: "police_route.geojson", type: "police-route", id: "togglePoliceRoutes" }
  ];

  const map = new Map({ basemap: "gray-vector", ground: "world-elevation" });

  layersInfo.forEach(info => {
    let renderer;
    let popupTemplate = null;

    if (info.type === "health-walk" || info.type === "walk") {
      const colors = info.type === "health-walk" ? [[52,152,219,0.6],[155,89,182,0.5],[44,62,80,0.4]] : [[46,204,113,0.5],[241,196,15,0.4],[230,126,34,0.3]];
      renderer = { type: "unique-value", field: "ToBreak", uniqueValueInfos: [{ value: 5, symbol: { type: "simple-fill", color: colors[0], outline: { width: 0 } } }, { value: 10, symbol: { type: "simple-fill", color: colors[1], outline: { width: 0 } } }, { value: 15, symbol: { type: "simple-fill", color: colors[2], outline: { width: 0 } } }] };
    } 
    else if (info.type.includes("route")) {
      let routeColor = [255,215,0,0.9];
      let routeTitle = "Transport Information Hospital";
      if (info.type === "fire-route") { routeColor = [217,48,37,0.9]; routeTitle = "Transport Information Firestation"; }
      if (info.type === "police-route") { routeColor = [0,0,255,0.9]; routeTitle = "Transport Information Police"; }
      renderer = { type: "simple", symbol: { type: "line-3d", symbolLayers: [{ type: "line", size: 4, material: { color: routeColor }, cap: "round", join: "round" }] } };
      popupTemplate = { title: routeTitle, content: function(feature) {
          const attr = feature.graphic.attributes;
          const totalTime = attr.Total_TravelTime || attr.Total_Time || attr.traveltime || attr.TRAVELTIME;
          if (totalTime) { const mins = Math.floor(totalTime); const secs = Math.round((totalTime - mins) * 60); return `<b>Total travel time:</b><br/> ${mins} minutes and ${secs} seconds`; }
          return "Travel time data not available.";
      }};
    } else if (info.type.includes("-icon")) {
    let iconHref = "./icons/";
    
    if (info.type === "hospital-icon") iconHref += "hospital-marker.svg";
    
    // 1. Specifik ikon för sjukhus-incidenter
    else if (info.type === "hospital-incident-icon") iconHref += "incident-house.svg";
    
    // 2. Specifik ikon för brand-incidenter
    else if (info.type === "fire-incident-icon") iconHref += "fire-incident-house.svg";
    
    else if (info.type === "fire-icon") iconHref += "firestation-marker.svg";
    else if (info.type === "police-icon") iconHref += "police-marker.svg";
    else if (info.type === "crime-icon") iconHref += "crime-incident.svg";
    else if (info.type === "health-icon") iconHref += "health.svg";
    else if (info.type === "school-icon") iconHref += "school.svg";
    else if (info.type === "bus-icon") iconHref += "bus.svg";
    else if (info.type === "play-icon") iconHref += "playground.svg";

    renderer = { 
        type: "simple", 
        symbol: { 
            type: "point-3d", 
            symbolLayers: [{ type: "icon", resource: { href: iconHref }, size: 30 }] 
        } 
    };
}
    else if (info.type === "building") {
      renderer = { 
        type: "unique-value", 
        field: "Building_ID", 
        defaultSymbol: { type: "polygon-3d", symbolLayers: [{ type: "extrude", size: 15, material: { color: "white" } }] }, 
        uniqueValueInfos: [{ value: 8052, symbol: { type: "polygon-3d", symbolLayers: [{ type: "extrude", size: 40, material: { color: "#2ecc71" } }] } }] 
      };
      popupTemplate = { title: "Building Information", content: function(feature) {
        const bID = feature.graphic.attributes.Building_ID;
        if (bID == 8052 || (bID && bID.toString() === "8052")) {
          const currentUrl = window.location.href.split('?')[0].split('#')[0];
          const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf("/") + 1);
          return `<div style="text-align: center;"><b>Building ID:</b> ${bID}<br/><br/><a href="${baseUrl}IFC.html" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #2ecc71; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; cursor: pointer;">Go to 3D Model</a></div>`;
        }
        return `<b>Building ID:</b> ${bID}`;
      }};
    }
    else if (info.type === "parking") {
      renderer = { type: "simple", symbol: { type: "polygon-3d", symbolLayers: [{ type: "fill", material: { color: [0, 197, 255, 0.6] } }] } };
    }

    const checkbox = document.getElementById(info.id);
    const layer = new GeoJSONLayer({
      url: "./data/" + info.file + "?v=" + new Date().getTime(),
      title: info.name,
      renderer: renderer,
      outFields: ["*"],
      popupTemplate: popupTemplate,
      visible: checkbox ? checkbox.checked : true,
      elevationInfo: { mode: "relative-to-ground", offset: info.type.includes("route") ? 5 : 0.5 }
    });
    map.add(layer);
  });

  const view = new SceneView({ container: "viewDiv", map: map, camera: { position: { x: 14.242, y: 57.782, z: 1200 }, tilt: 45 } });

  view.when(() => {
    layersInfo.forEach(info => {
      const checkbox = document.getElementById(info.id);
      if (checkbox) {
        checkbox.addEventListener("change", (e) => {
          const lyr = map.layers.find(l => l.title === info.name);
          if (lyr) lyr.visible = e.target.checked;
        });
      }
    });
  });
});