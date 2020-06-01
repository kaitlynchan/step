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

/**
 * Adds a random greeting to the page.
 */

//lofi object
const lofi = {song:"", filter:"", beat:"", monologue:""};

function selectSong() {
    //upload mp3 file, play to ensure it is correct
    //for now, keep local mp3 files
    const songs =
        ['songA.mp3', 'songB.mp3'];

    const song = songs[Math.floor(Math.random() * songs.length)];

    // Update object
    lofi.song = song;
    var songHTML = '<audio id = "selectedSong" src="audio/'+song+'" type="audio/mpeg"></audio>'
    
    // Add it to the page.
    const songContainer = document.getElementById('song-container');
    songContainer.innerHTML = song + '<br/>' + songHTML;
    updateSong(lofi);
}

function selectBeat() {
    //display beat options + preview play
    var beats = ['rain.mp3', 'Beat B', 'Beat C', 'Beat D'];

    var beat = beats[Math.floor(Math.random() * beats.length)];
    // Update object
    lofi.beat = beat;
    var beatHTML = '<audio id = "selectedBeat" src="audio/'+beat+'" type="audio/mpeg"></audio>'
    // Add it to the page.
    var beatContainer = document.getElementById('beat-container');
    beatContainer.innerHTML = beat + '<br/>' + beatHTML;
    updateBeat(lofi);
}

function selectFilter() {
    //display filter selections
    const filters =
        ['lowshelf', 'Filter B', 'Filter C', 'Filter D'];

    const filter = filters[Math.floor(Math.random() * filters.length)];
    // Update object
    lofi.filter = filter;
    // Add it to the page.
    const filterContainer = document.getElementById('filter-container');
    filterContainer.innerText = filter;
    updateFilter(lofi);
}

function selectMonologue() {
    //allow text input + test to speech
    const monologues =
        ['maman.mp3', 'Monologue B', 'Monologue C', 'Monologue D'];

    const monologue = monologues[Math.floor(Math.random() * monologues.length)];
    // Update object
    lofi.monologue = monologue;

    var monologueHTML = '<audio id = "selectedMonologue" src="audio/'+monologue+'" type="audio/mpeg"></audio>'
    // Add it to the page.
    var monologueContainer = document.getElementById('monologue-container');
    monologueContainer.innerHTML = monologue + '<br/>' + monologueHTML;
    updateMonologue();
}

function lofiStatus() {

    console.log("Lofi Status:")
    console.log(lofi.song);
    console.log(lofi.filter);
    console.log(lofi.monologue);
    console.log(lofi.beat);

    const lofiContainer = document.getElementById('lofi-container');

    var missing = "";
    if (lofi.song == ""){
        console.log("missing song");
        missing += "song";
    }

    if (lofi.filter == ""){
        console.log("missing filter");
        missing += "filter";
    }

    if (lofi.monologue == ""){
        console.log("missing monologue");
        missing += "monologue";
    }

    if (lofi.beat == ""){
        console.log("missing beat");
        missing += "beat";
    }

    var alertHTML = '<div class="alert alert-info alert-dismissible fade show">'+
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    'Missing:' + missing + '</div>';
    if (missing) {
        lofiContainer.innerHTML = alertHTML;
    }
    else {
        lofiContainer.innerHTML =   lofi.song+"<br/>"+lofi.filter+"<br/>"+lofi.monologue+"<br/>"+lofi.beat;
    }
}
