function injectFunc(func) {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.textContent = "(" + func + ")();";
  document.documentElement.appendChild(script);
}

injectFunc(function(){
  // Timezone Spoofer
  window.Date.prototype.getTimezoneOffset = function() {return 300;}

  // OS Platform Spoofer, Screen Size Spoofer & Plugin Hider
  var fakePlatformGetter = function () {return "Win32"};
  var fakePluginsGetter = function() {return []};
  var fakeScreenSize = function() {
    return { 
      availHeight: 1080,
      availLeft: 0,
      availTop: 22,
      availWidth: 1920,
      colorDepth: 24,
      height: 1080,
      orientation: {
        angle: 0,
        onchange: null,
        type: "landscape-primary"
      },
      pixelDepth: 24,
      width: 1920
    }
  }

  if (Object.defineProperty) {
    Object.defineProperty(navigator, "platform", {get: fakePlatformGetter});
    Object.defineProperty(navigator, "plugins", {get: fakePluginsGetter});
    Object.defineProperty(window, 'Screen', {get: fakeScreenSize});
  } else if (Object.prototype.__defineGetter__) {
    navigator.__defineGetter__("platform", fakePlatformGetter);
    navigator.__defineGetter__("plugins", fakePlatformGetter);
    navigator.__defineGetter__("Screen", fakeScreenSize);
  }

  // Screen Size Spoofer
  window.screen = fakeScreenSize();


  // WebGL Disabler
  if (!window.ogcctxfunc8675309) {
   window.ogcctxfunc8675309 = HTMLCanvasElement.prototype.getContext;
   HTMLCanvasElement.prototype.getContext = function (a, b) {
    if (a.toLowerCase().indexOf("webgl") >= 0) return null;
    if (b) {return window.ogcctxfunc8675309.call(this, a, b)} 
    else {return window.ogcctxfunc8675309.call(this, a)}
   };
  };

});

// Canvas Fingerprint Disabler
injectFunc(function() {
  // In it's own script tag because it's so large
  var script = document.createElement('script');
  script.id = '1337';
  script.type = "text/javascript";

  function getRandomString() {
      var text = "";
      var charset = "abcdefghijklmnopqrstuvwxyz";
      for (var i = 0; i < 5; i++)
          text += charset.charAt(Math.floor(Math.random() * charset.length));
      return text;
  }
  function inject(element) {
      if (element.tagName.toUpperCase() === "IFRAME" && element.contentWindow) {
          try {
              var hasAccess = element.contentWindow.HTMLCanvasElement;
          } catch (e) {
              // console.log("can't access " + e);
              return;
          }
          overrideCanvasProto(element.contentWindow.HTMLCanvasElement);
          overrideCanvaRendProto(element.contentWindow.CanvasRenderingContext2D);
          overrideDocumentProto(element.contentWindow.Document);
      }
  }
  function overrideCanvasProto(root) {
      function overrideCanvasInternal(name, old) {
          Object.defineProperty(root.prototype, name,
          {
              value: function () {
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
          }
          );
      }
      overrideCanvasInternal("toDataURL", root.prototype.toDataURL);
      overrideCanvasInternal("toBlob", root.prototype.toBlob);
      //overrideCanvasInternal("mozGetAsFile", root.prototype.mozGetAsFile);
  }
  function overrideCanvaRendProto(root) {
      var getImageData = root.prototype.getImageData;
      Object.defineProperty(root.prototype, "getImageData",
      {
          value: function () {
              var imageData = getImageData.apply(this, arguments);
              var height = imageData.height;
              var width = imageData.width;
                  //console.log("getImageData " + width + " " + height);
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
          }
          );
  }
  function overrideDocumentProto(root) {
      function doOverrideDocumentProto(old, name) {
          Object.defineProperty(root.prototype, name,
          {
              value: function () {
                  var element = old.apply(this, arguments);
                      //console.log(name+ " everridden call"+element);
                      if (element == null) {
                          return null;
                      }
                      if (Object.prototype.toString.call(element) === '[object HTMLCollection]' ||
                          Object.prototype.toString.call(element) === '[object NodeList]') {
                          for (var i = 0; i < element.length; ++i) {
                              var el = element[i];
                              //console.log("elements list inject " + name);
                              inject(el);
                          }
                      } else {
                          //console.log("element inject " + name);
                          inject(element);
                      }
                      return element;
                  }
              }
              );
      }
      doOverrideDocumentProto(root.prototype.createElement, "createElement");
      doOverrideDocumentProto(root.prototype.createElementNS, "createElementNS");
      doOverrideDocumentProto(root.prototype.getElementById, "getElementById");
      doOverrideDocumentProto(root.prototype.getElementsByName, "getElementsByName");
      doOverrideDocumentProto(root.prototype.getElementsByClassName, "getElementsByClassName");
      doOverrideDocumentProto(root.prototype.getElementsByTagName, "getElementsByTagName");
      doOverrideDocumentProto(root.prototype.getElementsByTagNameNS, "getElementsByTagNameNS");
  }

  overrideCanvasProto(HTMLCanvasElement);
  overrideCanvaRendProto(CanvasRenderingContext2D);
  overrideDocumentProto(Document);
});