document.addEventListener('DOMContentLoaded', function() {
  var debug        = document.getElementById('debug'),
      blacklistBtn = document.getElementById('blacklist'),
      pauseBtn     = document.getElementById('pause'),
      pageDisabled = false,
      extDisabled = false,
      activeTab,
      url;
  

  // ------------------ Set Initial Conditions ------------------ //
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    activeTab = tabs[0].id;
    chrome.tabs.sendMessage(activeTab, {cmd: 'getOptions'}, function(response) {
      if (response && response.siteDisabled) {
        debug.innerText = 'true';
        pageDisabled = true;
        blacklistBtn.innerText = 'Disabled on this Domain';
        blacklistBtn.className = 'button alert';
      }
      if (response && response.extDisabled) {
        extDisabled = true;
        pauseBtn.innerText = 'Disabled Globally';
        pauseBtn.className = 'button alert';
        blacklistBtn.className = 'button disabled strike';
      }
      if (response && response.url) {
        url = response.url;
      }
    });
  });




  // ------------------ Button Click Events ------------------ //
  
  function sendUpdate(message) {
    chrome.runtime.sendMessage({cmd: 'setState', opt: message, url: url}, function(response) {
      if (response.cmd == 'readyToReload') {
        chrome.tabs.sendMessage(activeTab, {cmd: 'reload'}, function() {
          window.close();
        });
      }
    });
  }

  blacklistBtn.addEventListener('click', function() {
    var send;
      if (pageDisabled) { // Page is enabled
        pageDisabled = false;
        blacklistBtn.innerText = 'Running on this Domain';
        blacklistBtn.className = 'button success';
        send = 'pageEnabled';
      } 
      else { // Page is disabled
        pageDisabled = true;
        blacklistBtn.innerText = 'Disabled on this Domain';
        blacklistBtn.className = 'button alert';
        send = 'pageDisabled';
      }
      sendUpdate(send);
  });

  pauseBtn.addEventListener('click', function() {
    var send;
    if (extDisabled) { // Plugin is enabled
      extDisabled = false;
      pauseBtn.innerText = 'Enabled Globally';
      pauseBtn.className = 'button secondary';
      blacklistBtn.classList.remove('disabled', 'strike');
      send = 'globalEnabled';
    } 
    else { // Plugin is disabled
      extDisabled = true;
      pauseBtn.innerText = 'Disabled Globally';
      pauseBtn.className= 'button alert';
      blacklistBtn.classList.add('disabled', 'strike');
      send = 'globalDisabled';
    }
    sendUpdate(send);
  });

});




// chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
// });


 // chrome.runtime.sendMessage({cmd: 'informPopupJs'}, function(response) {
  //   debug.innerText = JSON.stringify(response);
  //   // set initial conditions here
  // });