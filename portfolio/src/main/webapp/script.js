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

const lofi = {song:"", filter:"", beat:"", monologue:""};

function addSong() {

    //upload mp3 file, play to ensure it is correct

    //for now, keep local mp3 files

    const songs =
        ['songA.mp3', 'songB.mp3'];

    // Pick a random greeting.
    const song = songs[Math.floor(Math.random() * songs.length)];

    // Update object
    lofi.song = song;

    var mp3viewer = '<audio controls>'+
                    '<source src="audio/'+song+'" type="audio/mpeg">' + 
                    '</audio>'
    
    // Add it to the page.
    const songContainer = document.getElementById('song-container');
    songContainer.innerHTML = song + '<br/>' + mp3viewer;
}

function addBeat() {

    //display beat options + preview play
    const beats =
        ['Beat A', 'Beat B', 'Beat C', 'Beat D'];

    // Pick a random greeting.
    const beat = beats[Math.floor(Math.random() * beats.length)];
    // Update object
    lofi.beat = beat;
    // Add it to the page.
    const beatContainer = document.getElementById('beat-container');
    beatContainer.innerText = beat;
}

function addFilter() {

    //display filter selections
    const filters =
        ['Filter A', 'Filter B', 'Filter C', 'Filter D'];

    // Pick a random greeting.
    const filter = filters[Math.floor(Math.random() * filters.length)];
    // Update object
    lofi.filter = filter;
    // Add it to the page.
    const filterContainer = document.getElementById('filter-container');
    filterContainer.innerText = filter;
}

function addMonologue() {

    //allow text input + test to speech
    const monologues =
        ['Monologue A', 'Monologue B', 'Monologue C', 'Monologue D'];

    // Pick a random greeting.
    const monologue = monologues[Math.floor(Math.random() * monologues.length)];
    // Update object
    lofi.monologue = monologue;
    // Add it to the page.
    const monologueContainer = document.getElementById('monologue-container');
    monologueContainer.innerText = monologue;
}

function lofiStatus() {
    console.log("Lofi Status:")
    console.log(lofi.song);
    console.log(lofi.filter);
    console.log(lofi.monologue);
    console.log(lofi.beat);
    const lofiContainer = document.getElementById('lofi-container');
    lofiContainer.innerHTML =   lofi.song+"<br/>"+lofi.filter+"<br/>"+lofi.monologue+"<br/>"+lofi.beat;
}
