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
const audioElement2 = document.querySelector('#static');
//pass to audioContext(source node)
const track2 = audioContext.createMediaElementSource(audioElement2);


//create analyzer node
var analyser = audioContext.createAnalyser();
//control volume with gain node
const gainNode = audioContext.createGain();

//set the path 
track.connect(gainNode).connect(analyser).connect(audioContext.destination);


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

//add a  beat
let pulseTime = 1;
function addBeat() {
    //create oscillator
    let osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 880;
    let amp = audioContext.createGain();
    amp.gain.setValueAtTime(0.5, audioContext.currentTime);
    //lfo
    let lfo = audioContext.createOscillator();
    lfo.type = 'square';
    lfo.frequency.value = 30;
    //set path
    lfo.connect(amp.gain);
    osc.connect(amp).connect(audioContext.destination);
    lfo.start();
    osc.start();
    osc.stop(audioContext.currentTime + pulseTime);
}



function playSample() {
    track2.connect(gainNode).connect(analyser).connect(audioContext.destination);
    audioElement2.play();
}


//visualize waveform
//determine data length 
analyser.fftSize = 256; 
var bufferLength = analyser.frequencyBinCount; 
console.log(bufferLength);
var dataArray = new Uint8Array(bufferLength); 
var canvas = document.querySelector('.visualizer'); 
var canvasCtx = canvas.getContext("2d"); 
const WIDTH = 800; 
const HEIGHT = 100; 
canvas.setAttribute('width',WIDTH); 
canvas.setAttribute('height',HEIGHT); 
canvasCtx.clearRect(0, 0, WIDTH, HEIGHT); 


function draw() { 
    //console.log("draw func called");
    drawVisual = requestAnimationFrame(draw); 
    analyser.getByteFrequencyData(dataArray); 
    canvasCtx.fillStyle = 'rgb(0, 0, 0)'; 
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT); 
    var barWidth = (WIDTH / bufferLength) * 2.5; 
    var barHeight; 
    var x = 0; 
    for(var i = 0; i < bufferLength; i++) { 
        barHeight = dataArray[i]/2; 
        // if (barHeight > 0) {
        //     console.log(barHeight);
        // }
        canvasCtx.fillStyle = 'rgb(198,70,' + (barHeight+100) + ')'; 
        canvasCtx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2); 
        x += barWidth + 1; 
    } 
}; 

draw(); 



