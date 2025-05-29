if (typeof listingCoordinates === 'undefined' || !listingCoordinates.lat || !listingCoordinates.lng) {
    listingCoordinates = {lat: 18.9582, lng: 72.8321};
}

let lat = listingCoordinates.lat;
let lon = listingCoordinates.lng;
let locationTitle = listingTitleName;

let map = L.map('map').setView([lat, lon], 15);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let marker = L.marker([lat, lon]).addTo(map);

let circle = L.circle([lat, lon], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.3,
    radius: 300
}).addTo(map);

marker.bindPopup(`<b>${locationTitle}</b><br>Exact location will be provided after booking`).openPopup();