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
      marker: true,
      polyline: true,
      rectangle: false, // Rectangles disabled
      circle: false, // Circles disabled
      circlemarker: false, //Circle markers disabled

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

  var mapContainer = $("#map");
  var uploadBtn = $("<button>").attr('id', 'upload-btn').text('Upload')
  uploadBtn.appendTo(mapContainer);
  uploadBtn.on("click", function () {
    var outputText = $("#geojsontext");
    var fileInput = $('<input>').attr({
      type: 'file',
      accept: '.geojson, .json'
    }).css({
      display: 'none'
    });
    fileInput.appendTo('body');
    fileInput.on("change", function(e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(e) {
        var contents = e.target.result;
        outputText.val(contents);
        L.geoJSON(JSON.parse(contents), {
          style: {
            color: 'blue'
          }
        }).addTo(map);
        var geojsonLayer = L.geoJSON(JSON.parse(contents));
        if (geojsonLayer.getLayers().length > 0) {
          map.fitBounds(geojsonLayer.getBounds());
        }
      };
      reader.readAsText(file);
      fileInput.remove();
    });
    fileInput.click();
    $('#clear').click(function() {
      $('#geojsontext').val('');
      map.eachLayer(function(layer) {
        if (layer instanceof L.GeoJSON) {
          map.removeLayer(layer);
        }
      });
    });
  });

  
  // // Create an export button element
  // const exportBtn = $("<button>").attr('id', 'export-btn').text('Export').on("click", function () {
  //   // Toggle export options dropdown visibility
  //   $(".export-options").toggle();

  //   var mapContainer = $("#map");

  //   // Append the export button to the map container
      
  //   // Create export options dropdown
  //   const optionsContainer = $("<div>").addClass('export-options').hide(); // Hide the options container initially

  // // Create a list to hold the export options
  //   const optionsList = $("<ul>");

  //   // Create list items for each export option
  //   const csvOption = $("<li>").text("CSV").on("click", exportCSV);
  //   const kmlOption = $("<li>").text("KML").on("click", exportKML);
  //   const geojsonOption = $("<li>").text("GeoJSON").on("click", exportGeoJSON);
  //   const shapefileOption = $("<li>").text("Shapefile").on("click", exportShapefile);

  //     // Append list items to the options list
  //   optionsList.append(csvOption, kmlOption, geojsonOption, shapefileOption);

  //   // Append options list to the options container
  //   optionsContainer.append(optionsList);

  //   // Append options container to the map container
  //   mapContainer.append(optionsContainer);
  
  // });
  //   // Function to export drawn items as CSV
  //   function exportCSV() {
  //     var csv = drawnItems.toCSV();
  //     var dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  //     var downloadAnchorNode = document.createElement('a');
  //     downloadAnchorNode.setAttribute("href", dataStr);
  //     downloadAnchorNode.setAttribute("download", "drawn_items.csv");
  //     document.body.appendChild(downloadAnchorNode); // required for firefox
  //     downloadAnchorNode.click();
  //     downloadAnchorNode.remove();
  //   }
  
  //   // Function to export drawn items as KML
  // function exportKML() {
  //     var kml = tokml(drawnItems.toGeoJSON());
  //     var dataStr = "data:text/xml;charset=utf-8," + encodeURIComponent(kml);
  //     var downloadAnchorNode = document.createElement('a');
  //     downloadAnchorNode.setAttribute("href", dataStr);
  //     downloadAnchorNode.setAttribute("download", "drawn_items.kml");
  //     document.body.appendChild(downloadAnchorNode); // required for firefox
  //     downloadAnchorNode.click();
  //     downloadAnchorNode.remove();
  //   }
  
  //     // Function to export drawn items as GeoJSON
  // function exportGeoJSON() {
  //       var geojson = drawnItems.toGeoJSON();
  //       var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojson));
  //       var downloadAnchorNode = document.createElement('a');
  //       downloadAnchorNode.setAttribute("href", dataStr);
  //       downloadAnchorNode.setAttribute("download", "drawn_items.geojson");
  //       document.body.appendChild(downloadAnchorNode); // required for firefox
  //       downloadAnchorNode.click();
  //       downloadAnchorNode.remove();
  //     }
  
  // function exportShapefile() {
  //       // Check if shpwrite is available
  //       if (typeof shpwrite === 'undefined') {
  //         console.error('shpwrite.js library is not available. Please include the library and try again.');
  //         return;
  //       }
      
  //       // Check if drawnItems layer is available
  //       if (!drawnItems) {
  //         console.error('DrawnItems layer is not available. Please create the layer and add features to it before exporting as Shapefile.');
  //         return;
  //       }
      
  //       // Convert drawnItems to GeoJSON
  //       const geojson = drawnItems.toGeoJSON();
      
  //       // Convert GeoJSON to Shapefile using shpwrite library
  //       shpwrite.download(geojson, 'drawnItems', {
  //         folder: true
  //       });
  //     }   
  // mapContainer.append(exportBtn);

});

