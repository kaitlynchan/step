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
var biquadFilter

//grab input + control volume
const volumeControl = document.querySelector('#volume');
//grab play button
const playButton = document.querySelector('#genLofi');

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

//visualization variables
var dataArray;
var bufferLength;
var dataArrayNoMod;

//set up play button
var play;
playButton.addEventListener('click', function() {

    console.log("play button clicked")
    
    // check if context is in suspended state (autoplay policy)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    // play or pause track depending on state
    if (!play) {
        play = true;
        console.log("entered play loop");
        audioElement.play();
        audioContext.resume();
        //turn off or on effects (not super elegant logic)
        if (document.getElementById('chkbeat').checked) {
            addBeat();
        } else {
            removeBeat();
        }
        if (document.getElementById('chkmonologue').checked) {
            addMonologue();
        } else {
            removeMonologue();
        }
        if (document.getElementById('chkfilter').checked) {
            addFilter();
        } else {
            removeFilter();
        }
        
    } else if (play) {
        play = false;
        console.log("exited play loop");
        audioElement.pause();
        audioContext.suspend();
    }
}, false);

function initializeLofi() {
    //initializes audio context + API usage
    console.log("initLofi clicked");
    AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    initNodes();
    visualize();
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
    biquadFilter = audioContext.createBiquadFilter();
}

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

function updateSong(lofi) {
    console.log("updateSong called");
    // load new song
    audioElement = document.querySelector('#selectedSong');
    console.log("new audio element made");
    
    audioElement.addEventListener('ended', () => {
        //playButton.dataset.playing = 'false';
        play = false;
    }, false);

    connectTracks("song");
}

function connectTracks(updateType) {
    
    console.log(updateType);
    //if track already exists, disconnect it first

    if (updateType === "song"){
        if (track){
            console.log("track disconnected");
            track.disconnect(0);
        }   
        console.log("connecting song");
        track = audioContext.createMediaElementSource(audioElement);
        track.connect(analyserNoMod);
        track.connect(gainNode).connect(analyser).connect(audioContext.destination);
    }

    if (updateType === "beat"){
        console.log("connecting beat ");
        if (track2){
            console.log("track2 disconnected");
            track2.disconnect(0);
        }
        track2 = audioContext.createMediaElementSource(audioElement2);
        track2.connect(gainNode).connect(analyser).connect(audioContext.destination);
    }

    if (updateType === "monologue"){
        console.log("connecting monologue");
        if (track3){
            console.log("track3 disconnected");
            track3.disconnect(0);
        }
        track3 = audioContext.createMediaElementSource(audioElement3);
        track3.connect(gainNode).connect(analyser).connect(audioContext.destination);
    }

    if (updateType === "filter"){
        console.log("connecting filter");
        biquadFilter.connect(gainNode).connect(analyser).connect(audioContext.destination);
    }

}

function updateBeat(lofi) {
    // load sound
    console.log("updateBeat called")
    audioElement2 = document.querySelector('#selectedBeat');
    connectTracks("beat");
}

function test() {
    if (document.getElementById('chk1').checked) {
        console.log("checked");
    } 
    else {
        console.log("not checked");
    }
}

function updateMonologue() {
    // load sound
    console.log("updateMonologue called");
    audioElement3 = document.querySelector('#selectedMonologue');
    connectTracks("monologue");
}

function updateFilter(lofi) {
    console.log("Updatefilter called");
    console.log(lofi.filter);
    connectTracks("filter");
    //bass boost
    biquadFilter.type = lofi.filter;
    biquadFilter.frequency.setTargetAtTime(1000, audioContext.currentTime, 0);
    biquadFilter.gain.setTargetAtTime(10, audioContext.currentTime, 0);
    //lowpass (no gain attribute)
    //biquadFilter.type = "lowpass";
    //biquadFilter.frequency.setTargetAtTime(10000, audioContext.currentTime, 0);
}

//Add a background track 
function addBeat() {
    if (track2) {
        audioElement2.play();
    }
}

//Remove background track 
function removeBeat() {
    if (track2) {
        audioElement2.pause();
    }
}

//add a  filter
function addFilter() {
    if (biquadFilter.type) {
        track.disconnect(0);
        //reconnect to the analyserNoMod node
        track.connect(analyserNoMod);
        track.connect(biquadFilter);
    }
}

//remove the filter
function removeFilter() {
    if (biquadFilter.type) {
        track.disconnect(0);
        //reconnect to the analyserNoMod node
        track.connect(analyserNoMod);
        //bypass the filter node
        track.connect(gainNode);
    }
}

//add a monologue
function addMonologue() {
    if (track3) {
        audioElement3.play(); 
    }
}

//remove a monologue
function removeMonologue() {
    if (track3) {
        audioElement3.pause();
    }   
}

//visualize waveform
function draw() { 
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

document.addEventListener('readystatechange', event => {
    // When window loaded ( external resources are loaded too- `css`,`src`, etc...) 
    if (event.target.readyState === "complete") {
        initializeLofi();
        //call draw function every 1ms after initLofi has been called (so everything is initialized)
        setInterval(draw,1);
    }
});
 
