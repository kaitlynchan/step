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
      'legend': 'none'
    };

    const chart = new google.visualization.ScatterChart(
        document.getElementById('chart-container'));
    chart.draw(data, options);

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

function preQuery(userInput) {
    //text based query
    resultsArray = [];
    resultsDistances = [];
    resultsDurations = [];
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
                                distance: null
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
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
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
}

/** Creates an <li> element containing text. */
function createResultElement(result) {

    const resultElement = document.createElement('div');
    resultElement.className = 'result';

    const nameElement = document.createElement('p');
    nameElement.className = 'result_name_rating';
    nameElement.innerText = result.name + " "+ result.rating;
    resultElement.appendChild(nameElement);

    const routeElement = document.createElement('p');
    routeElement.className = 'result_route';
    routeElement.innerText = result.distance.text + " "+ result.duration.text;
    resultElement.appendChild(routeElement);

    return resultElement;
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
                    let polyline = response.routes[0].overview_polyline;

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


