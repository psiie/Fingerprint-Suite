document.addEventListener('DOMContentLoaded', function() {
  var debug = document.getElementById('debug');
  var blacklistBtn = document.getElementById('blacklist');
  var pauseBtn = document.getElementById('pause');
  var extDisabled = false;
  
  // ------------------ Set Initial Conditions ------------------ //
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {cmd: 'getOptions'}, function(response) {
      if (response && response.isBlacklisted) {
        blacklistBtn.innerText = 'Disabled on this Domain';
        blacklistBtn.classList.remove('success');
        blacklistBtn.classList.add('alert');
      }
      if (response && response.extDisabled) {
        extDisabled = true;
        debug.innerText = 'yes';
        pauseBtn.classList.remove('secondary');
        pauseBtn.classList.add('alert');
        pauseBtn.innerText = 'Disabled Globally';
        blacklistBtn.classList.remove('success', 'alert');
        blacklistBtn.classList.add('disabled');
      }
    });
  });
  
  // ------------------ Button Click Events ------------------ //
  blacklistBtn.addEventListener('click', function() {
    
  });
  pauseBtn.addEventListener('click', function() {
    if (extDisabled) {
      extDisabled = false;
      pauseBtn.innerText = 'Disabled Globally';
      pauseBtn.classList.remove('alert');
      pauseBtn.classList.add('secondary');
    } else {
      extDisabled = true;
      pauseBtn.innerText = 'Enabled Globally';
      pauseBtn.classList.remove('secondary');
      pauseBtn.classList.add('alert');
    }
  });

});







// debug.innerText = JSON.stringify(response);
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