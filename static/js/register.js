function roundDecimal(float, decimal_places) {
    return (Math.round(float * Math.pow(10,decimal_places)) / Math.pow(10,decimal_places)).toFixed(decimal_places);
}

let mymap = L.map("mapid");
let osmUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
let osmAttrib ='© <a href="https://openstreetmap.org" target="_blank">OpenStreetMap</a>';
let osm = new L.TileLayer(osmUrl, { attribution: osmAttrib });
mymap.addLayer(osm);
mymap.setView([38.246242, 21.7350847], 16);
let location_marker = L.marker([38.246242, 21.7350847], { draggable: "true" });
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
