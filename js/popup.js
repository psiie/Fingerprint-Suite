document.addEventListener('DOMContentLoaded', function() {
  var $globalBtn   = document.getElementById('global-state'),
      $localBtn    = document.getElementById('local-state'),
      $defaultBtn  = document.getElementById('set-default'),
      $switchTgls  = document.getElementsByClassName('cbx'),
      $switchGroup = document.getElementsByClassName('switches'),
      debug        = document.getElementById('debug'),
      pageDisabled = false,
      extDisabled  = false,
      activeTab,
      url;

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
      console.log(event.target.id, event.target.checked);
    }
  });


  // --------------- End Initialization ---------------- //

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
    if (response && response.url) {
      url = response.url;
    }
  }

  function sendUpdate(message) {
    // chrome.runtime.sendMessage({cmd: 'setState', opt: message, url: url}, function(response) {
    //   if (response.cmd == 'readyToReload') {
    //     chrome.tabs.sendMessage(activeTab, {cmd: 'reload'}, function() {
    //       window.close();
    //     });
    //   }
    // });
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