function roundDecimal(float, decimal_places) {
    return (Math.round(float * Math.pow(10,decimal_places)) / Math.pow(10,decimal_places)).toFixed(decimal_places);
}

let organizationBase = { lat: 38.361427, lng: 21.712058 };

let mymap = L.map("mapid");
let osmUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
let osmAttrib ='© <a href="https://openstreetmap.org" target="_blank">OpenStreetMap</a>';
let osm = new L.TileLayer(osmUrl, { attribution: osmAttrib });
mymap.addLayer(osm);
mymap.setView([organizationBase['lat'], organizationBase['lng']], 16);

let base_marker = L.marker([organizationBase['lat'], organizationBase['lng']]);
base_marker.addTo(mymap);
base_marker.bindPopup("<b>Organization base</b>");

// TODO: Popup tooltip saying "drag marker to your location"
let location_marker = L.marker([organizationBase['lat'], organizationBase['lng']], { draggable: "true" });
location_marker.addTo(mymap);
location_marker.bindPopup();
location_marker.on("click", markerClick);

function markerClick(event) {
  this.getPopup()
    .setLatLng(event.latlng)

    // .setContent(event.latlng.lat + ", " + event.latlng.lng);
    // Rounded
    .setContent(roundDecimal(event.latlng.lat, 3) + ', ' + roundDecimal(event.latlng.lng, 3));
}
