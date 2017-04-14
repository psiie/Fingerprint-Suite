var userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36';
var regX = /(?:http[s]*\:\/\/)*.*?\.(?=([^\/]*\..{2,5}))/i;
var extDisabled = false;
var storage = {};

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
    else if (req.requestHeaders[i].name == 'Referer') {
      req.requestHeaders[i].value = '';
    } 
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

function onMessage(request, sender, sendResponse) {
  var domain = '';
  
  if (request.url) {
    var domainParse = request.url.match(regX);
    domain = domainParse ? domainParse[1] : request.url;
  }

  if (request.cmd == 'informContentJs') {
    var siteDisabled = storage.sites[domain];
    sendResponse({extDisabled: extDisabled, siteDisabled: siteDisabled});
  } 
  else if (request.cmd == 'setState') {
    if (request.opt == 'globalDisabled') {
      extDisabled = true;
      chrome.browserAction.setIcon({path: {
        48: 'img/48x48-grey.png'
      }});
    } 
    else if (request.opt == 'globalEnabled') {
      extDisabled = false;
      chrome.browserAction.setIcon({path: {
        16: 'img/16x16.png',
        48: 'img/48x48-grey.png',
        128: 'img/128x128.png'
      }});
    }
    else if (request.opt == 'pageDisabled') {
      if (domain && domain.length > 1) {
        storage.sites[domain] = true;
      }
    }
    else if (request.opt == 'pageEnabled') {
      storage.sites[domain] = false;
    }

    // Save DB
    saveDB();

    // Reload page
    sendResponse({cmd: 'readyToReload'});
  }
}

function init() {
  var onBeforeSendOpts = {"urls": ["<all_urls>"]};
  var getStorageCB = function(obj) {
    storage = obj;
    if (!storage.hasOwnProperty('sites')) storage.sites = {};
    if (!storage.hasOwnProperty('extDisabled')) storage.extDisabled = extDisabled;
    cleanStorage();
  }

  chrome.runtime.onMessage.addListener(onMessage);
  chrome.webRequest.onBeforeSendHeaders.addListener(replaceAgent, onBeforeSendOpts, ['requestHeaders', 'blocking']);
  chrome.storage.local.get(null, getStorageCB);
}

init();