var userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36';
var regX = /(?:http[s]*\:\/\/)*.*?\.(?=([^\/]*\..{2,5}))/i;
var extDisabled = false;
var storage = {};
var icons = {
  disabled: {
    48: 'img/48x48-grey.png'
  },
  enabled: {
    16: 'img/16x16.png',
    48: 'img/48x48-grey.png',
    128: 'img/128x128.png'
  }
}

function replaceAgent(req) {
  if (extDisabled) return;
  for (var i=0; i<req.requestHeaders.length; i++) {
    if (req.requestHeaders[i].name == 'User-Agent') {
      req.requestHeaders[i].value = userAgent;
    } 
    else if (req.requestHeaders[i].name == 'Accept-Language') {
      req.requestHeaders[i].value = 'en-US,en;q=0.8';
    }
    // Disabled because this causes cross-origin issues for some reason
    // eg: drive.google.com
    // else if (req.requestHeaders[i].name == 'Referer') {
    //   req.requestHeaders[i].value = '';
    // } 
  }
  return { requestHeaders: req.requestHeaders};
}

function saveDB() {
  chrome.storage.local.set(storage, function() {
    console.log('saved storage', storage);
  });
}

function cleanStorage() {
  var changesMade = false;
  console.log('STORAGE: ', storage.sites);
  for (var site in storage.sites) {
    if (storage.sites[site] === false) {
      delete storage.sites[site];
      changesMade = true;
    }
  }
  console.log('FINISHED: ', storage.sites);
  if (changesMade) saveDB();
}

function clearStorage() {
  chrome.storage.local.clear(function() {
    console.log('local storage cleared');
  });
}

function setIconState(isOn) {
  if (isOn) {
    chrome.browserAction.setIcon({path: icons.enabled});
  } else {
    chrome.browserAction.setIcon({path: icons.disabled});
  }
}

function onMessage(request, sender, sendResponse) {
  var domain = '';
  
  function informContentJsRequest() {
    var siteDisabled = storage.sites[domain];
    sendResponse({extDisabled: extDisabled, siteDisabled: siteDisabled});
    setIconState( !(extDisabled || siteDisabled) );
  }

  function setStateRequest() {
    function setStorage(boolean) {storage.sites[domain] = boolean;}
    function setGlobal(state) {
      if (state === 'disabled') {
        extDisabled = true;
        setIconState(false);
      } else {
        extDisabled = false;
        setIconState(true);
      }
    }

    if (request.opt == 'globalDisabled') setGlobal('disabled');
    else if (request.opt == 'globalEnabled') setGlobal('enabled');
    else if (request.opt == 'pageDisabled' && domain && domain.length > 1) setStorage(true);
    else if (request.opt == 'pageEnabled') setStorage(false);

    saveDB();
    sendResponse({cmd: 'readyToReload'}); // Reload page
  }

  if (request.url) {
    // Set Domain safely
    var domainParse = request.url.match(regX);
    domain = domainParse ? domainParse[1] : request.url;
  }

  if (request.cmd == 'informContentJs') informContentJsRequest(); 
  else if (request.cmd == 'setState') setStateRequest();
}

function init() {
  var onBeforeSendOpts = {"urls": ["<all_urls>"]};
  var onTabSwitch = function(activeInfo) {
    chrome.tabs.sendMessage(activeInfo.tabId, {cmd: 'getOptions'}, function(response) {
      if (response) setIconState( !(response.siteDisabled || response.extDisabled) );
    });
  }
  var getStorageCB = function(obj) {
    storage = obj;
    if (!storage.hasOwnProperty('sites')) storage.sites = {};
    if (!storage.hasOwnProperty('extDisabled')) storage.extDisabled = extDisabled;
    cleanStorage();
  }

  chrome.runtime.onMessage.addListener(onMessage);
  chrome.tabs.onActivated.addListener(onTabSwitch);
  chrome.webRequest.onBeforeSendHeaders.addListener(replaceAgent, onBeforeSendOpts, ['requestHeaders', 'blocking']);
  chrome.storage.local.get(null, getStorageCB);
}

init();

// ----------------------------- //
