// Map init
const map = L.map('map', { center: [7, 0], zoom: 6 });

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
}).addTo(map);

// Layer groups
const pastedLayer = L.featureGroup().addTo(map);
const drawnLayer  = L.featureGroup().addTo(map);

// Leaflet Draw toolbar
map.addControl(new L.Control.Draw({
    edit: { featureGroup: drawnLayer },
    draw: {
    marker: true, polyline: true, polygon: true,
    rectangle: true, circle: false, circlemarker: false,
    },
}));
map.on(L.Draw.Event.CREATED, (e) => drawnLayer.addLayer(e.layer));

// Status helper
const status = document.getElementById('status');
const setStatus = (msg, ok = true) => {
    status.textContent = msg;
    status.className = ok ? 'ok' : 'err';
};

// Submit
document.getElementById('btn-submit').addEventListener('click', () => {
    const raw = document.getElementById('geojsontext').value.trim();
    if (!raw) { setStatus('Nothing to render — paste some GeoJSON first.', false); return; }

    let geojson;
    try {
    geojson = JSON.parse(raw);
    } catch (err) {
    setStatus(`Invalid JSON: ${err.message}`, false);
    return;
    }

    pastedLayer.clearLayers();

    try {
    const layer = L.geoJSON(geojson, {
        style: { color: '#3b82f6', weight: 2, fillOpacity: 0.25 },
        pointToLayer: (feature, latlng) =>
        L.circleMarker(latlng, {
            radius: 7, color: '#3b82f6', weight: 2,
            fillColor: '#10b981', fillOpacity: 0.8,
        }),
        onEachFeature: (feature, layer) => {
        if (feature.properties && Object.keys(feature.properties).length) {
            const rows = Object.entries(feature.properties)
            .map(([k, v]) => `<tr><th>${k}</th><td>${v ?? ''}</td></tr>`)
            .join('');
            layer.bindPopup(`<table class="table table-sm mb-0" style="font-size:.8rem;">${rows}</table>`);
        }
        },
    });

    pastedLayer.addLayer(layer);
    const bounds = pastedLayer.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [32, 32] });
    setStatus(`Rendered successfully.`, true);
    } catch (err) {
    setStatus(`Could not render GeoJSON: ${err.message}`, false);
    }
});

// Clear
document.getElementById('btn-clear').addEventListener('click', () => {
    pastedLayer.clearLayers();
    drawnLayer.clearLayers();
    document.getElementById('geojsontext').value = '';
    setStatus('Cleared.', true);
});