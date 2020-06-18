// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


google.charts.load('current', {'packages':['corechart']});
//google.charts.setOnLoadCallback(drawChart);

var map;
var service;
var infowindow;
var directionsService;
var directionsRenderer;
var userLocation;
var resultsDistances;
var resultsDurations;
var resultsArray;
var promise;
var markers = [];
var chart;


/** Creates a chart and adds it to the page. */
// function drawChart() {
//   fetch('/covid-data').then(response => response.json())
//   .then((covidCount) => {
//     const data = new google.visualization.DataTable();
//     data.addColumn('string', 'Date');
//     data.addColumn('number', 'Number of Cases');
//     Object.keys(covidCount).forEach((date) => {
//       data.addRow([date, covidCount[date]]);
//     });
//     data.sort([{column:1}]);
//     const options = {
//       'title': 'COVID-19 Cases in CA',
//       'height':500,
//       'animation': {
//         duration: 2000,
//         startup: true,
//         easing: 'in'
//       },
//     };

//     const chart = new google.visualization.LineChart(
//         document.getElementById('chart-container'));
//     chart.draw(data, options);
//   });
// }

function drawChart() {
  //fetch('/covid-data').then(response => response.json())
  //.then((covidCount) => {
    const data = new google.visualization.DataTable();
    data.addColumn('number', 'Distance');
    data.addColumn('number', 'Rating');
    data.addColumn({type:'string',role:'tooltip'});
    resultsArray.forEach((result) => {
        let miles  = result.distance.value/1609.34;
        console.log(miles);
        data.addRow([miles, result.rating, result.name]);
    });
    
    //data.sort([{column:1}]);
    const options = {
      'title': 'delayed gratification what?',
      //'height':500,
      'animation': {
        duration: 2000,
        startup: true,
        easing: 'inAndOut'
      },
      'hAxis': {title: 'Distance [miles]'},
      'vAxis': {title: 'Rating'},
      'legend': 'none',
      'colors': ['#917bab']
    };

    chart = new google.visualization.ScatterChart(
        document.getElementById('chart-container'));
    chart.draw(data, options);

}

//on click of html element
function selectResult(index) {
    console.log(index);
    //erase prev selection
    chart.setSelection(null);
    chart.setSelection([{row:index,column:null}]);
}

/** Creates a map and adds it to the page. */
function createMap() {
    
    infowindow = new google.maps.InfoWindow();

    map = new google.maps.Map(
        document.getElementById('map'),
        {center: {lat: 37.422, lng: -122.084}, zoom: 8});

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        infowindow.setPosition(pos);
        infowindow.setContent('Location found.');
        infowindow.open(map);
        map.setCenter(pos);        
        userLocation = new google.maps.LatLng({lat: pos.lat, lng: pos.lng}); 
    }, function() {
        handleLocationError(true, infowindow, map.getCenter());
    });
    } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infowindow, map.getCenter());
    }   
    //set up
    service = new google.maps.places.PlacesService(map);
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map); // Existing map object displays directions
}

async function inputQuery() {
    console.log("button clicked");
    const userInput= await document.getElementById("queryText").value;
    const response = await console.log(userInput);
    // const params = new URLSearchParams();
    // params.append('text', userInput);
    // const request = new Request('/query', {method: 'POST', body: params});
    // const response = await fetch(request);
    // console.log(response);
    // const query = await response.json();
    // console.log(query);
    preQuery(userInput);
}

function preQuery(userInput) {
    //text based query
    resultsArray = [];
    resultsDistances = [];
    resultsDurations = [];
    clearMarkers();

    var request = {
        query: userInput,
    };

    service.textSearch(request, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length && i < 8; i++) {
                createMarker(results[i]);
                let resultObj = {
                                destination: results[i].geometry.location,
                                name: results[i].name,
                                rating: results[i].rating,
                                duration: null,
                                distance: null,
                                index: i
                                };
                resultsArray.push(resultObj);
            }
            //map.setCenter(results[0].geometry.location);
            routeResults();
        }
    });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

function createMarker(place) {
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });
  markers.push(marker);
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

// Removes the markers from the map, clears them from the array.
function clearMarkers() {
    setMapOnAll(null);
    markers = [];
}


function updateResults() {
    // Build comments
    const resultsListElement = document.getElementById('results-container');
    resultsListElement.innerHTML = '';
    console.log(resultsArray.length);
    console.log(resultsDurations.length);
    console.log(resultsDistances.length);
    for (var i = 0; i < resultsArray.length; i++) {
        resultsArray[i].duration = resultsDurations[i];
        resultsArray[i].distance = resultsDistances[i];
        resultsListElement.appendChild(createResultElement(resultsArray[i]));
    }
    drawChart();
}

/** Creates an <li> element containing text. */
function createResultElement(result) {

    const resultElement = document.createElement('div');
    resultElement.className = 'result';
    resultElement.id = result.index;

    const nameElement = document.createElement('h5');
    nameElement.className = 'result_name_rating';
    nameElement.innerText = result.name + " ---  "+ result.rating;
    nameElement.style = 'font-weight: bold;';
    resultElement.appendChild(nameElement);

    const routeElement = document.createElement('p');
    routeElement.className = 'result_route';
    routeElement.innerText = result.distance.text + "   "+ result.duration.text;
    resultElement.appendChild(routeElement);

    resultElement.addEventListener('click', () => {
        selectResult(parseInt(resultElement.id));
        clearStyles();
        resultElement.style = "background-color:#d0b0f7";
    });

    return resultElement;
}

function clearStyles() {
    for (var i = 0; i < resultsArray.length; i++) {
        document.getElementById(i.toString()).removeAttribute("style");
    }
}

function afterQuery() {
    setTimeout(function() {
        updateResults();
    }, 2000);
}

function routeResults() {

    for (var i = 0; i < resultsArray.length; i++) {

        let route = {
                origin: userLocation,
                destination: resultsArray[i].destination,
                travelMode: 'DRIVING'
        };

        directionsService.route(route,
            function(response, status) { // anonymous function to capture directions
                if (status !== 'OK') {
                    window.alert('Directions request failed due to ' + status);
                    return;
                } else {
                    directionsRenderer.setDirections(response); // Add route to the map
                    var directionsData = response.routes[0].legs[0]; // Get data about the mapped route
                    //let polyline = response.routes[0].overview_polyline;

                    if (!directionsData) {
                        window.alert('Directions request failed');
                        return;
                    } else {
                        resultsDistances.push(directionsData.distance);
                        resultsDurations.push(directionsData.duration);
                    }
                }
            }
        );
    };

    afterQuery();
}


