
var defaults = {
  apikey: null,
  url: 'localhost',
  status: true
};

// var whitelist = [
//   '.*\.net',
//   'google.com',
//   'developer.chrome.com'
// ];


(function () {
  if( !(chrome && chrome.extension)) return;

  chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {

    var result = {};

    if(typeof F[request.method] !== undefined && typeof F[request.method] === "function") {
      request.args.push(sender);
      result = F[request.method].apply(this, request.args);
    }

    sendResponse({data: result});

  });

})();

var F = {

  getLocalStorage: function(key, sender) {
    return localStorage[key] || defaults[key] || null;
  },

  isEnabledForURL: function(hostname, sender){
    var item;
    var result = false;
    var whitelist = F.getLocalStorage('url');

    if (typeof whitelist === 'string') {
      whitelist = [whitelist];
    }

    try {

      for (item in whitelist){
        re = new RegExp(whitelist[item], 'gi');
        if( hostname.match(re)) {
          result = true;
          throw 'success';
        }
      }

    } catch (e) {
      return result;
    }

    return result;

  },

  allSettingsPresent: function() {
    // Check for API key
  },

  createUrl: function() {

    return  'http://cdn.debuggify.net/js/' + F.getLocalStorage('apikey') + '/debuggify.logger.http.js';
  },

  getCode: function (callback) {
    var url = F.createUrl();
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = process;
    xhr.open("GET", url, true);
    xhr.send();

    function process()
    {
      if (xhr.readyState == 4) {
        console.log(xhr.responseText);
        // localStorage["1"] =  '(' + xhr.responseText + ')()' ;
        localStorage["debuggify.logger.http.js"] =  xhr.responseText;
        callback();

      }
    }

  },

  processTab: function(urlObject, sender) {

    var badgeText = 'OFF';
    var badgeColor = '#FF0000';

    var isValid = F.isEnabledForURL(urlObject.hostname) && F.isEnabledForURL(urlObject.hostname);

    Ga.trackPageview(urlObject.href);

    console.log("Processing " + urlObject.hostname, isValid);

    if(!isValid) return false;

    // Update the badge
    badgeText = 'ON';
    badgeColor = '#00FF00';
    chrome.browserAction.setBadgeBackgroundColor({color: badgeColor, tabId: sender.tab.id});
    chrome.browserAction.setBadgeText({text: badgeText, tabId: sender.tab.id});

    // return F.createUrl();
    return localStorage['debuggify.logger.http.js'];
  }
};
