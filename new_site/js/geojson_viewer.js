// Base tile layers
const osmLayer = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }
);

const googleStreetLayer = L.tileLayer(
  'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
  {
    attribution: '<a href="https://www.google.com/maps/">Google Maps</a>',
    maxNativeZoom: 18,
    maxZoom: 18,
  }
);

const googleSatLayer = L.tileLayer(
  'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
  {
    attribution: '<a href="https://www.google.com/maps/">Google Satellite</a>',
    maxNativeZoom: 18,
    maxZoom: 18,
  }
);

// Map init (OSM on by default) 
const map = L.map('map', { center: [7, 0], zoom: 6, layers: [osmLayer] });

const baseLayers = {
  'OpenStreetMap':    osmLayer,
  'Google Streets':   googleStreetLayer,
  'Google Satellite': googleSatLayer,
};
L.control.layers(baseLayers).addTo(map);

//  Feature layer groups 
const pastedLayer = L.featureGroup().addTo(map);
const drawnLayer  = L.featureGroup().addTo(map);

//   draw styles 
const drawStyle = {
  color:       '#e53e3e',
  weight:      2,
  opacity:     0.85,
  fillColor:   '#f6e05e',
  fillOpacity: 0.4,
};

map.addControl(new L.Control.Draw({
  position: 'topright',
  edit: { featureGroup: drawnLayer, remove: true },
  draw: {
    polygon:      { shapeOptions: drawStyle },
    polyline:     { shapeOptions: drawStyle },
    rectangle:    { shapeOptions: drawStyle },
    marker:       true,
    circle:       false,
    circlemarker: false,
  },
}));

//   Draw (Automatically appears on the text area)
map.on(L.Draw.Event.CREATED, (e) => {
  const layer   = e.layer;
  drawnLayer.addLayer(layer);
  const geojson = drawnLayer.toGeoJSON();
  document.getElementById('geojsontext').value =
    JSON.stringify(geojson, null, 2);
  setStatus('Shape drawn - review GeoJSON in the panel, then click Submit to render.', true);
});

// Status helper 
const status    = document.getElementById('status');
const setStatus = (msg, ok = true) => {
  status.innerHTML = msg;
  status.className = ok ? 'ok' : 'err';
};

// Render GeoJSON helper
function renderGeoJSON(geojson) {
  pastedLayer.clearLayers();
  const layer = L.geoJSON(geojson, {
    style: { color: '#3b82f6', weight: 2, fillOpacity: 0.25 },
    pointToLayer: (_feature, latlng) =>
      L.circleMarker(latlng, {
        radius: 7, color: '#3b82f6', weight: 2,
        fillColor: '#10b981', fillOpacity: 0.8,
      }),
    onEachFeature: (feature, lyr) => {
      if (feature.properties && Object.keys(feature.properties).length) {
        const rows = Object.entries(feature.properties)
          .map(([k, v]) => `<tr><th>${k}</th><td>${v ?? ''}</td></tr>`)
          .join('');
        lyr.bindPopup(
          `<table class="table table-sm mb-0" style="font-size:.8rem;">${rows}</table>`
        );
      }
    },
  });
  pastedLayer.addLayer(layer);
  const bounds = pastedLayer.getBounds();
  if (bounds.isValid()) map.fitBounds(bounds, { padding: [32, 32] });
}

// Submit 
document.getElementById('btn-submit').addEventListener('click', () => {
  const raw = document.getElementById('geojsontext').value.trim();
  if (!raw) {
    setStatus('Nothing to render - paste some GeoJSON first.', false);
    return;
  }
  let geojson;
  try {
    geojson = JSON.parse(raw);
  } catch (err) {
    setStatus(`Invalid JSON: ${err.message}`, false);
    return;
  }
  try {
    renderGeoJSON(geojson);
    setStatus('Rendered successfully.', true);
  } catch (err) {
    setStatus(`Could not render GeoJSON: ${err.message}`, false);
  }
});

// Clear
document.getElementById('btn-clear').addEventListener('click', () => {
  pastedLayer.clearLayers();
  drawnLayer.clearLayers();
  document.getElementById('geojsontext').value = '';
  setStatus('Ready — paste <b>GeoJSON</b> and click <b>Submit</b>.', true);
});

// Upload button
(function initUpload() {
  const uploadBtn = document.createElement('button');
  uploadBtn.id        = 'btn-upload';
  uploadBtn.title     = 'Upload GeoJSON file (Please ensure the data is in WGS84 / EPSG:4326 projection)';
  uploadBtn.innerHTML = '<i class="ph ph-upload-simple"></i>';
  uploadBtn.className = 'btn btn-outline-secondary btn-sm map-fab';
  uploadBtn.style.cssText =
    'position:absolute;top:80px;left:10px;z-index:1000;width:34px;height:34px;padding:0;display:flex;align-items:center;justify-content:center;';

  document.getElementById('map').appendChild(uploadBtn);

  uploadBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type   = 'file';
    input.accept = '.geojson,.json';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const contents = ev.target.result;
        let geojson;
        try {
          geojson = JSON.parse(contents);
        } catch (err) {
          setStatus(`Could not parse file: ${err.message}`, false);
          return;
        }
        document.getElementById('geojsontext').value =
          JSON.stringify(geojson, null, 2);
        try {
          renderGeoJSON(geojson);
          setStatus(`Loaded <b>${file.name}</b> successfully.`, true);
        } catch (err) {
          setStatus(`File loaded but could not render: ${err.message}`, false);
        }
      };
      reader.readAsText(file);
      input.remove();
    });

    input.click();
  });
})();

// Export menu
(function initExport() {
  // --- Build DOM ---
  const wrap = document.createElement('div');
  wrap.style.cssText =
    'position:absolute;top:120px;left:10px;z-index:1000;';

  const exportBtn = document.createElement('button');
  exportBtn.id        = 'btn-export';
  exportBtn.title     = 'Export features';
  exportBtn.innerHTML = '<i class="ph ph-download-simple"></i>';
  exportBtn.className = 'btn btn-outline-secondary btn-sm';
  exportBtn.style.cssText = 'width:34px;height:34px;padding:0;display:flex;align-items:center;justify-content:center;';

  const dropdown = document.createElement('div');
  dropdown.className = 'export-menu';
  dropdown.style.cssText =
    'display:none;position:absolute;left:38px;top:0;background:var(--clr-surface,#1a1f2e);'
    + 'border:1px solid var(--clr-border,#2d3452);border-radius:8px;min-width:130px;'
    + 'box-shadow:0 4px 16px rgba(0,0,0,.35);z-index:9999;overflow:hidden;';

  const formats = [
    { label: 'CSV',       fn: exportCSV       },
    { label: 'KML',       fn: exportKML       },
    { label: 'GeoJSON',   fn: exportGeoJSON   },
    { label: 'Shapefile', fn: exportShapefile },
  ];

  formats.forEach(({ label, fn }) => {
    const item = document.createElement('button');
    item.textContent = label;
    item.style.cssText =
      'display:block;width:100%;text-align:left;padding:.45rem .9rem;'
      + 'background:none;border:none;cursor:pointer;font-size:.82rem;'
      + 'color:var(--clr-text,#e2e8f0);';
    item.addEventListener('mouseenter', () => item.style.background = 'rgba(59,130,246,.18)');
    item.addEventListener('mouseleave', () => item.style.background = 'none');
    item.addEventListener('click', () => { dropdown.style.display = 'none'; fn(); });
    dropdown.appendChild(item);
  });

  wrap.appendChild(exportBtn);
  wrap.appendChild(dropdown);
  document.getElementById('map').appendChild(wrap);

  exportBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  });
  document.addEventListener('click', () => { dropdown.style.display = 'none'; });

  // --- Helper: collect all features ---
  function allFeatures() {
    const combined = {
      type: 'FeatureCollection',
      features: [
        ...pastedLayer.toGeoJSON().features,
        ...drawnLayer.toGeoJSON().features,
      ],
    };
    return combined;
  }

  function hasFeatures() {
    const f = allFeatures().features;
    if (!f.length) { setStatus('No features to export — render some GeoJSON first.', false); return false; }
    return true;
  }

  // --- CSV ---
  function exportCSV() {
    if (!hasFeatures()) return;
    const data   = allFeatures();
    let csv      = 'id,geometry_type,longitude,latitude\n';
    data.features.forEach((feat, i) => {
      const g = feat.geometry;
      if (!g) return;
      // For points use the coordinate directly; for others use the centroid-ish first coordinate
      const firstCoord = (coords) => {
        if (Array.isArray(coords[0])) return firstCoord(coords[0]);
        return coords; // [lng, lat]
      };
      const [lng, lat] = firstCoord(g.coordinates);
      csv += `${i},${g.type},${lng},${lat}\n`;
    });
    triggerDownload(
      'data:text/csv;charset=utf-8,' + encodeURIComponent(csv),
      'export.csv'
    );
  }

  // --- KML (hand-rolled, no external lib needed) ---
  function exportKML() {
    if (!hasFeatures()) return;
    const data = allFeatures();
    const placemarks = data.features.map((feat, i) => {
      const name  = feat.properties?.name ?? `Feature ${i + 1}`;
      const desc  = Object.entries(feat.properties ?? {})
        .map(([k, v]) => `${k}: ${v}`).join(', ');
      const g     = feat.geometry;
      let coords  = '';

      if (g.type === 'Point') {
        coords = `<Point><coordinates>${g.coordinates[0]},${g.coordinates[1]},0</coordinates></Point>`;
      } else if (g.type === 'LineString') {
        const c = g.coordinates.map(c => c.join(',')).join(' ');
        coords  = `<LineString><coordinates>${c}</coordinates></LineString>`;
      } else if (g.type === 'Polygon') {
        const outer = g.coordinates[0].map(c => c.join(',')).join(' ');
        coords = `<Polygon><outerBoundaryIs><LinearRing><coordinates>${outer}</coordinates></LinearRing></outerBoundaryIs></Polygon>`;
      } else {
        return ''; // MultiPolygon etc. skipped for brevity
      }

      return `<Placemark><name>${name}</name><description>${desc}</description>${coords}</Placemark>`;
    }).join('\n');

    const kml =
      `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>GeoJSON Export</name>
    ${placemarks}
  </Document>
</kml>`;
    triggerDownload(
      'data:text/xml;charset=utf-8,' + encodeURIComponent(kml),
      'export.kml'
    );
  }

  // --- GeoJSON ---
  function exportGeoJSON() {
    if (!hasFeatures()) return;
    const str = JSON.stringify(allFeatures(), null, 2);
    triggerDownload(
      'data:text/json;charset=utf-8,' + encodeURIComponent(str),
      'export.geojson'
    );
  }

  // --- Shapefile (requires shp-write loaded globally) ---
  function exportShapefile() {
    if (!hasFeatures()) return;
    if (typeof shpwrite === 'undefined') {
      setStatus('Shapefile export requires the <b>shp-write</b> library — add it to your page scripts.', false);
      return;
    }
    const geojson = allFeatures();
    try {
      shpwrite.download(geojson);
    } catch (err) {
      setStatus(`Shapefile export failed: ${err.message}`, false);
    }
  }

  // --- Download helper ---
  function triggerDownload(href, filename) {
    const a  = document.createElement('a');
    a.href   = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setStatus(`Downloaded <b>${filename}</b>.`, true);
  }
})();
