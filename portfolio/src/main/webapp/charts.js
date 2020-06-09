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
google.charts.setOnLoadCallback(drawChart);

var map;
var service;
var infowindow;

/** Creates a chart and adds it to the page. */
function drawChart() {
  fetch('/covid-data').then(response => response.json())
  .then((covidCount) => {
    const data = new google.visualization.DataTable();
    data.addColumn('string', 'Date');
    data.addColumn('number', 'Number of Cases');
    Object.keys(covidCount).forEach((date) => {
      data.addRow([date, covidCount[date]]);
    });
    data.sort([{column:1}]);
    const options = {
      'title': 'COVID-19 Cases in CA',
      'height':500,
      'animation': {
        duration: 2000,
        startup: true,
        easing: 'in'
      },
    };

    const chart = new google.visualization.LineChart(
        document.getElementById('chart-container'));
    chart.draw(data, options);
  });
}

/** Creates a map and adds it to the page. */
function createMap() {
    infowindow = new google.maps.InfoWindow();

    map = new google.maps.Map(
        document.getElementById('map'),
        {center: {lat: 37.422, lng: -122.084}, zoom: 8});

    //text based query
    var request = {
        query: 'national park',
    };
    
    service = new google.maps.places.PlacesService(map);

    service.textSearch(request, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
        }
        map.setCenter(results[0].geometry.location);
        }
    });
}

function createMarker(place) {
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });
  console.log(place.name);
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}
