function roundDecimal(float, decimal_places) {
    return (Math.round(float * Math.pow(10,decimal_places)) / Math.pow(10,decimal_places)).toFixed(decimal_places);
}

async function fetchBaseLocation() {
  try {
    const response = await fetch('/map/base');
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log(data.base[0].coordinate);

    return data.base[0].coordinate;
  } catch (error) {
    // Handle errors, e.g., log the error or set a default value
    console.error('Error fetching data:', error.message);
    
    // Default value
    return { y: 18.361427, x: 21.712058 };
  }
}

let customBase = L.icon({
  iconUrl: 'markers/customBase.png',
  iconSize: [32, 32], // size of the icon
  iconAnchor: [16, 16] // center of the icon
});

let location_marker;
async function completeMap(mymap) {
  const organizationBase = await fetchBaseLocation();
  console.log(organizationBase);

  mymap.setView([organizationBase['x'], organizationBase['y']], 16);

  let base_marker = L.marker([organizationBase['x'], organizationBase['y']],
  { icon: customBase });
  base_marker.addTo(mymap);
  base_marker.bindPopup("<b>Organization base</b>");

  location_marker = L.marker([organizationBase['x'], organizationBase['y']], 
  { draggable: "true" });
  location_marker.addTo(mymap);
  location_marker.bindPopup('Drag to your location');
  location_marker.openPopup();
  location_marker.on("click", markerClick);
  
  function markerClick(event) {
    this.getPopup()
      .setLatLng(event.latlng)
  
      // .setContent(event.latlng.lat + ", " + event.latlng.lng);
      // Rounded
      .setContent(roundDecimal(event.latlng.lat, 3) + ', ' + roundDecimal(event.latlng.lng, 3));
  }
}

let mymap = L.map("mapid");
let osmUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
let osmAttrib ='© <a href="https://openstreetmap.org" target="_blank">OpenStreetMap</a>';
let osm = new L.TileLayer(osmUrl, { attribution: osmAttrib });
mymap.addLayer(osm);
completeMap(mymap)