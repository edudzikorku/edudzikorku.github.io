const API_URL = "https://ghanapostgps.sperixlabs.org/get-location";
const REQUEST_DELAY_MS = 350;


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
const gpgMap = L.map('gpg-map', { scrollWheelZoom: true, center: [7, 0], zoom: 6, layers: [osmLayer] });

const baseLayers = {
  'OpenStreetMap':    osmLayer,
  'Google Streets':   googleStreetLayer,
  'Google Satellite': googleSatLayer,
};
L.control.layers(baseLayers).addTo(gpgMap);

const gpgMarkers = L.layerGroup().addTo(gpgMap);

function plotResult(code, lat, lon){
  if(lat === '' || lon === '' || lat == null || lon == null) return;
  const la = Number(lat), lo = Number(lon);
  if(Number.isNaN(la) || Number.isNaN(lo)) return;

  // Define a custom icon
  const customIcon = L.icon({
    iconUrl: '../../projects/images/icon.svg', 
    iconSize: [20, 20],              
    iconAnchor: [10, 20],             
    popupAnchor: [0, -20]             
  });

  // Use the custom icon in the marker
  L.marker([la, lo], { icon: customIcon })
    .addTo(gpgMarkers)
    .bindPopup(`<b>${code}</b><br>${la}, ${lo}`);
}

function fitMapToMarkers(){
  const layers = gpgMarkers.getLayers();
  if(!layers.length) return;
  const group = L.featureGroup(layers);
  gpgMap.fitBounds(group.getBounds().pad(0.15));
}

function clearMap(){
  gpgMarkers.clearLayers();
  gpgMap.setView([7.9465, -1.0232], 6);
}

// Tabs
document.querySelectorAll('.gpg-tab').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.gpg-tab').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.gpg-mode').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('gpg-mode-' + btn.dataset.mode).classList.add('active');
  });
});

// Status helper
const statusEl = document.getElementById('gpg-status');
function setStatus(text, type){
  statusEl.textContent = text;
  statusEl.classList.remove('idle', 'ok', 'err');
  statusEl.classList.add(type || 'idle');
}

//Lookup core 
async function fetchLocation(code){
  const body = 'address=' + encodeURIComponent(code);
  const opts = { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body };
  try{
    const r = await fetch(API_URL, opts);
    if(!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  }catch(e){
    // fallback through a CORS relay in case the direct browser request is blocked
    const proxied = 'https://corsproxy.io/?url=' + encodeURIComponent(API_URL);
    const r2 = await fetch(proxied, opts);
    if(!r2.ok) throw new Error('HTTP ' + r2.status + ' (via proxy)');
    return await r2.json();
  }
}

async function lookupCode(code, cache){
  const clean = (code || '').trim();

  if(!clean) return {lat:'', lon:'', status:'missing PostGPS code'};
  if(!isValidPostGPS(clean)) return {lat:'', lon:'', status:'invalid format'};
  if(cache.has(clean)) return cache.get(clean);

  let result;
  try{
    const data = await fetchLocation(clean);
    if(data && data.found && data.data && data.data.Table && data.data.Table.length){
      const row = data.data.Table[0];
      result = { lat: row.CenterLatitude ?? '', lon: row.CenterLongitude ?? '', status:'found' };
    } else {
      result = { lat:'', lon:'', status:'not found' };
    }
  } catch(e){
    result = { lat:'', lon:'', status:'lookup failed'};
  }
  cache.set(clean, result);
  return result;
}

function statusClass(status){
  return status === 'found' ? 'gpg-status-found' : 'gpg-status-bad';
}

function isValidPostGPS(code) {
  // Remove hyphens for validation
  const stripped = code.replace(/-/g, '');

  // Must start with at least 2 letters followed by 8 digits
  const regex = /^[A-Za-z]{2}[0-9]{8}$/;

  // Check if stripped code matches the pattern
  if (!regex.test(stripped)) return false;

  // Ensure original code only contains letters, digits, and hyphens
  if (!/^[A-Za-z0-9-]+$/.test(code)) return false;

  // Ensure no trailing or consecutive hyphens
  if (/--/.test(code) || /-$/.test(code)) return false;

  return true;
}


function csvDownload(filename, rows, fields){
  const csv = Papa.unparse({ fields, data: rows.map(r => fields.map(f => r[f] ?? '')) });
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Shared results table / progress / download
const table = document.getElementById('gpg-table');
const tableHead = document.getElementById('gpg-table-head');
const tableBody = document.getElementById('gpg-table-body');

const progressWrap = document.getElementById('gpg-progress-wrap');
const progressFill = document.getElementById('gpg-progress-fill');
const progressText = document.getElementById('gpg-progress-text');

const downloadBtn = document.getElementById('gpg-btn-download');

let currentResultRows = [];
let currentResultFields = [];
let currentFilename = 'gps_codes_with_coordinates.csv';

function showProgress(){ progressWrap.style.display = 'block'; }
function hideProgress(){ progressWrap.style.display = 'none'; }

downloadBtn.addEventListener('click', ()=>{
  if(!currentResultRows.length) return;
  csvDownload(currentFilename, currentResultRows, currentResultFields);
});

//  SINGLE / MULTIPLE MODE
const codesInput = document.getElementById('gpg-codes');
const lookupBtn = document.getElementById('gpg-btn-lookup');
const clearSingleBtn = document.getElementById('gpg-btn-clear-single');

lookupBtn.addEventListener('click', async ()=>{
  const raw = codesInput.value;
  const codes = raw.split(/[\n,]/).map(c=>c.trim()).filter(Boolean);
  if(!codes.length){
    setStatus('Add at least one GhanaPostGPS code first.', 'err');
    return;
  }

  if (codes.length === 1 && !codes.every(isValidPostGPS)){
    setStatus('Code is invalid. Check the format.', 'err');
    return;
  }

  if (codes.length > 1 && !codes.every(isValidPostGPS)){
    setStatus('Some codes are invalid. Check the format.', 'err');
    return;
  }

  lookupBtn.disabled = true;
  downloadBtn.disabled = true;
  clearMap();

  currentResultRows = [];
  currentResultFields = ['GPS Code', 'Latitude', 'Longitude', 'Status'];
  currentFilename = 'gps_codes_with_coordinates.csv';

  tableHead.innerHTML = '<tr>' + currentResultFields.map(f=>`<th>${f}</th>`).join('') + '</tr>';
  tableBody.innerHTML = '';
  table.style.display = 'table';

  showProgress();
  setStatus('Looking up codes…', 'idle');

  const cache = new Map();
  for(let i=0;i<codes.length;i++){
    const code = codes[i];
    progressText.textContent = `Looking up ${i+1} of ${codes.length} — ${code}`;
    progressFill.style.width = Math.round((i/codes.length)*100) + '%';

    const res = await lookupCode(code, cache);
    currentResultRows.push({ 'GPS Code': code, 'Latitude': res.lat, 'Longitude': res.lon, 'Status': res.status });
    plotResult(code, res.lat, res.lon);

    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${code}</td><td>${res.lat}</td><td>${res.lon}</td><td class="${statusClass(res.status)}">${res.status}</td>`;
    tableBody.appendChild(tr);

    if(i < codes.length - 1) await new Promise(r=>setTimeout(r, REQUEST_DELAY_MS));
  }

  progressFill.style.width = '100%';
  progressText.textContent = `Done - ${codes.length} code${codes.length===1?'':'s'} processed`;
  setStatus(`Done - ${codes.length} code${codes.length===1?'':'s'} processed`, 'ok');
  fitMapToMarkers();

  lookupBtn.disabled = false;
  downloadBtn.disabled = false;
});

clearSingleBtn.addEventListener('click', ()=>{
  codesInput.value = '';
  currentResultRows = [];
  currentResultFields = [];
  tableHead.innerHTML = '';
  tableBody.innerHTML = '';
  table.style.display = 'none';
  hideProgress();
  clearMap();
  downloadBtn.disabled = true;
  setStatus('Ready - paste codes or upload a CSV, then run the conversion.', 'idle');
});

// BATCH MODE 
let parsedRows = [];
let parsedFields = [];

const csvFileInput = document.getElementById('gpg-csv-file');
const columnRow = document.getElementById('gpg-column-row');
const codeColumnSelect = document.getElementById('gpg-code-column');
const batchBtn = document.getElementById('gpg-btn-batch');

csvFileInput.addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  Papa.parse(file, {
    header:true,
    skipEmptyLines:true,
    complete: (results)=>{
      parsedRows = results.data;
      parsedFields = results.meta.fields || [];
      codeColumnSelect.innerHTML = '';
      parsedFields.forEach(f=>{
        const opt = document.createElement('option');
        opt.value = f; opt.textContent = f;
        codeColumnSelect.appendChild(opt);
      });
      // guess a sensible default
      const guess = parsedFields.find(f => /gps|code|address/i.test(f));
      if(guess) codeColumnSelect.value = guess;

      columnRow.style.display = 'flex';
      batchBtn.disabled = false;
      downloadBtn.disabled = true;
      setStatus(`Loaded ${parsedRows.length} row${parsedRows.length===1?'':'s'} with columns: ${parsedFields.join(', ')}`, 'idle');
      table.style.display = 'none';
    },
    error: (err)=>{
      setStatus('Could not parse that file as CSV: ' + err.message, 'err');
    }
  });
});

batchBtn.addEventListener('click', async ()=>{
  if(!parsedRows.length) return;
  const col = codeColumnSelect.value;
  batchBtn.disabled = true;
  downloadBtn.disabled = true;
  clearMap();

  showProgress();
  setStatus('Processing CSV…', 'idle');

  currentResultFields = [...parsedFields];
  if(!currentResultFields.includes('Latitude')) currentResultFields.push('Latitude');
  if(!currentResultFields.includes('Longitude')) currentResultFields.push('Longitude');
  if(!currentResultFields.includes('Lookup Status')) currentResultFields.push('Lookup Status');
  currentFilename = 'addresses_with_coordinates.csv';

  tableHead.innerHTML = '<tr>' + currentResultFields.map(f=>`<th>${f}</th>`).join('') + '</tr>';
  tableBody.innerHTML = '';
  table.style.display = 'table';

  const cache = new Map();
  currentResultRows = [];
  const n = parsedRows.length;
  const previewLimit = 25;

  for(let i=0;i<n;i++){
    const row = parsedRows[i];
    const code = row[col];
    progressText.textContent = `Processing ${i+1} of ${n} - ${code || '(empty)'}`;
    progressFill.style.width = Math.round((i/n)*100) + '%';

    const res = await lookupCode(code, cache);
    const outRow = { ...row, 'Latitude': res.lat, 'Longitude': res.lon, 'Lookup Status': res.status };
    currentResultRows.push(outRow);
    plotResult(code, res.lat, res.lon);

    if(i < previewLimit){
      const tr = document.createElement('tr');
      tr.innerHTML = currentResultFields.map(f=>{
        const cls = f === 'Lookup Status' ? ` class="${statusClass(res.status)}"` : '';
        return `<td${cls}>${outRow[f] ?? ''}</td>`;
      }).join('');
      tableBody.appendChild(tr);
    }

    if(i < n - 1) await new Promise(r=>setTimeout(r, REQUEST_DELAY_MS));
  }

  progressFill.style.width = '100%';
  const doneText = `Done - ${n} row${n===1?'':'s'} processed` + (n > previewLimit ? ` (showing first ${previewLimit} below, full result in the download)` : '');
  progressText.textContent = doneText;
  setStatus(doneText, 'ok');
  fitMapToMarkers();

  batchBtn.disabled = false;
  downloadBtn.disabled = false;
});