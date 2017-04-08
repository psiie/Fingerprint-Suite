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
  return { requestHeaders: req.requestHeaders}
}

// -------------------------------------------------------------------------- //
//                          Blacklist Check                                   //
// -------------------------------------------------------------------------- //
var extDisabled = false;
var blacklist = ['startpage.com']; // move to db later
var urlRegX = /https?:\/\/(?:www\.)?([-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b)*(\/[\/\d\w\.-]*)*(?:[\?])*(.+)*/;
var blacklistSites = [];

// set blacklistSites on start
// chrome.storage.local.get(null, function(obj) {
//   console.log(obj);
//   for (var key in obj) {
//     if (obj[key] == true) blacklistSites.push(key);
//   }
// });

// Wait for messages from the popupjs and contentjs
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.cmd == 'informContentJs') {
    sendResponse({extDisabled: extDisabled});
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
      // Add page to local blacklistSites var
      // Add page to localstorage if not in it
    }
    else if (request.opt == 'pageEnabled') {
      // remove page from local blacklistSites var
      // remove page from localstorage if not in it
    }

    sendResponse({cmd: 'readyToReload'});
  }
});


// chrome.storage.local.clear(function() {console.log('local storage cleared');});


// chrome.storage.local.set({'extDisabled': 'true'}, function() {
//   console.log('extDis saved as disabled');
//   // message('test')
// });

// chrome.storage.local.get(null, function(obj) {
//   console.log(obj);
// })
