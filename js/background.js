// -------------------------------------------------------------------------- //
//                         Replace User Agent                                 //
// -------------------------------------------------------------------------- //

var userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36';

chrome.webRequest.onBeforeSendHeaders.addListener(replaceAgent, {
    "urls": ["<all_urls>"] // , "types": requestTypes
  }, ['requestHeaders', 'blocking']
);

function replaceAgent(req) {
  for (var i=0; i<req.requestHeaders.length; i++) {
    if (req.requestHeaders[i].name == 'User-Agent') {
      req.requestHeaders[i].value = userAgent;
    } else if (req.requestHeaders[i].name == 'Accept-Language') {
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

// -------------------------------------------------------------------------- //
//                          Blacklist Check                                   //
// -------------------------------------------------------------------------- //
var extDisabled = false;
var blacklist = ['startpage.com']; // move to db later
var urlRegX = /https?:\/\/(?:www\.)?([-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b)*(\/[\/\d\w\.-]*)*(?:[\?])*(.+)*/;
var storage = {};
// var blacklistSites = [];

// chrome.storage.local.clear(function() {console.log('local storage cleared');});

// Get information from chrome storage. Initialize if needed
chrome.storage.local.get(null, function(obj) {
  storage = obj;
  if (!storage.hasOwnProperty('sites')) storage.sites = {};
  if (!storage.hasOwnProperty('extDisabled')) storage.extDisabled = extDisabled;
  console.log('saved keys', storage);
  
  // On load, clear out sites that are enabled again
  cleanStorage();
});





// Wait for messages from the popupjs and contentjs
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var domain;
  if (request.url) {
    domain = request.url;
    console.log('line59: ', domain);
    // domain = request.url.match(urlRegX);
    // domain = domain.length > 1 ? domain[1] : '';
  }

  if (request.cmd == 'informContentJs') {
    var siteDisabled = storage.sites[domain];
    sendResponse({extDisabled: extDisabled, siteDisabled: siteDisabled});
  }
  else if (request.cmd == 'setState') {
    var uri;
    console.log('req opt ', request.opt);
    
    if (request.opt == 'globalDisabled') {
      extDisabled = true;
      console.log('disabled ', extDisabled);
      chrome.browserAction.setIcon({path: {
        48: 'img/48x48-grey.png'
      }});
    } 
    else if (request.opt == 'globalEnabled') {
      extDisabled = false;
      console.log('disabled ', extDisabled);
      chrome.browserAction.setIcon({path: {
        16: 'img/16x16.png',
        48: 'img/48x48-grey.png',
        128: 'img/128x128.png'
      }});
    }
    else if (request.opt == 'pageDisabled') {
      // uri = request.url;
      console.log('pd ', domain);
      // uri = request.url.match(urlRegX);
      console.log('about to save ', domain);
      if (domain && domain.length > 1) {
        console.log('about to store site');
        // storage.sites[uri[1]] = true;
        storage.sites[domain] = true;
      }
    }
    else if (request.opt == 'pageEnabled') {
      // uri = request.url;
      console.log('pe ', domain);
      // uri = request.url.match(urlRegX);
      // if (storage.sites.hasOwnProperty(uri)) {
      console.log('deleted1');
      storage.sites[domain] = false;
      console.log('deleted2', storage.sites);
      // }
    }

    // Save DB
    saveDB();

    // Reload page
    sendResponse({cmd: 'readyToReload'});
  }
});



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

// chrome.storage.local.get(null, function(obj) {
//   console.log(obj);
// })

// chrome.storage.local.set({'extDisabled': extDisabled, sites: {}}, function() {
//   console.log('Initialized localstorage');
// });

// for (var key in obj) {
//   if (obj[key] == true) blacklistSites.push(key);
// }