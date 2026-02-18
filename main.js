const layersInfo = [
    { name: "Health Point", file: "Healthcare_center.geojson", type: "health-icon", id: "toggleHealthcare" },
    { name: "Health Zones", file: "Walking_zones_to_healthcare.geojson", type: "health-walk", id: "toggleHealthWalk" },
    { name: "School Points", file: "Primary_schools.geojson", type: "school-icon", id: "toggleSchools" },
    { name: "School Zones", file: "Walk_zones_to_school.geojson", type: "walk", id: "toggleWalk" },
    { name: "Buildings", file: "buildings.geojson", type: "building", id: "toggleBuildings" }
];

// ... inside the renderer logic ...
if (info.type === "health-walk") {
    renderer = {
        type: "unique-value", field: "ToBreak",
        uniqueValueInfos: [
            { value: 5, symbol: { type: "simple-fill", color: [52, 152, 219, 0.6], outline: { width: 0 } } },
            { value: 10, symbol: { type: "simple-fill", color: [155, 89, 182, 0.5], outline: { width: 0 } } },
            { value: 15, symbol: { type: "simple-fill", color: [44, 62, 80, 0.4], outline: { width: 0 } } }
        ]
    };
} else if (info.type === "health-icon") {
    renderer = {
        type: "simple",
        symbol: {
            type: "point-3d",
            symbolLayers: [{
                type: "icon", resource: { href: "./icons/health.svg" }, size: 32,
                outline: { color: "white", size: 1 }
            }]
        }
    };
}

// Set slightly different elevations to prevent the overlapping zones from flickering
const layer = new GeoJSONLayer({
    url: "./data/" + info.file + "?v=" + new Date().getTime(),
    title: info.name,
    renderer: renderer,
    elevationInfo: { 
        mode: "relative-to-ground", 
        // Lifts health zones slightly higher than school zones to keep them visible
        offset: info.type === "health-walk" ? 1.5 : (info.type.includes("icon") ? 45 : 0.5) 
    }
});