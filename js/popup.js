document.addEventListener('DOMContentLoaded', function() {
  var debug = document.getElementById('debug');
  var blacklistBtn = document.getElementById('blacklist');
  var pauseBtn = document.getElementById('pause');
  
  // Get info from content.js
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {cmd: 'getUrl'}, function(response) {
      debug.innerText = JSON.stringify(response);   
    });
  });
  

  blacklistBtn.addEventListener('click', function() {
    blacklistBtn.innerText = 'clicked';
  });
  pauseBtn.addEventListener('click', function() {
    pauseBtn.innerText = 'clicked';
  });

});


// var txt = Math.floor(Math.random()*100);




// chrome.runtime.sendMessage({cmd: 'getPopupInfo'}, function(response) {
//   debug.innerText = JSON.stringify(response)
// });

// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//   debug.innerText = JSON.stringify(request)
// });

//This line opens up a long-lived connection to your background page.
// var port = chrome.runtime.connect({name:"content-sync"});
// port.onMessage.addListener(function(message,sender){
//   console.log(message.isBlacklisted);
// });

// chrome.runtime.sendMessage({id: 'content'}, function(response) {
//   // debug.innerText = JSON.stringify(response)
//   debug.innerText = JSON.stringify(response)
// });