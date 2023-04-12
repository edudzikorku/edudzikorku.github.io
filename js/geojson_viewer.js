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

    // Define custom style options
    var customStyle = {
      color: 'red', // Specify the color you want
      weight: 2, // Specify the weight of the stroke
      opacity: 0.8, // Specify the opacity of the stroke
      fill: true, // Specify if you want the shape to be filled or not
      fillColor: 'yellow', // Specify the fill color if fill is set to true
      fillOpacity: 0.4 // Specify the fill opacity if fill is set to true
    };
    // Define a custom marker icon
    var customMarkerIcon = L.AwesomeMarkers.icon({
      icon: 'fa-map-marker', // Specify the icon name
      prefix: 'fa', // Specify the icon library (e.g., 'fa' for Font Awesome)
      markerColor: 'red' // Specify the marker color
      });
    var drawControl = new L.Control.Draw({
      draw: {
        polygon: {
          shapeOptions: customStyle 
        },

        polyline: {
          shapeOptions: customStyle
        },

        marker: {
          icon: new L.Icon({
            iconUrl: '../images/marker_v.png',
            iconSize: [30, 30]
          }), 
          repeatMode: false
        },

        rectangle: false, // Rectangles disabled
        circle: false, // Circles disabled
        circlemarker: false // Circle markers disabled
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

    // get the map container
    var mapContainer = $("#map");
    var uploadBtn = $("<button>").attr('id', 'upload-btn').text('Upload');
    uploadBtn.appendTo(mapContainer);
    // add event listener to be executed when the upload button is clicked
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
              color: 'red'
            }
        }).addTo(map);
        var geojsonLayer = L.geoJSON(JSON.parse(contents));
        if (geojsonLayer.getLayers().length > 0) {
          map.fitBounds(geojsonLayer.getBounds());
        }
      }
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

  
    // Create an export button element
    var exportBtn = $("<button>").attr('id', 'export-btn').text('Export').on("click", function () {
        // Toggle export options dropdown visibility
        $(".export-options").toggle().hide();

    // Append the export button to the map container
      var mapContainer = $("#map");
        
      // Create export options dropdown
      var optionsContainer = $("<div>").addClass('export-options'); //.hide(); // Hide the options container initially

      // Create a list to hold the export options
      var optionsList = $("<ul>");

      // Create list items for each export option
      var csvOption = $("<li>").text("CSV").on("click", exportCSV);
      var kmlOption = $("<li>").text("KML").on("click", exportKML);
      var geojsonOption = $("<li>").text("GeoJson").on("click", exportGeoJSON);
      var shapefileOption = $("<li>").text("Shapefile").on("click", exportShapefile);

      // Append list items to the options list
      optionsList.append(csvOption, kmlOption, geojsonOption, shapefileOption);

      // Append options list to the options container
      optionsContainer.append(optionsList);

      // Append options container to the map container
      optionsContainer.appendTo(mapContainer);
      exportBtn.append(optionsContainer)
      // Hide options container when its external is clicked
      $(document).on("click", function(event) {
        if (!$(event.target).closest("#export-btn, .export-options").length) {
          $(".export-options").hide();
        }
      });
    
    // Export functions for different formats

    // Function to export drawn features as CSV
    function exportCSV() {
      var data = drawnItems.toGeoJSON();
      var csv = 'data:text/csv;charset=utf-8,';
      csv += 'Latitude,Longitude\n';
      data.features.forEach(function(feature) {
          var coords = feature.geometry.coordinates;
          csv += coords[1] + ',' + coords[0] + '\n';
      });
      var encodedURI = encodeURI(csv);
      var link = document.createElement('a');
      link.setAttribute('href', encodedURI);
      link.setAttribute('download', 'export.csv');
      document.body.appendChild(link);
      link.click();
      console.log("Exporting as csv");
      $(".export-options").hide();
    }
  
    // Function to export drawn items as KML
    function exportKML() {
        var kml = tokml(drawnItems.toGeoJSON());
        var dataStr = "data:text/xml;charset=utf-8," + encodeURIComponent(kml);
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "export.kml");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        console.log("Exporting as kml");
        $(".export-options").hide();
      }
  
    // Function to export drawn items as GeoJSON
    function exportGeoJSON() {
          var geojson = drawnItems.toGeoJSON();
          var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojson));
          var downloadAnchorNode = document.createElement('a');
          downloadAnchorNode.setAttribute("href", dataStr);
          downloadAnchorNode.setAttribute("download", "export.geojson");
          document.body.appendChild(downloadAnchorNode); // required for firefox
          downloadAnchorNode.click();
          downloadAnchorNode.remove();
          console.log("Exporting as geojson");
          $(".export-options").hide();
        }

      // Function to export drawn features as shapefile
    function exportShapefile() {
          var geojson = drawnItems.toGeoJSON();
        
          // Convert the GeoJSON to a shapefile
          var shpBlob = new Blob([shpwrite.download(geojson)], { type: 'application/zip' });
        
          // Create a JSZip object
          // var zip = new JSZip();
          // zip.file('drawn_items.shp', shpBlob);
        
          // // Create a download link and trigger the download
          // zip.generateAsync({ type: 'blob' }).then(function(content) {
          //   var downloadLink = document.createElement('a');
          //   downloadLink.href = URL.createObjectURL(content);
          //   downloadLink.download = 'export.zip';
          //   document.body.appendChild(downloadLink); // required for Firefox
          //   downloadLink.click();
          //   downloadLink.remove();
         
          // });
          console.log('Exporting as shapefile');
          $('.export-options').hide();
        }
    });
    exportBtn.appendTo(mapContainer);
});
