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
});

// Wait for messages from the popupjs and contentjs
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('here', sender.url);
  var uri = sender.url.match(urlRegX);

  if (request.cmd == 'informContentJs') {
    var siteDisabled = storage.sites[uri[1]] || '';
    sendResponse({extDisabled: extDisabled, siteDisabled: siteDisabled});
  } 
  else if (request.cmd == 'setState') {
    
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
      console.log('about to save ', uri);
      storage.sites[uri] = true;
    }
    else if (request.opt == 'pageEnabled') {
      if (storage.sites.hasOwnProperty(uri)) {
        delete storage.sites[uri];
      }
    }

    // SAve DB
    chrome.storage.local.set(storage, function() {
      console.log('saved storage');
    });

    // Reload page
    sendResponse({cmd: 'readyToReload'});
  }
});





// chrome.storage.local.get(null, function(obj) {
//   console.log(obj);
// })

// chrome.storage.local.set({'extDisabled': extDisabled, sites: {}}, function() {
//   console.log('Initialized localstorage');
// });

// for (var key in obj) {
//   if (obj[key] == true) blacklistSites.push(key);
// }