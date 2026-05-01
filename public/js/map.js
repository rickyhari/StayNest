// Step 1: map div dhundho aur usse data-lat, data-lng padho
const mapDiv = document.getElementById("map");

// Agar map div page pe exist nahi karta toh kuch mat karo
if (mapDiv) {
  const lat = parseFloat(mapDiv.dataset.lat);
  const lng = parseFloat(mapDiv.dataset.lng);


  // Step 2: Map banao — [lat, lng] aur zoom level 10
  const map = L.map("map").setView([lat, lng], 10);

  // Step 3: OpenStreetMap tiles lagao (bilkul free!)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  // Step 4: Marker lagao aur popup open karo
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(`<b>${mapDiv.dataset.title || "Listing"}</b>`)
    .openPopup();
}