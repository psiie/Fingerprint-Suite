document.addEventListener('DOMContentLoaded', function() {
  var debug        = document.getElementById('debug'),
      blacklistBtn = document.getElementById('blacklist'),
      pauseBtn     = document.getElementById('pause'),
      pageDisabled = false,
      extDisabled  = false,
      activeTab,
      url;

  function setInitialState(response) {
    if (response && response.siteDisabled) {
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
  }

  function sendUpdate(message) {
    chrome.runtime.sendMessage({cmd: 'setState', opt: message, url: url}, function(response) {
      if (response.cmd == 'readyToReload') {
        chrome.tabs.sendMessage(activeTab, {cmd: 'reload'}, function() {
          window.close();
        });
      }
    });
  }

  function blacklistBtnToggle() {
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
  }

  function pauseBtnToggle() {
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
  }

  // blacklistBtn.addEventListener('click', blacklistBtnToggle);
  // pauseBtn.addEventListener('click', pauseBtnToggle);

  // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  //   activeTab = tabs[0].id;
  //   chrome.tabs.sendMessage(activeTab, {cmd: 'getOptions'}, setInitialState);
  // });

  // ------------- New Layout ------------ //

  // Switches Tiggles
  document.getElementsByClassName('switches')[0].addEventListener('click', function(event) {
    if (event.target.className === 'cbx hidden') {
      console.log(event.target.checked)
    }
  });

  // Button Toggles
  document.getElementById('local').addEventListener('click', function(event) {
    console.log(this);
  });
  // document.getElementsByClassName('toggles')[0].addEventListener('click', function(event) {
  //   function togglesSet(state, globalOrLocal) {
  //     console.log('inside func');
  //     document.getElementById('local-state').disabled = state;
  //     document.getElementById('set-default').disabled = state;
  //     var toggles = document.getElementsByClassName('cbx hidden');
  //     for (var i=0; i<toggles.length; i++) {
  //       toggles[i].disabled = state;
  //     }

  //   }

  //   console.log(event);
  //   if (event.target.id === 'local') {
  //     console.log('inside local', event.target);
  //     // togglesSet(!event.target.disabled, '')
  //   } else if (event.target.id === 'global') {
  //     console.log('inside global');
  //     // togglesSet(!event.target.disabled, '')
  //   }
  // });


});
