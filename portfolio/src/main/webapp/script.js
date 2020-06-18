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

//use fetch to request data from the server
async function checkLogin() {
    //if user is logged in, unhide comment form
    const response = await fetch('/login');
    const login = await response.json();
    console.log(login);

    const loginElement = document.getElementById("loginLink");
    loginElement.style.display = "block";
    loginElement.innerHTML = '';
    //not logged in
    if (!login.loginStatus) {
        document.getElementById("commentForm").style.display = "none";
        loginElement.innerHTML = '<a href=\"' + login.loginLink + '\">Login to Comment</a>';
    } 
    //logged in but no nickname
    else if (!login.nickname) {
        document.getElementById("commentForm").style.display = "none";
        loginElement.innerHTML = '<p>Set your nickname <a href=\"/nickname\">here</a>.</p>';
    }
    //logged in with nickname
    else {
        document.getElementById("commentForm").style.display = "block";
        loginElement.innerHTML = '<a href=\"' + login.logoutLink + '\">Logout Here</a> <p>Hi, '+ login.nickname + '. Change your nickname <a href=\"/nickname\">here</a>.</p>';
    }
}

async function fetchBlobstoreUrl() {
    const response = await fetch('/blobstore-upload-url');
    const uploadUrl = await response.text();
    const commentForm = await document.getElementById('imgUploadForm');
    commentForm.action = uploadUrl;
    console.log(uploadUrl);
}

//body onload()
async function updateComments() {
  checkLogin();
  var numComments = await document.getElementById("nC").value;
  //GET
  var queryString = '/data?numComments=' + numComments;
  console.log(queryString);
  const response = await fetch(queryString);
  //parse response as json
  const comments = await response.json();
  console.log(comments);
  await fetchBlobstoreUrl();
  console.log("done!");
  // Build comments
  const commentsListElement = document.getElementById('comment-container');
  commentsListElement.innerHTML = '';
  if (comments !== "invalid numComments") {
        comments.forEach((comment) => {
        commentsListElement.appendChild(createCommentElement(comment));
    });
  }
}

/** Creates an <li> element containing text. */
function createCommentElement(comment) {
  const commentElement = document.createElement('div');
  commentElement.className = 'comment';

  const nameElement = document.createElement('p');
  nameElement.className = 'comment_name';
  nameElement.innerText = comment.name;
  commentElement.appendChild(nameElement);

//   const emailElement = document.createElement('p');
//   emailElement.className = 'comment_email';
//   emailElement.innerText = comment.email;
//   commentElement.appendChild(emailElement);

  const textElement = document.createElement('p');
  textElement.innerText = comment.text;
  commentElement.appendChild(textElement);

  if (comment.imageUrl) {
    console.log("wow an image");
    const imgElement = document.createElement('img');
    imgElement.src = comment.imageUrl;
    commentElement.appendChild(imgElement);
  }

  const timeElement = document.createElement('p');
  timeElement.className = 'comment_date';
  var date = new Date(comment.timestamp);
  timeElement.innerText = date.toLocaleString();
  commentElement.appendChild(timeElement);

  const deleteButtonElement = document.createElement('button');
  deleteButtonElement.className = 'close';
  deleteButtonElement.innerHTML = '<span aria-hidden="true">&times;</span>';
  
  deleteButtonElement.addEventListener('click', () => {
    deleteComment(comment).then(success => {
        // Remove the comment from the DOM.
        if (success) {
            commentElement.remove();
        }
    });
  });
  nameElement.appendChild(deleteButtonElement);

  return commentElement;
}

//send POST request to /delete-data
async function deleteComment(comment) {
  //only allow the user to delete only her own comments
  const params = new URLSearchParams();
  params.append('id', comment.id);
  params.append('email', comment.email);
  const request = new Request('/delete-data', {method: 'POST', body: params});
  const response = await fetch(request);
  const deleteSuccess = await response.json();
  if (deleteSuccess) {
    //fetch comments back from the server
    updateComments();
  } else {
    alert("Invalid access to delete comment");
  }
  return deleteSuccess;
}

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
