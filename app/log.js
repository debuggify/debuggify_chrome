console.log('debuggify loading');


// chrome.extension.sendRequest({method: "getLocalStorage", key: "apikey"}, function(response) {
//   console.log(response.data);
// });

// chrome.extension.sendRequest({method: "getLocalStorage",args:  ["apikey"] }, function(response) {
//   console.log(response.data);
// });

// chrome.extension.sendRequest({method: "isEnabledForURL",args:  [document.location.hostname] }, function(response) {
//   console.log(response.data);
// });

function injectScript(url) {

  // Inject the script tag
  (function() {
    var dfy = document.createElement('script');
    dfy.type = 'text/javascript';
    dfy.async = false;
    dfy.src = url;
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(dfy, s);
  })();
}

chrome.extension.sendRequest({method: "processTab", args: [document.location] }, function(response) {

  console.log(response.data);

  if(!response.data) {
    return false;
  }

  injectScript(response.data);
});