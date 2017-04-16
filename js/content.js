function payload() {
  // Timezone Spoofer
  function spoofTimezone() {
    window.Date.prototype.getTimezoneOffset = function() {return 300};
  }

  // OS Platform Spoofer, Screen Size Spoofer & Plugin Hider
  function screenPluginPlatformSpoof() {
    var screenObject = { 
      orientation: {
        angle: 0,
        onchange: null,
        type: "landscape-primary"
      },
      availHeight: 1080,
      availLeft: 0,
      availTop: 22,
      availWidth: 1920,
      colorDepth: 24,
      height: 1080,
      pixelDepth: 24,
      width: 1920
    };
    function fakePlatformGetter() {return "Win32"}
    function fakePluginsGetter() {return []}
    function fakeScreenSize() {return screenObject}
    function defineProperty() {
      Object.defineProperty(navigator, "platform", {get: fakePlatformGetter});
      Object.defineProperty(navigator, "plugins", {get: fakePluginsGetter});
      Object.defineProperty(window, 'Screen', {get: fakeScreenSize});
    }
    function defineGetter() {
      navigator.__defineGetter__("platform", fakePlatformGetter);
      navigator.__defineGetter__("plugins", fakePlatformGetter);
      navigator.__defineGetter__("Screen", fakeScreenSize);
    }
    window.screen = fakeScreenSize(); // Screen Size Spoofer
    if (Object.defineProperty) defineProperty(); 
    else if (Object.prototype.__defineGetter__) defineGetter();
  }

  // WebGL Disabler
  function webGLDisabler() {
    var fakeGetContext = function(a,b) {
      if (a.toLowerCase().indexOf("webgl") >= 0) return null;
      if (b) {return window.ogcctxfunc8675309.call(this, a, b)}
      else {return window.ogcctxfunc8675309.call(this, a)}
    }
    window.ogcctxfunc8675309 = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = fakeGetContext;
  }

  function getRandomString() {
    var text = "", charset = "abcdefghijklmnopqrstuvwxyz";
    for (var i=0; i<5; i++) text += charset.charAt(Math.floor(Math.random() * charset.length));
    return text;
  }

  function overrideCanvasProto(root) {
    function overrideCanvasInternal(name, old) {
      var rootProtoValueFunc = function() {
        var width = this.width;
        var height = this.height;
        var context = this.getContext("2d");
        var imageData = context.getImageData(0, 0, width, height);
        for (var i = 0; i < height; i++) {
          for (var j = 0; j < width; j++) {
            var index = ((i * (width * 4)) + (j * 4));
            imageData.data[index + 0] = imageData.data[index + 0] + r;
            imageData.data[index + 1] = imageData.data[index + 1] + g;
            imageData.data[index + 2] = imageData.data[index + 2] + b;
            imageData.data[index + 3] = imageData.data[index + 3] + a;
          }
        }
        context.putImageData(imageData, 0, 0);
        return old.apply(this, arguments);
      }
      Object.defineProperty(root.prototype, name, {value: rootProtoValueFunc});
    }
    overrideCanvasInternal("toDataURL", root.prototype.toDataURL);
    overrideCanvasInternal("toBlob", root.prototype.toBlob);
    // overrideCanvasInternal("mozGetAsFile", root.prototype.mozGetAsFile);
  }

  function overrideCanvaRendProto(root) {
    var getImageData = root.prototype.getImageData;
    var rootProtoValueRendFunc = function() {
      var imageData = getImageData.apply(this, arguments),
          height    = imageData.height,
          width     = imageData.width;
      for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
          var index = ((i * (width * 4)) + (j * 4));
          imageData.data[index + 0] = imageData.data[index + 0] + r;
          imageData.data[index + 1] = imageData.data[index + 1] + g;
          imageData.data[index + 2] = imageData.data[index + 2] + b;
          imageData.data[index + 3] = imageData.data[index + 3] + a;
        }
      }
      return imageData;
    }
    Object.defineProperty(root.prototype, "getImageData", {value: rootProtoValueRendFunc});
  }

  function overrideDocumentProto(root) {
    function doOverrideDocumentProto(old, name) {
      var rootProtoDocFunc = function() {
        var element = old.apply(this, arguments);
        if (element == null) {return null;}
        if (Object.prototype.toString.call(element) === '[object HTMLCollection]' ||
            Object.prototype.toString.call(element) === '[object NodeList]') {
          for (var i = 0; i < element.length; ++i) {
            var el = element[i];
            inject(el);
          }
        } else {inject(element)}
        return element;
      }
      Object.defineProperty(root.prototype, name, {value: rootProtoDocFunc});
    }

    doOverrideDocumentProto(root.prototype.createElement, "createElement");
    doOverrideDocumentProto(root.prototype.createElementNS, "createElementNS");
    doOverrideDocumentProto(root.prototype.getElementById, "getElementById");
    doOverrideDocumentProto(root.prototype.getElementsByName, "getElementsByName");
    doOverrideDocumentProto(root.prototype.getElementsByClassName, "getElementsByClassName");
    doOverrideDocumentProto(root.prototype.getElementsByTagName, "getElementsByTagName");
    doOverrideDocumentProto(root.prototype.getElementsByTagNameNS, "getElementsByTagNameNS");
  }

  function inject(element) {
    if (element.tagName.toUpperCase() === "IFRAME" && element.contentWindow) {
      try {var hasAccess = element.contentWindow.HTMLCanvasElement} 
      catch (e) {return}
      overrideCanvasProto(element.contentWindow.HTMLCanvasElement);
      overrideCanvaRendProto(element.contentWindow.CanvasRenderingContext2D);
      overrideDocumentProto(element.contentWindow.Document);
    }
  }

  // Canvas Fingerprint Disabler
  // var script = document.createElement('script');
  // script.id = '1337';
  // script.type = "text/javascript";

  overrideCanvasProto(HTMLCanvasElement);
  overrideCanvaRendProto(CanvasRenderingContext2D);
  overrideDocumentProto(Document);
  spoofTimezone();
  screenPluginPlatformSpoof();
  if (!window.ogcctxfunc8675309) webGLDisabler();
}

function injectFunc(func) {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.textContent = "(" + func + ")();";
  document.documentElement.appendChild(script);
}

var siteDisabled, 
    extDisabled;

// Get informed from background.js as to if this page is blacklisted
chrome.runtime.sendMessage({cmd: 'informContentJs', url: window.location.hostname}, function(response) {
  extDisabled  = response.extDisabled;
  siteDisabled = response.siteDisabled;
  if (!extDisabled && !siteDisabled) injectFunc(payload);
  
  console.log('state: ', extDisabled, siteDisabled);
});

// Reload on change from Popup.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.cmd == 'reload') setTimeout("location.reload();", 2000);
  if (request.cmd == 'getOptions') sendResponse({
    siteDisabled: siteDisabled, 
    extDisabled:  extDisabled,
    url: window.location.hostname
  });
});

