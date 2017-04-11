document.addEventListener('DOMContentLoaded', function() {
  var debug = document.getElementById('debug');
  var blacklistBtn = document.getElementById('blacklist');
  var pauseBtn = document.getElementById('pause');
  var pageDisabled = false;
  var extDisabled = false;
  var activeTab;
  

  // ------------------ Set Initial Conditions ------------------ //
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    activeTab = tabs[0].id;
    chrome.tabs.sendMessage(activeTab, {cmd: 'getOptions'}, function(response) {
      if (response && response.siteDisabed) {
        blacklistBtn.innerText = 'Disabled on this Domain';
        blacklistBtn.className = 'button alert';
      }
      if (response && response.extDisabled) {
        extDisabled = true;
        pauseBtn.innerText = 'Disabled Globally';
        pauseBtn.className = 'button alert';
        blacklistBtn.className = 'button disabled strike';
      }
      debug.innerText = pageDisabled + ' ' + extDisabled;
    });
  });


  // chrome.runtime.sendMessage({cmd: 'informPopupJs'}, function(response) {
  //   debug.innerText = JSON.stringify(response);
  //   // set initial conditions here
  // });




  // ------------------ Button Click Events ------------------ //
  blacklistBtn.addEventListener('click', function() {
    var send;
    // var btnDisabled = blacklistBtn.classList.contains('disabled');
    // if (!btnDisabled) {
      if (pageDisabled) { // Page is enabled
        pageDisabled = false;
        blacklistBtn.innerText = 'Running on this Domain';
        blacklistBtn.className = 'button success';
        send = 'pageEnabled';
      } else { // Page is disabled
        pageDisabled = true;
        blacklistBtn.innerText = 'Disabled on this Domain';
        blacklistBtn.className = 'button alert';
        send = 'pageDisabled';
      }
      sendUpdate(send);
    // }
  });

  pauseBtn.addEventListener('click', function() {
    var send;
    if (extDisabled) { // Plugin is enabled
      extDisabled = false;
      pauseBtn.innerText = 'Enabled Globally';
      pauseBtn.className = 'button secondary';
      blacklistBtn.classList.remove('disabled', 'strike');
      send = 'globalEnabled';
    } else { // Plugin is disabled
      extDisabled = true;
      pauseBtn.innerText = 'Disabled Globally';
      pauseBtn.className= 'button alert';
      blacklistBtn.classList.add('disabled', 'strike');
      send = 'globalDisabled';
    }
    sendUpdate(send);


  });


function sendUpdate(message) {
  chrome.runtime.sendMessage({cmd: 'setState', opt: message}, function(response) {
    if (response.cmd == 'readyToReload') {
      chrome.tabs.sendMessage(activeTab, {cmd: 'reload'}, function(response) {
        // window.close();
        // location.reload();
      });
    }
  });
}





});
        // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        // });