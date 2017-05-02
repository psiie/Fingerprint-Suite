document.addEventListener('DOMContentLoaded', function() {
  var $globalBtn   = document.getElementById('global-state'),
      $localBtn    = document.getElementById('local-state'),
      $defaultBtn  = document.getElementById('set-default'),
      debug        = document.getElementById('debug'),
      $switchTgls  = document.getElementsByClassName('cbx'),
      $switchGroup = document.getElementsByClassName('switches'),
      pageDisabled = false,
      extDisabled  = false,
      activeTab,
      url,
      switches = {
        userAgent  : true,
        timeZone   : true,
        screenSize : true,
        webGL      : true,
        canvasID   : true,
        headerLang : true,
        headerRefer: false
      };

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    activeTab = tabs[0].id;
    chrome.tabs.sendMessage(activeTab, {cmd: 'getOptions'}, setInitialState);
  });

  var setDisability = function(state) {
    $defaultBtn.disabled = state;
    for (var i=0; i<$switchTgls.length; i++) $switchTgls[i].disabled = state;
  }
  
  $localBtn.addEventListener('click', function(event) {
    console.log(this.disabled);
    if (!this.disabled) {
      setDisability(!this.checked);
      localBtnToggle();
    }
  });

  $globalBtn.addEventListener('click', function(event) {
    $localBtn.disabled   = !this.checked;
    setDisability(!this.checked);
    globalBtnToggle();
  });

  $switchGroup[0].addEventListener('click', function(event) {
    if (event.target.classList.contains('cbx')) {
      switches[event.target.id] = event.target.checked;
      sendUpdate(null);
    }
  });


  // --------------- End Initialization ---------------- //

  // add switches to setinitialstate
  function setInitialState(response) {
    function disableToggles() {
      for (var i=0; i<$switchTgls.length; i++) { // make dry
        $switchTgls[i].disabled = true;
      }
    }
    if (response && response.siteDisabled) {
      pageDisabled = true;
      $localBtn.checked = false;
      disableToggles();
    }
    if (response && response.extDisabled) {
      extDisabled = true;
      $globalBtn.checked = false;
      $localBtn.disabled = true;
      $defaultBtn.disabled = true;
      disableToggles();
    }
    if (response && response.switches) {
      switches = response.switches;
      for (var key in switches) { // jshint ignore:line
        document.getElementById(key).checked = switches[key];
      }
    }
    if (response && response.url) {
      url = response.url;
    }
  }

  function sendUpdate(message) {
    var payload = {
      cmd: 'setState', 
      switches: switches,
      url: url
    };
    if (message) payload.opt = message;
    chrome.runtime.sendMessage(payload, function(response) {
      if (response.cmd == 'readyToReload') {
        chrome.tabs.sendMessage(activeTab, {cmd: 'reload'}, function() {
          // window.close();
        });
      }
    });
  }

  function localBtnToggle() {
    var send;
      if (pageDisabled) { // Page is enabled
        pageDisabled = false;
        send = 'pageEnabled';
      } 
      else { // Page is disabled
        pageDisabled = true;
        send = 'pageDisabled';
      }
      sendUpdate(send);
  }

  function globalBtnToggle() {
    var send;
    if (extDisabled) { // Plugin is enabled
      extDisabled = false;
      send = 'globalEnabled';
    } 
    else { // Plugin is disabled
      extDisabled = true;
      send = 'globalDisabled';
    }
    sendUpdate(send);
  }

});