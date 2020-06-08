var dataURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
console.log(dataURL)

d3.json(dataURL, function(earthquakeData){

  console.log(earthquakeData)
  console.log(earthquakeData)
  //add tectonic plates data to overlays
  linkTectonicPlates = "static/data/PB2002_plates.json"
  d3.json(linkTectonicPlates, function(tectonicPlatesData){
    console.log("tectonicPlatesData", tectonicPlatesData)

    //call function to create features
    createFeatures(earthquakeData.features, tectonicPlatesData);
  })

  

})

function createFeatures(earthquakeData, tectonicPlatesData) {
  console.log("earthquakeData",earthquakeData)

  //create array of circles to form overlay
  var earthquakeCircles = [];
  
  for (var i=0; i < earthquakeData.length; i++){

    //define color for circles
    var color = "";
    if (earthquakeData[i].properties.mag > 5) {
    color = "#F06B6B";
    }
    else if (earthquakeData[i].properties.mag > 4) {
    color = "#F0A76B";
    }
    else if (earthquakeData[i].properties.mag > 3) {
    color = "#F3BA4D";
    }
    else if (earthquakeData[i].properties.mag > 2) {
    color = "#F3DB4D";
    }
    else if (earthquakeData[i].properties.mag > 1) {
    color = "#E1F34D";
    }
    else {
    color = "#B7F34D";
    }    

    earthquakeCircles.push(
      L.circle([
        earthquakeData[i].geometry.coordinates[1], earthquakeData[i].geometry.coordinates[0]
      ],{
      color: color,
      fillColor: color,
      fillOpacity: 0.75,
      radius: parseFloat(earthquakeData[i].properties.mag) * 25000
      }
      ).bindPopup(
        "<p> Earthquake Magnitude: " + earthquakeData[i].properties.mag 
        + "</p><hr><p>Place: " + earthquakeData[i].properties.place 
        + "</p><p>Time: " + new Date(earthquakeData[i].properties.time)
        + "</p>")
    )
  }
  //console.log("earthquakeCircles",earthquakeCircles)

  //create a layer group
  var earthquakeLayer = L.layerGroup(earthquakeCircles);

  //create tectonic plates layer
  var tectonicPlatesLayer = L.geoJson(tectonicPlatesData, {
    style: function(feature) {
      return {
        color: "orange",
        fillOpacity: 0
      }},
    onEachFeature: function(feature, layer){
      layer.bindPopup("<p>" + feature.properties.PlateName + " Tectonic Plate</p>");
    }
    
  })


  var overlayMaps = {
    "Tectonic Plates": tectonicPlatesLayer,
    Earthquakes: earthquakeLayer
  };
  
    createMap(overlayMaps);
  }

  function createMap(overlayMaps) {

    // Define base layers
    var grayscaleMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      minZoom: 2,
      id: "mapbox.light",
      accessToken: API_KEY
    })

    var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        minZoom: 2,
        id: "mapbox.satellite",
        accessToken: API_KEY
      })
  
    var outdoorsMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      minZoom: 2,
      id: "mapbox.outdoors",
      accessToken: API_KEY
    });
  
    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Satellite": satelliteMap,
      "Outdoors": outdoorsMap,
      "Grayscale": grayscaleMap
    };
  
 
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 3,
      layers: [satelliteMap, overlayMaps["Tectonic Plates"], overlayMaps["Earthquakes"]]
    });

  
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);


  // Set up the legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var limits = [0,1,2,3,4,5];
    var colors = ["#B7F34D","#E1F34D","#F3DB4D","#F3BA4D","#F0A76B","#F06B6B"];

    for (var i = 0; i < limits.length; i++) {
      div.innerHTML +=
          '<i style="background:' + colors[i] + '"></i> ' +
          limits[i] + (limits[i + 1] ? '&ndash;' + limits[i + 1] + '<br>' : '+');
    }
    return div;
  };
  
    // //zoom event listener
    // legend.addTo(myMap);
    // myMap.on("zoom", function(ev){
    //   console.log("zoom", ev.target._zoom)
    // })
  }
