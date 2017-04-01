var userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36';

chrome.webRequest.onBeforeSendHeaders.addListener(replaceAgent, {
    "urls": ["<all_urls>"] // , "types": requestTypes
  }, ['requestHeaders', 'blocking']
);

function replaceAgent(req) {
  for (var i=0; i<req.requestHeaders.length; i++) {
    if (req.requestHeaders[i].name == 'User-Agent') {
      req.requestHeaders[i].value = userAgent;
    } else if (req.requestHeaders[i].name == 'Referer') {
      req.requestHeaders[i].value = '';
    } else if (req.requestHeaders[i].name == 'Accept-Language') {
      req.requestHeaders[i].value = 'en-US,en;q=0.8';
    }
  }
  return { requestHeaders: req.requestHeaders}
}




chrome.extension.onMessage.addListener(function(req, sender, res) {
  console.log(req.action);
});