$(document).ready(function () {
    // define a basic map
    var map = L.map("map").setView([5.123, -1.245], 10);
    // add a tile layer to the map
// google maps tile layer
    var goole_maps = L.tileLayer(
        "https://mt1.google.com/vt/lyrs=m\u0026x={x}\u0026y={y}\u0026z={z}\u0026key=AIzaSyB78Tt1ukAU0W0iy_ER9eQXK_cx4s_Skto",
        {"attribution": "\u003ca href=\"https://www.google.com/maps/\"\u003eGoogle Maps\u003c/a\u003e",
        "detectRetina": false,
        "maxNativeZoom": 18,
        "maxZoom": 18, 
        "minZoom": 0, 
        "noWrap": false, 
        "opacity": 1, "subdomains": 
        "abc", "tms": 
        false}).addTo(map);

    // osm tile layer
    var open_street_maps = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: 'Map data &copy: <a href="https://www.openstreetmap.org">Open Street Map</a>',
    maxZoom: 18,
    }).addTo(map);
    // add bing map
    var API_KEY = 'Av9vBDRFGoF99GLKbR4AP1a1VJN-g2NkvPSHXM0e_gi5XwOf1RVTLZhe94L3DzsA'

    // L.tileLayer.bing(API_KEY, {type: 'AerialWithLabels'}).addTo(map)
    // var bing_maps = L.BingLayer(API_KEY, {
    //     type: 'AerialWithLabels'
    //     });
    // map.addLayer(bing_maps)

    var bing_maps = L.tileLayer.bing(API_KEY, {
    type: 'AerialWithLabels'
    }).addTo(map);
        // create a layer group
    var baseLayers = {
        "OpenStreetMap": open_street_maps,
        "Bing Aerial": bing_maps,
        "Google Street Map": goole_maps,
    }
    L.control.layers(baseLayers).addTo(map);
    var lyrs = L.layerGroup().addTo(map);
    // define a function that collects the current value of the text area,  
    // and displays the corresponding GeoJSON layer on the map with L.geoJSON
    function displayGeoJson () {
        // remove old geojson
        lyrs.clearLayers();
        var txt = $("#geojsontext").val();
        // if the user did not submit a geojson string, prompt them
        if (txt === "") {
            alert("Please enter a GeoJSON string");
            return;
        }
        // parse the text string extracted from the <textarea> input with
        // JSON.parse
        txt = JSON.parse(txt);
        // display new geojson
        var geojsonLayer = L.geoJSON(txt).addTo(lyrs);
        // pan and zoom to the bounds of the new geojson layer
        map.fitBounds(geojsonLayer.getBounds());
    }
   
    // add an event listener that executes the displayGeoJson 
    // function when the submit button is clicked
    $("#submit").on("click", displayGeoJson);
    $("#clear").on("click", function () {
        $("#geojsontext").val("");
    });
  // add draw control to the map
  var drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);
  var drawControl = new L.Control.Draw({
    draw: {
      polygon: true,
      marker: false,
      polyline: true,
      rectangle: false,
      circle: false
    },
    edit: {
      featureGroup: drawnItems,
      remove: true
    }
  }
  );
  map.addControl(drawControl); // add draw control to the map

  // handle draw:created event
  map.on('draw:created', function (e) {
    var type = e.layerType;
    var layer = e.layer;
    var geojson = layer.toGeoJSON();
    // format the GeoJSON string and add it to the text area
    var str = JSON.stringify(geojson, null, 2);
    $('#geojsontext').val(str);
    drawnItems.addLayer(layer);
  });

  // handle submit button click event
  $('#submit').click(function() {
    var str = $('#geojsontext').val();
    var geojson = JSON.parse(str);
    // clear previous layers and add the new one
    drawnItems.clearLayers();
    var layer = L.geoJSON(geojson);
    drawnItems.addLayer(layer);
    map.fitBounds(layer.getBounds());
  });

  // handle clear button click event
  $('#clear').click(function() {
    $('#geojsontext').val('');
    drawnItems.clearLayers();
  });
});

