document.addEventListener('DOMContentLoaded', function() {
  var debug = document.getElementById('debug');
  var blacklistBtn = document.getElementById('blacklist');
  var pauseBtn = document.getElementById('pause');
  
  // Get info from background.js
  chrome.runtime.sendMessage({cmd: 'getPopupInfo'}, function(response) {
    // debug.innerText = JSON.stringify(response)
    // debug.innerText = JSON.stringify(response)
    // debug.innerText = response['msg'];
  });

  // chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  //   debug.innerText = JSON.stringify(request)
  // });

  blacklistBtn.addEventListener('click', function() {
    blacklistBtn.innerText = 'clicked';
  });
  pauseBtn.addEventListener('click', function() {
    pauseBtn.innerText = 'clicked';
  });

});


// var txt = Math.floor(Math.random()*100);