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



chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.cmd == 'informContentJs') {
    sendResponse({extDisabled: extDisabled});
  } else if (request.cmd == 'setState') {
    if (request.opt == 'globalDisabled') {
      extDisabled = true;
      console.log('disabled ', extDisabled);
    }
    // console.log(request.opt);
    // switch (request.opt) {
    //   case 'globalEnabled':
    //     extDisabled = false;
    //     console.log('Enabled'. extDisabled);
    //     break;
    //   case 'globalDisabled':
    //     extDisabled = true;
    //     console.log('Disabled'. extDisabled);
    //     break;
    //   case 'pageEnabled':
    //     break;
    //   case 'pageDisabled':
    //     break;
    // }
    sendResponse({cmd: 'readyToReload'});
  }
});





  // } else if (request.cmd == 'informPopupJs') {
  //   sendResponse({extDisabled: extDisabled});