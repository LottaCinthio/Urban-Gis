require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/GeoJSONLayer"
], function (Map, SceneView, GeoJSONLayer) {

  const map = new Map({ basemap: "gray-vector", ground: "world-elevation" });

  // Samma lagerinfo som tidigare...
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
    { name: "Incidents", file: "Incidents_hospital.geojson", type: "incident-icon", id: "toggleIncidents" },
    { name: "Hospital Routes", file: "Routes_from_hospital.geojson", type: "route", id: "toggleRoutes" },
    { name: "Fire Station", file: "Firestation.geojson", type: "fire-icon", id: "toggleFirestation" },
    { name: "Fire Incidents", file: "fire-incedents.geojson", type: "fire-incident-house", id: "toggleFireIncidents" },
    { name: "Fire Routes", file: "firestation_routes.geojson", type: "fire-route", id: "toggleFireRoutes" },
    { name: "Police Station", file: "policestation.geojson", type: "police-icon", id: "togglePolice" },
    { name: "Crimes", file: "crime.geojson", type: "crime-icon", id: "toggleCrimes" },
    { name: "Police Routes", file: "police_route.geojson", type: "police-route", id: "togglePoliceRoutes" }
  ];

  layersInfo.forEach(info => {
    let renderer;
    let popupTemplate = null;

    // Logik för renderer och popupTemplate... (Samma som innan för 8052 och Travel Time)
    // Se till att popupTemplate för rutter kollar efter: attr.Total_TravelTime || attr.Total_Time || attr.traveltime || attr.TRAVELTIME;

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