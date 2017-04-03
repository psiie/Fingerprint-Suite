
//This line opens up a long-lived connection to your background page.
// var port = chrome.runtime.connect({name:"popup-sync"});
// port.onMessage.addListener(function(message,sender){
//   console.log('connected');
// });
chrome.runtime.sendMessage({getBlacklist: true}, function(response) {
  console.log('pingback', response);
});


document.addEventListener('DOMContentLoaded', function() {
  // load settings from background

  var debug = document.getElementById('debug');
  var blacklistBtn = document.getElementById('blacklist');
  var pauseBtn = document.getElementById('pause');

  blacklistBtn.addEventListener('click', function() {
    blacklistBtn.innerText = 'clicked';
  });
  pauseBtn.addEventListener('click', function() {
    
  });

});


// var txt = Math.floor(Math.random()*100);