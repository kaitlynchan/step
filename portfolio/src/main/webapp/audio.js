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

//https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API


var AudioContext;
var audioContext;
var audioElement;
var track;
var audioElement2;
var track2;
var audioElement3;
var track3;
var analyser;
var analyserNoMod;
var gainNode;

//grab input + control volume
const volumeControl = document.querySelector('#volume');
//grab play button
const playButton = document.querySelector('#genLofi');
var play;
playButton.addEventListener('click', function() {

    console.log("play button clicked")
    
    // check if context is in suspended state (autoplay policy)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    // play or pause track depending on state
    //if (this.dataset.playing === 'false') {
    if (!play) {
        console.log("entered play loop");
        audioElement.play();
        audioContext.resume();
        this.dataset.playing = 'true';
        play = true;
    } else if (play) {
        audioElement.pause();
        audioContext.suspend();
        this.dataset.playing = 'false';
        play = false;
    }

    connectTracks();

}, false);

//set up visualizers
var canvas = document.querySelector('#visualizer'); 
//no mod visualizer
var canvasNoMod = document.querySelector('#visualizerNoMod'); 

var canvasCtx = canvas.getContext("2d"); 
var canvasCtxNoMod = canvasNoMod.getContext("2d"); 

const WIDTH = 500; 
const HEIGHT = 100; 
canvas.setAttribute('width',WIDTH); 
canvas.setAttribute('height',HEIGHT); 
canvasCtx.clearRect(0, 0, WIDTH, HEIGHT); 

canvasNoMod.setAttribute('width',WIDTH); 
canvasNoMod.setAttribute('height',HEIGHT); 
canvasCtxNoMod.clearRect(0, 0, WIDTH, HEIGHT); 

function initializeLofi() {
    //initializes audio context + API usage
    console.log("initLofi clicked");
    AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    initNodes();
    visualize();
}

function updateSong(song) {
    console.log("updateSong called");
    // load sound
    audioElement = document.querySelector('#selectedSong');
    console.log("audio element made");
    
    audioElement.addEventListener('ended', () => {
        playButton.dataset.playing = 'false';
    }, false);
}

function connectTracks() {
    console.log("connectTracks called");
    if (track){
        track.disconnect(0);
    }
    track = audioContext.createMediaElementSource(audioElement);
    //set the path 
    track.connect(analyserNoMod);
    track.connect(gainNode).connect(analyser).connect(audioContext.destination);
}

function updateBeat(beat) {
    // load sound
    audioElement2 = document.querySelector('#selectedBeat');
    //pass to audioContext(source node)
    track2 = audioContext.createMediaElementSource(audioElement2);
    track2.connect(gainNode).connect(analyser).connect(audioContext.destination);
}

function updateMonologue(monologue) {
    // load sound
    audioElement3 = document.querySelector('#monologue');
    //pass to audioContext(source node)
    track3 = audioContext.createMediaElementSource(audioElement3);
    track3.connect(gainNode).connect(analyser).connect(audioContext.destination);
}

function updateFilter() {
    biquadFilter.connect(gainNode).connect(analyser).connect(audioContext.destination);
}

function initNodes() {

    console.log("initNodes clicked");
    //create analyzer node
    analyser = audioContext.createAnalyser();

    //create no-mod analyzer node
    analyserNoMod = audioContext.createAnalyser();

    //control volume with gain node
    gainNode = audioContext.createGain();
    //interact with volume control
    volumeControl.addEventListener('input', function() {
        gainNode.gain.value = this.value;
    }, false)

    //create filter node
    var biquadFilter = audioContext.createBiquadFilter();
}


//Add a background track 
function addBeat() {
    audioElement2.play();
}

//Remove background track 
function removeBeat() {
    audioElement2.pause();
}

//add a  filter
function addFilter() {
    track.disconnect(0);
    //reconnect to the analyserNoMod node
    track.connect(analyserNoMod);
    track.connect(biquadFilter);
    //bass boost
    biquadFilter.type = "lowshelf";
    biquadFilter.frequency.setTargetAtTime(1000, audioContext.currentTime, 0);
    biquadFilter.gain.setTargetAtTime(15, audioContext.currentTime, 0);
    //lowpass (no gain attribute)
    //biquadFilter.type = "lowpass";
    //biquadFilter.frequency.setTargetAtTime(10000, audioContext.currentTime, 0);
}

//remove the filter
function removeFilter() {
    track.disconnect(0);
    //reconnect to the analyserNoMod node
    track.connect(analyserNoMod);
    //bypass the filter node
    track.connect(gainNode);
}

//add a monologue
function addMonologue() {
   audioElement3.play(); 
}

//remove a monologue
function removeMonologue() {
   audioElement3.pause(); 
}

var dataArray;
var bufferLength;
var dataArrayNoMod;
function visualize() {
    console.log("visualize called");
    //determine data length 
    analyser.fftSize = 256; 
    analyserNoMod.fftSize = 256; 

    bufferLength = analyser.frequencyBinCount; 
    //dataArrays to store buffer data
    dataArray = new Uint8Array(bufferLength); 
    dataArrayNoMod = new Uint8Array(bufferLength); 
}


//visualize waveform
function draw() { 
    console.log("draw func called");
    drawVisual = requestAnimationFrame(draw); 
    analyser.getByteFrequencyData(dataArray); 
    analyserNoMod.getByteFrequencyData(dataArrayNoMod); 

    canvasCtx.fillStyle = 'rgb(0, 0, 0)'; 
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtxNoMod.fillStyle = 'rgb(0, 0, 0)'; 
    canvasCtxNoMod.fillRect(0, 0, WIDTH, HEIGHT);

    var barWidth = (WIDTH / bufferLength) * 2.5; 
    var barHeight; 
    var barHeightNoMod; 
    var x = 0; 
    for(var i = 0; i < bufferLength; i++) { 
        //cut height in half to fit on canvas
        barHeight = dataArray[i]/2; 
        barHeightNoMod = dataArrayNoMod[i]/2; 
        // if (barHeight > 0) {
        //     console.log(barHeight);
        // }

        canvasCtx.fillStyle = 'rgb(198,70,' + (barHeight+100) + ')'; 
        canvasCtx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2); 

        canvasCtxNoMod.fillStyle = 'rgb(80,220,' + (barHeightNoMod+100) + ')'; 
        canvasCtxNoMod.fillRect(x,HEIGHT-barHeightNoMod/2,barWidth,barHeightNoMod/2); 
        x += barWidth + 1; 
    } 
}; 

draw(); 
