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

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();


// load sound
const audioElement = document.querySelector('#song');
//pass to audioContext(source node)
const track = audioContext.createMediaElementSource(audioElement);

// load sound
const audioElement2 = document.querySelector('#rain');
//pass to audioContext(source node)
const track2 = audioContext.createMediaElementSource(audioElement2);


//create analyzer node
var analyser = audioContext.createAnalyser();

//create no-mod analyzer node
var analyserNoMod = audioContext.createAnalyser();

//control volume with gain node
const gainNode = audioContext.createGain();

//create filter node
var biquadFilter = audioContext.createBiquadFilter();

//set the path 
track.connect(analyserNoMod);
track.connect(gainNode).connect(analyser).connect(audioContext.destination);
track2.connect(gainNode).connect(analyser).connect(audioContext.destination);
biquadFilter.connect(gainNode).connect(analyser).connect(audioContext.destination);

const playButton = document.querySelector('button');

playButton.addEventListener('click', function() {

    // check if context is in suspended state (autoplay policy)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    // play or pause track depending on state
    if (this.dataset.playing === 'false') {
        audioElement.play();
        audioContext.resume();
        this.dataset.playing = 'true';
    } else if (this.dataset.playing === 'true') {
        audioElement.pause();
        audioContext.suspend();
        this.dataset.playing = 'false';
    }

}, false);

audioElement.addEventListener('ended', () => {
    playButton.dataset.playing = 'false';
}, false);



//grab input + control volume
const volumeControl = document.querySelector('#volume');

volumeControl.addEventListener('input', function() {
    gainNode.gain.value = this.value;
}, false)


//Add a background track 
function addBeat() {
    audioElement2.play();
}



//determine data length 
analyser.fftSize = 256; 
analyserNoMod.fftSize = 256; 

var bufferLength = analyser.frequencyBinCount; 
var dataArray = new Uint8Array(bufferLength); 
var dataArrayNoMod = new Uint8Array(bufferLength); 

var canvas = document.querySelector('#visualizer'); 
//no mod visualizer
var canvasNoMod = document.querySelector('#visualizerNoMod'); 

var canvasCtx = canvas.getContext("2d"); 
var canvasCtxNoMod = canvasNoMod.getContext("2d"); 

const WIDTH = 800; 
const HEIGHT = 100; 
canvas.setAttribute('width',WIDTH); 
canvas.setAttribute('height',HEIGHT); 
canvasCtx.clearRect(0, 0, WIDTH, HEIGHT); 

canvasNoMod.setAttribute('width',WIDTH); 
canvasNoMod.setAttribute('height',HEIGHT); 
canvasCtxNoMod.clearRect(0, 0, WIDTH, HEIGHT); 

//visualize waveform
function draw() { 
    //console.log("draw func called");
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

//add a  filter
let pulseTime = 1;
function addFilter() {
    track.disconnect(0);
    track.connect(analyserNoMod);
    track.connect(biquadFilter);
    //bass boost
    biquadFilter.type = "lowshelf";
    biquadFilter.frequency.setTargetAtTime(1000, audioContext.currentTime, 0);
    biquadFilter.gain.setTargetAtTime(20, audioContext.currentTime, 0);
    //lowpass
    //biquadFilter.type = "lowpass";
    //biquadFilter.frequency.setTargetAtTime(10000, audioContext.currentTime, 0);
}





